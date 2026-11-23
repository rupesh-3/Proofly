"""
Proofly — Adversarial Socratic Interrogation (ASI) Engine

Implements the core Zero-Trust Proof-of-Competency protocol:
  1. Artifact ingestion & claim extraction
  2. Dynamic defense challenge generation (grounded in the student's own submission)
  3. Response evaluation with rubric-based scoring
  4. Keystroke telemetry authenticity analysis

This module uses Google Gemini 2.0 Flash for structured challenge generation
and response evaluation.  Every question is *artifact-grounded* — derived from
the student's own uploaded content — so generic LLM regurgitation cannot help.
"""

from __future__ import annotations

import json
import os
import time
import math
import hashlib
from datetime import datetime, timezone
from typing import Optional

import httpx
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}"
    f":generateContent?key={GEMINI_API_KEY}"
)

# ---------------------------------------------------------------------------
# Pydantic models for the ASI protocol
# ---------------------------------------------------------------------------

class ArtifactInput(BaseModel):
    """Student-submitted artifact for defense challenge generation."""
    evidence_id: str
    evidence_type: str = Field(
        description="One of: project, internship, certificate, hackathon, competition, achievement"
    )
    title: str
    description: str
    # Optional enrichments
    report_text: Optional[str] = Field(
        default=None,
        description="Full text of uploaded report / README (up to 8000 chars)"
    )
    code_snippet: Optional[str] = Field(
        default=None,
        description="Representative code snippet from the project (up to 4000 chars)"
    )
    tech_stack: list[str] = Field(default_factory=list)
    claimed_skills: list[str] = Field(default_factory=list)


class DefenseQuestion(BaseModel):
    """A single question in the defense challenge."""
    question_id: str
    question_type: str  # tradeoff | counterfactual | debug | explain
    question_text: str
    context_snippet: Optional[str] = None  # Code or text shown alongside
    time_limit_seconds: int = 45
    rubric: dict = Field(
        default_factory=dict,
        description="Evaluation criteria: {criterion: weight}"
    )
    expected_key_concepts: list[str] = Field(
        default_factory=list,
        description="Key ideas a genuine practitioner would mention"
    )


class DefenseChallenge(BaseModel):
    """The full defense challenge for one artifact."""
    challenge_id: str
    evidence_id: str
    evidence_type: str
    title: str
    questions: list[DefenseQuestion]
    total_time_seconds: int
    generated_at: str
    artifact_hash: str  # SHA-256 of the input to prove grounding


class StudentResponse(BaseModel):
    """A student's answer to one defense question."""
    question_id: str
    response_text: str
    time_taken_seconds: float
    # Keystroke telemetry
    keystroke_events: list[dict] = Field(
        default_factory=list,
        description="List of {key, timestamp_ms, event_type} records"
    )
    tab_switch_count: int = 0
    paste_attempt_count: int = 0


class DefenseSubmission(BaseModel):
    """Full submission of all defense responses."""
    challenge_id: str
    evidence_id: str
    student_id: str
    responses: list[StudentResponse]
    started_at: str
    completed_at: str


class QuestionEvaluation(BaseModel):
    """AI evaluation of a single response."""
    question_id: str
    question_type: str
    conceptual_precision: float = Field(ge=0, le=100)
    technical_depth: float = Field(ge=0, le=100)
    response_authenticity: float = Field(ge=0, le=100)
    weighted_score: float = Field(ge=0, le=100)
    feedback: str
    key_concepts_hit: list[str]
    key_concepts_missed: list[str]
    flags: list[str] = Field(default_factory=list)


class TelemetryAnalysis(BaseModel):
    """Keystroke dynamics and behavioral analysis."""
    typing_cadence_score: float = Field(
        ge=0, le=1.0,
        description="1.0 = natural organic typing, 0.0 = robotic / paste-like"
    )
    mean_ikl_ms: float = Field(description="Mean inter-key latency in ms")
    ikl_std_ms: float = Field(description="Std dev of inter-key latency")
    burstiness_index: float = Field(
        description="Ratio of burst typing to sustained typing (genuine ~0.3-0.7)"
    )
    pause_frequency: float = Field(
        description="Fraction of time spent in pauses > 2s (genuine ~0.15-0.4)"
    )
    tab_switch_penalty: float = Field(ge=0, le=1.0)
    paste_penalty: float = Field(ge=0, le=1.0)
    overall_confidence: float = Field(
        ge=0, le=1.0,
        description="Combined telemetry confidence that the student typed authentically"
    )
    flags: list[str] = Field(default_factory=list)


class DefenseReport(BaseModel):
    """Complete defense evaluation report."""
    challenge_id: str
    evidence_id: str
    student_id: str
    # Scores
    asi_score: float = Field(ge=0, le=100, description="Adversarial Socratic Interrogation score")
    telemetry_confidence: float = Field(ge=0, le=1.0)
    combined_defense_score: float = Field(ge=0, le=100)
    defense_level: str  # "Passed" | "Marginal" | "Failed"
    # Details
    question_evaluations: list[QuestionEvaluation]
    telemetry_analysis: TelemetryAnalysis
    # Transcript for faculty review
    transcript: list[dict]  # [{question, response, score, time_taken}]
    evaluated_at: str
    report_hash: str  # SHA-256 for integrity


# ---------------------------------------------------------------------------
# Challenge Generation Prompt Templates
# ---------------------------------------------------------------------------

CHALLENGE_SYSTEM_PROMPT = """You are Proofly's Adversarial Socratic Interrogation (ASI) Engine.
Your role is to generate defense challenges that test whether a student genuinely
performed the work they claim. You are NOT testing textbook knowledge — you are
testing whether this specific person actually built, experienced, or learned what
they submitted as evidence.

RULES:
1. Every question MUST reference specific details from the student's submission.
2. Questions must probe DECISIONS, TRADEOFFS, and FAILURE MODES — not definitions.
3. Include at least one counterfactual ("What would happen if X changed?").
4. For code-based submissions, include a subtle bug injection for the student to find.
5. Questions should be answerable in 30-45 seconds by someone who did the work,
   but require significant effort to answer via external LLM lookup.
6. Never ask generic questions like "What is React?" or "Define machine learning."
"""

QUESTION_TEMPLATES = {
    "project": {
        "count": 4,
        "types": ["tradeoff", "counterfactual", "debug", "explain"],
        "prompt_suffix": """Generate exactly 4 questions:
1. TRADEOFF: Ask why they chose a specific technology/architecture over alternatives,
   referencing their actual stack. Probe the COST of that decision.
2. COUNTERFACTUAL: Describe a realistic failure scenario in their system and ask
   what breaks and how they would fix it.
3. DEBUG: Take a concept from their code/description, write a 6-10 line code snippet
   in their language that contains a subtle concurrency, memory, or logic bug.
   Ask them to identify and fix it.
4. EXPLAIN: Ask them to explain a complex part of their system to a junior developer
   without using jargon — tests true conceptual ownership."""
    },
    "internship": {
        "count": 3,
        "types": ["tradeoff", "counterfactual", "explain"],
        "prompt_suffix": """Generate exactly 3 questions:
1. TRADEOFF: Ask about a specific technical decision mentioned in their report —
   what alternatives existed, what was the cost/benefit analysis?
2. COUNTERFACTUAL: Describe a scenario where a key constraint changes (scale,
   latency, budget) and ask how their solution would need to adapt.
3. EXPLAIN: Ask them to walk through a specific workflow or pipeline they claim
   to have built, focusing on the parts that would be hard to fake."""
    },
    "certificate": {
        "count": 3,
        "types": ["tradeoff", "counterfactual", "explain"],
        "prompt_suffix": """Generate exactly 3 questions:
1. TRADEOFF: Based on the certification topic, present a real-world scenario with
   two valid approaches and ask which they would choose and why.
2. COUNTERFACTUAL: Present an edge case or failure mode relevant to the certified
   skill and ask how to diagnose and resolve it.
3. EXPLAIN: Ask them to explain a core concept from the certification syllabus
   using a concrete example from a project they would build."""
    },
    "hackathon": {
        "count": 3,
        "types": ["tradeoff", "counterfactual", "explain"],
        "prompt_suffix": """Generate exactly 3 questions:
1. TRADEOFF: Ask about a critical decision they made under time pressure —
   what did they sacrifice for speed and what would they do differently?
2. COUNTERFACTUAL: If they had twice the time, what architectural flaw would
   they fix first and why?
3. EXPLAIN: Ask them to explain the most technically challenging part of their
   hackathon submission."""
    },
}

# Default for competition, achievement, etc.
QUESTION_TEMPLATES["competition"] = QUESTION_TEMPLATES["hackathon"]
QUESTION_TEMPLATES["achievement"] = {
    "count": 3,
    "types": ["tradeoff", "counterfactual", "explain"],
    "prompt_suffix": """Generate exactly 3 questions:
1. TRADEOFF: Based on the achievement context, ask about a key decision or
   methodology choice and its implications.
2. COUNTERFACTUAL: Present a variation of the scenario and ask how their
   approach would change.
3. EXPLAIN: Ask them to teach the core concept to someone unfamiliar with
   the domain."""
}


# ---------------------------------------------------------------------------
# Gemini API Helper
# ---------------------------------------------------------------------------

async def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    """Call Gemini 2.0 Flash and return the text response."""
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY not configured. Set it in ai-service/.env"
        )

    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json",
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(GEMINI_ENDPOINT, json=payload)
        resp.raise_for_status()
        data = resp.json()

    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError("No candidates returned from Gemini API")

    text = candidates[0]["content"]["parts"][0]["text"]
    return text


# ---------------------------------------------------------------------------
# 1. Challenge Generation
# ---------------------------------------------------------------------------

async def generate_defense_challenge(artifact: ArtifactInput) -> DefenseChallenge:
    """
    Generate an artifact-grounded defense challenge.

    The challenge is uniquely tied to the student's submission via SHA-256 hash,
    ensuring every question references their specific work.
    """
    # Determine question template
    etype = artifact.evidence_type.lower()
    template = QUESTION_TEMPLATES.get(etype, QUESTION_TEMPLATES["achievement"])

    # Build the artifact context
    context_parts = [
        f"Title: {artifact.title}",
        f"Type: {artifact.evidence_type}",
        f"Description: {artifact.description}",
    ]
    if artifact.tech_stack:
        context_parts.append(f"Technology Stack: {', '.join(artifact.tech_stack)}")
    if artifact.claimed_skills:
        context_parts.append(f"Claimed Skills: {', '.join(artifact.claimed_skills)}")
    if artifact.report_text:
        context_parts.append(f"Report/README Excerpt:\n{artifact.report_text[:6000]}")
    if artifact.code_snippet:
        context_parts.append(f"Code Snippet:\n```\n{artifact.code_snippet[:3000]}\n```")

    artifact_context = "\n".join(context_parts)

    # Compute artifact hash for integrity
    hash_input = f"{artifact.evidence_id}:{artifact.title}:{artifact.description}"
    artifact_hash = hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    user_prompt = f"""STUDENT SUBMISSION:
{artifact_context}

{template['prompt_suffix']}

Respond with a JSON object matching this exact schema:
{{
  "questions": [
    {{
      "question_type": "tradeoff|counterfactual|debug|explain",
      "question_text": "The full question text",
      "context_snippet": "Optional code snippet or text excerpt shown with the question (null if not needed)",
      "time_limit_seconds": 45,
      "expected_key_concepts": ["concept1", "concept2", "concept3"],
      "rubric": {{
        "conceptual_precision": 40,
        "technical_depth": 40,
        "response_authenticity": 20
      }}
    }}
  ]
}}"""

    raw_response = await _call_gemini(CHALLENGE_SYSTEM_PROMPT, user_prompt)

    # Parse JSON response
    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        import re
        json_match = re.search(r'\{[\s\S]*\}', raw_response)
        if json_match:
            parsed = json.loads(json_match.group())
        else:
            raise RuntimeError(f"Failed to parse Gemini response as JSON")

    # Build DefenseChallenge
    questions: list[DefenseQuestion] = []
    for i, q in enumerate(parsed.get("questions", [])):
        questions.append(DefenseQuestion(
            question_id=f"{artifact_hash}-q{i+1}",
            question_type=q.get("question_type", "explain"),
            question_text=q["question_text"],
            context_snippet=q.get("context_snippet"),
            time_limit_seconds=q.get("time_limit_seconds", 45),
            rubric=q.get("rubric", {
                "conceptual_precision": 40,
                "technical_depth": 40,
                "response_authenticity": 20
            }),
            expected_key_concepts=q.get("expected_key_concepts", []),
        ))

    total_time = sum(q.time_limit_seconds for q in questions)

    challenge = DefenseChallenge(
        challenge_id=f"def-{artifact_hash}-{int(time.time())}",
        evidence_id=artifact.evidence_id,
        evidence_type=artifact.evidence_type,
        title=artifact.title,
        questions=questions,
        total_time_seconds=total_time,
        generated_at=datetime.now(timezone.utc).isoformat(),
        artifact_hash=artifact_hash,
    )

    return challenge


# ---------------------------------------------------------------------------
# 2. Keystroke Telemetry Analysis
# ---------------------------------------------------------------------------

def analyze_keystroke_telemetry(responses: list[StudentResponse]) -> TelemetryAnalysis:
    """
    Analyze keystroke dynamics across all responses to determine typing authenticity.

    Genuine practitioners exhibit:
    - Bursty typing with organic pauses (thinking → typing → pausing → typing)
    - Non-uniform inter-key latency (IKL) distribution
    - Moderate backspace/edit frequency (self-correction)
    - No clipboard paste events

    Suspicious patterns:
    - Uniform, rhythmic typing (reading from another screen)
    - Very low IKL std dev (robotic)
    - Zero backspaces (copy-pasted or dictated)
    - Tab switches followed by typing bursts
    """
    all_ikls: list[float] = []
    total_pauses = 0
    total_intervals = 0
    total_burst_intervals = 0
    total_tab_switches = 0
    total_paste_attempts = 0

    for resp in responses:
        total_tab_switches += resp.tab_switch_count
        total_paste_attempts += resp.paste_attempt_count

        events = resp.keystroke_events
        if len(events) < 2:
            continue

        # Sort by timestamp
        sorted_events = sorted(events, key=lambda e: e.get("timestamp_ms", 0))

        for i in range(1, len(sorted_events)):
            prev_ts = sorted_events[i - 1].get("timestamp_ms", 0)
            curr_ts = sorted_events[i].get("timestamp_ms", 0)
            ikl = curr_ts - prev_ts

            if ikl <= 0 or ikl > 30000:  # Ignore invalid or very long gaps
                continue

            all_ikls.append(ikl)
            total_intervals += 1

            if ikl > 2000:  # Pause > 2 seconds
                total_pauses += 1
            elif ikl < 150:  # Burst typing
                total_burst_intervals += 1

    # Calculate metrics
    if len(all_ikls) < 5:
        # Not enough data — return neutral telemetry
        return TelemetryAnalysis(
            typing_cadence_score=0.5,
            mean_ikl_ms=0,
            ikl_std_ms=0,
            burstiness_index=0.5,
            pause_frequency=0.3,
            tab_switch_penalty=0.0,
            paste_penalty=0.0,
            overall_confidence=0.5,
            flags=["insufficient_keystroke_data"],
        )

    mean_ikl = sum(all_ikls) / len(all_ikls)
    variance = sum((x - mean_ikl) ** 2 for x in all_ikls) / len(all_ikls)
    std_ikl = math.sqrt(variance)

    burstiness = total_burst_intervals / total_intervals if total_intervals > 0 else 0
    pause_freq = total_pauses / total_intervals if total_intervals > 0 else 0

    # --- Scoring ---

    # Cadence score: organic typing has moderate mean IKL (120-400ms) and high variance
    cadence_score = 1.0
    if std_ikl < 30:  # Very uniform = suspicious (robotic or dictation)
        cadence_score *= 0.3
    elif std_ikl < 60:
        cadence_score *= 0.6
    elif std_ikl > 500:  # Extremely erratic
        cadence_score *= 0.7

    # Burstiness: genuine is ~0.3-0.7
    if burstiness < 0.1:  # Almost no burst typing = reading and typing slowly
        cadence_score *= 0.7
    elif burstiness > 0.85:  # Almost all burst = paste-like
        cadence_score *= 0.5

    # Pause frequency: genuine is ~0.15-0.4 (thinking pauses)
    if pause_freq < 0.05:  # Never pauses = suspicious
        cadence_score *= 0.6
    elif pause_freq > 0.6:  # Pauses too much = looking up answers
        cadence_score *= 0.7

    cadence_score = max(0.0, min(1.0, cadence_score))

    # Tab switch penalty
    tab_penalty = min(1.0, total_tab_switches * 0.15)

    # Paste penalty
    paste_penalty = min(1.0, total_paste_attempts * 0.3)

    # Overall confidence
    overall = cadence_score * (1.0 - tab_penalty) * (1.0 - paste_penalty)
    overall = max(0.0, min(1.0, overall))

    flags: list[str] = []
    if total_tab_switches > 0:
        flags.append(f"tab_switches_detected:{total_tab_switches}")
    if total_paste_attempts > 0:
        flags.append(f"paste_attempts_detected:{total_paste_attempts}")
    if std_ikl < 40:
        flags.append("uniform_typing_cadence")
    if burstiness > 0.85:
        flags.append("paste_like_burst_pattern")
    if pause_freq > 0.5:
        flags.append("excessive_pauses")

    return TelemetryAnalysis(
        typing_cadence_score=round(cadence_score, 3),
        mean_ikl_ms=round(mean_ikl, 1),
        ikl_std_ms=round(std_ikl, 1),
        burstiness_index=round(burstiness, 3),
        pause_frequency=round(pause_freq, 3),
        tab_switch_penalty=round(tab_penalty, 3),
        paste_penalty=round(paste_penalty, 3),
        overall_confidence=round(overall, 3),
        flags=flags,
    )


# ---------------------------------------------------------------------------
# 3. Response Evaluation
# ---------------------------------------------------------------------------

EVALUATION_SYSTEM_PROMPT = """You are Proofly's Defense Evaluator. You assess whether a student's
response to a defense question demonstrates genuine understanding and ownership
of the work they claimed.

SCORING CRITERIA (each 0-100):
1. CONCEPTUAL PRECISION (40% weight): Does the answer show accurate understanding
   of the underlying concepts? Does it address the specific question asked?
2. TECHNICAL DEPTH (40% weight): Does the answer go beyond surface-level
   explanation? Does it reference specific implementation details, edge cases,
   or failure modes?
3. RESPONSE AUTHENTICITY (20% weight): Does the response sound like someone
   recalling their own experience vs. reading a generic LLM answer?
   Look for: first-person experience markers, specific numbers/dates,
   acknowledgment of mistakes/limitations, natural hedging.

RED FLAGS for low authenticity:
- Overly polished, textbook-like language
- Generic examples not grounded in the specific artifact
- Buzzword-heavy responses without concrete specifics
- Responses that rephrase the question back without adding information
"""


async def evaluate_defense_submission(
    challenge: DefenseChallenge,
    submission: DefenseSubmission,
) -> DefenseReport:
    """
    Evaluate a complete defense submission against the original challenge.

    Returns a DefenseReport with per-question scores, telemetry analysis,
    and a combined defense score.
    """
    # 1. Analyze keystroke telemetry
    telemetry = analyze_keystroke_telemetry(submission.responses)

    # 2. Evaluate each response via Gemini
    question_evals: list[QuestionEvaluation] = []
    transcript: list[dict] = []

    for question in challenge.questions:
        # Find matching response
        response = next(
            (r for r in submission.responses if r.question_id == question.question_id),
            None
        )

        if response is None or not response.response_text.strip():
            # No response provided
            eval_result = QuestionEvaluation(
                question_id=question.question_id,
                question_type=question.question_type,
                conceptual_precision=0,
                technical_depth=0,
                response_authenticity=0,
                weighted_score=0,
                feedback="No response provided.",
                key_concepts_hit=[],
                key_concepts_missed=question.expected_key_concepts,
                flags=["no_response"],
            )
            question_evals.append(eval_result)
            transcript.append({
                "question": question.question_text,
                "response": "",
                "score": 0,
                "time_taken": 0,
            })
            continue

        # Time penalty: if answered too quickly (< 5s), suspicious
        time_flags: list[str] = []
        if response.time_taken_seconds < 5:
            time_flags.append("suspiciously_fast_response")
        if response.time_taken_seconds > question.time_limit_seconds:
            time_flags.append("exceeded_time_limit")

        # Call Gemini for evaluation
        eval_prompt = f"""QUESTION (type: {question.question_type}):
{question.question_text}

{f'CONTEXT SHOWN TO STUDENT: {question.context_snippet}' if question.context_snippet else ''}

EXPECTED KEY CONCEPTS: {', '.join(question.expected_key_concepts)}

STUDENT'S RESPONSE (answered in {response.time_taken_seconds:.1f}s):
{response.response_text}

Evaluate this response. Return a JSON object:
{{
  "conceptual_precision": <0-100>,
  "technical_depth": <0-100>,
  "response_authenticity": <0-100>,
  "feedback": "<2-3 sentence evaluation>",
  "key_concepts_hit": ["concept1", ...],
  "key_concepts_missed": ["concept1", ...],
  "flags": ["flag1", ...]
}}"""

        try:
            raw_eval = await _call_gemini(EVALUATION_SYSTEM_PROMPT, eval_prompt)
            eval_data = json.loads(raw_eval)
        except Exception:
            # Fallback: heuristic evaluation
            word_count = len(response.response_text.split())
            eval_data = {
                "conceptual_precision": min(60, word_count * 2),
                "technical_depth": min(50, word_count * 1.5),
                "response_authenticity": 50,
                "feedback": "Automated heuristic evaluation (Gemini unavailable).",
                "key_concepts_hit": [],
                "key_concepts_missed": question.expected_key_concepts,
                "flags": ["heuristic_fallback"],
            }

        # Calculate weighted score using rubric
        rubric = question.rubric
        cp_weight = rubric.get("conceptual_precision", 40) / 100
        td_weight = rubric.get("technical_depth", 40) / 100
        ra_weight = rubric.get("response_authenticity", 20) / 100

        cp = float(eval_data.get("conceptual_precision", 0))
        td = float(eval_data.get("technical_depth", 0))
        ra = float(eval_data.get("response_authenticity", 0))

        weighted = cp * cp_weight + td * td_weight + ra * ra_weight

        all_flags = eval_data.get("flags", []) + time_flags
        eval_result = QuestionEvaluation(
            question_id=question.question_id,
            question_type=question.question_type,
            conceptual_precision=cp,
            technical_depth=td,
            response_authenticity=ra,
            weighted_score=round(weighted, 1),
            feedback=eval_data.get("feedback", ""),
            key_concepts_hit=eval_data.get("key_concepts_hit", []),
            key_concepts_missed=eval_data.get("key_concepts_missed", []),
            flags=all_flags,
        )
        question_evals.append(eval_result)

        transcript.append({
            "question": question.question_text,
            "question_type": question.question_type,
            "response": response.response_text,
            "score": round(weighted, 1),
            "time_taken": round(response.time_taken_seconds, 1),
            "feedback": eval_data.get("feedback", ""),
        })

    # 3. Calculate overall ASI score
    if question_evals:
        asi_score = sum(e.weighted_score for e in question_evals) / len(question_evals)
    else:
        asi_score = 0.0

    # 4. Combined defense score (ASI * telemetry confidence)
    combined = asi_score * telemetry.overall_confidence
    combined = round(min(100.0, max(0.0, combined)), 1)

    # 5. Determine defense level
    if combined >= 70:
        defense_level = "Passed"
    elif combined >= 45:
        defense_level = "Marginal"
    else:
        defense_level = "Failed"

    # 6. Compute report hash for integrity
    report_data = f"{challenge.challenge_id}:{submission.student_id}:{asi_score}:{combined}"
    report_hash = hashlib.sha256(report_data.encode()).hexdigest()[:16]

    return DefenseReport(
        challenge_id=challenge.challenge_id,
        evidence_id=challenge.evidence_id,
        student_id=submission.student_id,
        asi_score=round(asi_score, 1),
        telemetry_confidence=telemetry.overall_confidence,
        combined_defense_score=combined,
        defense_level=defense_level,
        question_evaluations=question_evals,
        telemetry_analysis=telemetry,
        transcript=transcript,
        evaluated_at=datetime.now(timezone.utc).isoformat(),
        report_hash=report_hash,
    )


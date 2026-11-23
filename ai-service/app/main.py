"""
Proofly AI Service — FastAPI main application.
Run locally: uvicorn app.main:app --reload
"""
from __future__ import annotations

import os
from datetime import date, datetime

from dotenv import load_dotenv
load_dotenv()

from pydantic import BaseModel, Field
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .auth import verify_jwt
from .embeddings import embed
from .scoring import (
    skill_confidence,
    hybrid_similarity,
    opportunity_match_score,
    weighted_jaccard,
)
from . import db
from .models import (
    IdeaIn, SimilarityOut, SimilarityMatch,
    EmbedEvidenceIn, EmbedEvidenceOut,
    SkillConfidenceOut, SkillScore,
    OpportunityMatchIn, OpportunityMatchOut,
    DefenseGenerateIn, DefenseChallengeOut, DefenseQuestionOut,
    DefenseSubmissionIn, DefenseReportOut,
    IssueCredentialIn, VerifyCredentialIn,
)
from .defense import (
    ArtifactInput,
    StudentResponse as DefenseStudentResponse,
    DefenseSubmission,
    generate_defense_challenge,
    evaluate_defense_submission,
)
from .crypto_attestation import (
    build_verifiable_credential,
    verify_credential_signature,
    EvidenceSummary,
)

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
ALLOWED_ORIGINS = list(set([FRONTEND_ORIGIN, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]))

app = FastAPI(title="Proofly AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────
# Health check (no auth required)
# ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ──────────────────────────────────────────────────────────────
# 1. Embed evidence text and store the vector
# ──────────────────────────────────────────────────────────────

@app.post("/embed-evidence", response_model=EmbedEvidenceOut)
def embed_evidence(
    body: EmbedEvidenceIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Called after a student adds new evidence.
    Generates a 384-dim embedding and writes it to evidence.embedding.
    """
    text = f"{body.title}. {body.description}"
    vec = embed(text)
    db.upsert_evidence_embedding(body.evidence_id, vec)
    return EmbedEvidenceOut(evidence_id=body.evidence_id, status="embedded")


# ──────────────────────────────────────────────────────────────
# 2. Project similarity check
# ──────────────────────────────────────────────────────────────

@app.post("/project-similarity", response_model=SimilarityOut)
def project_similarity(
    body: IdeaIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Given a project title + description, return the top-3 most similar
    verified institutional projects with a hybrid similarity score.
    """
    vec = embed(f"{body.title}. {body.description}")
    rows = db.nearest_projects(vec, limit=5, exclude_student_id=user_id)

    matches: list[SimilarityMatch] = []
    for r in rows:
        # cosine_sim is already in [0,1] from the SQL query
        semantic = round(max(0.0, float(r["cosine_sim"])) * 100, 1)
        structural_data = db.structural_overlap(body.title, body.description, r)
        structural = structural_data["total"]
        score = hybrid_similarity(semantic, structural)

        matches.append(SimilarityMatch(
            project_id=r["id"],
            title=r["title"],
            student_name=r.get("student_name", "Institutional Scholar"),
            score=score,
            semantic_score=semantic,
            structural_score=structural,
            breakdown=structural_data["by_dimension"],
        ))

    # Sort descending and return top 3
    matches.sort(key=lambda m: m.score, reverse=True)
    return SimilarityOut(
        matches=matches[:3],
        note="Similarity within this institution, not global originality.",
    )


# ──────────────────────────────────────────────────────────────
# 3. Skill confidence recalculation for a student
# ──────────────────────────────────────────────────────────────

def _months_ago(event_date) -> float:
    if not event_date:
        return 6.0  # default: assume recent
    if isinstance(event_date, str):
        try:
            event_date = date.fromisoformat(event_date)
        except ValueError:
            return 6.0
    today = date.today()
    return (today - event_date).days / 30.44


@app.get("/skill-confidence/{student_id}", response_model=SkillConfidenceOut)
def get_skill_confidence(
    student_id: str,
    user_id: str = Depends(verify_jwt),
):
    """
    Recalculate skill confidence for all of a student's skills.
    Faculty and the student themselves can call this.
    """
    skill_names = db.get_all_skills_for_student(student_id)
    results: list[SkillScore] = []

    for skill_name in skill_names:
        evidence_rows = db.get_student_evidence_for_skill(student_id, skill_name)
        evidence_for_scoring = [
            {
                "type": row["type"],
                "proof_level": row["proof_level"],
                "depth": float(row["depth_factor"] or 1.0),
                "months_ago": _months_ago(row["event_date"]),
            }
            for row in evidence_rows
        ]

        confidence = skill_confidence(evidence_for_scoring)

        # Determine level
        if confidence < 35:
            level = "Beginner"
        elif confidence < 70:
            level = "Intermediate"
        else:
            level = "Advanced"

        results.append(SkillScore(
            skill_name=skill_name,
            confidence=confidence,
            level=level,
        ))

    results.sort(key=lambda s: s.confidence, reverse=True)
    return SkillConfidenceOut(student_id=student_id, skills=results)


# ──────────────────────────────────────────────────────────────
# 4. Opportunity match score
# ──────────────────────────────────────────────────────────────

@app.post("/opportunity-match", response_model=OpportunityMatchOut)
def opportunity_match(
    body: OpportunityMatchIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Calculate how well the calling student matches an opportunity.
    """
    # Get the student's skills
    skill_names = db.get_all_skills_for_student(user_id)

    # Build skill → confidence map
    skill_conf_map: dict[str, float] = {}
    for skill_name in skill_names:
        rows = db.get_student_evidence_for_skill(user_id, skill_name)
        evidence_for_scoring = [
            {
                "type": r["type"],
                "proof_level": r["proof_level"],
                "depth": float(r["depth_factor"] or 1.0),
                "months_ago": _months_ago(r["event_date"]),
            }
            for r in rows
        ]
        skill_conf_map[skill_name.lower()] = skill_confidence(evidence_for_scoring)

    # Calculate structural skill fit
    total_weight = 0.0
    weighted_conf_sum = 0.0
    you_have: list[dict] = []
    you_need: list[dict] = []
    matched_confidences: list[float] = []
    why_matched: list[str] = []

    for req in body.required_skills:
        req_name = req.get("skill_name", "")
        req_weight = float(req.get("weight", 1.0))
        conf = skill_conf_map.get(req_name.lower(), 0.0)

        total_weight += req_weight
        fit_factor = min(1.0, conf / 70.0)
        weighted_conf_sum += req_weight * fit_factor

        if conf >= 40:
            matched_confidences.append(conf)
            you_have.append({"skill_name": req_name, "confidence": conf})
            why_matched.append(
                f"Strong {req_name} capability ({conf}/100) with verified evidence."
            )
        else:
            you_need.append({
                "skill_name": req_name,
                "weight": req_weight,
                "gap_score": round(70.0 - conf, 1),
            })

    structural_skill_fit = (
        round((weighted_conf_sum / total_weight) * 100, 1) if total_weight > 0 else 50.0
    )

    # Semantic fit: embed student's skill list vs opportunity text
    student_text = " ".join(skill_names)
    opp_text = f"{body.opportunity_title} {body.opportunity_description}"
    student_vec = embed(student_text)
    opp_vec = embed(opp_text)

    import numpy as np
    s_arr = np.array(student_vec)
    o_arr = np.array(opp_vec)
    cosine = float(np.dot(s_arr, o_arr) / (np.linalg.norm(s_arr) * np.linalg.norm(o_arr) + 1e-9))
    semantic_fit = round(max(0.0, cosine) * 100, 1)

    evidence_strength = (
        round(sum(matched_confidences) / len(matched_confidences), 1)
        if matched_confidences else 20.0
    )

    score = opportunity_match_score(structural_skill_fit, semantic_fit, evidence_strength)

    # Next best action
    if you_need:
        sorted_gaps = sorted(you_need, key=lambda x: (-x["weight"], -x["gap_score"]))
        top_gap = sorted_gaps[0]
        next_action = (
            f"Build a project demonstrating {top_gap['skill_name']} "
            f"(gap: {top_gap['gap_score']} pts) to increase match probability."
        )
    elif score >= 85:
        next_action = "Profile strongly aligns. Submit your application and request faculty endorsement."
    else:
        next_action = "Add more verified evidence and live project links to boost confidence scores."

    return OpportunityMatchOut(
        opportunity_id=body.opportunity_id,
        score=score,
        structural_skill_fit=structural_skill_fit,
        semantic_fit=semantic_fit,
        evidence_strength=evidence_strength,
        you_have=you_have,
        you_need=you_need,
        why_matched=why_matched[:3],
        next_best_action=next_action,
    )


# ══════════════════════════════════════════════════════════════
# DEFENSE CHALLENGE ENDPOINTS (Module 1 — ASI Protocol)
# ══════════════════════════════════════════════════════════════

# In-memory challenge store (production: use defense_challenges table)
_challenge_store: dict[str, object] = {}


@app.post("/defense/generate", response_model=DefenseChallengeOut)
async def defense_generate(
    body: DefenseGenerateIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Generate an artifact-grounded defense challenge.

    The AI reads the student's submitted evidence (title, description,
    report text, code) and produces 3-4 targeted questions that only
    someone who genuinely did the work can answer quickly.
    """
    artifact = ArtifactInput(
        evidence_id=body.evidence_id,
        evidence_type=body.evidence_type,
        title=body.title,
        description=body.description,
        report_text=body.report_text,
        code_snippet=body.code_snippet,
        tech_stack=body.tech_stack,
        claimed_skills=body.claimed_skills,
    )

    challenge = await generate_defense_challenge(artifact)

    # Store challenge for later evaluation
    _challenge_store[challenge.challenge_id] = challenge

    # Convert to output model
    questions_out = [
        DefenseQuestionOut(
            question_id=q.question_id,
            question_type=q.question_type,
            question_text=q.question_text,
            context_snippet=q.context_snippet,
            time_limit_seconds=q.time_limit_seconds,
            rubric=q.rubric,
            expected_key_concepts=q.expected_key_concepts,
        )
        for q in challenge.questions
    ]

    return DefenseChallengeOut(
        challenge_id=challenge.challenge_id,
        evidence_id=challenge.evidence_id,
        evidence_type=challenge.evidence_type,
        title=challenge.title,
        questions=questions_out,
        total_time_seconds=challenge.total_time_seconds,
        generated_at=challenge.generated_at,
        artifact_hash=challenge.artifact_hash,
    )


@app.post("/defense/evaluate", response_model=DefenseReportOut)
async def defense_evaluate(
    body: DefenseSubmissionIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Evaluate a defense submission.

    Processes the student's responses through:
      1. AI rubric evaluation (conceptual precision, depth, authenticity)
      2. Keystroke telemetry analysis (typing cadence, tab switches, paste attempts)
      3. Combined scoring with the dual-observer model
    """
    # Retrieve the original challenge
    challenge = _challenge_store.get(body.challenge_id)
    if challenge is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Challenge not found or expired")

    # Convert request responses to internal format
    student_responses = [
        DefenseStudentResponse(
            question_id=r.question_id,
            response_text=r.response_text,
            time_taken_seconds=r.time_taken_seconds,
            keystroke_events=r.keystroke_events,
            tab_switch_count=r.tab_switch_count,
            paste_attempt_count=r.paste_attempt_count,
        )
        for r in body.responses
    ]

    submission = DefenseSubmission(
        challenge_id=body.challenge_id,
        evidence_id=body.evidence_id,
        student_id=body.student_id,
        responses=student_responses,
        started_at=body.started_at,
        completed_at=body.completed_at,
    )

    report = await evaluate_defense_submission(challenge, submission)

    # Clean up challenge from store
    _challenge_store.pop(body.challenge_id, None)

    return DefenseReportOut(**report.model_dump())


@app.get("/defense/report/{evidence_id}", response_model=DefenseReportOut)
def get_defense_report(
    evidence_id: str,
    user_id: str = Depends(verify_jwt),
):
    """
    Retrieve the defense report for an evidence item.
    Faculty and the student can view this.
    """
    # In production, query defense_reports table
    from fastapi import HTTPException
    raise HTTPException(
        status_code=404,
        detail="No defense report found for this evidence item."
    )


# ══════════════════════════════════════════════════════════════
# VERIFIABLE CREDENTIAL ENDPOINTS (Module 4)
# ══════════════════════════════════════════════════════════════

@app.post("/credential/issue")
def issue_credential(
    body: IssueCredentialIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Issue a W3C Verifiable Credential for a student's proven skill.

    Generates a tamper-evident, cryptographically signed credential
    containing the evidence chain Merkle root, defense scores, and
    faculty attestation status.
    """
    credential = build_verifiable_credential(
        student_id=user_id,
        student_name="Proofly Student",  # In production: fetch from profiles
        institution_name="Proofly University",
        institution_did="did:web:proofly.dev",
        skill_name=body.skill_name,
        confidence=75.0,  # In production: compute from calibration model
        level="Intermediate",
        evidence_items=[
            EvidenceSummary(
                evidence_id="placeholder",
                title="Evidence",
                evidence_type="project",
                proof_level=2,
                defense_score=75.0,
            )
        ],
    )

    return credential


@app.post("/credential/verify")
def verify_credential(
    body: VerifyCredentialIn,
):
    """
    Verify a credential's cryptographic signature.
    No authentication required — anyone can verify.
    """
    is_valid = verify_credential_signature(body.credential)
    return {
        "valid": is_valid,
        "details": "Signature verified successfully." if is_valid
                   else "Invalid signature or tampered credential.",
    }


# ══════════════════════════════════════════════════════════════
# PHASE 1: EVIDENCE & PROVENANCE ENDPOINTS
# ══════════════════════════════════════════════════════════════

from .provenance import (
    analyze_repository_provenance,
    CommitNode,
    ProvenanceReport,
)

class ProvenanceAnalyzeIn(BaseModel):
    repository_identifier: str
    files: dict[str, str]  # file_path -> source code
    commits: Optional[list[dict]] = None


@app.post("/provenance/analyze")
def provenance_analyze(
    body: ProvenanceAnalyzeIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Phase 1: Ingest repository files and commit history.
    Performs AST parsing, complexity scoring, semantic code evolution,
    and development trajectory classification.
    """
    commit_nodes = []
    if body.commits:
        for c in body.commits:
            commit_nodes.append(CommitNode(
                commit_hash=c.get("commit_hash", ""),
                author_name=c.get("author_name", "Author"),
                author_email=c.get("author_email", "author@domain.com"),
                timestamp=c.get("timestamp", datetime.now(timezone.utc).isoformat()),
                message=c.get("message", "Commit"),
                lines_added=c.get("lines_added", 0),
                lines_deleted=c.get("lines_deleted", 0),
                files_changed=c.get("files_changed", []),
                ast_nodes_added=c.get("ast_nodes_added", 0),
                ast_nodes_modified=c.get("ast_nodes_modified", 0),
            ))

    report = analyze_repository_provenance(
        repo_identifier=body.repository_identifier,
        files=body.files,
        commits=commit_nodes,
    )
    from dataclasses import asdict
    return asdict(report)


# ══════════════════════════════════════════════════════════════
# PHASE 2: ADAPTIVE MULTI-TURN SOCRATIC DEFENSE ENDPOINTS
# ══════════════════════════════════════════════════════════════

from .adaptive_defense import (
    AdaptiveDefenseSession,
    start_adaptive_defense_session,
    submit_turn_and_adapt,
)

# Active adaptive session store
_adaptive_session_store: dict[str, AdaptiveDefenseSession] = {}


class AdaptiveStartIn(BaseModel):
    evidence_id: str
    student_id: str
    title: str
    description: str
    tech_stack: list[str] = Field(default_factory=list)
    report_text: Optional[str] = None
    code_snippet: Optional[str] = None


class AdaptiveTurnIn(BaseModel):
    session_id: str
    student_response: str
    response_time_seconds: float
    telemetry_summary: Optional[dict] = None


@app.post("/adaptive-defense/start")
async def adaptive_defense_start(
    body: AdaptiveStartIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Phase 2: Initialize an adaptive Socratic defense session and generate Turn 1.
    """
    session = await start_adaptive_defense_session(
        evidence_id=body.evidence_id,
        student_id=body.student_id,
        title=body.title,
        description=body.description,
        tech_stack=body.tech_stack,
        report_text=body.report_text,
        code_snippet=body.code_snippet,
    )
    _adaptive_session_store[session.session_id] = session
    return session.model_dump()


@app.post("/adaptive-defense/turn")
async def adaptive_defense_turn(
    body: AdaptiveTurnIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Phase 2: Submit a response to the active turn.
    Evaluates response against rubric and adaptively produces the next turn probe
    or final IRT competency estimation.
    """
    session = _adaptive_session_store.get(body.session_id)
    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Adaptive defense session not found or expired.")

    updated_session = await submit_turn_and_adapt(
        session=session,
        student_response=body.student_response,
        response_time_seconds=body.response_time_seconds,
        telemetry_summary=body.telemetry_summary,
    )
    _adaptive_session_store[body.session_id] = updated_session
    return updated_session.model_dump()


# ══════════════════════════════════════════════════════════════
# PHASE 4: FORMAL IRT & BAYESIAN COMPETENCY ENDPOINTS
# ══════════════════════════════════════════════════════════════

from .irt_model import (
    DefenseItemParameters,
    ItemResponseObservation,
    estimate_competency_map,
)

class IRTEstimateIn(BaseModel):
    skill_name: str
    observations: list[dict]  # item_id, observed_category, response_time, raw_eval_score
    items: list[dict]        # item_id, item_type, discrimination, difficulty_thresholds
    faculty_prior_mean: Optional[float] = None
    faculty_prior_sd: Optional[float] = None


@app.post("/competency/estimate-irt")
def competency_estimate_irt(
    body: IRTEstimateIn,
    user_id: str = Depends(verify_jwt),
):
    """
    Phase 4: Run formal Samejima Graded Response Model (GRM) Bayesian MAP estimation.
    Returns θ̂, standard error SE(θ̂), 95% Credible Interval, and Fisher Information.
    """
    item_dict = {
        it["item_id"]: DefenseItemParameters(
            item_id=it["item_id"],
            item_type=it.get("item_type", "tradeoff"),
            discrimination=float(it.get("discrimination", 1.8)),
            difficulty_thresholds=[float(b) for b in it.get("difficulty_thresholds", [-1.0, 0.0, 1.0])],
        )
        for it in body.items
    }

    obs_list = [
        ItemResponseObservation(
            item_id=o["item_id"],
            observed_category=int(o["observed_category"]),
            response_time_seconds=float(o.get("response_time_seconds", 30.0)),
            raw_eval_score=float(o.get("raw_eval_score", 70.0)),
            feedback=o.get("feedback", ""),
        )
        for o in body.observations
    ]

    result = estimate_competency_map(
        skill_name=body.skill_name,
        observations=obs_list,
        items=item_dict,
        faculty_prior_mean=body.faculty_prior_mean,
        faculty_prior_sd=body.faculty_prior_sd,
    )
    from dataclasses import asdict
    return asdict(result)

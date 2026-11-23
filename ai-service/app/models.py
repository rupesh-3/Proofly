from pydantic import BaseModel, Field
from typing import Optional


class IdeaIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=20, max_length=3000)


class SimilarityMatch(BaseModel):
    project_id: str
    title: str
    student_name: str
    score: float
    semantic_score: float
    structural_score: float
    breakdown: dict


class SimilarityOut(BaseModel):
    matches: list[SimilarityMatch]
    note: str


class EmbedEvidenceIn(BaseModel):
    evidence_id: str
    title: str
    description: str


class EmbedEvidenceOut(BaseModel):
    evidence_id: str
    status: str


class SkillScore(BaseModel):
    skill_name: str
    confidence: float
    level: str


class SkillConfidenceOut(BaseModel):
    student_id: str
    skills: list[SkillScore]


class OpportunityMatchIn(BaseModel):
    opportunity_id: str
    opportunity_title: str
    opportunity_description: str
    required_skills: list[dict]  # [{skill_name, weight}]


class OpportunityMatchOut(BaseModel):
    opportunity_id: str
    score: float
    structural_skill_fit: float
    semantic_fit: float
    evidence_strength: float
    you_have: list[dict]
    you_need: list[dict]
    why_matched: list[str]
    next_best_action: str


# ──────────────────────────────────────────────────────────────
# Defense Challenge Models (Module 1 — ASI Protocol)
# ──────────────────────────────────────────────────────────────

class DefenseGenerateIn(BaseModel):
    """Request to generate a defense challenge for an evidence item."""
    evidence_id: str
    evidence_type: str = Field(
        description="One of: project, internship, certificate, hackathon, competition, achievement"
    )
    title: str
    description: str
    report_text: Optional[str] = None
    code_snippet: Optional[str] = None
    tech_stack: list[str] = Field(default_factory=list)
    claimed_skills: list[str] = Field(default_factory=list)


class DefenseQuestionOut(BaseModel):
    question_id: str
    question_type: str
    question_text: str
    context_snippet: Optional[str] = None
    time_limit_seconds: int = 45
    rubric: dict = Field(default_factory=dict)
    expected_key_concepts: list[str] = Field(default_factory=list)


class DefenseChallengeOut(BaseModel):
    challenge_id: str
    evidence_id: str
    evidence_type: str
    title: str
    questions: list[DefenseQuestionOut]
    total_time_seconds: int
    generated_at: str
    artifact_hash: str


class QuestionResponseIn(BaseModel):
    """A student's answer to one defense question."""
    question_id: str
    response_text: str
    time_taken_seconds: float
    keystroke_events: list[dict] = Field(default_factory=list)
    tab_switch_count: int = 0
    paste_attempt_count: int = 0


class DefenseSubmissionIn(BaseModel):
    """Full submission of all defense responses."""
    challenge_id: str
    evidence_id: str
    student_id: str
    responses: list[QuestionResponseIn]
    started_at: str
    completed_at: str


class QuestionEvaluationOut(BaseModel):
    question_id: str
    question_type: str
    conceptual_precision: float
    technical_depth: float
    response_authenticity: float
    weighted_score: float
    feedback: str
    key_concepts_hit: list[str]
    key_concepts_missed: list[str]
    flags: list[str] = Field(default_factory=list)


class TelemetryAnalysisOut(BaseModel):
    typing_cadence_score: float
    mean_ikl_ms: float
    ikl_std_ms: float
    burstiness_index: float
    pause_frequency: float
    tab_switch_penalty: float
    paste_penalty: float
    overall_confidence: float
    flags: list[str] = Field(default_factory=list)


class DefenseReportOut(BaseModel):
    challenge_id: str
    evidence_id: str
    student_id: str
    asi_score: float
    telemetry_confidence: float
    combined_defense_score: float
    defense_level: str
    question_evaluations: list[QuestionEvaluationOut]
    telemetry_analysis: TelemetryAnalysisOut
    transcript: list[dict]
    evaluated_at: str
    report_hash: str


# ──────────────────────────────────────────────────────────────
# Verifiable Credential Models (Module 4)
# ──────────────────────────────────────────────────────────────

class IssueCredentialIn(BaseModel):
    skill_name: str


class VerifyCredentialIn(BaseModel):
    credential: dict


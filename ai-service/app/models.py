from pydantic import BaseModel, Field


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


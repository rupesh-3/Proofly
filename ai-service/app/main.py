"""
Proofly AI Service — FastAPI main application.
Run locally: uvicorn app.main:app --reload
"""
from __future__ import annotations

import os
from datetime import date, datetime

from dotenv import load_dotenv
load_dotenv()

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
)

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

app = FastAPI(title="Proofly AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
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


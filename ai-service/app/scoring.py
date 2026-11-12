"""
Single source of truth for all Proofly scoring formulas.
The frontend ONLY displays numbers returned from these functions.
"""

from __future__ import annotations

TYPE_WEIGHT: dict[str, float] = {
    "internship":   30.0,
    "project":      25.0,
    "hackathon":    20.0,
    "competition":  18.0,
    "certificate":  15.0,
    "achievement":  12.0,
}

# Proof level → verification multiplier
VERIFY_FACTOR: dict[int, float] = {
    0: 0.2,  # self-reported, no file
    1: 0.4,  # file uploaded (URL only)
    2: 0.6,  # file uploaded + cross-checked externally
    3: 1.0,  # faculty-verified
    4: 1.0,  # admin-verified
}

# Proof level → maximum confidence cap
TRUST_CAP: dict[int, float] = {
    0: 20.0,
    1: 50.0,
    2: 70.0,
    3: 100.0,
    4: 100.0,
}

# Diminishing-returns decay between same-type evidences
DELTA = 0.7


def recency(months_ago: float) -> float:
    """Recency decay based on months since the evidence date."""
    if months_ago <= 12:
        return 1.0
    if months_ago <= 24:
        return 0.85
    return 0.7


def skill_confidence(evidence: list[dict]) -> float:
    """
    Calculate skill confidence (0-100) from a list of evidence dicts.

    Each dict must have:
      - type        (str)   e.g. "internship"
      - proof_level (int)   0-4
      - depth       (float) depth_factor from DB (default 1.0)
      - months_ago  (float) months since event_date
    """
    by_type: dict[str, list[float]] = {}

    for e in evidence:
        t = e.get("type", "project").lower()
        weight = TYPE_WEIGHT.get(t, 10.0)
        v_factor = VERIFY_FACTOR.get(int(e.get("proof_level", 0)), 0.2)
        depth = float(e.get("depth", 1.0))
        r_factor = recency(float(e.get("months_ago", 0)))

        pts = weight * v_factor * depth * r_factor
        by_type.setdefault(t, []).append(pts)

    total = 0.0
    for pts_list in by_type.values():
        for n, pts in enumerate(sorted(pts_list, reverse=True)):
            total += pts * (DELTA ** n)

    best_level = max((int(e.get("proof_level", 0)) for e in evidence), default=0)
    cap = TRUST_CAP.get(best_level, 20.0)
    return round(min(total, cap, 100.0), 1)


def hybrid_similarity(semantic: float, structural: float) -> float:
    """
    Combine semantic (pgvector cosine) and structural (Jaccard) scores.
    Returns a 0-100 score.
    """
    return round(0.6 * semantic + 0.4 * structural, 1)


def weighted_jaccard(a: set, b: set) -> float:
    union = a | b
    if not union:
        return 0.0
    return len(a & b) / len(union)


def opportunity_match_score(
    structural_skill_fit: float,
    semantic_fit: float,
    evidence_strength: float,
) -> float:
    """
    Final match score for student × opportunity.
    0.5 × structural + 0.3 × semantic + 0.2 × evidence_strength
    """
    raw = 0.5 * structural_skill_fit + 0.3 * semantic_fit + 0.2 * evidence_strength
    return round(min(100.0, max(0.0, raw)), 1)


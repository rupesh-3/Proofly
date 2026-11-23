"""
Proofly — Bayesian Latent Competency Calibration (Module 3)

Implements the formal Dual-Observer IRT-inspired model for the IEEE paper:

    θ = σ( w₁·S_artifact + w₂·S_ASI·C_telemetry + w₃·S_faculty )

Where:
  S_artifact  = static artifact quality score (proof level + depth + recency)
  S_ASI       = Adversarial Socratic Interrogation score (0-100)
  C_telemetry = keystroke telemetry authenticity confidence (0-1)
  S_faculty   = faculty attestation weight (0 or 1, with granular sub-scores)
  σ           = sigmoid squash to (0, 100) with configurable steepness

This replaces the ad-hoc heuristic scoring with a principled mathematical model
suitable for peer-reviewed publication.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Optional

# ---------------------------------------------------------------------------
# Model Hyperparameters (tunable, reported in the paper)
# ---------------------------------------------------------------------------

# Observer weights (must sum to 1.0)
W_ARTIFACT = 0.30   # Static evidence quality
W_ASI = 0.45         # Dynamic defense interrogation (the core novelty)
W_FACULTY = 0.25     # Faculty human attestation

# Sigmoid parameters for final calibration
SIGMOID_STEEPNESS = 0.08  # Controls how sharp the transition is
SIGMOID_MIDPOINT = 50.0   # Score at which confidence = 50%

# Trust caps per proof level (unchanged from original, but now justified)
TRUST_CAP: dict[int, float] = {
    0: 20.0,   # Self-reported, no proof → hard cap
    1: 40.0,   # File/URL uploaded
    2: 70.0,   # AI Defense passed (NEW — the key contribution)
    3: 100.0,  # Faculty verified
    4: 100.0,  # Institutional / industry attested
}

# Evidence type weights (domain-specific priors)
TYPE_WEIGHT: dict[str, float] = {
    "internship":   30.0,
    "project":      25.0,
    "hackathon":    20.0,
    "competition":  18.0,
    "certificate":  15.0,
    "achievement":  12.0,
}

# Verification factor by proof level
VERIFY_FACTOR: dict[int, float] = {
    0: 0.2,  # Self-reported
    1: 0.4,  # Uploaded proof
    2: 0.7,  # AI Defense passed
    3: 1.0,  # Faculty verified
    4: 1.0,  # Admin verified
}

# Recency decay function constants
RECENCY_THRESHOLDS = [
    (12,  1.0),   # Within 1 year: full weight
    (24,  0.85),  # 1-2 years: slight decay
    (36,  0.70),  # 2-3 years: moderate decay
    (999, 0.55),  # Older: significant decay
]

# Diminishing returns for multiple evidences of same type
DIMINISHING_DECAY = 0.7


# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

@dataclass
class EvidenceSignal:
    """A single piece of evidence contributing to skill confidence."""
    evidence_type: str       # e.g., "internship", "project"
    proof_level: int         # 0-4
    depth_factor: float      # 1.0 default, can be > 1.0 for exceptional work
    months_ago: float        # Months since the evidence was produced
    asi_score: Optional[float] = None  # 0-100, from defense challenge
    telemetry_confidence: Optional[float] = None  # 0-1, from keystroke analysis
    faculty_verified: bool = False
    faculty_sub_scores: dict = field(default_factory=dict)
    # Optional: faculty sub-scores like {exists: True, authorship: True, quality: True}


@dataclass
class CompetencyEstimate:
    """The output of the calibration model for a single skill."""
    skill_name: str
    raw_score: float          # Unbounded intermediate score
    calibrated_confidence: float  # 0-100, sigmoid-calibrated
    trust_cap: float          # Maximum possible based on highest proof level
    final_confidence: float   # min(calibrated, trust_cap)
    level: str                # Beginner | Intermediate | Advanced
    # Component breakdown (for paper's ablation study)
    s_artifact: float
    s_asi: float
    c_telemetry: float
    s_faculty: float
    # Metadata
    evidence_count: int
    highest_proof_level: int
    flags: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Core Mathematical Functions
# ---------------------------------------------------------------------------

def _recency_decay(months_ago: float) -> float:
    """
    Piecewise linear recency decay.
    
    Maps time since evidence to a decay factor in [0.55, 1.0].
    Recent evidence has full weight; older evidence is down-weighted.
    """
    for threshold, factor in RECENCY_THRESHOLDS:
        if months_ago <= threshold:
            return factor
    return 0.55


def _sigmoid(x: float, steepness: float = SIGMOID_STEEPNESS,
             midpoint: float = SIGMOID_MIDPOINT) -> float:
    """
    Sigmoid calibration function mapping raw score to (0, 100).
    
        σ(x) = 100 / (1 + exp(-k * (x - x₀)))
    
    This ensures scores are well-calibrated and interpretable:
    - Scores near midpoint → ~50 confidence
    - Very high raw scores → asymptotically approach 100
    - Very low raw scores → asymptotically approach 0
    """
    try:
        return 100.0 / (1.0 + math.exp(-steepness * (x - midpoint)))
    except OverflowError:
        return 0.0 if x < midpoint else 100.0


def _artifact_quality_score(evidence: list[EvidenceSignal]) -> float:
    """
    S_artifact: Static artifact quality score.
    
    Combines evidence type weight, verification factor, depth, and recency
    with diminishing returns for same-type evidences.
    
    Formula:
        S_artifact = Σ_type [ Σ_n (δ^n · w_type · v_level · d · r(t)) ]
    
    Where δ = 0.7 provides diminishing returns within each type.
    """
    by_type: dict[str, list[float]] = {}

    for e in evidence:
        t = e.evidence_type.lower()
        weight = TYPE_WEIGHT.get(t, 10.0)
        v_factor = VERIFY_FACTOR.get(e.proof_level, 0.2)
        depth = max(0.1, e.depth_factor)
        r_factor = _recency_decay(e.months_ago)

        points = weight * v_factor * depth * r_factor
        by_type.setdefault(t, []).append(points)

    total = 0.0
    for pts_list in by_type.values():
        for n, pts in enumerate(sorted(pts_list, reverse=True)):
            total += pts * (DIMINISHING_DECAY ** n)

    return total


def _asi_aggregate_score(evidence: list[EvidenceSignal]) -> float:
    """
    S_ASI: Aggregate Adversarial Socratic Interrogation score.
    
    If multiple evidences have ASI scores, take the weighted average
    where more recent and higher-proof-level defenses count more.
    """
    scored = [(e.asi_score, e.months_ago, e.proof_level)
              for e in evidence if e.asi_score is not None]

    if not scored:
        return 0.0

    weighted_sum = 0.0
    weight_sum = 0.0
    for score, months, level in scored:
        recency_w = _recency_decay(months)
        level_w = 1.0 + 0.1 * level  # Slightly favor higher-proof evidences
        w = recency_w * level_w
        weighted_sum += score * w
        weight_sum += w

    return weighted_sum / weight_sum if weight_sum > 0 else 0.0


def _telemetry_aggregate(evidence: list[EvidenceSignal]) -> float:
    """
    C_telemetry: Aggregate keystroke telemetry confidence.
    
    Returns the minimum telemetry confidence across all defense sessions.
    Using min (not mean) because a single suspicious session should drag
    down the overall trust.
    """
    confidences = [e.telemetry_confidence for e in evidence
                   if e.telemetry_confidence is not None]
    if not confidences:
        return 1.0  # No telemetry data → no penalty (neutral)

    return min(confidences)


def _faculty_score(evidence: list[EvidenceSignal]) -> float:
    """
    S_faculty: Faculty attestation signal.
    
    Returns 100 if any evidence is faculty-verified, 0 otherwise.
    Sub-scores (exists, authorship, quality) can modulate this.
    """
    for e in evidence:
        if e.faculty_verified:
            sub = e.faculty_sub_scores
            if sub:
                # Granular: average of sub-score booleans
                checks = [
                    sub.get("checked_exists", False),
                    sub.get("checked_authorship", False),
                    sub.get("checked_quality", False),
                ]
                return (sum(checks) / len(checks)) * 100.0
            return 100.0

    return 0.0


# ---------------------------------------------------------------------------
# Main Calibration Function
# ---------------------------------------------------------------------------

def calibrate_competency(
    skill_name: str,
    evidence: list[EvidenceSignal],
) -> CompetencyEstimate:
    """
    Compute the calibrated competency estimate for a single skill.
    
    This is the core function implementing the paper's formal model:
    
        θ_raw = w₁·S_artifact + w₂·(S_ASI · C_telemetry) + w₃·S_faculty
        θ = σ(θ_raw)
        confidence = min(θ, trust_cap[max_proof_level])
    
    Parameters
    ----------
    skill_name : str
        The canonical skill name (e.g., "Python", "Machine Learning")
    evidence : list[EvidenceSignal]
        All evidence items tagged with this skill
    
    Returns
    -------
    CompetencyEstimate
        Full calibrated result with component breakdown for ablation study
    """
    if not evidence:
        return CompetencyEstimate(
            skill_name=skill_name,
            raw_score=0.0,
            calibrated_confidence=0.0,
            trust_cap=0.0,
            final_confidence=0.0,
            level="Beginner",
            s_artifact=0.0,
            s_asi=0.0,
            c_telemetry=1.0,
            s_faculty=0.0,
            evidence_count=0,
            highest_proof_level=0,
        )

    # Compute component scores
    s_artifact = _artifact_quality_score(evidence)
    s_asi = _asi_aggregate_score(evidence)
    c_telemetry = _telemetry_aggregate(evidence)
    s_faculty = _faculty_score(evidence)

    # Dual-observer combination
    raw_score = (
        W_ARTIFACT * s_artifact +
        W_ASI * (s_asi * c_telemetry) +
        W_FACULTY * s_faculty
    )

    # Sigmoid calibration
    calibrated = _sigmoid(raw_score)

    # Trust cap based on highest proof level
    highest_level = max(e.proof_level for e in evidence)
    cap = TRUST_CAP.get(highest_level, 20.0)

    final = round(min(calibrated, cap), 1)

    # Level determination
    if final < 35:
        level = "Beginner"
    elif final < 70:
        level = "Intermediate"
    else:
        level = "Advanced"

    # Flags
    flags: list[str] = []
    if s_asi > 0 and c_telemetry < 0.5:
        flags.append("low_telemetry_confidence")
    if highest_level <= 1 and s_asi == 0:
        flags.append("no_active_defense")
    if len(evidence) == 1 and evidence[0].proof_level == 0:
        flags.append("single_unverified_claim")

    return CompetencyEstimate(
        skill_name=skill_name,
        raw_score=round(raw_score, 2),
        calibrated_confidence=round(calibrated, 1),
        trust_cap=cap,
        final_confidence=final,
        level=level,
        s_artifact=round(s_artifact, 2),
        s_asi=round(s_asi, 2),
        c_telemetry=round(c_telemetry, 3),
        s_faculty=round(s_faculty, 2),
        evidence_count=len(evidence),
        highest_proof_level=highest_level,
        flags=flags,
    )


# ---------------------------------------------------------------------------
# Batch Calibration (for dashboard and paper evaluation)
# ---------------------------------------------------------------------------

def calibrate_all_skills(
    skill_evidence_map: dict[str, list[EvidenceSignal]],
) -> list[CompetencyEstimate]:
    """
    Calibrate all skills for a student.
    
    Parameters
    ----------
    skill_evidence_map : dict
        Maps skill_name → list of EvidenceSignal objects
    
    Returns
    -------
    list[CompetencyEstimate]
        Sorted by final_confidence descending
    """
    results = [
        calibrate_competency(skill, evidence)
        for skill, evidence in skill_evidence_map.items()
    ]
    results.sort(key=lambda r: r.final_confidence, reverse=True)
    return results


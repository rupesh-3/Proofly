"""
Proofly — Mathematical Competency Model (Phase 4)

Formally specified Item Response Theory (IRT) and Bayesian Latent-Variable Estimation.

Theoretical Formulation:
  Implements Samejima's Graded Response Model (GRM) for polytomous multi-category
  technical defense evaluations, alongside a dichotomous 2-Parameter Logistic (2PL) model.

Mathematical Framework:
  1. Latent Competency Trait:
       θ ~ N(μ₀, σ₀²)   where θ ∈ (-∞, +∞) (standardized latent scale, typically [-3, +3])

  2. Cumulative Response Probability (Samejima's GRM):
       P*_{jk}(θ) = P(Y_j ≥ k | θ) = 1 / (1 + exp(-a_j * (θ - b_{jk})))
       where:
         - a_j > 0 is item discrimination parameter
         - b_{jk} are category difficulty thresholds: b_{j1} ≤ b_{j2} ≤ ... ≤ b_{jK}
         - P*_{j0}(θ) = 1.0,  P*_{j,K+1}(θ) = 0.0

  3. Category Probability:
       P(Y_j = k | θ) = P*_{jk}(θ) - P*_{j,k+1}(θ)

  4. Bayesian Posterior (Log-Posterior):
       log p(θ | y) = Σ_j log P(Y_j = y_j | θ) - (θ - μ₀)² / (2σ₀²) + C

  5. Newton-Raphson Maximum A Posteriori (MAP) Estimation:
       θ^(t+1) = θ^(t) - [d/dθ log p(θ^(t) | y)] / [d²/dθ² log p(θ^(t) | y)]

  6. Fisher Information and Standard Error of Measurement:
       I(θ) = Σ_j a_j² Σ_k [ (P*'_{jk}(θ) - P*'_{j,k+1}(θ))² / P(Y_j = k | θ) ]
       SE(θ̂) = 1 / sqrt( I(θ̂) + 1/σ₀² )

  7. Credible Interval:
       95% CI = [θ̂ - 1.96 * SE(θ̂), θ̂ + 1.96 * SE(θ̂)]
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Optional


# ---------------------------------------------------------------------------
# Data Models for IRT Assessment
# ---------------------------------------------------------------------------

@dataclass
class DefenseItemParameters:
    """
    IRT parameters for a specific defense challenge probe.
    """
    item_id: str
    item_type: str  # "tradeoff" | "counterfactual" | "debug" | "explain"
    discrimination: float  # a_j > 0 (typically 0.8 - 2.5)
    # Category boundary thresholds for 4-point rubric (0=Unsatisfactory, 1=Basic, 2=Competent, 3=Deep)
    difficulty_thresholds: list[float]  # [b_j1, b_j2, b_j3] strictly ascending
    evidence_grounding_factor: float = 1.0  # Quality multiplier for artifact-specific grounding


@dataclass
class ItemResponseObservation:
    """Observed score for a single defense question."""
    item_id: str
    observed_category: int  # 0, 1, 2, or 3
    response_time_seconds: float
    raw_eval_score: float  # 0-100 continuous score before discretization
    feedback: str = ""


@dataclass
class CompetencyEstimateResult:
    """
    Formal output of the Bayesian IRT competency estimation.
    """
    skill_name: str
    theta_map: float            # Latent trait estimate (standardized scale, typically -3.0 to +3.0)
    theta_percentile: float     # Converted to 0-100 percentile/score
    standard_error: float       # Asymptotic SE(θ̂) from Fisher Information
    ci_95_lower: float          # Lower bound of 95% Credible Interval
    ci_95_upper: float          # Upper bound of 95% Credible Interval
    test_information: float     # Total Fisher Information at θ̂
    reliability_index: float    # Empirical reliability coefficient ρ = 1 - (SE² / Var(θ))
    competency_classification: str  # "Novice" | "Developing" | "Competent" | "Advanced" | "Expert"
    faculty_prior_applied: bool
    evidence_count: int
    diagnostics: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Graded Response Model (GRM) Core Functions
# ---------------------------------------------------------------------------

def _p_star(theta: float, a: float, b_k: float) -> float:
    """Cumulative probability P*(Y ≥ k | θ) = 1 / (1 + exp(-a * (θ - b_k)))."""
    val = -a * (theta - b_k)
    # Numerical stability clamping
    if val > 35.0:
        return 0.0
    if val < -35.0:
        return 1.0
    return 1.0 / (1.0 + math.exp(val))


def _category_probs(theta: float, a: float, thresholds: list[float]) -> list[float]:
    """
    Compute P(Y = k | θ) for all categories k ∈ {0, ..., K}.
    thresholds: [b_1, ..., b_K]
    Returns list of length K+1.
    """
    K = len(thresholds)
    # p_stars: [P*(0)=1.0, P*(1), ..., P*(K), P*(K+1)=0.0]
    p_stars = [1.0] + [_p_star(theta, a, b) for b in thresholds] + [0.0]

    probs = []
    for k in range(K + 1):
        pk = p_stars[k] - p_stars[k + 1]
        probs.append(max(1e-9, min(1.0 - 1e-9, pk)))
    return probs


def log_posterior(
    theta: float,
    observations: list[ItemResponseObservation],
    items: dict[str, DefenseItemParameters],
    mu_0: float = 0.0,
    sigma_0: float = 1.0,
) -> float:
    """Log-posterior density log p(θ | y)."""
    prior_term = -0.5 * ((theta - mu_0) / sigma_0) ** 2

    log_lik = 0.0
    for obs in observations:
        item = items.get(obs.item_id)
        if not item:
            continue
        probs = _category_probs(theta, item.discrimination, item.difficulty_thresholds)
        k = max(0, min(len(probs) - 1, obs.observed_category))
        log_lik += math.log(probs[k])

    return log_lik + prior_term


def log_posterior_derivatives(
    theta: float,
    observations: list[ItemResponseObservation],
    items: dict[str, DefenseItemParameters],
    mu_0: float = 0.0,
    sigma_0: float = 1.0,
) -> tuple[float, float]:
    """
    Compute 1st and 2nd derivatives of log p(θ | y) with respect to θ.
    Uses robust central finite differences with h = 1e-4.
    """
    h = 1e-4
    f_p = log_posterior(theta + h, observations, items, mu_0, sigma_0)
    f_0 = log_posterior(theta, observations, items, mu_0, sigma_0)
    f_m = log_posterior(theta - h, observations, items, mu_0, sigma_0)

    d1 = (f_p - f_m) / (2.0 * h)
    d2 = (f_p - 2.0 * f_0 + f_m) / (h ** 2)
    return d1, d2


def calculate_fisher_information(
    theta: float,
    items: list[DefenseItemParameters],
) -> float:
    """
    Total test Fisher Information at trait level θ:
      I(θ) = Σ_j a_j² Σ_k [ (P*'_{jk} - P*'_{j,k+1})² / P_jk ]
    """
    total_info = 0.0
    h = 1e-4

    for item in items:
        a = item.discrimination
        thresholds = item.difficulty_thresholds
        K = len(thresholds)

        p_stars_plus = [1.0] + [_p_star(theta + h, a, b) for b in thresholds] + [0.0]
        p_stars_minus = [1.0] + [_p_star(theta - h, a, b) for b in thresholds] + [0.0]

        probs = _category_probs(theta, a, thresholds)

        item_info = 0.0
        for k in range(K + 1):
            d_p_star_k = (p_stars_plus[k] - p_stars_minus[k]) / (2.0 * h)
            d_p_star_k1 = (p_stars_plus[k + 1] - p_stars_minus[k + 1]) / (2.0 * h)
            d_prob = d_p_star_k - d_p_star_k1
            item_info += (d_prob ** 2) / probs[k]

        total_info += item_info

    return max(0.01, total_info)


# ---------------------------------------------------------------------------
# Maximum A Posteriori (MAP) Solver
# ---------------------------------------------------------------------------

def estimate_competency_map(
    skill_name: str,
    observations: list[ItemResponseObservation],
    items: dict[str, DefenseItemParameters],
    faculty_prior_mean: Optional[float] = None,
    faculty_prior_sd: Optional[float] = None,
) -> CompetencyEstimateResult:
    """
    Estimate latent competency θ̂ via Bayesian MAP using Newton-Raphson.

    Parameters:
      skill_name: Name of skill being estimated
      observations: Student responses across defense items
      items: IRT parameters for the items
      faculty_prior_mean: If faculty has attested/rated, adjusts prior μ₀
      faculty_prior_sd: Uncertainty of faculty prior (e.g. 0.5 for high confidence)
    """
    # 1. Establish prior
    mu_0 = faculty_prior_mean if faculty_prior_mean is not None else 0.0
    sigma_0 = faculty_prior_sd if faculty_prior_sd is not None else 1.0

    if not observations:
        # Default uninformative estimate
        return CompetencyEstimateResult(
            skill_name=skill_name,
            theta_map=mu_0,
            theta_percentile=50.0,
            standard_error=sigma_0,
            ci_95_lower=mu_0 - 1.96 * sigma_0,
            ci_95_upper=mu_0 + 1.96 * sigma_0,
            test_information=1.0 / (sigma_0 ** 2),
            reliability_index=0.0,
            competency_classification="Novice",
            faculty_prior_applied=faculty_prior_mean is not None,
            evidence_count=0,
            diagnostics={"convergence": True, "iterations": 0},
        )

    # 2. Newton-Raphson iteration
    theta = mu_0
    max_iter = 50
    tol = 1e-4
    converged = False
    iterations = 0

    for i in range(max_iter):
        iterations = i + 1
        d1, d2 = log_posterior_derivatives(theta, observations, items, mu_0, sigma_0)

        # Enforce negative curvature
        if d2 >= 0.0:
            d2 = -0.5

        step = d1 / d2
        # Damping step to prevent overshoot
        if abs(step) > 1.0:
            step = math.copysign(1.0, step)

        theta_new = theta - step
        # Restrict θ to reasonable bounds [-4.0, +4.0]
        theta_new = max(-4.0, min(4.0, theta_new))

        if abs(theta_new - theta) < tol:
            theta = theta_new
            converged = True
            break
        theta = theta_new

    # 3. Compute Fisher Information and Standard Error
    relevant_items = [items[obs.item_id] for obs in observations if obs.item_id in items]
    fisher_info = calculate_fisher_information(theta, relevant_items)
    prior_info = 1.0 / (sigma_0 ** 2)
    total_info = fisher_info + prior_info
    standard_error = 1.0 / math.sqrt(total_info)

    # 4. Standardized score conversion to 0-100 scale (Normal CDF mapping)
    # θ = 0 maps to 50%, θ = +2 maps to ~95%, θ = -2 maps to ~5%
    z_score = theta / 1.5  # Scale factor so ±3 covers ~99% of domain
    percentile = 0.5 * (1.0 + math.erf(z_score / math.sqrt(2.0))) * 100.0
    percentile = round(max(0.0, min(100.0, percentile)), 1)

    # 5. Reliability index ρ = 1 - (SE² / 1.0)
    var_theta = 1.0
    reliability = max(0.0, min(0.99, 1.0 - (standard_error ** 2 / var_theta)))

    # 6. Classification
    if percentile >= 85.0:
        classification = "Expert"
    elif percentile >= 70.0:
        classification = "Advanced"
    elif percentile >= 50.0:
        classification = "Competent"
    elif percentile >= 30.0:
        classification = "Developing"
    else:
        classification = "Novice"

    return CompetencyEstimateResult(
        skill_name=skill_name,
        theta_map=round(theta, 3),
        theta_percentile=percentile,
        standard_error=round(standard_error, 3),
        ci_95_lower=round(theta - 1.96 * standard_error, 3),
        ci_95_upper=round(theta + 1.96 * standard_error, 3),
        test_information=round(total_info, 2),
        reliability_index=round(reliability, 3),
        competency_classification=classification,
        faculty_prior_applied=faculty_prior_mean is not None,
        evidence_count=len(observations),
        diagnostics={
            "converged": converged,
            "iterations": iterations,
            "fisher_info": round(fisher_info, 2),
            "prior_info": round(prior_info, 2),
        },
    )


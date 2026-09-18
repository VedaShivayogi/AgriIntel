"""Soil health scoring service.

IMPORTANT: This is a heuristic scoring model for demonstration.
Real agronomic thresholds should be configured by an agronomist.
"""
from typing import Optional


# Very generic thresholds for demonstration only.
# Real thresholds depend on crop, soil type, region.
IDEAL = {
    "ph": (6.0, 7.5),
    "nitrogen_kg_ha": (280, 560),
    "phosphorus_kg_ha": (10, 30),
    "potassium_kg_ha": (120, 300),
    "organic_carbon_pct": (0.5, 1.5),
    "moisture_pct": (20, 35),
}


def _score_range(value: Optional[float], lo: float, hi: float) -> float:
    """Return 0-100 score for a value within an ideal band."""
    if value is None:
        return 50.0
    if lo <= value <= hi:
        return 100.0
    if value < lo:
        span = max(lo - 0, 1e-6)
        return max(0.0, 100.0 * (value / span)) if value > 0 else 0.0
    # above ideal
    span = max(hi, 1e-6)
    excess = (value - hi) / span
    return max(0.0, 100.0 - excess * 100.0)


def compute_soil_health(soil) -> dict:
    components = {}
    scores = []

    mapping = {
        "ph": "ph",
        "nitrogen_kg_ha": "nitrogen_kg_ha",
        "phosphorus_kg_ha": "phosphorus_kg_ha",
        "potassium_kg_ha": "potassium_kg_ha",
        "organic_carbon_pct": "organic_carbon_pct",
        "moisture_pct": "moisture_pct",
    }
    for attr, key in mapping.items():
        value = getattr(soil, attr, None)
        lo, hi = IDEAL[key]
        score = _score_range(value, lo, hi)
        components[attr] = {
            "value": value,
            "ideal": [lo, hi],
            "score": round(score, 1),
        }
        scores.append(score)

    overall = round(sum(scores) / max(len(scores), 1), 1)
    if overall >= 80:
        status = "Excellent"
    elif overall >= 65:
        status = "Good"
    elif overall >= 50:
        status = "Moderate"
    else:
        status = "Poor"

    recs = []
    if (soil.ph or 7) < IDEAL["ph"][0]:
        recs.append("Soil pH is below ideal — consider agronomist advice on liming.")
    if (soil.ph or 7) > IDEAL["ph"][1]:
        recs.append("Soil pH is above ideal — consider agronomist advice on acidification.")
    if (soil.nitrogen_kg_ha or 0) < IDEAL["nitrogen_kg_ha"][0]:
        recs.append("Nitrogen appears low — consult agronomist for nitrogen plan.")
    if (soil.organic_carbon_pct or 0) < IDEAL["organic_carbon_pct"][0]:
        recs.append("Organic carbon appears low — consider organic matter additions.")
    if not recs:
        recs.append("Soil parameters are within a reasonable range. Continue monitoring.")

    return {
        "score": overall,
        "status": status,
        "components": components,
        "recommendations": recs,
        "is_demo": True,
    }

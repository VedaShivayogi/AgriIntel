"""Rule-based risk scoring (demo). Returns 0-100 per risk dimension."""
from typing import Optional


def _clamp(x: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, x))


def compute_risk(
    rainfall_anomaly_pct: float = 0.0,
    soil_health_score: float = 75.0,
    disease_risk_level: str = "low",
    yield_cv_pct: float = 12.0,
    price_volatility_pct: float = 15.0,
    input_cost_inflation_pct: float = 5.0,
) -> dict:
    # Weather risk: |anomaly| scaled
    weather_risk = _clamp(min(abs(rainfall_anomaly_pct) * 1.5, 100))

    # Soil risk: inverse of health score
    soil_risk = _clamp(100 - soil_health_score)

    # Disease risk
    disease_map = {"low": 20.0, "medium": 50.0, "high": 80.0, "critical": 95.0}
    disease_risk = disease_map.get(disease_risk_level.lower(), 40.0)

    # Yield risk: coefficient of variation
    yield_risk = _clamp(yield_cv_pct * 3.0)

    # Market risk
    market_risk = _clamp(price_volatility_pct * 2.0)

    # Input cost risk
    input_cost_risk = _clamp(input_cost_inflation_pct * 4.0)

    dims = {
        "weather": weather_risk,
        "soil": soil_risk,
        "disease": disease_risk,
        "yield": yield_risk,
        "market": market_risk,
        "input_cost": input_cost_risk,
    }
    overall = sum(dims.values()) / len(dims)
    if overall >= 70:
        level = "High"
    elif overall >= 45:
        level = "Medium"
    else:
        level = "Low"

    explanations = {
        "weather": f"Rainfall anomaly of {rainfall_anomaly_pct:.1f}% affects weather risk.",
        "soil": f"Soil health score of {soil_health_score:.0f}/100 drives soil risk.",
        "disease": f"Disease risk level '{disease_risk_level}' contributes to disease risk.",
        "yield": f"Yield variability (CV={yield_cv_pct:.1f}%) determines yield risk.",
        "market": f"Price volatility ({price_volatility_pct:.1f}%) drives market risk.",
        "input_cost": f"Input cost inflation ({input_cost_inflation_pct:.1f}%) drives this dimension.",
    }

    return {
        "weather_risk": round(weather_risk, 1),
        "soil_risk": round(soil_risk, 1),
        "disease_risk": round(disease_risk, 1),
        "yield_risk": round(yield_risk, 1),
        "market_risk": round(market_risk, 1),
        "input_cost_risk": round(input_cost_risk, 1),
        "overall_risk": level,
        "explanations": explanations,
    }

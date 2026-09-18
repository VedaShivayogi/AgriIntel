"""Crop recommendation — DEMO heuristic provider (clearly labelled)."""
from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import (
    CropRecommendRequest, CropRecommendResponse, CropCandidate
)

router = APIRouter(prefix="/crop", tags=["crop"])


CANDIDATES = [
    # (name, base_yield_kg_ha, base_price, base_cost_per_ha, ideal_ph, ideal_rain, water_need)
    ("Chilli",  5200, 55, 146000, (6.0, 7.0), (500, 900), "medium"),
    ("Tomato",  35000, 18, 220000, (6.0, 7.0), (600, 1000), "high"),
    ("Maize",   8500, 22, 55000, (5.8, 7.0), (500, 900), "medium"),
    ("Ragi",    3000, 32, 32000, (5.5, 7.5), (400, 800), "low"),
    ("Groundnut", 2200, 62, 48000, (6.0, 7.5), (500, 900), "low"),
    ("Onion",   28000, 20, 180000, (6.0, 7.5), (500, 900), "high"),
]


@router.post("/recommend", response_model=CropRecommendResponse)
def recommend(payload: CropRecommendRequest, user: User = Depends(get_current_user)):
    ph = payload.soil_ph or 6.7
    rain = payload.rainfall_mm or 700
    temp = payload.temp_avg_c or 27.0
    water = (payload.water_availability or "medium").lower()
    price = payload.market_price_per_kg

    out: list[CropCandidate] = []
    for name, y, p, cost, ph_ideal, rain_ideal, water_need in CANDIDATES:
        # Suitability scoring
        ph_score = max(0.0, 1.0 - abs(ph - sum(ph_ideal) / 2) / 2.0)
        rain_score = max(0.0, 1.0 - abs(rain - sum(rain_ideal) / 2) / 400.0)
        water_score = 1.0 if water_need == water else (0.7 if abs(
            ["low", "medium", "high"].index(water_need) - ["low", "medium", "high"].index(water)
        ) == 1 else 0.35)
        temp_score = 1.0 if 20 <= temp <= 32 else 0.6
        suitability = round(100 * (0.3 * ph_score + 0.3 * rain_score + 0.2 * water_score + 0.2 * temp_score), 1)

        # Expected yield scaled by suitability (demo)
        exp_yield = round(y * (0.6 + 0.4 * suitability / 100.0), 1)
        exp_price = price if price else p
        exp_cost = cost * max(payload.farm_area_ha, 0.1)
        exp_rev = exp_yield * max(payload.farm_area_ha, 0.1) * exp_price
        exp_profit = exp_rev - exp_cost

        risk = "Low" if suitability > 75 else ("Medium" if suitability > 55 else "High")
        confidence = round(0.5 + 0.4 * suitability / 100.0, 2)
        explanation = (
            f"pH match {ph_score:.2f}, rainfall match {rain_score:.2f}, "
            f"water availability match {water_score:.2f}, temperature match {temp_score:.2f}. "
            "DEMO heuristic — not a scientific recommendation."
        )
        out.append(CropCandidate(
            crop=name,
            suitability=suitability,
            expected_yield_kg_ha=exp_yield,
            expected_cost_inr=round(exp_cost, 0),
            expected_revenue_inr=round(exp_rev, 0),
            expected_profit_inr=round(exp_profit, 0),
            risk=risk,
            confidence=confidence,
            explanation=explanation,
        ))

    out.sort(key=lambda c: c.suitability, reverse=True)
    return CropRecommendResponse(
        candidates=out,
        is_demo=True,
        disclaimer=(
            "DEMO recommendations. AI-generated agricultural recommendations are "
            "decision-support tools and should be validated with qualified agricultural experts."
        ),
    )

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import WhatIfRequest, WhatIfResponse

router = APIRouter(prefix="/what-if", tags=["what-if"])


@router.post("", response_model=WhatIfResponse)
def what_if(payload: WhatIfRequest, user: User = Depends(get_current_user)):
    # Baseline
    base_yield = payload.baseline_yield_kg_ha
    base_price = payload.baseline_price_per_kg
    base_cost = payload.baseline_total_cost
    base_revenue = base_yield * base_price
    base_profit = base_revenue - base_cost
    base_roi = (base_profit / base_cost * 100.0) if base_cost > 0 else 0.0

    # Scenario adjustments
    yield_delta_pct = payload.rainfall_change_pct * 0.25 + (-1.5) * payload.temp_change_c * 2.0
    if payload.disease_risk_change == "worsened":
        yield_delta_pct -= 8.0
    elif payload.disease_risk_change == "improved":
        yield_delta_pct += 4.0

    scen_yield = max(0.0, base_yield * (1.0 + yield_delta_pct / 100.0))
    scen_price = max(0.0, base_price * (1.0 + payload.market_price_change_pct / 100.0))

    # Cost adjustments only on the fertilizer/seed portion (rough demo split)
    fert_share = 0.30
    seed_share = 0.15
    scen_cost = base_cost * (
        1.0
        + fert_share * payload.fertilizer_cost_change_pct / 100.0
        + seed_share * payload.seed_cost_change_pct / 100.0
    )

    scen_revenue = scen_yield * scen_price
    scen_profit = scen_revenue - scen_cost
    scen_roi = (scen_profit / scen_cost * 100.0) if scen_cost > 0 else 0.0

    baseline = {
        "yield_kg_ha": round(base_yield, 1),
        "price_per_kg": round(base_price, 2),
        "total_cost": round(base_cost, 2),
        "revenue": round(base_revenue, 2),
        "profit": round(base_profit, 2),
        "roi_pct": round(base_roi, 2),
    }
    scenario = {
        "yield_kg_ha": round(scen_yield, 1),
        "price_per_kg": round(scen_price, 2),
        "total_cost": round(scen_cost, 2),
        "revenue": round(scen_revenue, 2),
        "profit": round(scen_profit, 2),
        "roi_pct": round(scen_roi, 2),
    }
    delta = {k: round(scenario[k] - baseline[k], 2) for k in baseline}

    return WhatIfResponse(
        baseline=baseline,
        scenario=scenario,
        delta=delta,
        disclaimer=(
            "Scenario simulation — not a guaranteed forecast. "
            "Illustrative linear response curves are used in this MVP."
        ),
    )

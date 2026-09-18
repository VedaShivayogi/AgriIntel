"""Cost / revenue / profit calculations. Pure math — no external data needed."""
from typing import Iterable


def compute_profit(
    area_ha: float,
    expected_yield_kg_ha: float,
    selling_price_per_kg: float,
    costs: Iterable[dict],
) -> dict:
    total_cost = float(sum(c.get("amount", 0.0) for c in costs))
    total_yield_kg = max(area_ha, 0.0) * max(expected_yield_kg_ha, 0.0)
    revenue = total_yield_kg * max(selling_price_per_kg, 0.0)
    profit = revenue - total_cost
    roi = (profit / total_cost * 100.0) if total_cost > 0 else 0.0

    # Break-even values (in kg/ha and ₹/kg)
    if total_yield_kg > 0:
        break_even_price = total_cost / total_yield_kg
    else:
        break_even_price = 0.0

    if selling_price_per_kg > 0:
        break_even_yield_total = total_cost / selling_price_per_kg
        break_even_yield_per_ha = break_even_yield_total / max(area_ha, 1e-6)
    else:
        break_even_yield_per_ha = 0.0

    return {
        "total_cost": round(total_cost, 2),
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "roi_pct": round(roi, 2),
        "break_even_price": round(break_even_price, 2),
        "break_even_yield_kg_ha": round(break_even_yield_per_ha, 2),
        "is_demo": True,
    }

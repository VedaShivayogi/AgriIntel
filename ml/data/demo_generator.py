"""Synthetic demo dataset generator for AgriIntel-X.

All rows are clearly labelled as SYNTHETIC. They are used only for
demonstration, UI wiring and pipeline testing. They must NOT be presented
as real farmer data or used to draw scientific conclusions.
"""
from __future__ import annotations
import argparse
import random
from pathlib import Path

import numpy as np
import pandas as pd


def generate(n: int = 600, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows = []
    seasons = ["Kharif 2022", "Rabi 2022", "Kharif 2023", "Rabi 2023", "Kharif 2024"]
    crops = ["Chilli", "Tomato", "Maize", "Ragi", "Groundnut", "Onion"]
    soil_types = ["Red", "Black", "Laterite", "Sandy Loam", "Clay Loam"]
    irrigation = ["drip", "sprinkler", "flood", "rainfed"]

    for i in range(n):
        soil_ph = float(np.clip(rng.normal(6.7, 0.5), 5.0, 8.5))
        soil_n = float(np.clip(rng.normal(300, 80), 80, 700))
        soil_p = float(np.clip(rng.normal(22, 8), 3, 60))
        soil_k = float(np.clip(rng.normal(190, 50), 60, 400))
        oc = float(np.clip(rng.normal(0.9, 0.35), 0.1, 2.5))
        rainfall = float(np.clip(rng.normal(650, 200), 150, 1400))
        temp = float(np.clip(rng.normal(27, 3), 15, 38))
        humidity = float(np.clip(rng.normal(70, 12), 30, 98))
        fertilizer = float(np.clip(rng.normal(240, 70), 50, 500))
        irrigation_type = rng.choice(irrigation)
        soil_type = rng.choice(soil_types)
        crop = rng.choice(crops)
        season = rng.choice(seasons)

        # Yield heuristic — biases per crop + soil/weather sensitivities (DEMO ONLY)
        base_by_crop = {
            "Chilli": 5000, "Tomato": 32000, "Maize": 8200,
            "Ragi": 2900, "Groundnut": 2100, "Onion": 26000,
        }
        y = base_by_crop[crop]
        y += (soil_n - 300) * 1.3
        y += (soil_p - 22) * 22
        y += (soil_k - 190) * 0.8
        y -= 60 * abs(soil_ph - 6.7)
        y += (rainfall - 650) * 0.5
        y -= 40 * abs(temp - 27)
        y += 0.6 * (fertilizer - 240)
        y += rng.normal(0, y * 0.07)
        y = max(300, y)

        area_ha = float(np.clip(rng.normal(1.5, 0.8), 0.2, 6.0))
        price_per_kg = float(np.clip(rng.normal(52 if crop == "Chilli" else 22, 6), 8, 90))
        seed_cost = area_ha * rng.uniform(4000, 12000)
        fert_cost = area_ha * rng.uniform(8000, 22000)
        pest_cost = area_ha * rng.uniform(3000, 9000)
        labour = area_ha * rng.uniform(15000, 35000)
        irrig_cost = area_ha * rng.uniform(2000, 12000)
        mach_cost = area_ha * rng.uniform(3000, 10000)
        other = area_ha * rng.uniform(2000, 8000)
        total_cost = seed_cost + fert_cost + pest_cost + labour + irrig_cost + mach_cost + other

        total_yield_kg = area_ha * y
        revenue = total_yield_kg * price_per_kg
        profit = revenue - total_cost

        rows.append({
            "record_id": i + 1,
            "season": season,
            "crop": crop,
            "soil_type": soil_type,
            "irrigation_type": irrigation_type,
            "area_ha": round(area_ha, 3),
            "soil_ph": round(soil_ph, 2),
            "soil_n_kg_ha": round(soil_n, 1),
            "soil_p_kg_ha": round(soil_p, 1),
            "soil_k_kg_ha": round(soil_k, 1),
            "organic_carbon_pct": round(oc, 2),
            "rainfall_mm": round(rainfall, 1),
            "temp_avg_c": round(temp, 1),
            "humidity_pct": round(humidity, 1),
            "fertilizer_kg_ha": round(fertilizer, 1),
            "yield_kg_ha": round(y, 1),
            "price_per_kg": round(price_per_kg, 2),
            "seed_cost": round(seed_cost, 2),
            "fertilizer_cost": round(fert_cost, 2),
            "pesticide_cost": round(pest_cost, 2),
            "labour_cost": round(labour, 2),
            "irrigation_cost": round(irrig_cost, 2),
            "machinery_cost": round(mach_cost, 2),
            "other_cost": round(other, 2),
            "total_cost": round(total_cost, 2),
            "revenue": round(revenue, 2),
            "profit": round(profit, 2),
            "data_source": "SYNTHETIC_DEMO",
        })

    return pd.DataFrame(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=600)
    parser.add_argument("--out", type=str, default="data/demo/agriintel_demo.csv")
    args = parser.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df = generate(n=args.rows)
    df.to_csv(out_path, index=False)
    print(f"[demo] Wrote {len(df)} SYNTHETIC rows to {out_path}")


if __name__ == "__main__":
    main()

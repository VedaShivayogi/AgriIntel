"""Train a yield prediction model on the SYNTHETIC demo dataset.

Produces: ml_artifacts/yield_model.joblib
"""
from __future__ import annotations
import argparse
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

FEATURES = [
    "soil_ph", "soil_n_kg_ha", "soil_p_kg_ha", "soil_k_kg_ha",
    "organic_carbon_pct", "rainfall_mm", "temp_avg_c", "humidity_pct",
    "fertilizer_kg_ha", "area_ha",
]
TARGET = "yield_kg_ha"


def train(csv_path: str, out_path: str) -> None:
    df = pd.read_csv(csv_path)
    missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")

    # chronological split via record_id (assumes demo is ordered by season)
    df = df.sort_values("record_id").reset_index(drop=True)
    split_idx = int(len(df) * 0.8)
    train_df, test_df = df.iloc[:split_idx], df.iloc[split_idx:]

    X_train = train_df[FEATURES].values
    y_train = train_df[TARGET].values
    X_test = test_df[FEATURES].values
    y_test = test_df[TARGET].values

    model = RandomForestRegressor(n_estimators=300, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, pred)))
    r2 = r2_score(y_test, pred)
    print(f"[train] MAE={mae:.2f} RMSE={rmse:.2f} R2={r2:.3f}")

    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({
        "model": model,
        "feature_names": FEATURES,
        "name": "random_forest_yield",
        "version": "rf-demo-0.1",
        "metrics": {"mae": mae, "rmse": rmse, "r2": r2},
    }, out)
    print(f"[train] Saved to {out}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--csv", default="data/demo/agriintel_demo.csv")
    p.add_argument("--out", default="ml_artifacts/yield_model.joblib")
    args = p.parse_args()
    train(args.csv, args.out)

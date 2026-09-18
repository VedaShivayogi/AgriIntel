"""SHAP-based explainability for the trained yield model (optional)."""
from __future__ import annotations
import joblib
import numpy as np
import pandas as pd


def explain(model_path: str, row: dict, background: pd.DataFrame | None = None) -> dict:
    bundle = joblib.load(model_path)
    model = bundle["model"]
    feature_names = bundle["feature_names"]
    X = pd.DataFrame([row])[feature_names]

    try:
        import shap
        if background is not None:
            explainer = shap.Explainer(model, background[feature_names])
        else:
            explainer = shap.Explainer(model)
        values = explainer(X).values[0]
        return {name: float(v) for name, v in zip(feature_names, values)}
    except Exception as e:
        # Fallback to feature_importances_ if SHAP unavailable
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            return {name: float(v) for name, v in zip(feature_names, importances)}
        return {"error": str(e)}

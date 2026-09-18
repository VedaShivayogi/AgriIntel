"""ML model interface for yield prediction."""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional


class BaseYieldModel(ABC):
    name: str = "base"
    version: str = "0.0"

    @abstractmethod
    def predict(self, features: dict) -> dict:
        """
        Returns:
            {
              "predicted_yield_kg_ha": float,
              "lower_bound_kg_ha": float,
              "upper_bound_kg_ha": float,
              "confidence": float,
              "model_name": str,
              "model_version": str,
              "is_demo": bool,
            }
        """
        raise NotImplementedError


class DemoYieldModel(BaseYieldModel):
    """Deterministic heuristic DEMO yield model. Not a trained model.

    Real implementation should load a trained sklearn/xgboost model artifact.
    """
    name = "demo_heuristic"
    version = "0.1-demo"

    def predict(self, features: dict) -> dict:
        soil_n = features.get("soil_n") or 300.0
        soil_p = features.get("soil_p") or 20.0
        soil_k = features.get("soil_k") or 180.0
        ph = features.get("soil_ph") or 6.7
        rain = features.get("rainfall_mm") or 600.0
        temp = features.get("temp_avg_c") or 27.0
        hist = features.get("historical_yield_kg_ha") or 4500.0
        fert = features.get("fertilizer_kg_ha") or 250.0

        # Very simple linear-ish heuristic — for demonstration.
        base = 3500.0
        base += (soil_n - 300) * 1.5
        base += (soil_p - 20) * 25.0
        base += (soil_k - 180) * 1.0
        base += -80 * abs(ph - 6.7)
        base += (rain - 600) * 0.6
        base += -40 * abs(temp - 27)
        base += 0.4 * (hist - 4500)
        base += 0.8 * (fert - 250)

        pred = max(500.0, base)
        spread = 0.09 * pred  # ~9% band
        return {
            "predicted_yield_kg_ha": round(pred, 1),
            "lower_bound_kg_ha": round(pred - spread, 1),
            "upper_bound_kg_ha": round(pred + spread, 1),
            "confidence": 0.72,
            "model_name": self.name,
            "model_version": self.version,
            "is_demo": True,
        }

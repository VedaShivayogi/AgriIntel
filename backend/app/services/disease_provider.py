"""Disease detection provider interface. Ships with a clearly-labelled DEMO provider.

To integrate a real model:
 - Implement `DiseaseProvider` (see signature below).
 - Set env `DISEASE_PROVIDER=torch` and provide model weights path.
"""
from __future__ import annotations
import hashlib
from typing import Optional

DEMO_CLASSES = [
    ("Anthracnose", "high"),
    ("Bacterial Leaf Spot", "medium"),
    ("Cercospora Leaf Spot", "medium"),
    ("Chilli Leaf Curl Virus", "high"),
    ("Powdery Mildew", "low"),
    ("Healthy", "low"),
]


class DiseaseProvider:
    name = "base"

    def predict(self, image_bytes: bytes) -> dict:
        raise NotImplementedError


class DemoDiseaseProvider(DiseaseProvider):
    """Deterministic pseudo-random DEMO provider. NOT a real diagnosis."""
    name = "demo"

    def predict(self, image_bytes: bytes) -> dict:
        h = hashlib.sha256(image_bytes).digest()
        idx = h[0] % len(DEMO_CLASSES)
        label, risk = DEMO_CLASSES[idx]
        # Confidence in demo mode is capped and clearly illustrative.
        conf = 0.55 + (h[1] % 30) / 100.0
        return {
            "label": label,
            "confidence": round(conf, 2),
            "risk": risk,
            "provider": "demo",
            "is_demo": True,
            "visual_explanation": None,
            "disclaimer": (
                "DEMO prediction only. AI prediction is advisory and should be verified "
                "by an agricultural expert."
            ),
        }


def get_disease_provider() -> DiseaseProvider:
    # Real providers can be plugged in here.
    return DemoDiseaseProvider()

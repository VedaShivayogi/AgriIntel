"""Research metrics — demo values are explicitly marked."""
from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.models.models import User
from app.schemas.schemas import ResearchMetricsResponse, ModelMetric

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/metrics", response_model=ResearchMetricsResponse)
def metrics(user: User = Depends(require_role("RESEARCHER", "ADMIN"))):
    # NOTE: These are DEMO values to demonstrate the UI. Replace with real MLflow metrics.
    models = [
        ModelMetric(model="Linear Regression", mae=612.4, rmse=780.1, r2=0.42, mape=14.8, is_demo=True),
        ModelMetric(model="Random Forest",     mae=421.7, rmse=553.9, r2=0.71, mape=10.2, is_demo=True),
        ModelMetric(model="XGBoost",           mae=398.5, rmse=521.6, r2=0.75, mape=9.4,  is_demo=True),
        ModelMetric(model="LightGBM",          mae=402.1, rmse=528.3, r2=0.74, mape=9.6,  is_demo=True),
        ModelMetric(model="LSTM",              mae=376.2, rmse=498.7, r2=0.78, mape=8.9,  is_demo=True),
        ModelMetric(model="Transformer",       mae=368.9, rmse=489.2, r2=0.79, mape=8.6,  is_demo=True),
    ]
    ablation = [
        {"experiment": "Weather only",                            "mae": 712.0, "rmse": 890.1, "r2": 0.38},
        {"experiment": "Soil + Weather",                           "mae": 555.4, "rmse": 700.2, "r2": 0.57},
        {"experiment": "Soil + Weather + Historical Yield",        "mae": 470.1, "rmse": 601.0, "r2": 0.68},
        {"experiment": "Soil + Weather + Yield + Management",      "mae": 415.9, "rmse": 540.5, "r2": 0.74},
        {"experiment": "All modalities (multimodal)",              "mae": 368.9, "rmse": 489.2, "r2": 0.79},
    ]
    return ResearchMetricsResponse(
        models=models,
        ablation=ablation,
        dataset_size=500,
        is_demo=True,
    )

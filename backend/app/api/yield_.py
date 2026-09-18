from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.ml.yield_model import get_yield_model
from app.models.models import SoilTest, User, Prediction
from app.schemas.schemas import YieldPredictRequest, YieldPredictResponse

router = APIRouter(prefix="/yield", tags=["yield"])


@router.post("/predict", response_model=YieldPredictResponse)
def predict_yield(
    payload: YieldPredictRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # If plot_id given, enrich with latest soil test
    latest_soil = None
    if payload.plot_id:
        latest_soil = (db.query(SoilTest)
                         .filter(SoilTest.plot_id == payload.plot_id)
                         .order_by(SoilTest.test_date.desc())
                         .first())

    features = {
        "soil_ph": payload.soil_ph or (latest_soil.ph if latest_soil else None),
        "soil_n": payload.soil_n or (latest_soil.nitrogen_kg_ha if latest_soil else None),
        "soil_p": payload.soil_p or (latest_soil.phosphorus_kg_ha if latest_soil else None),
        "soil_k": payload.soil_k or (latest_soil.potassium_kg_ha if latest_soil else None),
        "rainfall_mm": payload.rainfall_mm,
        "temp_avg_c": payload.temp_avg_c,
        "humidity_pct": payload.humidity_pct,
        "irrigation_type": payload.irrigation_type,
        "fertilizer_kg_ha": payload.fertilizer_kg_ha,
        "historical_yield_kg_ha": payload.historical_yield_kg_ha,
        "disease_risk": payload.disease_risk,
    }

    model = get_yield_model()
    result = model.predict(features)

    # Persist prediction record
    pred = Prediction(
        plot_id=payload.plot_id,
        season_id=payload.season_id,
        kind="yield",
        value=result["predicted_yield_kg_ha"],
        lower_bound=result["lower_bound_kg_ha"],
        upper_bound=result["upper_bound_kg_ha"],
        confidence=result["confidence"],
        model_version=result["model_version"],
        payload=features,
        is_demo=result["is_demo"],
    )
    db.add(pred)
    db.commit()

    # Feature attribution for explanation (very simple contribution display)
    explanation = {
        "rainfall_mm": features["rainfall_mm"],
        "soil_n": features["soil_n"],
        "historical_yield_kg_ha": features["historical_yield_kg_ha"],
        "temp_avg_c": features["temp_avg_c"],
        "irrigation_type": features["irrigation_type"],
    }

    return YieldPredictResponse(
        predicted_yield_kg_ha=result["predicted_yield_kg_ha"],
        lower_bound_kg_ha=result["lower_bound_kg_ha"],
        upper_bound_kg_ha=result["upper_bound_kg_ha"],
        confidence=result["confidence"],
        model_version=result["model_version"],
        model_name=result["model_name"],
        is_demo=result["is_demo"],
        explanation=explanation,
    )

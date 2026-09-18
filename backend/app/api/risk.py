from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import RiskPredictRequest, RiskPredictResponse
from app.services.risk_service import compute_risk

router = APIRouter(prefix="/risk", tags=["risk"])


@router.post("/predict", response_model=RiskPredictResponse)
def predict_risk(payload: RiskPredictRequest, user: User = Depends(get_current_user)):
    result = compute_risk(**payload.model_dump())
    return RiskPredictResponse(**result)

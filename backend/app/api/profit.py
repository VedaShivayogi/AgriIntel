from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import ProfitPredictRequest, ProfitPredictResponse
from app.services.profit_service import compute_profit

router = APIRouter(prefix="/profit", tags=["profit"])


@router.post("/predict", response_model=ProfitPredictResponse)
def predict_profit(payload: ProfitPredictRequest, user: User = Depends(get_current_user)):
    costs = [c.model_dump() for c in payload.costs]
    result = compute_profit(
        area_ha=payload.area_ha,
        expected_yield_kg_ha=payload.expected_yield_kg_ha,
        selling_price_per_kg=payload.selling_price_per_kg,
        costs=costs,
    )
    return ProfitPredictResponse(**result)

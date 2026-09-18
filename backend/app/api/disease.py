from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import DiseasePredictResponse
from app.services.disease_provider import get_disease_provider

router = APIRouter(prefix="/disease", tags=["disease"])


@router.post("/predict", response_model=DiseasePredictResponse)
async def predict_disease(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Please upload an image file.")
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 8 MB).")

    provider = get_disease_provider()
    result = provider.predict(content)
    return DiseasePredictResponse(**result)

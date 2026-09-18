from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.database.session import get_db
from app.models.models import Farm, Farmer, User
from app.schemas.schemas import FarmCreate, FarmOut

router = APIRouter(prefix="/farms", tags=["farms"])


def _farmer_for(user: User, db: Session) -> Farmer:
    farmer = db.query(Farmer).filter(Farmer.user_id == user.id).first()
    if not farmer:
        farmer = Farmer(user_id=user.id)
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
    return farmer


@router.get("", response_model=list[FarmOut])
def list_farms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farmer = _farmer_for(user, db)
    return db.query(Farm).filter(Farm.farmer_id == farmer.id).all()


@router.post("", response_model=FarmOut)
def create_farm(
    payload: FarmCreate,
    user: User = Depends(require_role("FARMER", "ADMIN")),
    db: Session = Depends(get_db),
):
    farmer = _farmer_for(user, db)
    farm = Farm(farmer_id=farmer.id, **payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(404, "Farm not found")
    return farm

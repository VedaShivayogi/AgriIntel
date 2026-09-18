from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.models import SoilTest, User
from app.schemas.schemas import SoilTestCreate, SoilTestOut, SoilHealthOut
from app.services.soil_service import compute_soil_health

router = APIRouter(prefix="/soil-tests", tags=["soil"])


@router.post("", response_model=SoilTestOut)
def create_soil_test(payload: SoilTestCreate, db: Session = Depends(get_db),
                     user: User = Depends(get_current_user)):
    data = payload.model_dump()
    if not data.get("test_date"):
        data.pop("test_date", None)
    st = SoilTest(**data)
    db.add(st)
    db.commit()
    db.refresh(st)
    return st


@router.get("/{plot_id}", response_model=list[SoilTestOut])
def list_soil_tests(plot_id: int, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    return (db.query(SoilTest)
              .filter(SoilTest.plot_id == plot_id)
              .order_by(SoilTest.test_date.desc())
              .all())


@router.get("/{plot_id}/health", response_model=SoilHealthOut)
def soil_health(plot_id: int, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    latest = (db.query(SoilTest)
                .filter(SoilTest.plot_id == plot_id)
                .order_by(SoilTest.test_date.desc())
                .first())
    if not latest:
        raise HTTPException(404, "No soil test found for this plot")
    return compute_soil_health(latest)

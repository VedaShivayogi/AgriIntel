from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.models import Plot, Farm, Farmer, User
from app.schemas.schemas import PlotCreate, PlotOut

router = APIRouter(prefix="/plots", tags=["plots"])


@router.post("", response_model=PlotOut)
def create_plot(
    payload: PlotCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    farm = db.query(Farm).filter(Farm.id == payload.farm_id).first()
    if not farm:
        raise HTTPException(404, "Farm not found")
    plot = Plot(**payload.model_dump())
    db.add(plot)
    db.commit()
    db.refresh(plot)
    return plot


@router.get("", response_model=list[PlotOut])
def list_plots(farm_id: int | None = None, db: Session = Depends(get_db),
               user: User = Depends(get_current_user)):
    q = db.query(Plot)
    if farm_id:
        q = q.filter(Plot.farm_id == farm_id)
    return q.all()


@router.get("/{plot_id}", response_model=PlotOut)
def get_plot(plot_id: int, db: Session = Depends(get_db),
             user: User = Depends(get_current_user)):
    plot = db.query(Plot).filter(Plot.id == plot_id).first()
    if not plot:
        raise HTTPException(404, "Plot not found")
    return plot

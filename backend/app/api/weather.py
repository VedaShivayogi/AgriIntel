from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database.session import get_db
from app.models.models import Plot, User
from app.schemas.schemas import WeatherOut, WeatherDay
from app.services.weather_provider import get_weather_provider, compute_alerts

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/{plot_id}", response_model=WeatherOut)
def get_weather(plot_id: int, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    plot = db.query(Plot).filter(Plot.id == plot_id).first()
    if not plot:
        raise HTTPException(404, "Plot not found")
    lat = plot.latitude or 12.97  # default: Bengaluru
    lon = plot.longitude or 77.59
    provider = get_weather_provider()
    forecast = provider.get_forecast(lat, lon, days=7)
    alerts = compute_alerts(forecast)
    return WeatherOut(
        plot_id=plot_id,
        current=WeatherDay(**forecast[0]) if forecast else None,
        forecast=[WeatherDay(**d) for d in forecast],
        alerts=alerts,
        source=provider.name,
        is_demo=(provider.name == "mock"),
    )

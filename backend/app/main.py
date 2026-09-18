"""AgriIntel-X FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.api import (
    auth, farms, plots, soil, weather, crop, yield_, disease,
    profit, risk, whatif, reports, research,
)

# Auto-create tables (fine for MVP; use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Explainable Multimodal AI Platform for Soil-Aware Crop Yield, Risk and Farmer Profit Forecasting.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = settings.API_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(farms.router, prefix=api_prefix)
app.include_router(plots.router, prefix=api_prefix)
app.include_router(soil.router, prefix=api_prefix)
app.include_router(weather.router, prefix=api_prefix)
app.include_router(crop.router, prefix=api_prefix)
app.include_router(yield_.router, prefix=api_prefix)
app.include_router(disease.router, prefix=api_prefix)
app.include_router(profit.router, prefix=api_prefix)
app.include_router(risk.router, prefix=api_prefix)
app.include_router(whatif.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(research.router, prefix=api_prefix)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "ok",
        "docs": "/docs",
        "api": settings.API_PREFIX,
    }


@app.get("/healthz")
def healthz():
    return {"status": "healthy"}

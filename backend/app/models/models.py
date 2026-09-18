"""SQLAlchemy ORM models for AgriIntel-X."""
from datetime import datetime, date
from typing import Optional

from sqlalchemy import (
    String, Integer, Float, Boolean, Date, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="FARMER")  # FARMER | RESEARCHER | ADMIN
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer: Mapped[Optional["Farmer"]] = relationship(back_populates="user", uselist=False)


class Farmer(Base):
    __tablename__ = "farmers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    village: Mapped[Optional[str]] = mapped_column(String(120))
    district: Mapped[Optional[str]] = mapped_column(String(120))
    state: Mapped[Optional[str]] = mapped_column(String(120), default="Karnataka")
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")

    user: Mapped["User"] = relationship(back_populates="farmer")
    farms: Mapped[list["Farm"]] = relationship(back_populates="farmer", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmers.id"))
    name: Mapped[str] = mapped_column(String(160))
    village: Mapped[Optional[str]] = mapped_column(String(120))
    district: Mapped[Optional[str]] = mapped_column(String(120))
    state: Mapped[str] = mapped_column(String(120), default="Karnataka")
    total_area_ha: Mapped[float] = mapped_column(Float, default=0.0)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    soil_type: Mapped[Optional[str]] = mapped_column(String(80))
    irrigation_type: Mapped[Optional[str]] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer: Mapped["Farmer"] = relationship(back_populates="farms")
    plots: Mapped[list["Plot"]] = relationship(back_populates="farm", cascade="all, delete-orphan")


class Plot(Base):
    __tablename__ = "plots"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id"))
    name: Mapped[str] = mapped_column(String(160))
    area_ha: Mapped[float] = mapped_column(Float, default=0.0)
    soil_type: Mapped[Optional[str]] = mapped_column(String(80))
    irrigation_type: Mapped[Optional[str]] = mapped_column(String(80))
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farm: Mapped["Farm"] = relationship(back_populates="plots")
    soil_tests: Mapped[list["SoilTest"]] = relationship(back_populates="plot", cascade="all, delete-orphan")
    seasons: Mapped[list["CropSeason"]] = relationship(back_populates="plot", cascade="all, delete-orphan")


class SoilTest(Base):
    __tablename__ = "soil_tests"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id"))
    test_date: Mapped[date] = mapped_column(Date, default=date.today)
    ph: Mapped[Optional[float]] = mapped_column(Float)
    nitrogen_kg_ha: Mapped[Optional[float]] = mapped_column(Float)
    phosphorus_kg_ha: Mapped[Optional[float]] = mapped_column(Float)
    potassium_kg_ha: Mapped[Optional[float]] = mapped_column(Float)
    organic_carbon_pct: Mapped[Optional[float]] = mapped_column(Float)
    ec_ds_m: Mapped[Optional[float]] = mapped_column(Float)
    moisture_pct: Mapped[Optional[float]] = mapped_column(Float)
    zinc_ppm: Mapped[Optional[float]] = mapped_column(Float)
    iron_ppm: Mapped[Optional[float]] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(60), default="manual")

    plot: Mapped["Plot"] = relationship(back_populates="soil_tests")


class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id"))
    record_date: Mapped[date] = mapped_column(Date, default=date.today)
    temp_min_c: Mapped[Optional[float]] = mapped_column(Float)
    temp_max_c: Mapped[Optional[float]] = mapped_column(Float)
    rainfall_mm: Mapped[Optional[float]] = mapped_column(Float)
    humidity_pct: Mapped[Optional[float]] = mapped_column(Float)
    wind_kmph: Mapped[Optional[float]] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(60), default="mock")


class Crop(Base):
    __tablename__ = "crops"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    local_name: Mapped[Optional[str]] = mapped_column(String(120))
    is_pilot: Mapped[bool] = mapped_column(Boolean, default=False)


class CropVariety(Base):
    __tablename__ = "crop_varieties"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id"))
    name: Mapped[str] = mapped_column(String(160))
    duration_days: Mapped[Optional[int]] = mapped_column(Integer)
    notes: Mapped[Optional[str]] = mapped_column(Text)


class Seed(Base):
    __tablename__ = "seeds"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    variety_id: Mapped[int] = mapped_column(ForeignKey("crop_varieties.id"))
    brand: Mapped[Optional[str]] = mapped_column(String(160))
    rate_per_kg: Mapped[Optional[float]] = mapped_column(Float)


class Fertilizer(Base):
    __tablename__ = "fertilizers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    n_pct: Mapped[Optional[float]] = mapped_column(Float)
    p_pct: Mapped[Optional[float]] = mapped_column(Float)
    k_pct: Mapped[Optional[float]] = mapped_column(Float)
    rate_per_kg: Mapped[Optional[float]] = mapped_column(Float)


class Pesticide(Base):
    __tablename__ = "pesticides"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    type: Mapped[Optional[str]] = mapped_column(String(60))
    rate_per_litre: Mapped[Optional[float]] = mapped_column(Float)


class CropSeason(Base):
    __tablename__ = "crop_seasons"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plot_id: Mapped[int] = mapped_column(ForeignKey("plots.id"))
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id"))
    variety_id: Mapped[Optional[int]] = mapped_column(ForeignKey("crop_varieties.id"))
    season_name: Mapped[str] = mapped_column(String(60))  # e.g., "Kharif 2024"
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    growth_stage: Mapped[Optional[str]] = mapped_column(String(60))
    area_ha: Mapped[float] = mapped_column(Float, default=0.0)
    previous_crop: Mapped[Optional[str]] = mapped_column(String(120))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    plot: Mapped["Plot"] = relationship(back_populates="seasons")
    activities: Mapped[list["FarmActivity"]] = relationship(back_populates="season", cascade="all, delete-orphan")
    yield_records: Mapped[list["YieldRecord"]] = relationship(back_populates="season", cascade="all, delete-orphan")


class FarmActivity(Base):
    __tablename__ = "farm_activities"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[int] = mapped_column(ForeignKey("crop_seasons.id"))
    activity_date: Mapped[date] = mapped_column(Date, default=date.today)
    activity_type: Mapped[str] = mapped_column(String(60))  # irrigation, fertilizer, pesticide, etc.
    description: Mapped[Optional[str]] = mapped_column(Text)
    quantity: Mapped[Optional[float]] = mapped_column(Float)
    unit: Mapped[Optional[str]] = mapped_column(String(30))
    cost: Mapped[Optional[float]] = mapped_column(Float)

    season: Mapped["CropSeason"] = relationship(back_populates="activities")


class DiseaseObservation(Base):
    __tablename__ = "disease_observations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[int] = mapped_column(ForeignKey("crop_seasons.id"))
    observation_date: Mapped[date] = mapped_column(Date, default=date.today)
    label: Mapped[str] = mapped_column(String(160))
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    severity: Mapped[Optional[str]] = mapped_column(String(30))  # low|medium|high
    notes: Mapped[Optional[str]] = mapped_column(Text)
    image_path: Mapped[Optional[str]] = mapped_column(String(400))
    provider: Mapped[str] = mapped_column(String(40), default="demo")


class YieldRecord(Base):
    __tablename__ = "yield_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[int] = mapped_column(ForeignKey("crop_seasons.id"))
    yield_kg_per_ha: Mapped[float] = mapped_column(Float)
    total_yield_kg: Mapped[Optional[float]] = mapped_column(Float)
    recorded_at: Mapped[date] = mapped_column(Date, default=date.today)
    source: Mapped[str] = mapped_column(String(60), default="manual")

    season: Mapped["CropSeason"] = relationship(back_populates="yield_records")


class MarketPrice(Base):
    __tablename__ = "market_prices"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id"))
    market: Mapped[str] = mapped_column(String(160))
    price_date: Mapped[date] = mapped_column(Date, default=date.today)
    modal_price_per_kg: Mapped[float] = mapped_column(Float)
    min_price_per_kg: Mapped[Optional[float]] = mapped_column(Float)
    max_price_per_kg: Mapped[Optional[float]] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(60), default="demo")


class FarmCost(Base):
    __tablename__ = "farm_costs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[int] = mapped_column(ForeignKey("crop_seasons.id"))
    category: Mapped[str] = mapped_column(String(60))  # seed|fertilizer|pesticide|labour|irrigation|machinery|other
    amount: Mapped[float] = mapped_column(Float)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    recorded_at: Mapped[date] = mapped_column(Date, default=date.today)


class Prediction(Base):
    __tablename__ = "predictions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[Optional[int]] = mapped_column(ForeignKey("crop_seasons.id"))
    plot_id: Mapped[Optional[int]] = mapped_column(ForeignKey("plots.id"))
    kind: Mapped[str] = mapped_column(String(40))  # yield|disease|profit|risk
    value: Mapped[Optional[float]] = mapped_column(Float)
    lower_bound: Mapped[Optional[float]] = mapped_column(Float)
    upper_bound: Mapped[Optional[float]] = mapped_column(Float)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    model_version: Mapped[Optional[str]] = mapped_column(String(80))
    payload: Mapped[Optional[dict]] = mapped_column(JSON)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plot_id: Mapped[Optional[int]] = mapped_column(ForeignKey("plots.id"))
    crop_name: Mapped[str] = mapped_column(String(120))
    suitability: Mapped[Optional[float]] = mapped_column(Float)
    expected_yield: Mapped[Optional[float]] = mapped_column(Float)
    expected_cost: Mapped[Optional[float]] = mapped_column(Float)
    expected_revenue: Mapped[Optional[float]] = mapped_column(Float)
    expected_profit: Mapped[Optional[float]] = mapped_column(Float)
    risk_level: Mapped[Optional[str]] = mapped_column(String(20))
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    season_id: Mapped[Optional[int]] = mapped_column(ForeignKey("crop_seasons.id"))
    weather_risk: Mapped[Optional[float]] = mapped_column(Float)
    soil_risk: Mapped[Optional[float]] = mapped_column(Float)
    disease_risk: Mapped[Optional[float]] = mapped_column(Float)
    yield_risk: Mapped[Optional[float]] = mapped_column(Float)
    market_risk: Mapped[Optional[float]] = mapped_column(Float)
    input_cost_risk: Mapped[Optional[float]] = mapped_column(Float)
    overall_risk: Mapped[Optional[str]] = mapped_column(String(20))
    details: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ModelVersion(Base):
    __tablename__ = "model_versions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    task: Mapped[str] = mapped_column(String(60))  # yield|disease|risk
    version: Mapped[str] = mapped_column(String(40))
    trained_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    dataset_size: Mapped[Optional[int]] = mapped_column(Integer)
    metrics: Mapped[Optional[dict]] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    notes: Mapped[Optional[str]] = mapped_column(Text)

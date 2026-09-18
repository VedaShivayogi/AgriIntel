"""Pydantic schemas for API request/response validation."""
from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------- Auth ----------------
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str = Field(min_length=6)
    role: str = "FARMER"
    village: Optional[str] = None
    district: Optional[str] = None
    state: str = "Karnataka"
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str


# ---------------- Farm/Plot ----------------
class FarmCreate(BaseModel):
    name: str
    village: Optional[str] = None
    district: Optional[str] = None
    state: str = "Karnataka"
    total_area_ha: float = 0.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None


class FarmOut(FarmCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    farmer_id: int
    created_at: datetime


class PlotCreate(BaseModel):
    farm_id: int
    name: str
    area_ha: float = 0.0
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class PlotOut(PlotCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------------- Soil ----------------
class SoilTestCreate(BaseModel):
    plot_id: int
    test_date: Optional[date] = None
    ph: Optional[float] = None
    nitrogen_kg_ha: Optional[float] = None
    phosphorus_kg_ha: Optional[float] = None
    potassium_kg_ha: Optional[float] = None
    organic_carbon_pct: Optional[float] = None
    ec_ds_m: Optional[float] = None
    moisture_pct: Optional[float] = None
    zinc_ppm: Optional[float] = None
    iron_ppm: Optional[float] = None
    source: str = "manual"


class SoilTestOut(SoilTestCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class SoilHealthOut(BaseModel):
    score: float
    status: str
    components: dict
    recommendations: list[str]
    is_demo: bool = True


# ---------------- Weather ----------------
class WeatherDay(BaseModel):
    date: date
    temp_min_c: float
    temp_max_c: float
    rainfall_mm: float
    humidity_pct: float
    wind_kmph: float


class WeatherOut(BaseModel):
    plot_id: int
    current: Optional[WeatherDay] = None
    forecast: list[WeatherDay] = []
    alerts: list[dict] = []
    source: str = "mock"
    is_demo: bool = True


# ---------------- Crop Recommendation ----------------
class CropRecommendRequest(BaseModel):
    plot_id: Optional[int] = None
    soil_ph: Optional[float] = None
    soil_n: Optional[float] = None
    soil_p: Optional[float] = None
    soil_k: Optional[float] = None
    rainfall_mm: Optional[float] = None
    temp_avg_c: Optional[float] = None
    water_availability: str = "medium"  # low|medium|high
    farm_area_ha: float = 1.0
    previous_crop: Optional[str] = None
    historical_yield_kg_ha: Optional[float] = None
    budget_inr: Optional[float] = None
    market_price_per_kg: Optional[float] = None


class CropCandidate(BaseModel):
    crop: str
    suitability: float
    expected_yield_kg_ha: float
    expected_cost_inr: float
    expected_revenue_inr: float
    expected_profit_inr: float
    risk: str
    confidence: float
    explanation: str


class CropRecommendResponse(BaseModel):
    candidates: list[CropCandidate]
    is_demo: bool = True
    disclaimer: str


# ---------------- Yield ----------------
class YieldPredictRequest(BaseModel):
    plot_id: Optional[int] = None
    season_id: Optional[int] = None
    soil_ph: Optional[float] = None
    soil_n: Optional[float] = None
    soil_p: Optional[float] = None
    soil_k: Optional[float] = None
    rainfall_mm: Optional[float] = None
    temp_avg_c: Optional[float] = None
    humidity_pct: Optional[float] = None
    irrigation_type: Optional[str] = None
    fertilizer_kg_ha: Optional[float] = None
    historical_yield_kg_ha: Optional[float] = None
    disease_risk: Optional[str] = "low"


class YieldPredictResponse(BaseModel):
    predicted_yield_kg_ha: float
    lower_bound_kg_ha: float
    upper_bound_kg_ha: float
    confidence: float
    model_version: str
    model_name: str
    is_demo: bool
    explanation: Optional[dict] = None


# ---------------- Disease ----------------
class DiseasePredictResponse(BaseModel):
    label: str
    confidence: float
    risk: str
    provider: str
    is_demo: bool
    visual_explanation: Optional[str] = None
    disclaimer: str


# ---------------- Profit ----------------
class CostItem(BaseModel):
    category: str
    amount: float


class ProfitPredictRequest(BaseModel):
    season_id: Optional[int] = None
    area_ha: float = 1.0
    expected_yield_kg_ha: float
    selling_price_per_kg: float
    costs: list[CostItem] = []


class ProfitPredictResponse(BaseModel):
    total_cost: float
    revenue: float
    profit: float
    roi_pct: float
    break_even_price: float
    break_even_yield_kg_ha: float
    is_demo: bool = True


# ---------------- Risk ----------------
class RiskPredictRequest(BaseModel):
    plot_id: Optional[int] = None
    rainfall_anomaly_pct: float = 0.0
    soil_health_score: float = 75.0
    disease_risk_level: str = "low"
    yield_cv_pct: float = 12.0
    price_volatility_pct: float = 15.0
    input_cost_inflation_pct: float = 5.0


class RiskPredictResponse(BaseModel):
    weather_risk: float
    soil_risk: float
    disease_risk: float
    yield_risk: float
    market_risk: float
    input_cost_risk: float
    overall_risk: str
    explanations: dict


# ---------------- What-if ----------------
class WhatIfRequest(BaseModel):
    baseline_yield_kg_ha: float
    baseline_price_per_kg: float
    baseline_total_cost: float
    rainfall_change_pct: float = 0.0
    temp_change_c: float = 0.0
    fertilizer_cost_change_pct: float = 0.0
    seed_cost_change_pct: float = 0.0
    market_price_change_pct: float = 0.0
    disease_risk_change: str = "unchanged"  # improved|unchanged|worsened


class WhatIfResponse(BaseModel):
    baseline: dict
    scenario: dict
    delta: dict
    disclaimer: str


# ---------------- Research ----------------
class ModelMetric(BaseModel):
    model: str
    mae: float
    rmse: float
    r2: float
    mape: Optional[float] = None
    is_demo: bool = True


class ResearchMetricsResponse(BaseModel):
    models: list[ModelMetric]
    ablation: list[dict]
    dataset_size: int
    is_demo: bool = True

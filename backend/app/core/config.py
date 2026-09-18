"""Application configuration via environment variables."""
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "AgriIntel-X"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    # Database - falls back to SQLite for local dev
    DATABASE_URL: str = "sqlite:///./agriintel.db"

    # JWT
    JWT_SECRET: str = "change-me-in-production-please-use-a-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Weather provider
    WEATHER_PROVIDER: str = "mock"  # "mock" | "openweather"
    OPENWEATHER_API_KEY: Optional[str] = None

    # ML
    MODEL_DIR: str = "./ml_artifacts"

    # CORS
    CORS_ORIGINS: str = "http://localhost:4200,http://localhost:80"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

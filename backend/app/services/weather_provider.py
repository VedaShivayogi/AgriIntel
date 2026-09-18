"""Weather provider abstraction with mock and optional OpenWeather adapters."""
from __future__ import annotations
import math
import random
from datetime import date, timedelta
from typing import Optional

import httpx

from app.core.config import settings


class WeatherProvider:
    """Base interface."""
    name = "base"

    def get_forecast(self, lat: float, lon: float, days: int = 7) -> list[dict]:
        raise NotImplementedError


class MockWeatherProvider(WeatherProvider):
    """Deterministic mock generator seeded by lat/lon. Clearly labelled DEMO."""
    name = "mock"

    def _seed(self, lat: float, lon: float) -> int:
        return int((lat * 1000 + lon * 1000)) & 0xFFFFFFFF

    def get_forecast(self, lat: float, lon: float, days: int = 7) -> list[dict]:
        rng = random.Random(self._seed(lat, lon))
        today = date.today()
        base_temp = 26.0 + rng.uniform(-3, 4)
        out = []
        for i in range(days):
            d = today + timedelta(days=i)
            season_wave = math.sin((d.timetuple().tm_yday / 365.0) * 2 * math.pi)
            t_max = base_temp + 4 + 2 * season_wave + rng.uniform(-1.5, 1.5)
            t_min = t_max - rng.uniform(6, 10)
            rain = max(0.0, rng.gauss(4.0, 6.0))
            humidity = min(98.0, max(30.0, 65 + rng.uniform(-15, 20)))
            wind = max(1.0, rng.gauss(9.0, 3.0))
            out.append({
                "date": d,
                "temp_min_c": round(t_min, 1),
                "temp_max_c": round(t_max, 1),
                "rainfall_mm": round(rain, 1),
                "humidity_pct": round(humidity, 1),
                "wind_kmph": round(wind, 1),
            })
        return out


class OpenWeatherProvider(WeatherProvider):
    """Adapter for OpenWeather. Requires OPENWEATHER_API_KEY env var."""
    name = "openweather"

    def get_forecast(self, lat: float, lon: float, days: int = 7) -> list[dict]:
        if not settings.OPENWEATHER_API_KEY:
            raise RuntimeError("OPENWEATHER_API_KEY not configured")
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": lat, "lon": lon,
            "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric",
        }
        with httpx.Client(timeout=10.0) as client:
            r = client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
        # Aggregate 3-hourly into daily (simple, minimal)
        daily: dict[date, dict] = {}
        for item in data.get("list", []):
            d = date.fromtimestamp(item["dt"])
            entry = daily.setdefault(d, {
                "date": d, "temp_min_c": 100.0, "temp_max_c": -100.0,
                "rainfall_mm": 0.0, "humidity_pct": 0.0, "wind_kmph": 0.0, "_n": 0,
            })
            entry["temp_min_c"] = min(entry["temp_min_c"], item["main"]["temp_min"])
            entry["temp_max_c"] = max(entry["temp_max_c"], item["main"]["temp_max"])
            entry["rainfall_mm"] += item.get("rain", {}).get("3h", 0.0)
            entry["humidity_pct"] += item["main"]["humidity"]
            entry["wind_kmph"] += item["wind"]["speed"] * 3.6
            entry["_n"] += 1
        out = []
        for d in sorted(daily.keys())[:days]:
            e = daily[d]
            n = max(e.pop("_n"), 1)
            e["humidity_pct"] = round(e["humidity_pct"] / n, 1)
            e["wind_kmph"] = round(e["wind_kmph"] / n, 1)
            e["rainfall_mm"] = round(e["rainfall_mm"], 1)
            e["temp_min_c"] = round(e["temp_min_c"], 1)
            e["temp_max_c"] = round(e["temp_max_c"], 1)
            out.append(e)
        return out


def get_weather_provider() -> WeatherProvider:
    if settings.WEATHER_PROVIDER == "openweather" and settings.OPENWEATHER_API_KEY:
        return OpenWeatherProvider()
    return MockWeatherProvider()


def compute_alerts(forecast: list[dict]) -> list[dict]:
    """Simple rule-based agronomic weather alerts."""
    alerts = []
    total_rain = sum(d["rainfall_mm"] for d in forecast[:3])
    if total_rain > 60:
        alerts.append({
            "type": "heavy_rain",
            "level": "high",
            "message": f"Heavy rainfall risk ({total_rain:.1f} mm over next 3 days).",
        })
    if total_rain < 1.0 and len(forecast) >= 5:
        alerts.append({
            "type": "dry_spell",
            "level": "medium",
            "message": "Dry spell risk — very low rainfall expected.",
        })
    for d in forecast:
        if d["temp_max_c"] >= 38:
            alerts.append({
                "type": "heat_stress",
                "level": "high",
                "message": f"Heat stress risk on {d['date']} (max {d['temp_max_c']}°C).",
            })
            break
    avg_hum = sum(d["humidity_pct"] for d in forecast) / max(len(forecast), 1)
    if avg_hum > 80 and total_rain > 20:
        alerts.append({
            "type": "disease_favourable",
            "level": "medium",
            "message": "Weather is favourable for fungal disease development.",
        })
    return alerts

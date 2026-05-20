from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "RoadWatch Intelligence API"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"

    frontend_origin: str = "http://localhost:5173"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "roadwatch"

    jwt_secret_key: str = "replace-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_exp_minutes: int = 30
    refresh_token_exp_days: int = 14

    gemini_api_key: str | None = None
    google_api_key: str | None = None
    gemini_model: str = "gemini-2.0-flash"

    rate_limit_requests: int = 120
    rate_limit_window_seconds: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("environment")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.lower().strip()

    @property
    def resolved_gemini_key(self) -> str | None:
        return self.gemini_api_key or self.google_api_key

    @property
    def cors_origin_list(self) -> list[str]:
        from_env = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        if self.frontend_origin not in from_env:
            from_env.append(self.frontend_origin)
        return sorted(set(from_env))


@lru_cache
def get_settings() -> Settings:
    return Settings()

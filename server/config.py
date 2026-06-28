"""Application configuration.

Settings are read from environment variables (loaded from `server/.env` in
development). The Gemini API key is read here and never leaves the backend.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve `.env` relative to this file so it loads regardless of the CWD
# uvicorn is launched from.
ENV_PATH = Path(__file__).resolve().parent / ".env"

# The single topic the app teaches. Kept here so every feature shares one
# source of truth (and a second topic could be added for the bonus).
DEFAULT_TOPIC = "How Neural Networks Learn"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Gemini — backend only.
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # CORS: comma-separated origins, e.g. "http://localhost:3000,https://app.com".
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()


settings = get_settings()

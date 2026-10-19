"""Application configuration using pydantic-settings."""
from __future__ import annotations

import json
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # General
    debug: bool = False
    app_title: str = "Autonomous Campus Navigation Agent"
    app_version: str = "1.0.0"

    # Database
    database_url: str = "sqlite:///./acna.db"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return json.loads(v)
        return v

    # AI Provider
    ai_provider: Literal["mock", "gemini"] = "mock"
    gemini_api_key: str = ""

    # NLP
    nlp_confidence_threshold: float = 0.65
    fuzzy_match_threshold: float = 75.0  # rapidfuzz score out of 100


settings = Settings()

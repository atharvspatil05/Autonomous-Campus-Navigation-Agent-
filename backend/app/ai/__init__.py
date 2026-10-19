"""AI package — factory function to instantiate the configured provider."""
from __future__ import annotations

from app.ai.base_provider import BaseAIProvider
from app.config import settings


def get_ai_provider() -> BaseAIProvider:
    """Return the AI provider selected by the AI_PROVIDER env variable."""
    if settings.ai_provider == "gemini":
        from app.ai.gemini_provider import GeminiProvider
        return GeminiProvider()
    from app.ai.mock_provider import MockAIProvider
    return MockAIProvider()


__all__ = ["BaseAIProvider", "get_ai_provider"]

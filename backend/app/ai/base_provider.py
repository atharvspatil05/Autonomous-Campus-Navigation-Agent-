"""Abstract base class for AI providers."""
from __future__ import annotations

from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    """
    Contract for all AI provider adapters.
    Concrete implementations: MockProvider, GeminiProvider.
    """

    @abstractmethod
    async def resolve_location(
        self,
        query: str,
        location_names: list[str],
    ) -> dict | None:
        """
        Given a natural language query and a list of known location names,
        return a dict with keys: {"id": str, "name": str, "confidence": float}
        or None if the model cannot resolve the query.
        """

    @abstractmethod
    async def explain_route(
        self,
        origin_name: str,
        destination_name: str,
        instructions: list[str],
        total_distance: float,
        estimated_time: float,
    ) -> str:
        """
        Generate a human-friendly narrative explanation of a route.
        Returns a plain-text string.
        """

"""FastAPI dependency providers."""
from __future__ import annotations

from functools import lru_cache

from app.ai import get_ai_provider
from app.ai.base_provider import BaseAIProvider
from app.repositories.location_repository import location_repository
from app.services.graph_service import graph_service
from app.services.navigation_service import NavigationService


@lru_cache(maxsize=1)
def get_navigation_service() -> NavigationService:
    """Singleton NavigationService — constructed once per process."""
    ai = get_ai_provider()
    return NavigationService(
        graph_service=graph_service,
        location_repo=location_repository,
        ai_provider=ai,
    )


def get_graph_service():
    return graph_service


def get_location_repo():
    return location_repository

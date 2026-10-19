"""
Mock AI provider for testing and local development.
Returns deterministic, plausible responses without any API calls.
"""
from __future__ import annotations

import difflib

from app.ai.base_provider import BaseAIProvider


class MockAIProvider(BaseAIProvider):
    """
    Lightweight mock that uses Python's difflib for approximate matching —
    no network required. Ideal for CI and unit tests.
    """

    async def resolve_location(
        self,
        query: str,
        location_names: list[str],
    ) -> dict | None:
        """Use difflib sequence matching as a fallback 'AI' response."""
        query_lower = query.lower()
        matches = difflib.get_close_matches(
            query_lower,
            [n.lower() for n in location_names],
            n=1,
            cutoff=0.4,
        )
        if not matches:
            return None
        matched_name = location_names[[n.lower() for n in location_names].index(matches[0])]
        return {
            "name": matched_name,
            "confidence": 0.72,
        }

    async def explain_route(
        self,
        origin_name: str,
        destination_name: str,
        instructions: list[str],
        total_distance: float,
        estimated_time: float,
    ) -> str:
        steps = "\n".join(f"  {i+1}. {s}" for i, s in enumerate(instructions))
        return (
            f"To get from {origin_name} to {destination_name}, follow this route:\n"
            f"{steps}\n"
            f"Total walking distance: {total_distance:.0f} metres "
            f"(approximately {estimated_time:.1f} minutes)."
        )

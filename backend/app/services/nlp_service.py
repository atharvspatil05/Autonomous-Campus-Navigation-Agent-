"""
NLP Service: 3-tier location resolution pipeline.

Tier 1: Exact string match against location names and aliases.
Tier 2: Fuzzy match using rapidfuzz (no network required).
Tier 3: AI provider fallback (Gemini / Mock).
"""
from __future__ import annotations

import logging
import re

from rapidfuzz import fuzz, process

from app.ai.base_provider import BaseAIProvider
from app.config import settings
from app.models.domain.location import Location

logger = logging.getLogger(__name__)


class NLPService:
    def __init__(self, ai_provider: BaseAIProvider) -> None:
        self._ai = ai_provider

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def resolve(
        self,
        query: str,
        locations: list[Location],
    ) -> tuple[Location | None, float, list[dict]]:
        """
        Resolve a natural-language query to a campus Location.

        Returns:
            (matched_location | None, confidence: float, alternatives: list[dict])
        """
        normalized = self._normalize(query)
        logger.debug("NLP resolve: '%s' → normalized: '%s'", query, normalized)

        # Tier 1 — Exact match
        exact = self._exact_match(normalized, locations)
        if exact:
            logger.debug("Tier 1 exact match: %s", exact.name)
            return exact, 1.0, []

        # Tier 2 — Fuzzy match
        fuzzy_result, alternatives = self._fuzzy_match(normalized, locations)
        if fuzzy_result and fuzzy_result[1] >= settings.nlp_confidence_threshold:
            loc, score = fuzzy_result
            logger.debug("Tier 2 fuzzy match: %s (score=%.2f)", loc.name, score)
            return loc, score, alternatives

        # Tier 3 — AI fallback
        all_names = [loc.name for loc in locations]
        ai_result = await self._ai.resolve_location(query, all_names)
        if ai_result and ai_result.get("confidence", 0) >= settings.nlp_confidence_threshold:
            matched = self._find_by_name(ai_result["name"], locations)
            if matched:
                logger.debug(
                    "Tier 3 AI match: %s (confidence=%.2f)",
                    matched.name,
                    ai_result["confidence"],
                )
                return matched, ai_result["confidence"], alternatives

        logger.debug("No match found for query: '%s'", query)
        return None, 0.0, alternatives

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _normalize(text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text)
        # Strip common navigation filler phrases
        fillers = [
            "take me to the", "take me to",
            "how do i get to the", "how do i get to",
            "navigate to the", "navigate to",
            "go to the", "go to",
            "i want to go to the", "i want to go to",
            "directions to the", "directions to",
            "where is the", "where is",
            "i need to get to the", "i need to get to",
            "the way to", "show me the", "show me",
            "find the", "find",
        ]
        for filler in fillers:
            if text.startswith(filler):
                text = text[len(filler):].strip()
                break
        # Strip leading 'the ' article if still present
        if text.startswith("the "):
            text = text[4:].strip()
        return text

    @staticmethod
    def _exact_match(query: str, locations: list[Location]) -> Location | None:
        for loc in locations:
            for name in loc.all_names:
                if name.lower() == query:
                    return loc
        return None

    @staticmethod
    def _fuzzy_match(
        query: str,
        locations: list[Location],
    ) -> tuple[tuple[Location, float] | None, list[dict]]:
        """
        Run rapidfuzz partial_ratio against all location names and aliases.
        Returns (best_match | None, alternatives_list).
        """
        candidates: list[tuple[str, Location]] = []
        for loc in locations:
            for name in loc.all_names:
                candidates.append((name.lower(), loc))

        if not candidates:
            return None, []

        names_only = [c[0] for c in candidates]
        results = process.extract(
            query,
            names_only,
            scorer=fuzz.WRatio,
            limit=5,
        )

        if not results:
            return None, []

        # Deduplicate — keep best score per location
        seen_ids: set[str] = set()
        scored_locs: list[tuple[Location, float]] = []
        for match_name, score, idx in results:
            loc = candidates[idx][1]
            if loc.id not in seen_ids:
                seen_ids.add(loc.id)
                scored_locs.append((loc, score / 100.0))

        best = scored_locs[0] if scored_locs else None
        alternatives = [
            {"id": loc.id, "name": loc.name, "confidence": round(score, 2)}
            for loc, score in scored_locs[1:4]
        ]
        return best, alternatives

    @staticmethod
    def _find_by_name(name: str, locations: list[Location]) -> Location | None:
        name_lower = name.lower()
        for loc in locations:
            if loc.name.lower() == name_lower:
                return loc
        return None

"""
Google Gemini AI provider adapter.
Requires GEMINI_API_KEY in environment and AI_PROVIDER=gemini.
"""
from __future__ import annotations

import json
import logging

import google.generativeai as genai

from app.ai.base_provider import BaseAIProvider
from app.config import settings

logger = logging.getLogger(__name__)

_RESOLVE_PROMPT = """\
You are a campus navigation assistant. A user wants to navigate to a location \
described in their query.

User query: "{query}"

Available campus locations:
{location_list}

Identify the BEST matching location from the list above.
Respond ONLY with a valid JSON object in this exact format:
{{"name": "<exact name from list>", "confidence": <float 0.0-1.0>}}

If no location matches, respond with: {{"name": null, "confidence": 0.0}}
"""

_EXPLAIN_PROMPT = """\
You are a friendly campus navigation assistant. Provide a concise, natural \
walking route explanation for a student.

From: {origin}
To: {destination}
Distance: {distance:.0f} metres (~{time:.1f} minutes walking)

Step-by-step directions:
{steps}

Write 2-3 sentences that naturally describe this walk. Be friendly and mention \
key landmarks. Do NOT repeat the step list verbatim.
"""


class GeminiProvider(BaseAIProvider):
    def __init__(self) -> None:
        genai.configure(api_key=settings.gemini_api_key)
        self._model = genai.GenerativeModel("gemini-1.5-flash")

    async def resolve_location(
        self,
        query: str,
        location_names: list[str],
    ) -> dict | None:
        location_list = "\n".join(f"- {name}" for name in location_names)
        prompt = _RESOLVE_PROMPT.format(query=query, location_list=location_list)
        try:
            response = self._model.generate_content(prompt)
            text = response.text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            result = json.loads(text)
            if result.get("name") is None:
                return None
            return result
        except Exception as exc:
            logger.warning("Gemini resolve_location failed: %s", exc)
            return None

    async def explain_route(
        self,
        origin_name: str,
        destination_name: str,
        instructions: list[str],
        total_distance: float,
        estimated_time: float,
    ) -> str:
        steps = "\n".join(f"{i+1}. {s}" for i, s in enumerate(instructions))
        prompt = _EXPLAIN_PROMPT.format(
            origin=origin_name,
            destination=destination_name,
            distance=total_distance,
            time=estimated_time,
            steps=steps,
        )
        try:
            response = self._model.generate_content(prompt)
            return response.text.strip()
        except Exception as exc:
            logger.warning("Gemini explain_route failed: %s", exc)
            return f"Walk from {origin_name} to {destination_name} ({total_distance:.0f} m)."

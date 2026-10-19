"""
Navigation Service: top-level orchestrator for the navigation pipeline.

Pipeline:
  1. NLP → resolve destination location from natural language
  2. GraphService → find the destination node
  3. RouteEngine → compute optimal route
  4. AI Provider → generate route explanation narrative
"""
from __future__ import annotations

import logging

from app.ai.base_provider import BaseAIProvider
from app.models.domain.enums import AlgorithmType
from app.models.domain.location import Location
from app.models.domain.route import Route
from app.repositories.location_repository import LocationRepository
from app.services.graph_service import GraphService
from app.services.nlp_service import NLPService
from app.services.route_engine import RouteEngine

logger = logging.getLogger(__name__)


class NavigationService:
    def __init__(
        self,
        graph_service: GraphService,
        location_repo: LocationRepository,
        ai_provider: BaseAIProvider,
    ) -> None:
        self._graph = graph_service
        self._repo = location_repo
        self._nlp = NLPService(ai_provider)
        self._engine = RouteEngine(graph_service)
        self._ai = ai_provider

    # ------------------------------------------------------------------
    # Full navigation pipeline
    # ------------------------------------------------------------------

    async def navigate(
        self,
        query: str,
        origin_node_id: str,
        algorithm: AlgorithmType = AlgorithmType.ASTAR,
        accessible_only: bool = False,
    ) -> dict:
        """
        Full pipeline: NL query → resolved location → route → explanation.

        Returns a dict with keys:
            resolved_location, confidence, alternatives, route
        Raises ValueError if destination cannot be resolved or route cannot be found.
        """
        locations = self._repo.get_all()

        # Step 1: Resolve destination via NLP
        location, confidence, alternatives = await self._nlp.resolve(query, locations)
        if location is None:
            raise ValueError(f"Could not resolve destination from query: '{query}'")

        # Step 2: Find destination node
        dest_node = self._graph.get_location_node(location.id)
        if dest_node is None:
            raise ValueError(f"Location '{location.name}' has no graph node.")

        # Step 3: Compute route
        route = self._engine.compute_route(
            origin_node_id=origin_node_id,
            destination_node_id=dest_node.id,
            algorithm=algorithm,
            accessible_only=accessible_only,
        )
        if route is None:
            raise ValueError(
                f"No walkable path found from '{origin_node_id}' "
                f"to '{location.name}'."
            )

        # Step 4: AI explanation
        explanation = await self._generate_explanation(origin_node_id, location, route)
        route.explanation = explanation

        return {
            "resolved_location": {
                "id": location.id,
                "name": location.name,
                "confidence": round(confidence, 3),
            },
            "alternatives": alternatives,
            "route": route,
        }

    # ------------------------------------------------------------------
    # Resolve only (no route computation)
    # ------------------------------------------------------------------

    async def resolve_location(self, query: str) -> dict:
        locations = self._repo.get_all()
        location, confidence, alternatives = await self._nlp.resolve(query, locations)
        if location is None:
            return {"location": None, "confidence": 0.0, "alternatives": alternatives}
        return {
            "location": location.model_dump(),
            "confidence": round(confidence, 3),
            "alternatives": alternatives,
        }

    # ------------------------------------------------------------------
    # Dynamic replanning
    # ------------------------------------------------------------------

    async def replan(
        self,
        current_node_id: str,
        destination_node_id: str,
        algorithm: AlgorithmType = AlgorithmType.ASTAR,
        accessible_only: bool = False,
    ) -> Route | None:
        """Recompute route from current position after a path blockage."""
        route = self._engine.compute_route(
            origin_node_id=current_node_id,
            destination_node_id=destination_node_id,
            algorithm=algorithm,
            accessible_only=accessible_only,
        )
        if route is None:
            return None

        # Generate explanation for replanned route
        dest_node = self._graph.get_node(destination_node_id)
        dest_loc_id = dest_node.location_id if dest_node else None
        dest_location = self._repo.get_by_id(dest_loc_id) if dest_loc_id else None
        dest_name = dest_location.name if dest_location else destination_node_id

        origin_node = self._graph.get_node(current_node_id)
        origin_name = origin_node.label if origin_node and origin_node.label else current_node_id

        instruction_texts = [instr.description for instr in route.instructions]
        explanation = await self._ai.explain_route(
            origin_name=origin_name,
            destination_name=dest_name,
            instructions=instruction_texts,
            total_distance=route.total_distance,
            estimated_time=route.estimated_time_minutes,
        )
        route.explanation = explanation
        return route

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def _generate_explanation(
        self,
        origin_node_id: str,
        destination: Location,
        route: Route,
    ) -> str:
        origin_node = self._graph.get_node(origin_node_id)
        origin_loc_id = origin_node.location_id if origin_node else None
        origin_location = self._repo.get_by_id(origin_loc_id) if origin_loc_id else None
        origin_name = origin_location.name if origin_location else (
            origin_node.label if origin_node else origin_node_id
        )

        instruction_texts = [instr.description for instr in route.instructions]
        return await self._ai.explain_route(
            origin_name=origin_name,
            destination_name=destination.name,
            instructions=instruction_texts,
            total_distance=route.total_distance,
            estimated_time=route.estimated_time_minutes,
        )

"""Navigation API router — POST /navigate, POST /replan, POST /resolve-location."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_graph_service, get_navigation_service
from app.models.domain.enums import AlgorithmType
from app.schemas.navigation import (
    BlockEdgeRequest,
    NavigateRequest,
    NavigateResponse,
    ReplanRequest,
    ResolveRequest,
    ResolveResponse,
    RouteSchema,
)
from app.services.graph_service import GraphService
from app.services.navigation_service import NavigationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/navigation", tags=["Navigation"])


@router.post("/navigate", response_model=NavigateResponse, status_code=status.HTTP_200_OK)
async def navigate(
    body: NavigateRequest,
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """
    Full navigation pipeline:
    Natural language query → location resolution → A*/Dijkstra route → AI explanation.
    """
    try:
        result = await nav_service.navigate(
            query=body.natural_language_query,
            origin_node_id=body.origin_node_id,
            algorithm=body.preferences.algorithm,
            accessible_only=body.preferences.accessible_only,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error during navigation: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Navigation failed due to an internal error.",
        )


@router.post("/replan", response_model=RouteSchema, status_code=status.HTTP_200_OK)
async def replan(
    body: ReplanRequest,
    nav_service: NavigationService = Depends(get_navigation_service),
    graph_service: GraphService = Depends(get_graph_service),
):
    """
    Dynamic replanning: block specified edges then recompute route from current position.
    """
    # Apply any new blockages from the request
    for edge_id in body.blocked_edge_ids:
        graph_service.set_edge_blocked(edge_id, True)

    try:
        route = await nav_service.replan(
            current_node_id=body.current_node_id,
            destination_node_id=body.destination_node_id,
            algorithm=body.preferences.algorithm,
            accessible_only=body.preferences.accessible_only,
        )
        if route is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No alternative path found — destination may be unreachable.",
            )
        return route
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/resolve-location", response_model=ResolveResponse, status_code=status.HTTP_200_OK)
async def resolve_location(
    body: ResolveRequest,
    nav_service: NavigationService = Depends(get_navigation_service),
):
    """Resolve a natural language query to a campus location without computing a route."""
    result = await nav_service.resolve_location(body.query)
    return result


@router.patch("/graph/edges/{edge_id}/block", status_code=status.HTTP_200_OK)
async def toggle_edge_block(
    edge_id: str,
    body: BlockEdgeRequest,
    graph_service: GraphService = Depends(get_graph_service),
):
    """Block or unblock a specific edge for dynamic replanning demos."""
    updated = graph_service.set_edge_blocked(edge_id, body.is_blocked)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Edge '{edge_id}' not found.",
        )
    return {
        "edge_id": edge_id,
        "is_blocked": updated.is_blocked,
        "message": f"Edge {'blocked' if updated.is_blocked else 'unblocked'} successfully.",
    }

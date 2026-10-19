"""Graph API router — GET /graph (nodes + edges), GET /graph/stats."""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.dependencies import get_graph_service
from app.services.graph_service import GraphService

router = APIRouter(prefix="/graph", tags=["Graph"])


@router.get("", status_code=status.HTTP_200_OK)
async def get_graph(
    graph_service: GraphService = Depends(get_graph_service),
):
    """Return the full campus graph (nodes + edges). Used by frontend for map rendering."""
    nodes = [n.model_dump() for n in graph_service.nodes.values()]
    edges = [e.model_dump() for e in graph_service.edges.values()]
    return {"nodes": nodes, "edges": edges}


@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_graph_stats(
    graph_service: GraphService = Depends(get_graph_service),
):
    """Return graph statistics (node count, edge count, blocked edges)."""
    return graph_service.stats()


@router.get("/blocked-edges", status_code=status.HTTP_200_OK)
async def get_blocked_edges(
    graph_service: GraphService = Depends(get_graph_service),
):
    """Return all currently blocked edges."""
    blocked = graph_service.get_blocked_edges()
    return {"blocked_edges": [e.model_dump() for e in blocked], "count": len(blocked)}

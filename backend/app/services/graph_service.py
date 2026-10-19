"""
Graph Service: loads campus graph from JSON/DB, builds NetworkX graph
and the adjacency dict used by pure algorithm implementations.

Acts as the single source of truth for the live graph state —
including which edges are currently blocked.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

import networkx as nx

from app.models.domain.edge import Edge
from app.models.domain.enums import SurfaceType
from app.models.domain.node import Node

# Surfaces that are not wheelchair/accessible-route friendly
_INACCESSIBLE_SURFACES: frozenset[SurfaceType] = frozenset({SurfaceType.STAIRS})

DATA_DIR = Path(__file__).parent.parent.parent / "data"


class GraphService:
    """
    Manages the campus navigation graph.

    Responsibilities:
    - Load nodes and edges from JSON seed data.
    - Build a NetworkX DiGraph (bidirectional edges stored as two directed edges).
    - Expose the adjacency dict for pure A*/Dijkstra/BFS implementations.
    - Support runtime blocking/unblocking of edges.
    """

    def __init__(self) -> None:
        self._nodes: dict[str, Node] = {}
        self._edges: dict[str, Edge] = {}
        self._nx_graph: nx.Graph = nx.Graph()
        # Adjacency: graph[node_id][neighbor_id] = {weight, edge_id, accessible}
        self._adj: dict[str, dict[str, dict[str, Any]]] = {}
        # Coordinate lookup: coords[node_id] = (lat, lng)
        self._coords: dict[str, tuple[float, float]] = {}

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def load_from_json(
        self,
        graph_path: Path | None = None,
    ) -> None:
        """Load nodes and edges from the campus_graph.json seed file."""
        path = graph_path or DATA_DIR / "campus_graph.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        self._load_nodes(data["nodes"])
        self._load_edges(data["edges"])
        self._rebuild_structures()

    def _load_nodes(self, raw_nodes: list[dict]) -> None:
        self._nodes = {}
        for raw in raw_nodes:
            node = Node(**raw)
            self._nodes[node.id] = node

    def _load_edges(self, raw_edges: list[dict]) -> None:
        self._edges = {}
        for raw in raw_edges:
            edge = Edge(**raw)
            self._edges[edge.id] = edge

    def _rebuild_structures(self) -> None:
        """Rebuild NetworkX graph and adjacency dict from current nodes/edges."""
        self._nx_graph = nx.Graph()
        self._adj = {nid: {} for nid in self._nodes}
        self._coords = {nid: (n.lat, n.lng) for nid, n in self._nodes.items()}

        for nid, node in self._nodes.items():
            self._nx_graph.add_node(nid, **node.model_dump())

        for eid, edge in self._edges.items():
            if edge.is_blocked:
                continue

            is_accessible = (
                edge.surface not in _INACCESSIBLE_SURFACES
                and self._nodes[edge.source_id].is_accessible
                and self._nodes[edge.target_id].is_accessible
            )

            edge_attrs = {
                "weight": edge.weight,
                "edge_id": eid,
                "accessible": is_accessible,
                "surface": edge.surface,
            }

            # NetworkX graph (for visualisation / future use)
            self._nx_graph.add_edge(
                edge.source_id, edge.target_id,
                **edge_attrs,
            )

            # Adjacency dict for pure algorithms
            self._adj[edge.source_id][edge.target_id] = edge_attrs
            if edge.bidirectional:
                self._adj[edge.target_id][edge.source_id] = edge_attrs

    # ------------------------------------------------------------------
    # Public read API
    # ------------------------------------------------------------------

    @property
    def nodes(self) -> dict[str, Node]:
        return self._nodes

    @property
    def edges(self) -> dict[str, Edge]:
        return self._edges

    @property
    def adjacency(self) -> dict[str, dict[str, dict[str, Any]]]:
        return self._adj

    @property
    def coords(self) -> dict[str, tuple[float, float]]:
        return self._coords

    @property
    def nx_graph(self) -> nx.Graph:
        return self._nx_graph

    def get_node(self, node_id: str) -> Node | None:
        return self._nodes.get(node_id)

    def get_edge(self, edge_id: str) -> Edge | None:
        return self._edges.get(edge_id)

    def get_location_node(self, location_id: str) -> Node | None:
        """Return the primary entrance node for a given location ID."""
        for node in self._nodes.values():
            if node.location_id == location_id:
                return node
        return None

    # ------------------------------------------------------------------
    # Dynamic edge blocking
    # ------------------------------------------------------------------

    def set_edge_blocked(self, edge_id: str, is_blocked: bool) -> Edge | None:
        """Block or unblock an edge and rebuild the graph structures."""
        edge = self._edges.get(edge_id)
        if edge is None:
            return None
        # Pydantic models are immutable by default — replace with updated copy
        self._edges[edge_id] = edge.model_copy(update={"is_blocked": is_blocked})
        self._rebuild_structures()
        return self._edges[edge_id]

    def get_blocked_edges(self) -> list[Edge]:
        return [e for e in self._edges.values() if e.is_blocked]

    # ------------------------------------------------------------------
    # Stats / debug
    # ------------------------------------------------------------------

    def stats(self) -> dict[str, int]:
        return {
            "nodes": len(self._nodes),
            "edges": len(self._edges),
            "blocked_edges": len(self.get_blocked_edges()),
            "nx_nodes": self._nx_graph.number_of_nodes(),
            "nx_edges": self._nx_graph.number_of_edges(),
        }


# ---------------------------------------------------------------------------
# Module-level singleton — initialised on first import by the app lifespan
# ---------------------------------------------------------------------------
graph_service = GraphService()

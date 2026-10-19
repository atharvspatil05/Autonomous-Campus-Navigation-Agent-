"""
Route Engine: orchestrates algorithm selection and route computation.

Wraps the pure algorithm implementations with:
- Algorithm selection logic
- Pre-flight BFS reachability check
- Instruction generation from node sequence
- Bearing-based turn detection
"""
from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone

from app.algorithms import (
    astar,
    bfs_reachable,
    dijkstra,
)
from app.algorithms.heuristics import zero_heuristic
from app.models.domain.enums import ActionType, AlgorithmType
from app.models.domain.node import Node
from app.models.domain.route import Instruction, Route
from app.services.graph_service import GraphService

# Average walking speed in metres per minute
_WALKING_SPEED_M_PER_MIN = 80.0


class RouteEngine:
    def __init__(self, graph_service: GraphService) -> None:
        self._graph = graph_service

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def compute_route(
        self,
        origin_node_id: str,
        destination_node_id: str,
        algorithm: AlgorithmType = AlgorithmType.ASTAR,
        accessible_only: bool = False,
    ) -> Route | None:
        """
        Compute a route between two nodes using the specified algorithm.
        Returns None if no path exists.
        """
        adj = self._graph.adjacency
        coords = self._graph.coords

        # Pre-flight reachability check (O(V+E), fast)
        if not bfs_reachable(adj, origin_node_id, destination_node_id, accessible_only):
            return None

        # Algorithm selection
        result = self._run_algorithm(
            algorithm, adj, coords, origin_node_id, destination_node_id, accessible_only
        )
        if result is None:
            return None

        node_ids, edge_ids, total_cost = result
        nodes = [self._graph.get_node(nid) for nid in node_ids if self._graph.get_node(nid)]
        edges = [self._graph.get_edge(eid) for eid in edge_ids if self._graph.get_edge(eid)]

        instructions = self._generate_instructions(nodes)
        estimated_time = total_cost / _WALKING_SPEED_M_PER_MIN

        return Route(
            id=str(uuid.uuid4()),
            origin_node_id=origin_node_id,
            destination_node_id=destination_node_id,
            algorithm_used=algorithm,
            nodes=nodes,
            edges=edges,
            node_ids=node_ids,
            edge_ids=edge_ids,
            total_distance=round(total_cost, 2),
            estimated_time_minutes=round(estimated_time, 2),
            instructions=instructions,
            computed_at=datetime.now(timezone.utc),
        )

    # ------------------------------------------------------------------
    # Algorithm dispatch
    # ------------------------------------------------------------------

    def _run_algorithm(
        self,
        algorithm: AlgorithmType,
        adj,
        coords,
        start: str,
        goal: str,
        accessible_only: bool,
    ):
        if algorithm == AlgorithmType.ASTAR:
            return astar(adj, coords, start, goal, accessible_only=accessible_only)
        elif algorithm == AlgorithmType.DIJKSTRA:
            return dijkstra(adj, start, goal, accessible_only=accessible_only)
        elif algorithm == AlgorithmType.BFS:
            from app.algorithms.bfs import bfs_shortest_path
            result = bfs_shortest_path(adj, start, goal, accessible_only=accessible_only)
            if result is None:
                return None
            node_path, edge_path = result
            # Compute total weight for BFS path
            total = sum(
                adj[node_path[i]][node_path[i + 1]]["weight"]
                for i in range(len(node_path) - 1)
            )
            return node_path, edge_path, total
        return None

    # ------------------------------------------------------------------
    # Instruction generation
    # ------------------------------------------------------------------

    def _generate_instructions(self, nodes: list[Node]) -> list[Instruction]:
        if not nodes:
            return []

        instructions: list[Instruction] = []

        # START instruction
        instructions.append(
            Instruction(
                step=1,
                action=ActionType.START,
                description=f"Start at {nodes[0].label or nodes[0].id}",
                distance_m=0.0,
                node_id=nodes[0].id,
            )
        )

        for i in range(1, len(nodes) - 1):
            prev, curr, nxt = nodes[i - 1], nodes[i], nodes[i + 1]
            bearing_in = self._bearing(prev.lat, prev.lng, curr.lat, curr.lng)
            bearing_out = self._bearing(curr.lat, curr.lng, nxt.lat, nxt.lng)
            turn = self._classify_turn(bearing_in, bearing_out)
            dist = self._distance_m(prev.lat, prev.lng, curr.lat, curr.lng)

            label = curr.label or curr.id
            instructions.append(
                Instruction(
                    step=i + 1,
                    action=turn,
                    description=self._turn_description(turn, label),
                    distance_m=round(dist, 1),
                    node_id=curr.id,
                )
            )

        # ARRIVE instruction
        dest = nodes[-1]
        dist_last = (
            self._distance_m(nodes[-2].lat, nodes[-2].lng, dest.lat, dest.lng)
            if len(nodes) > 1 else 0.0
        )
        instructions.append(
            Instruction(
                step=len(nodes),
                action=ActionType.ARRIVE,
                description=f"Arrive at {dest.label or dest.id}",
                distance_m=round(dist_last, 1),
                node_id=dest.id,
            )
        )

        return instructions

    # ------------------------------------------------------------------
    # Geometry helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Compass bearing in degrees [0, 360) from point 1 to point 2."""
        d_lng = lng2 - lng1
        d_lat = lat2 - lat1
        angle = math.degrees(math.atan2(d_lng, d_lat))
        return (angle + 360) % 360

    @staticmethod
    def _classify_turn(bearing_in: float, bearing_out: float) -> ActionType:
        diff = (bearing_out - bearing_in + 360) % 360
        if diff < 20 or diff > 340:
            return ActionType.GO_STRAIGHT
        elif diff < 60:
            return ActionType.SLIGHT_RIGHT
        elif diff < 150:
            return ActionType.TURN_RIGHT
        elif diff < 200:
            return ActionType.GO_STRAIGHT
        elif diff < 270:
            return ActionType.TURN_LEFT
        else:
            return ActionType.SLIGHT_LEFT

    @staticmethod
    def _distance_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        lat_m = (lat2 - lat1) * 111_320
        lng_m = (lng2 - lng1) * 111_320 * math.cos(math.radians((lat1 + lat2) / 2))
        return math.sqrt(lat_m ** 2 + lng_m ** 2)

    @staticmethod
    def _turn_description(action: ActionType, label: str) -> str:
        mapping = {
            ActionType.GO_STRAIGHT: f"Continue straight towards {label}",
            ActionType.TURN_LEFT: f"Turn left at {label}",
            ActionType.TURN_RIGHT: f"Turn right at {label}",
            ActionType.SLIGHT_LEFT: f"Bear slightly left near {label}",
            ActionType.SLIGHT_RIGHT: f"Bear slightly right near {label}",
        }
        return mapping.get(action, f"Proceed to {label}")

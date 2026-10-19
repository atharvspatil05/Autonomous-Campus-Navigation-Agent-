"""
A* pathfinding algorithm for the campus graph.

Operates on a pure adjacency structure (dict-of-dicts) so it is fully
decoupled from NetworkX and testable in isolation.

Graph format expected:
    graph[node_id] = {
        neighbor_id: {
            "weight": float,
            "edge_id": str,
            "accessible": bool
        },
        ...
    }
Coordinate map format:
    coords[node_id] = (lat, lng)
"""
from __future__ import annotations

import heapq
from collections.abc import Callable
from typing import Any

from app.algorithms.heuristics import euclidean_distance


def astar(
    graph: dict[str, dict[str, dict[str, Any]]],
    coords: dict[str, tuple[float, float]],
    start: str,
    goal: str,
    heuristic: Callable[[float, float, float, float], float] = euclidean_distance,
    accessible_only: bool = False,
) -> tuple[list[str], list[str], float] | None:
    """
    Run A* from `start` to `goal`.

    Returns:
        (node_path, edge_path, total_cost) on success.
        None if no path exists.

    node_path: ordered list of node IDs including start and goal.
    edge_path: ordered list of edge IDs traversed.
    total_cost: sum of edge weights along the path.
    """
    if start not in graph or goal not in graph:
        return None

    # Trivial case: already at goal
    if start == goal:
        return [start], [], 0.0

    goal_lat, goal_lng = coords[goal]

    # Priority queue entries: (f_score, node_id)
    open_heap: list[tuple[float, str]] = []
    heapq.heappush(open_heap, (0.0, start))

    g_score: dict[str, float] = {start: 0.0}
    came_from: dict[str, tuple[str, str]] = {}  # node → (parent_node, edge_id)
    visited: set[str] = set()

    while open_heap:
        _, current = heapq.heappop(open_heap)

        if current in visited:
            continue
        visited.add(current)

        if current == goal:
            return _reconstruct_path(came_from, start, goal, g_score[goal])

        for neighbor, edge_data in graph[current].items():
            if neighbor in visited:
                continue
            if accessible_only and not edge_data.get("accessible", True):
                continue

            tentative_g = g_score[current] + edge_data["weight"]

            if tentative_g < g_score.get(neighbor, float("inf")):
                g_score[neighbor] = tentative_g
                came_from[neighbor] = (current, edge_data["edge_id"])
                n_lat, n_lng = coords[neighbor]
                h = heuristic(n_lat, n_lng, goal_lat, goal_lng)
                f = tentative_g + h
                heapq.heappush(open_heap, (f, neighbor))

    return None  # No path found


def _reconstruct_path(
    came_from: dict[str, tuple[str, str]],
    start: str,
    goal: str,
    total_cost: float,
) -> tuple[list[str], list[str], float]:
    node_path: list[str] = []
    edge_path: list[str] = []
    current = goal

    while current != start:
        parent, edge_id = came_from[current]
        node_path.append(current)
        edge_path.append(edge_id)
        current = parent

    node_path.append(start)
    node_path.reverse()
    edge_path.reverse()

    return node_path, edge_path, total_cost

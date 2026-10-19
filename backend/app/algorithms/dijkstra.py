"""
Dijkstra's algorithm for campus routing.

Identical interface to astar() — uses a zero heuristic which guarantees
globally optimal paths without spatial assumptions. Preferred for
accessibility-constrained routing where ramp/rerouting cost is non-trivial.
"""
from __future__ import annotations

import heapq
from typing import Any

from app.algorithms.astar import _reconstruct_path


def dijkstra(
    graph: dict[str, dict[str, dict[str, Any]]],
    start: str,
    goal: str,
    accessible_only: bool = False,
) -> tuple[list[str], list[str], float] | None:
    """
    Run Dijkstra from `start` to `goal`.

    Returns:
        (node_path, edge_path, total_cost) on success.
        None if no path exists.
    """
    if start not in graph or goal not in graph:
        return None

    open_heap: list[tuple[float, str]] = []
    heapq.heappush(open_heap, (0.0, start))

    dist: dict[str, float] = {start: 0.0}
    came_from: dict[str, tuple[str, str]] = {}
    visited: set[str] = set()

    while open_heap:
        cost, current = heapq.heappop(open_heap)

        if current in visited:
            continue
        visited.add(current)

        if current == goal:
            return _reconstruct_path(came_from, start, goal, dist[goal])

        for neighbor, edge_data in graph[current].items():
            if neighbor in visited:
                continue
            if accessible_only and not edge_data.get("accessible", True):
                continue

            new_dist = cost + edge_data["weight"]
            if new_dist < dist.get(neighbor, float("inf")):
                dist[neighbor] = new_dist
                came_from[neighbor] = (current, edge_data["edge_id"])
                heapq.heappush(open_heap, (new_dist, neighbor))

    return None

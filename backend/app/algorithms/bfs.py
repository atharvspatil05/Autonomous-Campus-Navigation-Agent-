"""
Breadth-First Search for reachability checks and hop-count routing.

Used as a pre-flight check: before running A* or Dijkstra, BFS confirms
the destination is reachable from the origin (accounting for blocked edges
and accessibility constraints). O(V + E) cost, no priority queue overhead.
"""
from __future__ import annotations

from collections import deque
from typing import Any


def bfs_reachable(
    graph: dict[str, dict[str, dict[str, Any]]],
    start: str,
    goal: str,
    accessible_only: bool = False,
) -> bool:
    """Return True if `goal` is reachable from `start`."""
    if start not in graph or goal not in graph:
        return False

    visited: set[str] = {start}
    queue: deque[str] = deque([start])

    while queue:
        current = queue.popleft()
        if current == goal:
            return True
        for neighbor, edge_data in graph[current].items():
            if neighbor not in visited:
                if accessible_only and not edge_data.get("accessible", True):
                    continue
                visited.add(neighbor)
                queue.append(neighbor)

    return False


def bfs_shortest_path(
    graph: dict[str, dict[str, dict[str, Any]]],
    start: str,
    goal: str,
    accessible_only: bool = False,
) -> tuple[list[str], list[str]] | None:
    """
    BFS shortest path by hop count (unweighted).

    Returns:
        (node_path, edge_path) or None if unreachable.
    """
    if start not in graph or goal not in graph:
        return None

    visited: set[str] = {start}
    queue: deque[str] = deque([start])
    came_from: dict[str, tuple[str, str]] = {}  # node → (parent, edge_id)

    while queue:
        current = queue.popleft()
        if current == goal:
            return _reconstruct_bfs(came_from, start, goal)

        for neighbor, edge_data in graph[current].items():
            if neighbor not in visited:
                if accessible_only and not edge_data.get("accessible", True):
                    continue
                visited.add(neighbor)
                came_from[neighbor] = (current, edge_data["edge_id"])
                queue.append(neighbor)

    return None


def bfs_find_nearest(
    graph: dict[str, dict[str, dict[str, Any]]],
    start: str,
    candidates: set[str],
    accessible_only: bool = False,
) -> str | None:
    """
    Find the nearest node (by hop count) from `start` within `candidates`.
    Useful for snapping a user position to the nearest named location.
    """
    visited: set[str] = {start}
    queue: deque[str] = deque([start])

    while queue:
        current = queue.popleft()
        if current in candidates:
            return current
        for neighbor, edge_data in graph[current].items():
            if neighbor not in visited:
                if accessible_only and not edge_data.get("accessible", True):
                    continue
                visited.add(neighbor)
                queue.append(neighbor)

    return None


def _reconstruct_bfs(
    came_from: dict[str, tuple[str, str]],
    start: str,
    goal: str,
) -> tuple[list[str], list[str]]:
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

    return node_path, edge_path

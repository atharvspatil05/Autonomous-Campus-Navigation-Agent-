"""Unit tests for Dijkstra and BFS algorithms."""
from __future__ import annotations

import pytest

from app.algorithms.bfs import bfs_find_nearest, bfs_reachable, bfs_shortest_path
from app.algorithms.dijkstra import dijkstra


class TestDijkstra:
    def test_finds_optimal_path(self, simple_graph):
        g = simple_graph["graph"]
        result = dijkstra(g, "A", "E")
        assert result is not None
        _, _, cost = result
        # A→B→C→E = 23 is shorter than A→D→E = 27
        assert cost == pytest.approx(23.0)

    def test_returns_none_for_isolated_node(self, simple_graph):
        g = {**simple_graph["graph"], "Z": {}}
        assert dijkstra(g, "A", "Z") is None

    def test_accessible_only_avoids_inaccessible(self, simple_graph):
        g = {k: dict(v) for k, v in simple_graph["graph"].items()}
        g["B"]["C"] = {**g["B"]["C"], "accessible": False}
        g["C"]["B"] = {**g["C"]["B"], "accessible": False}
        result = dijkstra(g, "A", "C", accessible_only=True)
        assert result is not None
        node_path, _, _ = result
        assert "B" not in node_path

    def test_edge_ids_match_path_length(self, simple_graph):
        g = simple_graph["graph"]
        node_path, edge_path, _ = dijkstra(g, "A", "E")
        assert len(edge_path) == len(node_path) - 1


class TestBFS:
    def test_reachable_returns_true(self, simple_graph):
        g = simple_graph["graph"]
        assert bfs_reachable(g, "A", "E") is True

    def test_unreachable_returns_false(self, simple_graph):
        g = {**simple_graph["graph"], "Z": {}}
        assert bfs_reachable(g, "A", "Z") is False

    def test_shortest_path_by_hops(self, simple_graph):
        g = simple_graph["graph"]
        result = bfs_shortest_path(g, "A", "E")
        assert result is not None
        node_path, edge_path = result
        assert node_path[0] == "A"
        assert node_path[-1] == "E"
        assert len(edge_path) == len(node_path) - 1

    def test_shortest_path_returns_none_when_unreachable(self, simple_graph):
        g = {**simple_graph["graph"], "Z": {}}
        assert bfs_shortest_path(g, "A", "Z") is None

    def test_find_nearest_candidate(self, simple_graph):
        g = simple_graph["graph"]
        nearest = bfs_find_nearest(g, "A", {"C", "E"})
        # From A, hop-count nearest of {C, E}: A→B→C (2 hops) vs A→B→C→E or A→D→E (3 hops)
        assert nearest == "C"

    def test_find_nearest_start_is_candidate(self, simple_graph):
        g = simple_graph["graph"]
        nearest = bfs_find_nearest(g, "A", {"A", "E"})
        assert nearest == "A"

    def test_reachable_self(self, simple_graph):
        g = simple_graph["graph"]
        assert bfs_reachable(g, "A", "A") is True

"""Unit tests for A* algorithm."""
from __future__ import annotations

import pytest

from app.algorithms.astar import astar
from app.algorithms.heuristics import euclidean_distance, zero_heuristic


class TestAstar:
    def test_finds_shortest_path(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        result = astar(g, c, "A", "E")
        assert result is not None
        node_path, edge_path, cost = result
        # Optimal: A→B→C→E = 10+5+8 = 23
        assert cost == pytest.approx(23.0)
        assert node_path[0] == "A"
        assert node_path[-1] == "E"

    def test_path_includes_start_and_goal(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        node_path, _, _ = astar(g, c, "A", "C")
        assert "A" in node_path
        assert "C" in node_path

    def test_returns_none_for_isolated_goal(self, simple_graph):
        g = {**simple_graph["graph"], "Z": {}}
        c = {**simple_graph["coords"], "Z": (5.0, 5.0)}
        result = astar(g, c, "A", "Z")
        assert result is None

    def test_start_equals_goal(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        result = astar(g, c, "A", "A")
        # Should return trivial path [A] with cost 0
        assert result is not None
        node_path, edge_path, cost = result
        assert node_path == ["A"]
        assert cost == pytest.approx(0.0)

    def test_inaccessible_edges_skipped(self, simple_graph):
        g = {k: dict(v) for k, v in simple_graph["graph"].items()}
        # Mark the direct path B→C as inaccessible
        g["B"]["C"] = {**g["B"]["C"], "accessible": False}
        g["C"]["B"] = {**g["C"]["B"], "accessible": False}
        c = simple_graph["coords"]
        result = astar(g, c, "A", "C", accessible_only=True)
        # Only path: A→D→E→C = 15+12+8 = 35 (A→B→C blocked)
        assert result is not None
        node_path, _, cost = result
        assert "B" not in node_path

    def test_unknown_start_returns_none(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        assert astar(g, c, "X", "A") is None

    def test_unknown_goal_returns_none(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        assert astar(g, c, "A", "X") is None

    def test_with_zero_heuristic_equals_dijkstra(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        result_astar = astar(g, c, "A", "E", heuristic=zero_heuristic)
        from app.algorithms.dijkstra import dijkstra
        result_dijkstra = dijkstra(g, "A", "E")
        assert result_astar is not None
        assert result_dijkstra is not None
        assert result_astar[2] == pytest.approx(result_dijkstra[2])

    def test_edge_ids_length_matches_path(self, simple_graph):
        g, c = simple_graph["graph"], simple_graph["coords"]
        node_path, edge_path, _ = astar(g, c, "A", "E")
        assert len(edge_path) == len(node_path) - 1

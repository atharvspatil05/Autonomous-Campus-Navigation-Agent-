"""Integration tests for navigation API endpoints."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


class TestNavigateEndpoint:
    def test_navigate_to_library(self, client: TestClient):
        resp = client.post("/api/v1/navigation/navigate", json={
            "natural_language_query": "library",
            "origin_node_id": "n_main_gate",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "route" in data
        assert "resolved_location" in data
        assert data["resolved_location"]["id"] == "main-library"
        assert data["route"]["total_distance"] > 0
        assert len(data["route"]["instructions"]) >= 2

    def test_navigate_with_alias(self, client: TestClient):
        resp = client.post("/api/v1/navigation/navigate", json={
            "natural_language_query": "take me to the caf",
            "origin_node_id": "n_main_gate",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["resolved_location"]["id"] == "cafeteria"

    def test_navigate_unresolvable_query(self, client: TestClient):
        resp = client.post("/api/v1/navigation/navigate", json={
            "natural_language_query": "zxqwerty9999plugh",
            "origin_node_id": "n_main_gate",
        })
        assert resp.status_code == 404

    def test_navigate_dijkstra_algorithm(self, client: TestClient):
        resp = client.post("/api/v1/navigation/navigate", json={
            "natural_language_query": "sports",
            "origin_node_id": "n_main_gate",
            "preferences": {"algorithm": "DIJKSTRA", "accessible_only": False},
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["route"]["algorithm_used"] == "DIJKSTRA"

    def test_navigate_returns_explanation(self, client: TestClient):
        resp = client.post("/api/v1/navigation/navigate", json={
            "natural_language_query": "admin",
            "origin_node_id": "n_main_gate",
        })
        assert resp.status_code == 200
        assert resp.json()["route"]["explanation"] != ""


class TestResolveLocationEndpoint:
    def test_resolve_exact(self, client: TestClient):
        resp = client.post("/api/v1/navigation/resolve-location", json={"query": "library"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["location"] is not None
        assert data["confidence"] > 0.6

    def test_resolve_unknown(self, client: TestClient):
        resp = client.post("/api/v1/navigation/resolve-location", json={"query": "xyzzy12345"})
        assert resp.status_code == 200
        data = resp.json()
        # Should return null location, not 404
        assert data["location"] is None


class TestEdgeBlockingEndpoint:
    def test_block_and_unblock_edge(self, client: TestClient):
        edge_id = "e_j11_library"
        # Block
        resp = client.patch(f"/api/v1/navigation/graph/edges/{edge_id}/block", json={"is_blocked": True})
        assert resp.status_code == 200
        assert resp.json()["is_blocked"] is True
        # Unblock
        resp = client.patch(f"/api/v1/navigation/graph/edges/{edge_id}/block", json={"is_blocked": False})
        assert resp.status_code == 200
        assert resp.json()["is_blocked"] is False

    def test_block_unknown_edge(self, client: TestClient):
        resp = client.patch("/api/v1/navigation/graph/edges/nonexistent_edge/block", json={"is_blocked": True})
        assert resp.status_code == 404


class TestGraphEndpoints:
    def test_get_graph(self, client: TestClient):
        resp = client.get("/api/v1/graph")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["nodes"]) > 0
        assert len(data["edges"]) > 0

    def test_get_graph_stats(self, client: TestClient):
        resp = client.get("/api/v1/graph/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["nodes"] > 0
        assert data["edges"] > 0


class TestLocationsEndpoints:
    def test_list_locations(self, client: TestClient):
        resp = client.get("/api/v1/locations")
        assert resp.status_code == 200
        data = resp.json()
        assert data["count"] >= 25

    def test_filter_by_category(self, client: TestClient):
        resp = client.get("/api/v1/locations?category=BUILDING")
        assert resp.status_code == 200
        for loc in resp.json()["locations"]:
            assert loc["category"] == "BUILDING"

    def test_get_location_by_id(self, client: TestClient):
        resp = client.get("/api/v1/locations/main-library")
        assert resp.status_code == 200
        assert resp.json()["id"] == "main-library"

    def test_get_unknown_location(self, client: TestClient):
        resp = client.get("/api/v1/locations/does-not-exist")
        assert resp.status_code == 404

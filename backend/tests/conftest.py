"""Pytest configuration and shared fixtures."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.graph_service import graph_service


@pytest.fixture(scope="session", autouse=True)
def _load_graph():
    """Ensure the graph is loaded before any test runs."""
    graph_service.load_from_json()


@pytest.fixture(scope="session")
def client(_load_graph) -> TestClient:
    """TestClient with graph pre-loaded."""
    return TestClient(app)


@pytest.fixture
def simple_graph() -> dict:
    """
    A tiny 5-node graph for pure algorithm unit tests.
    Layout:
        A --10-- B --5-- C
        |               |
        15              8
        |               |
        D -----12------ E
    """
    graph = {
        "A": {
            "B": {"weight": 10.0, "edge_id": "e_AB", "accessible": True},
            "D": {"weight": 15.0, "edge_id": "e_AD", "accessible": True},
        },
        "B": {
            "A": {"weight": 10.0, "edge_id": "e_AB", "accessible": True},
            "C": {"weight": 5.0,  "edge_id": "e_BC", "accessible": True},
        },
        "C": {
            "B": {"weight": 5.0,  "edge_id": "e_BC", "accessible": True},
            "E": {"weight": 8.0,  "edge_id": "e_CE", "accessible": True},
        },
        "D": {
            "A": {"weight": 15.0, "edge_id": "e_AD", "accessible": True},
            "E": {"weight": 12.0, "edge_id": "e_DE", "accessible": True},
        },
        "E": {
            "C": {"weight": 8.0,  "edge_id": "e_CE", "accessible": True},
            "D": {"weight": 12.0, "edge_id": "e_DE", "accessible": True},
        },
    }
    coords = {
        "A": (0.0, 0.0),
        "B": (0.0, 1.0),
        "C": (0.0, 2.0),
        "D": (1.0, 0.0),
        "E": (1.0, 2.0),
    }
    return {"graph": graph, "coords": coords}



@pytest.fixture
def simple_graph() -> dict:
    """
    A tiny 5-node graph for pure algorithm unit tests.
    Layout:
        A --10-- B --5-- C
        |               |
        15              8
        |               |
        D -----12------ E
    """
    graph = {
        "A": {
            "B": {"weight": 10.0, "edge_id": "e_AB", "accessible": True},
            "D": {"weight": 15.0, "edge_id": "e_AD", "accessible": True},
        },
        "B": {
            "A": {"weight": 10.0, "edge_id": "e_AB", "accessible": True},
            "C": {"weight": 5.0,  "edge_id": "e_BC", "accessible": True},
        },
        "C": {
            "B": {"weight": 5.0,  "edge_id": "e_BC", "accessible": True},
            "E": {"weight": 8.0,  "edge_id": "e_CE", "accessible": True},
        },
        "D": {
            "A": {"weight": 15.0, "edge_id": "e_AD", "accessible": True},
            "E": {"weight": 12.0, "edge_id": "e_DE", "accessible": True},
        },
        "E": {
            "C": {"weight": 8.0,  "edge_id": "e_CE", "accessible": True},
            "D": {"weight": 12.0, "edge_id": "e_DE", "accessible": True},
        },
    }
    coords = {
        "A": (0.0, 0.0),
        "B": (0.0, 1.0),
        "C": (0.0, 2.0),
        "D": (1.0, 0.0),
        "E": (1.0, 2.0),
    }
    return {"graph": graph, "coords": coords}

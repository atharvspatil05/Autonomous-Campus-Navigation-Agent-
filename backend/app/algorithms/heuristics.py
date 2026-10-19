"""Spatial heuristics for graph search algorithms."""
from __future__ import annotations

import math


def euclidean_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Euclidean distance in degree-space scaled to approximate metres.
    Suitable as an admissible A* heuristic for a simulated campus map
    where coordinates are arbitrary floats representing spatial positions.

    1 degree latitude  ≈ 111,320 m
    1 degree longitude ≈ 111,320 * cos(lat) m  (≈ 111,320 at low latitudes)
    """
    lat_m = (lat2 - lat1) * 111_320
    lng_m = (lng2 - lng1) * 111_320 * math.cos(math.radians((lat1 + lat2) / 2))
    return math.sqrt(lat_m ** 2 + lng_m ** 2)


def zero_heuristic(_lat1: float, _lng1: float, _lat2: float, _lng2: float) -> float:
    """Zero heuristic — turns A* into Dijkstra. Used when no spatial info is reliable."""
    return 0.0

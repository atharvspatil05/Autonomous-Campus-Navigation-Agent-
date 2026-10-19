"""Domain enumerations shared across the application."""
from enum import Enum


class LocationCategory(str, Enum):
    BUILDING = "BUILDING"
    GATE = "GATE"
    PARKING = "PARKING"
    OPEN_AREA = "OPEN_AREA"
    TRANSIT = "TRANSIT"


class NodeType(str, Enum):
    JUNCTION = "JUNCTION"
    ENTRANCE = "ENTRANCE"
    WAYPOINT = "WAYPOINT"
    LANDMARK = "LANDMARK"


class SurfaceType(str, Enum):
    PATH = "PATH"
    ROAD = "ROAD"
    STAIRS = "STAIRS"
    RAMP = "RAMP"
    INDOOR = "INDOOR"


class AlgorithmType(str, Enum):
    ASTAR = "ASTAR"
    DIJKSTRA = "DIJKSTRA"
    BFS = "BFS"


class ActionType(str, Enum):
    START = "START"
    TURN_LEFT = "TURN_LEFT"
    TURN_RIGHT = "TURN_RIGHT"
    GO_STRAIGHT = "GO_STRAIGHT"
    SLIGHT_LEFT = "SLIGHT_LEFT"
    SLIGHT_RIGHT = "SLIGHT_RIGHT"
    ARRIVE = "ARRIVE"

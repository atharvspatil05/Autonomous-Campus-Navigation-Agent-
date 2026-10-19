"""Domain model: Node — a graph waypoint on the campus map."""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.domain.enums import NodeType


class Node(BaseModel):
    id: str = Field(..., description="Unique node identifier e.g. 'node_001'")
    lat: float
    lng: float
    location_id: str | None = None  # Links to a named Location if this is an entrance/landmark
    is_accessible: bool = True
    node_type: NodeType = NodeType.WAYPOINT
    label: str = ""  # Optional human-readable label for debug/display

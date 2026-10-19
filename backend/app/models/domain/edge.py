"""Domain model: Edge — a walkable connection between two graph nodes."""
from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.domain.enums import SurfaceType


class Edge(BaseModel):
    id: str = Field(..., description="Unique edge identifier e.g. 'edge_001_002'")
    source_id: str
    target_id: str
    weight: float = Field(..., description="Distance in simulated meters")
    bidirectional: bool = True
    surface: SurfaceType = SurfaceType.PATH
    is_blocked: bool = False
    tags: list[str] = Field(default_factory=list)

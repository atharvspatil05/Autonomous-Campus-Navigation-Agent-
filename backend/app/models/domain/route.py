"""Domain models: Route and Instruction."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.models.domain.enums import ActionType, AlgorithmType
from app.models.domain.node import Node
from app.models.domain.edge import Edge


class Instruction(BaseModel):
    step: int
    action: ActionType
    description: str
    distance_m: float
    landmark_hint: str | None = None
    node_id: str


class Route(BaseModel):
    id: str
    origin_node_id: str
    destination_node_id: str
    algorithm_used: AlgorithmType
    nodes: list[Node]
    edges: list[Edge]
    node_ids: list[str]   # Ordered sequence of node IDs
    edge_ids: list[str]   # Ordered sequence of edge IDs
    total_distance: float
    estimated_time_minutes: float
    instructions: list[Instruction]
    explanation: str = ""
    computed_at: datetime = Field(default_factory=datetime.utcnow)

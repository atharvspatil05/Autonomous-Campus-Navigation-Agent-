"""Pydantic schemas for navigation API request/response."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.domain.enums import ActionType, AlgorithmType


class RoutePreferencesSchema(BaseModel):
    accessible_only: bool = False
    algorithm: AlgorithmType = AlgorithmType.ASTAR
    avoid_blocked: bool = True


class NavigateRequest(BaseModel):
    natural_language_query: str = Field(..., min_length=1, max_length=500)
    origin_node_id: str = Field(default="n_main_gate")
    preferences: RoutePreferencesSchema = Field(default_factory=RoutePreferencesSchema)


class ReplanRequest(BaseModel):
    current_node_id: str
    destination_node_id: str
    blocked_edge_ids: list[str] = Field(default_factory=list)
    preferences: RoutePreferencesSchema = Field(default_factory=RoutePreferencesSchema)


class ResolveRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)


class InstructionSchema(BaseModel):
    step: int
    action: ActionType
    description: str
    distance_m: float
    landmark_hint: str | None = None
    node_id: str


class NodeSchema(BaseModel):
    id: str
    lat: float
    lng: float
    location_id: str | None
    is_accessible: bool
    node_type: str
    label: str


class EdgeSchema(BaseModel):
    id: str
    source_id: str
    target_id: str
    weight: float
    bidirectional: bool
    surface: str
    is_blocked: bool
    tags: list[str]


class RouteSchema(BaseModel):
    id: str
    origin_node_id: str
    destination_node_id: str
    algorithm_used: AlgorithmType
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
    node_ids: list[str]
    edge_ids: list[str]
    total_distance: float
    estimated_time_minutes: float
    instructions: list[InstructionSchema]
    explanation: str
    computed_at: datetime


class ResolvedLocationSchema(BaseModel):
    id: str
    name: str
    confidence: float


class AlternativeSchema(BaseModel):
    id: str
    name: str
    confidence: float


class NavigateResponse(BaseModel):
    resolved_location: ResolvedLocationSchema
    alternatives: list[dict[str, Any]]
    route: RouteSchema


class ResolveResponse(BaseModel):
    location: dict[str, Any] | None
    confidence: float
    alternatives: list[dict[str, Any]]


class BlockEdgeRequest(BaseModel):
    is_blocked: bool


class GraphStatsSchema(BaseModel):
    nodes: int
    edges: int
    blocked_edges: int
    nx_nodes: int
    nx_edges: int

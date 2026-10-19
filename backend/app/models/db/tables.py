"""SQLModel DB table definitions for persistence."""
from __future__ import annotations

import json
from typing import Optional

from sqlmodel import Field, SQLModel


class LocationDB(SQLModel, table=True):
    __tablename__ = "locations"

    id: str = Field(primary_key=True)
    name: str
    aliases: str = Field(default="[]")        # JSON array
    category: str
    lat: float
    lng: float
    floor: int = 0
    description: str = ""
    accessibility: bool = True
    metadata_json: str = Field(default="{}")  # renamed to avoid reserved word

    def aliases_list(self) -> list[str]:
        return json.loads(self.aliases)

    def metadata_dict(self) -> dict:
        return json.loads(self.metadata_json)


class NodeDB(SQLModel, table=True):
    __tablename__ = "nodes"

    id: str = Field(primary_key=True)
    lat: float
    lng: float
    location_id: Optional[str] = Field(default=None, foreign_key="locations.id")
    is_accessible: bool = True
    node_type: str = "WAYPOINT"
    label: str = ""


class EdgeDB(SQLModel, table=True):
    __tablename__ = "edges"

    id: str = Field(primary_key=True)
    source_id: str = Field(foreign_key="nodes.id")
    target_id: str = Field(foreign_key="nodes.id")
    weight: float
    bidirectional: bool = True
    surface: str = "PATH"
    is_blocked: bool = False
    tags: str = Field(default="[]")  # JSON array

    def tags_list(self) -> list[str]:
        return json.loads(self.tags)

"""Domain model: Location — a named, human-visible campus place."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.models.domain.enums import LocationCategory


class Location(BaseModel):
    id: str = Field(..., description="Unique slug e.g. 'main-library'")
    name: str
    aliases: list[str] = Field(default_factory=list)
    category: LocationCategory
    lat: float
    lng: float
    floor: int = 0
    description: str = ""
    accessibility: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)

    @property
    def all_names(self) -> list[str]:
        """All searchable names for this location."""
        return [self.name] + self.aliases

"""Locations API router — GET /locations, GET /locations/{id}."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import get_location_repo
from app.models.domain.enums import LocationCategory
from app.repositories.location_repository import LocationRepository

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", status_code=status.HTTP_200_OK)
async def list_locations(
    category: LocationCategory | None = Query(default=None),
    accessible: bool | None = Query(default=None),
    q: str | None = Query(default=None, description="Substring search"),
    repo: LocationRepository = Depends(get_location_repo),
):
    """List all campus locations with optional filtering."""
    locations = repo.get_all()

    if category is not None:
        locations = [loc for loc in locations if loc.category == category]
    if accessible is not None:
        locations = [loc for loc in locations if loc.accessibility == accessible]
    if q:
        q_lower = q.lower()
        locations = [
            loc for loc in locations
            if any(q_lower in name.lower() for name in loc.all_names)
        ]

    return {"locations": [loc.model_dump() for loc in locations], "count": len(locations)}


@router.get("/{location_id}", status_code=status.HTTP_200_OK)
async def get_location(
    location_id: str,
    repo: LocationRepository = Depends(get_location_repo),
):
    """Get a single campus location by ID."""
    loc = repo.get_by_id(location_id)
    if loc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{location_id}' not found.",
        )
    return loc.model_dump()

"""
Location Repository: loads locations from JSON and provides lookup methods.
In v1 we load from JSON seed. The interface is compatible with a future
SQLite-backed implementation.
"""
from __future__ import annotations

import json
from pathlib import Path

from app.models.domain.location import Location

DATA_DIR = Path(__file__).parent.parent.parent / "data"


class LocationRepository:
    def __init__(self) -> None:
        self._locations: dict[str, Location] = {}
        self._load()

    def _load(self) -> None:
        path = DATA_DIR / "campus_locations.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        for raw in data["locations"]:
            loc = Location(**raw)
            self._locations[loc.id] = loc

    def get_all(self) -> list[Location]:
        return list(self._locations.values())

    def get_by_id(self, location_id: str) -> Location | None:
        return self._locations.get(location_id)

    def get_by_name(self, name: str) -> Location | None:
        name_lower = name.lower()
        for loc in self._locations.values():
            if any(n.lower() == name_lower for n in loc.all_names):
                return loc
        return None

    def search(self, query: str) -> list[Location]:
        q = query.lower()
        return [
            loc for loc in self._locations.values()
            if any(q in n.lower() for n in loc.all_names)
        ]


# Module-level singleton
location_repository = LocationRepository()

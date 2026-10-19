"""Unit tests for the NLP location resolution pipeline."""
from __future__ import annotations

import pytest

from app.ai.mock_provider import MockAIProvider
from app.models.domain.enums import LocationCategory
from app.models.domain.location import Location
from app.services.nlp_service import NLPService


@pytest.fixture
def locations() -> list[Location]:
    return [
        Location(id="main-library",  name="Main Library",  aliases=["library", "lib"],       category=LocationCategory.BUILDING, lat=23.1, lng=72.5),
        Location(id="cafeteria",     name="Main Cafeteria", aliases=["caf", "canteen"],        category=LocationCategory.BUILDING, lat=23.1, lng=72.5),
        Location(id="admin-block",   name="Administration Block", aliases=["admin", "office"], category=LocationCategory.BUILDING, lat=23.1, lng=72.5),
        Location(id="cse-dept",      name="Computer Science Department", aliases=["cse"],      category=LocationCategory.BUILDING, lat=23.1, lng=72.5),
        Location(id="sports-complex",name="Sports Complex", aliases=["sports", "gym"],         category=LocationCategory.OPEN_AREA,lat=23.1, lng=72.5),
    ]


@pytest.fixture
def nlp(locations) -> NLPService:
    return NLPService(ai_provider=MockAIProvider())


class TestNLPExactMatch:
    @pytest.mark.asyncio
    async def test_exact_name_match(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("Main Library", locations)
        assert loc is not None
        assert loc.id == "main-library"
        assert conf == 1.0

    @pytest.mark.asyncio
    async def test_exact_alias_match(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("caf", locations)
        assert loc is not None
        assert loc.id == "cafeteria"

    @pytest.mark.asyncio
    async def test_case_insensitive_exact(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("LIBRARY", locations)
        assert loc is not None
        assert loc.id == "main-library"


class TestNLPFuzzyMatch:
    @pytest.mark.asyncio
    async def test_fuzzy_typo(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("libraary", locations)
        assert loc is not None
        assert loc.id == "main-library"

    @pytest.mark.asyncio
    async def test_filler_phrase_stripped(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("take me to the library", locations)
        assert loc is not None
        assert loc.id == "main-library"

    @pytest.mark.asyncio
    async def test_navigate_to_filler(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("navigate to admin block", locations)
        assert loc is not None
        assert loc.id == "admin-block"

    @pytest.mark.asyncio
    async def test_no_match_returns_none(self, nlp, locations):
        loc, conf, _ = await nlp.resolve("xyzzyplugh", locations)
        # Should return None (or a very low confidence result)
        if loc is not None:
            assert conf < 0.65


class TestNLPNormalization:
    def test_strips_fillers(self):
        nlp = NLPService(MockAIProvider())
        assert nlp._normalize("take me to the library") == "library"
        assert nlp._normalize("take me to library") == "library"
        assert nlp._normalize("How do I get to Admin?") == "admin"
        assert nlp._normalize("Where is the gym") == "gym"
        assert nlp._normalize("Navigate to the cafeteria") == "cafeteria"
        assert nlp._normalize("Find the main library") == "main library"

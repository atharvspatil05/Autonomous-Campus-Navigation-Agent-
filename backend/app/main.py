"""FastAPI application factory."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import routes_graph, routes_locations, routes_navigation, routes_ws
from app.config import settings
from app.services.graph_service import graph_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load campus graph. Shutdown: no-op."""
    graph_service.load_from_json()
    print(f"[ACNA] Campus graph loaded: {graph_service.stats()}")
    yield
    print("[ACNA] Server shutting down.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_title,
        version=settings.app_version,
        description=(
            "Autonomous Campus Navigation Agent — intelligent, "
            "graph-based campus wayfinding with NL understanding."
        ),
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    PREFIX = "/api/v1"
    app.include_router(routes_navigation.router, prefix=PREFIX)
    app.include_router(routes_locations.router, prefix=PREFIX)
    app.include_router(routes_graph.router, prefix=PREFIX)
    app.include_router(routes_ws.router, prefix=PREFIX)

    @app.get("/", tags=["Health"])
    async def health():
        return {
            "status": "ok",
            "app": settings.app_title,
            "version": settings.app_version,
        }

    @app.get("/api/v1/health", tags=["Health"])
    async def api_health():
        stats = graph_service.stats()
        return {"status": "ok", "graph": stats}

    return app


app = create_app()

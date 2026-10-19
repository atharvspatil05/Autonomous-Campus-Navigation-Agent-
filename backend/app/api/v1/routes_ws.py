"""
WebSocket router for real-time navigation events.

Clients connect to /api/v1/ws/navigation and receive JSON events:
- {"event": "edge_blocked", "edge_id": "...", "timestamp": "..."}
- {"event": "edge_unblocked", "edge_id": "...", "timestamp": "..."}
- {"event": "ping", "timestamp": "..."}

The connection manager broadcasts to all connected clients.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts messages."""

    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)
        logger.info("WS client connected. Total: %d", len(self.active))

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)
        logger.info("WS client disconnected. Total: %d", len(self.active))

    async def broadcast(self, message: dict) -> None:
        dead: list[WebSocket] = []
        payload = json.dumps(message)
        for ws in self.active:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def send_personal(self, ws: WebSocket, message: dict) -> None:
        await ws.send_text(json.dumps(message))


# Module-level singleton — imported by the edge-block endpoints to broadcast events
connection_manager = ConnectionManager()


@router.websocket("/ws/navigation")
async def navigation_ws(websocket: WebSocket):
    await connection_manager.connect(websocket)
    try:
        await connection_manager.send_personal(
            websocket,
            {
                "event": "connected",
                "message": "ACNA real-time navigation stream active.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        while True:
            # Keep connection alive — clients can send "ping" messages
            data = await websocket.receive_text()
            msg = json.loads(data) if data else {}
            if msg.get("type") == "ping":
                await connection_manager.send_personal(
                    websocket,
                    {"event": "pong", "timestamp": datetime.now(timezone.utc).isoformat()},
                )
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)

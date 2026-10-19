# Autonomous Campus Navigation Agent (ACNA)

An intelligent campus navigation system with natural-language destination input, A* graph-based pathfinding, interactive Leaflet map, turn-by-turn instructions, and dynamic replanning when paths are blocked.

---

## Quick Start

### Backend

```powershell
cd backend
# Install dependencies
python -m pip install -r requirements.txt

# Copy env file and configure (optional: set GEMINI_API_KEY for AI narration)
copy .env.example .env

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| State | Zustand |
| Map | React Leaflet + OSM tiles |
| Backend | Python 3.13, FastAPI, Pydantic v2 |
| Database | SQLite via SQLModel |
| Graph | NetworkX + custom A*/Dijkstra/BFS |
| NLP | rapidfuzz + Google Gemini (optional) |
| Realtime | WebSocket (FastAPI) |

## Features

- 🗣️ **Natural Language Navigation** — type "take me to the library" or "where's the gym"
- 🧭 **A\* Pathfinding** — optimal routes with Euclidean heuristic
- ⚡ **Dynamic Replanning** — click any path edge to block it; route replans instantly
- ♿ **Accessibility Mode** — routes that avoid stairs and inaccessible paths
- 🤖 **AI Explanation** — human-friendly route narration via Gemini
- 🗺️ **Interactive Map** — dark-themed Leaflet map with graph overlay
- 📡 **Live WebSocket** — real-time blocked-path broadcasts

## AI Provider Configuration

Set `AI_PROVIDER` in `backend/.env`:

- `mock` (default) — no API key needed, uses fuzzy matching
- `gemini` — set `GEMINI_API_KEY` for full AI-powered NL resolution and route narration

## Testing

```powershell
# Backend
cd backend
python -m pytest --cov=app --cov-report=term-missing -v

# Frontend
cd frontend
npm run test
```

## Campus Map

The simulated campus contains 25 named locations and 47 graph nodes connected by 70 edges.
Locations include: Main Library, CSE/ECE/Mech/Civil Departments, Cafeteria, Auditorium, Sports Complex, Hostels, Health Center, Parking, Gates, and more.

## Project Structure

```
acna/
├── backend/        # FastAPI + algorithms + NLP
│   ├── app/
│   │   ├── algorithms/    # A*, Dijkstra, BFS (pure, testable)
│   │   ├── ai/            # Provider adapters (Gemini, Mock)
│   │   ├── api/v1/        # FastAPI routers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Domain + DB models
│   │   └── repositories/  # Data access
│   ├── data/              # Campus graph + locations JSON
│   └── tests/             # Unit + integration tests
└── frontend/       # React + Leaflet UI
    └── src/
        ├── components/    # Map, SearchBar, RoutePanel, etc.
        ├── hooks/         # useInitialData, useWebSocket, useReplan
        ├── store/         # Zustand navigation store
        └── api/           # Typed API client
```

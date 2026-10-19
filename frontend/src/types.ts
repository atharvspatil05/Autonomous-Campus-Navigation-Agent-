/** Shared TypeScript types for the ACNA frontend. */

export type LocationCategory = 'BUILDING' | 'GATE' | 'PARKING' | 'OPEN_AREA' | 'TRANSIT'
export type NodeType = 'JUNCTION' | 'ENTRANCE' | 'WAYPOINT' | 'LANDMARK'
export type SurfaceType = 'PATH' | 'ROAD' | 'STAIRS' | 'RAMP' | 'INDOOR'
export type AlgorithmType = 'ASTAR' | 'DIJKSTRA' | 'BFS'
export type ActionType = 'START' | 'TURN_LEFT' | 'TURN_RIGHT' | 'GO_STRAIGHT' | 'SLIGHT_LEFT' | 'SLIGHT_RIGHT' | 'ARRIVE'

export interface Location {
  id: string
  name: string
  aliases: string[]
  category: LocationCategory
  lat: number
  lng: number
  floor: number
  description: string
  accessibility: boolean
}

export interface MapNode {
  id: string
  lat: number
  lng: number
  location_id: string | null
  is_accessible: boolean
  node_type: NodeType
  label: string
}

export interface MapEdge {
  id: string
  source_id: string
  target_id: string
  weight: number
  bidirectional: boolean
  surface: SurfaceType
  is_blocked: boolean
  tags: string[]
}

export interface Instruction {
  step: number
  action: ActionType
  description: string
  distance_m: number
  landmark_hint: string | null
  node_id: string
}

export interface Route {
  id: string
  origin_node_id: string
  destination_node_id: string
  algorithm_used: AlgorithmType
  nodes: MapNode[]
  edges: MapEdge[]
  node_ids: string[]
  edge_ids: string[]
  total_distance: number
  estimated_time_minutes: number
  instructions: Instruction[]
  explanation: string
  computed_at: string
}

export interface ResolvedLocation {
  id: string
  name: string
  confidence: number
}

export interface NavigateResponse {
  resolved_location: ResolvedLocation
  alternatives: { id: string; name: string; confidence: number }[]
  route: Route
}

export interface RoutePreferences {
  accessible_only: boolean
  algorithm: AlgorithmType
  avoid_blocked: boolean
}

export interface NavigateRequest {
  natural_language_query: string
  origin_node_id: string
  preferences: RoutePreferences
}

export interface ReplanRequest {
  current_node_id: string
  destination_node_id: string
  blocked_edge_ids: string[]
  preferences: RoutePreferences
}

export interface GraphData {
  nodes: MapNode[]
  edges: MapEdge[]
}

export type WSEvent =
  | { event: 'connected'; message: string; timestamp: string }
  | { event: 'pong'; timestamp: string }
  | { event: 'edge_blocked'; edge_id: string; timestamp: string }
  | { event: 'edge_unblocked'; edge_id: string; timestamp: string }
  | { event: 'replan_suggested'; reason: string; timestamp: string }

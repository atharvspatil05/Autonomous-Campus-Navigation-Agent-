import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigationStore } from '../store/navigationStore'
import type { MapEdge, MapNode } from '../types'

// ── Campus map center & zoom ─────────────────────────────────────
const CAMPUS_CENTER: [number, number] = [23.1055, 72.5095]
const CAMPUS_ZOOM = 16

// ── Node type display config ─────────────────────────────────────
const NODE_CONFIG = {
  ENTRANCE: { radius: 7, color: '#6366f1', fillColor: '#818cf8' },
  LANDMARK: { radius: 6, color: '#22d3ee', fillColor: '#67e8f9' },
  JUNCTION: { radius: 4, color: '#5a5d7a', fillColor: '#2d304d' },
  WAYPOINT: { radius: 3, color: '#5a5d7a', fillColor: '#2d304d' },
} as const

// ── Edge surface color ───────────────────────────────────────────
const SURFACE_COLOR: Record<string, string> = {
  PATH:   '#2d304d',
  ROAD:   '#3d4060',
  STAIRS: '#7c3aed',
  RAMP:   '#0891b2',
  INDOOR: '#374151',
}

// ── Auto-fit bounds when route changes ──────────────────────────
function BoundsFitter({ nodes }: { nodes: MapNode[] }) {
  const map = useMap()
  useEffect(() => {
    if (nodes.length < 2) return
    const lats = nodes.map((n) => n.lat)
    const lngs = nodes.map((n) => n.lng)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats) - 0.0005, Math.min(...lngs) - 0.0005],
      [Math.max(...lats) + 0.0005, Math.max(...lngs) + 0.0005],
    ]
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 18 })
  }, [nodes, map])
  return null
}

// ── Edge click handler for blocking ─────────────────────────────
function EdgePolyline({ edge, nodeMap, isBlocked, isOnRoute, onToggleBlock }: {
  edge: MapEdge
  nodeMap: Map<string, MapNode>
  isBlocked: boolean
  isOnRoute: boolean
  onToggleBlock: (id: string, blocked: boolean) => void
}) {
  const src = nodeMap.get(edge.source_id)
  const tgt = nodeMap.get(edge.target_id)
  if (!src || !tgt) return null

  const positions: [number, number][] = [[src.lat, src.lng], [tgt.lat, tgt.lng]]
  const color = isBlocked
    ? '#ef4444'
    : isOnRoute
    ? '#6366f1'
    : SURFACE_COLOR[edge.surface] ?? '#2d304d'
  const weight = isBlocked ? 3 : isOnRoute ? 4 : 1.5
  const opacity = isBlocked ? 0.9 : isOnRoute ? 0.9 : 0.4

  return (
    <Polyline
      positions={positions}
      pathOptions={{ color, weight, opacity, dashArray: isBlocked ? '6 4' : undefined }}
      eventHandlers={{
        click: () => onToggleBlock(edge.id, !edge.is_blocked),
      }}
    >
      <Tooltip sticky>
        <div style={{ fontSize: '12px' }}>
          <strong>{edge.id}</strong><br />
          Surface: {edge.surface} · {edge.weight.toFixed(0)}m<br />
          {isBlocked ? '🚫 BLOCKED — click to unblock' : '✅ Click to block this path'}
        </div>
      </Tooltip>
    </Polyline>
  )
}

export function CampusMap() {
  const {
    mapNodes, mapEdges,
    currentRoute, currentStep,
    showGraph, blockedEdgeIds,
    addBlockedEdge, removeBlockedEdge,
  } = useNavigationStore()

  // Build node lookup map
  const nodeMap = useMemo(
    () => new Map(mapNodes.map((n) => [n.id, n])),
    [mapNodes]
  )

  // Route node IDs for highlighting
  const routeNodeIds = useMemo(
    () => new Set(currentRoute?.node_ids ?? []),
    [currentRoute]
  )
  const routeEdgeIds = useMemo(
    () => new Set(currentRoute?.edge_ids ?? []),
    [currentRoute]
  )

  // Route polyline coordinates
  const routePositions = useMemo((): [number, number][] => {
    if (!currentRoute) return []
    return currentRoute.nodes
      .map((n) => [n.lat, n.lng] as [number, number])
  }, [currentRoute])

  // Active step node
  const activeNodeId = currentRoute?.instructions[currentStep]?.node_id

  // Handle edge block toggle
  const handleToggleBlock = async (edgeId: string, blocked: boolean) => {
    try {
      const { navigationApi } = await import('../api/navigationApi')
      await navigationApi.blockEdge(edgeId, blocked)
      if (blocked) addBlockedEdge(edgeId)
      else removeBlockedEdge(edgeId)
    } catch {
      /* ignore */
    }
  }

  return (
    <MapContainer
      center={CAMPUS_CENTER}
      zoom={CAMPUS_ZOOM}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      {/* OpenStreetMap tiles — dark-filtered via CSS */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {/* Graph edges */}
      {showGraph && mapEdges.map((edge) => (
        <EdgePolyline
          key={edge.id}
          edge={edge}
          nodeMap={nodeMap}
          isBlocked={blockedEdgeIds.has(edge.id) || edge.is_blocked}
          isOnRoute={routeEdgeIds.has(edge.id)}
          onToggleBlock={handleToggleBlock}
        />
      ))}

      {/* Route highlight polyline (drawn on top of graph) */}
      {currentRoute && routePositions.length > 1 && (
        <>
          {/* Glow layer */}
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#6366f1', weight: 12, opacity: 0.12 }}
          />
          {/* Main route */}
          <Polyline
            positions={routePositions}
            pathOptions={{ color: '#818cf8', weight: 4, opacity: 0.95 }}
          />
          {/* Animated dashes */}
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#c7d2fe', weight: 2, opacity: 0.6,
              dashArray: '8 6',
            }}
          />
        </>
      )}

      {/* Graph nodes */}
      {showGraph && mapNodes.map((node) => {
        const cfg = NODE_CONFIG[node.node_type] ?? NODE_CONFIG.WAYPOINT
        const isOnRoute = routeNodeIds.has(node.id)
        const isActive = node.id === activeNodeId

        return (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={isActive ? cfg.radius + 4 : isOnRoute ? cfg.radius + 2 : cfg.radius}
            pathOptions={{
              color: isActive ? '#22d3ee' : isOnRoute ? '#818cf8' : cfg.color,
              fillColor: isActive ? '#22d3ee' : isOnRoute ? '#6366f1' : cfg.fillColor,
              fillOpacity: isActive ? 1 : isOnRoute ? 0.95 : 0.7,
              weight: isActive ? 3 : isOnRoute ? 2 : 1,
            }}
          >
            {(node.location_id || node.label) && (
              <Tooltip direction="top" offset={[0, -8]}>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>
                  {node.label || node.id}
                  {node.location_id && <div style={{ fontSize: '10px', color: '#9ca3af' }}>{node.location_id}</div>}
                  {!node.is_accessible && <div style={{ color: '#f87171', fontSize: '10px' }}>♿ Not accessible</div>}
                </div>
              </Tooltip>
            )}
          </CircleMarker>
        )
      })}

      {/* Origin marker */}
      {currentRoute && (() => {
        const originNode = nodeMap.get(currentRoute.origin_node_id)
        if (!originNode) return null
        return (
          <CircleMarker
            center={[originNode.lat, originNode.lng]}
            radius={10}
            pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.9, weight: 3 }}
          >
            <Tooltip permanent direction="top" offset={[0, -12]}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>📍 You</span>
            </Tooltip>
          </CircleMarker>
        )
      })()}

      {/* Destination marker */}
      {currentRoute && (() => {
        const destNode = nodeMap.get(currentRoute.destination_node_id)
        if (!destNode) return null
        return (
          <CircleMarker
            center={[destNode.lat, destNode.lng]}
            radius={12}
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.9, weight: 3 }}
          >
            <Tooltip permanent direction="top" offset={[0, -14]}>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>🏁 Destination</span>
            </Tooltip>
          </CircleMarker>
        )
      })()}

      {/* Auto-fit when route changes */}
      {currentRoute && <BoundsFitter nodes={currentRoute.nodes} />}
    </MapContainer>
  )
}

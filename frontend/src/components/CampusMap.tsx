import { useEffect, useMemo, useState } from 'react'
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
import { navigationApi } from '../api/navigationApi'
import { SANJIVANI_LANDMARKS, type SanjivaniLandmarkInfo } from '../data/sanjivaniLandmarks'
import type { MapEdge, MapNode } from '../types'

// ── Campus map center & zoom (Sanjivani College of Engineering, Kopargaon)
const CAMPUS_CENTER: [number, number] = [19.90204, 74.49448]
const CAMPUS_ZOOM = 17

// ── Node type display config ─────────────────────────────────────
const NODE_CONFIG = {
  ENTRANCE: { radius: 7, color: '#6366f1', fillColor: '#818cf8' },
  LANDMARK: { radius: 6, color: '#22d3ee', fillColor: '#67e8f9' },
  JUNCTION: { radius: 4, color: '#5a5d7a', fillColor: '#2d304d' },
  WAYPOINT: { radius: 3, color: '#5a5d7a', fillColor: '#2d304d' },
} as const

// ── Edge surface color ───────────────────────────────────────────
const SURFACE_COLOR: Record<string, string> = {
  PATH: '#2d304d',
  ROAD: '#3d4060',
  STAIRS: '#7c3aed',
  RAMP: '#0891b2',
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

// ── Smooth Map Follower when user is walking ────────────────────
function UserPositionFollower({
  position,
  isWalking,
}: {
  position: [number, number] | null
  isWalking: boolean
}) {
  const map = useMap()
  useEffect(() => {
    if (!position || !isWalking) return
    map.panTo(position, { animate: true, duration: 0.35 })
  }, [position, isWalking, map])
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
          {isBlocked ? '🚫 Blocked path — click to unblock' : 'Click to mark as blocked / under maintenance'}
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
    userPosition, isWalking,
    originNodeId, setOriginNodeId,
    setQuery, setResponse, setIsNavigating, setError,
    clearNavigation, algorithm, accessibleOnly,
  } = useNavigationStore()

  // Selected Sanjivani Landmark modal state
  const [selectedLandmark, setSelectedLandmark] = useState<SanjivaniLandmarkInfo | null>(null)
  const [mapType, setMapType] = useState<'dark' | 'satellite'>('dark')

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
      await navigationApi.blockEdge(edgeId, blocked)
      if (blocked) addBlockedEdge(edgeId)
      else removeBlockedEdge(edgeId)
    } catch {
      /* ignore */
    }
  }

  // Handle direct navigation to a clicked landmark
  const handleNavigateToLandmark = async (landmark: SanjivaniLandmarkInfo) => {
    setSelectedLandmark(null)
    setQuery(landmark.name)
    clearNavigation()
    setIsNavigating(true)
    setError(null)
    try {
      const res = await navigationApi.navigate({
        natural_language_query: landmark.name,
        origin_node_id: originNodeId,
        preferences: {
          algorithm,
          accessible_only: accessibleOnly,
          avoid_blocked: true,
        },
      })
      setResponse(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Navigation failed'
      setError(msg)
    } finally {
      setIsNavigating(false)
    }
  }

  // Handle setting landmark as start
  const handleSetAsStart = (landmark: SanjivaniLandmarkInfo) => {
    setOriginNodeId(landmark.nodeId)
    setSelectedLandmark(null)
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floating Satellite / Street View Toggle Pill */}
      <div
        style={{
          position: 'absolute',
          top: '56px',
          right: '18px',
          zIndex: 600,
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '20px',
          padding: '3px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        }}
      >
        <button
          type="button"
          onClick={() => setMapType('dark')}
          style={{
            border: 'none',
            background: mapType === 'dark' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
            color: mapType === 'dark' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
            padding: '5px 12px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          style={{
            border: 'none',
            background: mapType === 'satellite' ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'transparent',
            color: mapType === 'satellite' ? '#fff' : 'rgba(255, 255, 255, 0.65)',
            padding: '5px 12px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={CAMPUS_CENTER}
        zoom={CAMPUS_ZOOM}
        className={mapType === 'satellite' ? 'map-satellite' : 'map-dark'}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {mapType === 'satellite' ? (
          <TileLayer
            key="satellite-layer"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="street-dark-layer"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

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
              pathOptions={{ color: '#6366f1', weight: 12, opacity: 0.15 }}
            />
            {/* Main route */}
            <Polyline
              positions={routePositions}
              pathOptions={{ color: '#818cf8', weight: 5, opacity: 0.95 }}
            />
            {/* Animated dashes */}
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: '#c7d2fe', weight: 2, opacity: 0.8,
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
          const landmarkInfo = node.location_id ? SANJIVANI_LANDMARKS[node.location_id] : null

          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={landmarkInfo ? 8 : isActive ? cfg.radius + 4 : isOnRoute ? cfg.radius + 2 : cfg.radius}
              pathOptions={{
                color: landmarkInfo ? '#38bdf8' : isActive ? '#22d3ee' : isOnRoute ? '#818cf8' : cfg.color,
                fillColor: landmarkInfo ? '#0284c7' : isActive ? '#22d3ee' : isOnRoute ? '#6366f1' : cfg.fillColor,
                fillOpacity: landmarkInfo ? 0.95 : isActive ? 1 : isOnRoute ? 0.95 : 0.7,
                weight: landmarkInfo ? 2.5 : isActive ? 3 : isOnRoute ? 2 : 1,
              }}
              eventHandlers={{
                click: () => {
                  if (landmarkInfo) {
                    setSelectedLandmark(landmarkInfo)
                  }
                },
              }}
            >
              {(node.location_id || node.label) && (
                <Tooltip direction="top" offset={[0, -8]}>
                  <div style={{ fontSize: '12px', fontWeight: 600, padding: '2px 4px' }}>
                    <div style={{ color: '#f8fafc', fontWeight: 700 }}>{node.label || node.id}</div>
                    {landmarkInfo && (
                      <div style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'Mukta, sans-serif' }}>
                        {landmarkInfo.marathiName} · Click for details
                      </div>
                    )}
                    {!node.is_accessible && (
                      <div style={{ color: '#f87171', fontSize: '10px', marginTop: '2px' }}>Stairs only</div>
                    )}
                  </div>
                </Tooltip>
              )}
            </CircleMarker>
          )
        })}

        {/* Live Animated Walker Marker */}
        {userPosition && (
          <>
            {/* Radar outer aura */}
            <CircleMarker
              center={userPosition}
              radius={22}
              pathOptions={{
                color: '#38bdf8',
                fillColor: '#38bdf8',
                fillOpacity: 0.16,
                weight: 1.5,
              }}
            />
            {/* Medium pulse ring */}
            <CircleMarker
              center={userPosition}
              radius={14}
              pathOptions={{
                color: '#6366f1',
                fillColor: '#6366f1',
                fillOpacity: 0.35,
                weight: 2,
              }}
            />
            {/* Core user location dot */}
            <CircleMarker
              center={userPosition}
              radius={8}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#38bdf8',
                fillOpacity: 1,
                weight: 2.5,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>
                  You
                </span>
              </Tooltip>
            </CircleMarker>
          </>
        )}

        {/* Static Start Marker (shown when not actively walking) */}
        {!userPosition && currentRoute && (() => {
          const originNode = nodeMap.get(currentRoute.origin_node_id)
          if (!originNode) return null
          return (
            <CircleMarker
              center={[originNode.lat, originNode.lng]}
              radius={9}
              pathOptions={{ color: '#ffffff', fillColor: '#22d3ee', fillOpacity: 0.95, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>Start</span>
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
              radius={11}
              pathOptions={{ color: '#ffffff', fillColor: '#10b981', fillOpacity: 0.95, weight: 2.5 }}
            >
              <Tooltip permanent direction="top" offset={[0, -12]}>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>Destination</span>
              </Tooltip>
            </CircleMarker>
          )
        })()}

        {/* Smoothly follow user along path when walking */}
        <UserPositionFollower position={userPosition} isWalking={isWalking} />

        {/* Auto-fit when route changes and user is not in mid-walk */}
        {!isWalking && currentRoute && <BoundsFitter nodes={currentRoute.nodes} />}
      </MapContainer>

      {/* ── Interactive Sanjivani Campus Landmark Card ────────────────────── */}
      {selectedLandmark && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '92%',
            maxWidth: '440px',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Top Banner Image with close button */}
          <div style={{ position: 'relative', height: '140px', width: '100%', overflow: 'hidden' }}>
            <img
              src={selectedLandmark.photo}
              alt={selectedLandmark.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.85)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, transparent 60%)',
              }}
            />
            <button
              onClick={() => setSelectedLandmark(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#fff',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                backdropFilter: 'blur(4px)',
              }}
              title="Close"
            >
              ✕
            </button>
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.85)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                }}
              >
                {selectedLandmark.category}
              </span>
              {selectedLandmark.timing && (
                <span
                  style={{
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {selectedLandmark.timing}
                </span>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                  {selectedLandmark.name}
                </h3>
                <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, fontFamily: 'Mukta, sans-serif' }}>
                  {selectedLandmark.marathiName}
                </div>
              </div>
            </div>

            <p style={{ margin: '8px 0 10px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.45 }}>
              {selectedLandmark.description}
            </p>

            {/* Highlights Chips */}
            {selectedLandmark.highlights && selectedLandmark.highlights.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                {selectedLandmark.highlights.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => handleNavigateToLandmark(selectedLandmark)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>Navigate Here</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetAsStart(selectedLandmark)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>Start Here</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

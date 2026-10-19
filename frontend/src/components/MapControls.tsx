import { useNavigationStore } from '../store/navigationStore'

export function MapControls() {
  const {
    showGraph, toggleShowGraph,
    clearNavigation, currentRoute,
    blockedEdgeIds, mapEdges,
    removeBlockedEdge,
  } = useNavigationStore()

  const hasBlockedEdges = blockedEdgeIds.size > 0 || mapEdges.some((e) => e.is_blocked)

  const handleClearAll = async () => {
    const { navigationApi } = await import('../api/navigationApi')
    const toUnblock = mapEdges.filter((e) => blockedEdgeIds.has(e.id) || e.is_blocked)
    await Promise.allSettled(
      toUnblock.map((e) => navigationApi.blockEdge(e.id, false))
    )
    toUnblock.forEach((e) => removeBlockedEdge(e.id))
  }

  return (
    <div style={{
      position: 'absolute', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: 1000,
    }}>
      {/* Graph toggle */}
      <button
        id="toggle-graph-btn"
        className="btn glass"
        style={{
          padding: '10px 14px', fontSize: '12px', fontWeight: 600,
          border: '1px solid var(--border)',
          color: showGraph ? 'var(--color-primary)' : 'var(--text-muted)',
        }}
        onClick={toggleShowGraph}
        title="Toggle graph overlay"
      >
        {showGraph ? '🗺️ Graph On' : '🗺️ Graph Off'}
      </button>

      {/* Clear route */}
      {currentRoute && (
        <button
          id="clear-route-btn"
          className="btn glass"
          style={{
            padding: '10px 14px', fontSize: '12px', fontWeight: 600,
            border: '1px solid var(--border)', color: 'var(--text-secondary)',
          }}
          onClick={clearNavigation}
          title="Clear current route"
        >
          ✕ Clear Route
        </button>
      )}

      {/* Clear blocked edges */}
      {hasBlockedEdges && (
        <button
          id="clear-blocks-btn"
          className="btn btn-danger"
          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600 }}
          onClick={handleClearAll}
          title="Remove all path blockages"
        >
          🔓 Clear Blocks
        </button>
      )}
    </div>
  )
}

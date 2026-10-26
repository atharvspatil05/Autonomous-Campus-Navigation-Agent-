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
      {/* Walkways toggle */}
      <button
        id="toggle-graph-btn"
        className="btn glass"
        style={{
          padding: '8px 14px', fontSize: '11px', fontWeight: 700,
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '12px',
          color: showGraph ? '#38bdf8' : 'rgba(255, 255, 255, 0.55)',
          background: showGraph ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer',
        }}
        onClick={toggleShowGraph}
        title="Toggle campus pathways overlay"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="19" r="3" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
          <circle cx="18" cy="5" r="3" />
        </svg>
        <span>{showGraph ? 'Paths Visible' : 'Paths Hidden'}</span>
      </button>

      {/* Clear route */}
      {currentRoute && (
        <button
          id="clear-route-btn"
          className="btn glass"
          style={{
            padding: '8px 14px', fontSize: '11px', fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '12px',
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: '6px',
            cursor: 'pointer',
          }}
          onClick={clearNavigation}
          title="Reset active navigation route"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span>Clear Route</span>
        </button>
      )}

      {/* Clear blocked edges */}
      {hasBlockedEdges && (
        <button
          id="clear-blocks-btn"
          style={{
            padding: '8px 14px', fontSize: '11px', fontWeight: 700,
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: '6px',
            cursor: 'pointer',
          }}
          onClick={handleClearAll}
          title="Remove all blocked paths"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
          <span>Unblock All Paths</span>
        </button>
      )}
    </div>
  )
}

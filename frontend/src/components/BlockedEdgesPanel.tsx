import { useNavigationStore } from '../store/navigationStore'
import { navigationApi } from '../api/navigationApi'

/**
 * Sidebar panel for the blocked-edges control panel.
 * Lets users see blocked edges and unblock them individually.
 */
export function BlockedEdgesPanel() {
  const { mapEdges, blockedEdgeIds, removeBlockedEdge } = useNavigationStore()

  const blocked = mapEdges.filter(
    (e) => blockedEdgeIds.has(e.id) || e.is_blocked
  )

  if (blocked.length === 0) return null

  const handleUnblock = async (edgeId: string) => {
    try {
      await navigationApi.blockEdge(edgeId, false)
      removeBlockedEdge(edgeId)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        padding: '12px 14px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{
        fontSize: '11px', fontWeight: 700, color: 'var(--color-danger)',
        marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        🚫 BLOCKED PATHS ({blocked.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {blocked.map((e) => (
          <div
            key={e.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px', background: 'rgba(239,68,68,0.08)',
              borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--color-danger)', flex: 1, fontFamily: 'monospace' }}>
              {e.id}
            </span>
            <button
              className="btn btn-ghost"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => handleUnblock(e.id)}
              id={`unblock-btn-${e.id}`}
            >
              Unblock
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
        💡 Click any edge on the map to block/unblock it
      </div>
    </div>
  )
}

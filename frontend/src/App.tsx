import { Suspense, lazy } from 'react'
import { SearchBar } from './components/SearchBar'
import { RoutePanel } from './components/RoutePanel'
import { BlockedEdgesPanel } from './components/BlockedEdgesPanel'
import { MapControls } from './components/MapControls'
import { ErrorToast, LoadingOverlay } from './components/Overlays'
import { useNavigationStore } from './store/navigationStore'
import { useInitialData } from './hooks/useInitialData'
import { useWebSocket } from './hooks/useWebSocket'
import { useReplan } from './hooks/useReplan'

// Lazy-load heavy Leaflet map
const CampusMap = lazy(() =>
  import('./components/CampusMap').then((m) => ({ default: m.CampusMap }))
)

export default function App() {
  // Bootstrap data and realtime connections
  useInitialData()
  useWebSocket()
  useReplan()

  const { sidebarOpen, toggleSidebar, mapNodes, currentRoute } = useNavigationStore()

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', position: 'relative',
      background: 'var(--surface-0)',
    }}>

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? '360px' : '0',
        minWidth: sidebarOpen ? '360px' : '0',
        height: '100%',
        overflow: 'hidden',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        zIndex: 100,
        borderRight: '1px solid var(--border)',
        background: 'var(--surface-1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          opacity: sidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <SearchBar />
          <div className="divider" />
          <RoutePanel />
          <BlockedEdgesPanel />
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: sidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
          <span>{mapNodes.length} nodes · {currentRoute ? `Route active` : 'No route'}</span>
        </div>
      </aside>

      {/* ── Sidebar Toggle Button ────────────────────────────── */}
      <button
        id="sidebar-toggle-btn"
        onClick={toggleSidebar}
        style={{
          position: 'absolute',
          left: sidebarOpen ? '348px' : '0',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 200,
          width: '24px', height: '48px',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderLeft: sidebarOpen ? 'none' : '1px solid var(--border)',
          borderRadius: sidebarOpen ? '0 8px 8px 0' : '0 8px 8px 0',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        aria-label="Toggle sidebar"
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        {sidebarOpen ? '‹' : '›'}
      </button>

      {/* ── Map Area ──────────────────────────────────────────── */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map header bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 500,
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(10,11,15,0.9) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <span className="gradient-text" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em' }}>
              ACNA
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>
              Autonomous Campus Navigation Agent
            </span>
          </div>
          <span className="badge badge-cyan" style={{ pointerEvents: 'auto' }}>
            🔴 LIVE
          </span>
        </div>

        {/* Leaflet map */}
        <Suspense fallback={
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-0)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px', height: '40px', margin: '0 auto 12px',
                border: '3px solid var(--surface-4)',
                borderTop: '3px solid var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading map…</div>
            </div>
          </div>
        }>
          <CampusMap />
        </Suspense>

        {/* Floating overlays */}
        <LoadingOverlay />
        <ErrorToast />
        <MapControls />

        {/* Map hint */}
        <div style={{
          position: 'absolute', bottom: '24px', left: '24px',
          zIndex: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          pointerEvents: 'none',
          background: 'rgba(10,11,15,0.7)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          backdropFilter: 'blur(8px)',
        }}>
          🖱️ Click any edge on the map to block/unblock it
        </div>
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

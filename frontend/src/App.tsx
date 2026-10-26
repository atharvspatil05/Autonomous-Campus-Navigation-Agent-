import { Suspense, lazy, useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { RoutePanel } from './components/RoutePanel'
import { BlockedEdgesPanel } from './components/BlockedEdgesPanel'
import { MapControls } from './components/MapControls'
import { ErrorToast, LoadingOverlay } from './components/Overlays'
import { WelcomeScreen } from './components/WelcomeScreen'
import { CampusDirectoryModal } from './components/CampusDirectoryModal'
import { HelplineModal } from './components/HelplineModal'
import { useNavigationStore } from './store/navigationStore'
import { useInitialData } from './hooks/useInitialData'
import { useWebSocket } from './hooks/useWebSocket'
import { useReplan } from './hooks/useReplan'
import { useWalkSimulation } from './hooks/useWalkSimulation'

// Lazy-load Leaflet map
const CampusMap = lazy(() =>
  import('./components/CampusMap').then((m) => ({ default: m.CampusMap }))
)

export default function App() {
  // Bootstrap data and realtime connections
  useInitialData()
  useWebSocket()
  useReplan()
  useWalkSimulation()

  const [showWelcome, setShowWelcome] = useState(true)
  const [showDirectory, setShowDirectory] = useState(false)
  const [showHelpline, setShowHelpline] = useState(false)
  const [language, setLanguage] = useState<'en' | 'mr'>('en')

  const { sidebarOpen, toggleSidebar, currentRoute } = useNavigationStore()

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw',
      overflow: 'hidden', position: 'relative',
      background: 'var(--surface-0)',
    }}>
      {/* ── Welcome Tour Screen ─────────────────────────────────── */}
      {showWelcome && (
        <WelcomeScreen onEnter={() => setShowWelcome(false)} />
      )}

      {/* ── Campus Directory Modal ──────────────────────────────── */}
      <CampusDirectoryModal
        isOpen={showDirectory}
        onClose={() => setShowDirectory(false)}
        language={language}
      />

      {/* ── Campus Emergency / Helpline Modal ───────────────────── */}
      <HelplineModal
        isOpen={showHelpline}
        onClose={() => setShowHelpline(false)}
        language={language}
      />

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
          <SearchBar language={language} />
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
          justifyContent: 'space-between',
          opacity: sidebarOpen ? 1 : 0,
          transition: 'opacity 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
            <span>Sanjivani COE Network · Kopargaon</span>
          </div>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>PIN 423603</span>
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
        {/* Modern Sanjivani Header Bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          zIndex: 500,
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(10,11,15,0.92) 0%, rgba(10,11,15,0.6) 80%, transparent 100%)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}>
          {/* Logo & Institute Title */}
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/sanjivani_logo.png"
              alt="Sanjivani Logo"
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  {language === 'mr' ? 'संजीवनी अभियांत्रिकी महाविद्यालय' : 'Sanjivani College of Engineering'}
                </span>
                <span
                  style={{
                    background: 'rgba(99, 102, 241, 0.25)',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    color: '#a5b4fc',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                  }}
                >
                  AUTONOMOUS
                </span>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    color: '#6ee7b7',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                  }}
                >
                  NAAC A+
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'Mukta, sans-serif' }}>
                {language === 'mr'
                  ? 'स्वायत्त संस्था · कोपरगाव, अहिल्यानगर · अधिकृत नेव्हिगेशन'
                  : 'Autonomous Institute · Kopargaon, Maharashtra · Official Campus Nav'}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Campus Directory Button */}
            <button
              onClick={() => setShowDirectory(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '16px',
                padding: '6px 12px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
              title="Browse Campus Directory"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>{language === 'mr' ? 'कॅम्पस डिरेक्टरी' : 'Directory'}</span>
            </button>

            {/* Helpline Button */}
            <button
              onClick={() => setShowHelpline(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '16px',
                padding: '6px 12px',
                color: '#fca5a5',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
              title="Campus Helplines & Security"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{language === 'mr' ? 'मदत कक्ष' : 'Helpline'}</span>
            </button>

            {/* Language Toggle (EN / मराठी) */}
            <button
              onClick={() => setLanguage((l) => (l === 'en' ? 'mr' : 'en'))}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '16px',
                padding: '6px 12px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(8px)',
                fontFamily: 'Mukta, sans-serif',
              }}
              title="Switch Language (मराठी / English)"
            >
              🌐 {language === 'en' ? 'मराठी' : 'English'}
            </button>

            {/* Virtual Tour Button */}
            <button
              id="virtual-tour-btn"
              onClick={() => setShowWelcome(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(59, 130, 246, 0.35))',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                borderRadius: '16px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backdropFilter: 'blur(8px)',
              }}
              title="Open Campus Virtual Tour"
            >
              <span>{language === 'mr' ? 'व्हर्च्युअल टूर' : 'Virtual Tour'}</span>
            </button>

            <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 9px', fontSize: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
              LIVE
            </span>
          </div>
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
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading Sanjivani Campus Map…</div>
            </div>
          </div>
        }>
          <CampusMap />
        </Suspense>

        {/* Floating overlays */}
        <LoadingOverlay />
        <ErrorToast />
        <MapControls />

        {/* Helpful Tip */}
        <div style={{
          position: 'absolute', bottom: '24px', left: '24px',
          zIndex: 500,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.7)',
          pointerEvents: 'none',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '6px 14px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ color: '#38bdf8' }}>💡</span>
          <span>{language === 'mr' ? 'नकाशावरील कोणत्याही इमारतीवर क्लिक करून फोटो व माहिती पहा' : 'Click any building or pin on the map to view photos & instant directions'}</span>
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

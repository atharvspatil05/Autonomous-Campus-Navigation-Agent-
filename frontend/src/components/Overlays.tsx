import { useNavigationStore } from '../store/navigationStore'

export function ErrorToast() {
  const { error, setError } = useNavigationStore()
  if (!error) return null

  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'absolute', bottom: '24px', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 20px',
        background: 'rgba(17,18,24,0.95)',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        maxWidth: '480px',
        backdropFilter: 'blur(16px)',
      }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
      <span style={{ fontSize: '13px', color: '#fca5a5', flex: 1 }}>{error}</span>
      <button
        onClick={() => setError(null)}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '16px', padding: '0 4px',
        }}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  )
}

export function LoadingOverlay() {
  const { isNavigating } = useNavigationStore()
  if (!isNavigating) return null

  return (
    <div style={{
      position: 'absolute', top: '16px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 18px',
      background: 'rgba(17,18,24,0.92)',
      border: '1px solid var(--border-accent)',
      borderRadius: 'var(--radius-md)',
      backdropFilter: 'blur(16px)',
      boxShadow: 'var(--shadow-glow)',
    }}>
      <div style={{
        width: '16px', height: '16px',
        border: '2px solid var(--surface-4)',
        borderTop: '2px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
        Finding route…
      </span>
    </div>
  )
}

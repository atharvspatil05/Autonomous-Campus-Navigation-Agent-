import React, { useCallback, useRef, useState } from 'react'
import { useNavigationStore } from '../../store/navigationStore'
import { navigationApi } from '../../api/navigationApi'

const ALGO_OPTIONS = [
  { value: 'ASTAR',    label: 'A* (Default)' },
  { value: 'DIJKSTRA', label: 'Dijkstra' },
  { value: 'BFS',      label: 'BFS (Hop Count)' },
] as const

export function SearchBar() {
  const {
    query, setQuery, originNodeId, algorithm, accessibleOnly,
    setAlgorithm, setAccessibleOnly,
    setResponse, setIsNavigating, setError, clearNavigation,
    isNavigating,
  } = useNavigationStore()

  const [showOptions, setShowOptions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isNavigating) return

    clearNavigation()
    setIsNavigating(true)
    setError(null)

    try {
      const res = await navigationApi.navigate({
        natural_language_query: query.trim(),
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
  }, [query, isNavigating, originNodeId, algorithm, accessibleOnly, clearNavigation, setIsNavigating, setError, setResponse])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>🗺️</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Campus Navigator
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Powered by A* · AI-assisted
          </div>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '16px', pointerEvents: 'none',
          }}>🔍</span>
          <input
            ref={inputRef}
            id="nav-search-input"
            className="input-field"
            style={{ paddingLeft: '40px', paddingRight: '12px' }}
            type="text"
            placeholder='Try "take me to the library"…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isNavigating}
            autoComplete="off"
            autoFocus
          />
        </div>
        <button
          id="nav-search-btn"
          type="submit"
          className="btn btn-primary"
          disabled={!query.trim() || isNavigating}
          style={{ minWidth: '52px', padding: '10px 14px' }}
          title="Navigate"
        >
          {isNavigating
            ? <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            : '→'}
        </button>
      </form>

      {/* Options toggle */}
      <button
        className="btn btn-ghost"
        style={{ fontSize: '12px', padding: '6px 12px', justifyContent: 'flex-start' }}
        onClick={() => setShowOptions(v => !v)}
        type="button"
      >
        ⚙️ Route options {showOptions ? '▲' : '▼'}
      </button>

      {showOptions && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              ALGORITHM
            </label>
            <select
              id="algorithm-select"
              className="input-field"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
            >
              {ALGO_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer', padding: '10px 12px',
            background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}>
            <input
              id="accessible-toggle"
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>♿ Accessible routes only</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avoid stairs and inaccessible paths</div>
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

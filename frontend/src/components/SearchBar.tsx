import React, { useCallback, useRef, useState } from 'react'
import { useNavigationStore } from '../store/navigationStore'
import { navigationApi } from '../api/navigationApi'

interface SearchBarProps {
  language?: 'en' | 'mr'
}

export function SearchBar({ language = 'en' }: SearchBarProps) {
  const {
    query, setQuery, originNodeId, algorithm, accessibleOnly,
    setAccessibleOnly,
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

  const destinationChips = [
    { label: language === 'mr' ? 'सेंट्रल लायब्ररी' : 'Central Library', query: 'Sanjivani Central Library' },
    { label: language === 'mr' ? 'आयडिया लॅब' : 'IDEA Lab', query: 'AICTE IDEA Lab' },
    { label: language === 'mr' ? 'कॉम्प्युटर व आयटी' : 'Computer & IT', query: 'Computer Engineering Department' },
    { label: language === 'mr' ? 'अॅम्फीथिएटर' : 'Amphitheater', query: 'Open-Air Amphitheater' },
    { label: language === 'mr' ? 'कँटीन' : 'Canteen', query: 'Sanjivani Main Canteen' },
    { label: language === 'mr' ? 'प्रशासकीय कार्यालय' : 'Admin Office', query: 'Administrative Block' },
    { label: language === 'mr' ? 'क्रीडांगण' : 'Sports Ground', query: 'Sports Ground' },
    { label: language === 'mr' ? 'वर्कशॉप' : 'Workshop', query: 'Central Engineering Workshop' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            {language === 'mr' ? 'कॅम्पस नेव्हिगेशन' : 'Campus Navigation'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
            {language === 'mr'
              ? 'संजीवनी संकुलात कुठेही सहज पोहोचा'
              : 'Voice-guided intelligent campus wayfinding'}
          </div>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.45)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id="nav-search-input"
            className="input-field"
            style={{
              paddingLeft: '38px',
              paddingRight: '12px',
              height: '42px',
              fontSize: '13px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
            type="text"
            placeholder={
              language === 'mr'
                ? 'उदा. "आयडिया लॅब", "सेंट्रल लायब्ररी", "कँटीन"…'
                : 'Search: e.g. "IDEA Lab", "Central Library", "Canteen"…'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isNavigating}
            autoComplete="off"
          />
        </div>
        <button
          id="nav-search-btn"
          type="submit"
          className="btn btn-primary"
          disabled={!query.trim() || isNavigating}
          style={{ minWidth: '48px', height: '42px', borderRadius: '12px', padding: '0 14px' }}
          title="Search directions"
        >
          {isNavigating ? (
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </form>

      {/* Quick Destination Chips */}
      <div>
        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px', fontWeight: 600 }}>
          {language === 'mr' ? 'लोकप्रिय ठिकाणे' : 'Popular Destinations'}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {destinationChips.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={async () => {
                setQuery(d.query)
                clearNavigation()
                setIsNavigating(true)
                setError(null)
                try {
                  const res = await navigationApi.navigate({
                    natural_language_query: d.query,
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
              }}
              disabled={isNavigating}
              style={{
                padding: '5px 11px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.6)'
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.18)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences toggle */}
      <div style={{ marginTop: '2px' }}>
        <button
          className="btn btn-ghost"
          style={{
            fontSize: '11px',
            padding: '6px 10px',
            justifyContent: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(255, 255, 255, 0.55)',
            border: 'none',
          }}
          onClick={() => setShowOptions((v) => !v)}
          type="button"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>{language === 'mr' ? 'मार्ग पर्याय' : 'Route Preferences'}</span>
          <span style={{ fontSize: '9px', marginLeft: 'auto' }}>{showOptions ? '▲' : '▼'}</span>
        </button>

        {showOptions && (
          <div
            className="animate-slide-up"
            style={{
              marginTop: '6px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                id="accessible-toggle"
                type="checkbox"
                checked={accessibleOnly}
                onChange={(e) => setAccessibleOnly(e.target.checked)}
                style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  {language === 'mr' ? 'सुलभ प्रवेश मार्ग (Accessible Ramps)' : 'Wheelchair / Ramp Routes Only'}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  {language === 'mr' ? 'पायऱ्या टाळा आणि उताराचे रस्ते निवडा' : 'Avoid stairs and steep terrain'}
                </div>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import type { ActionType, Instruction } from '../types'
import { useNavigationStore } from '../store/navigationStore'

const ACTION_ICONS: Record<ActionType, string> = {
  START:        '▶',
  TURN_LEFT:    '↰',
  TURN_RIGHT:   '↱',
  GO_STRAIGHT:  '↑',
  SLIGHT_LEFT:  '↖',
  SLIGHT_RIGHT: '↗',
  ARRIVE:       '●',
}

const ACTION_COLORS: Record<ActionType, string> = {
  START:        'var(--color-accent)',
  ARRIVE:       'var(--color-success)',
  TURN_LEFT:    'var(--color-primary)',
  TURN_RIGHT:   'var(--color-primary)',
  SLIGHT_LEFT:  '#a78bfa',
  SLIGHT_RIGHT: '#a78bfa',
  GO_STRAIGHT:  'var(--text-secondary)',
}

function InstructionRow({
  instr,
  index,
  isActive,
  isDone,
  onClick,
}: {
  instr: Instruction
  index: number
  isActive: boolean
  isDone: boolean
  onClick: () => void
}) {
  const rowRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isActive && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isActive])

  return (
    <button
      ref={rowRef}
      id={`instruction-step-${instr.step}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
        background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {/* Step dot + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          className={`step-dot ${isActive ? 'active' : isDone ? 'done' : ''}`}
          style={{ marginTop: '4px' }}
        />
        {index !== -1 && (
          <div
            style={{
              width: '1px',
              height: '20px',
              background: isDone ? 'var(--color-success)' : 'var(--border)',
              marginTop: '4px',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: ACTION_COLORS[instr.action] }}>
            {ACTION_ICONS[instr.action]}
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: ACTION_COLORS[instr.action],
            }}
          >
            Step {instr.step}
          </span>
          {instr.distance_m > 0 && (
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {instr.distance_m.toFixed(0)}m
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '13px',
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 400,
            lineHeight: 1.45,
          }}
        >
          {instr.description}
        </div>
        {instr.landmark_hint && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-accent)',
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ opacity: 0.7 }}>Near:</span>
            <span>{instr.landmark_hint}</span>
          </div>
        )}
      </div>
    </button>
  )
}

export function RoutePanel() {
  const {
    response,
    currentRoute,
    currentStep,
    setCurrentStep,
    isReplanning,
    isWalking,
    isPausedWalking,
    walkSpeed,
    voiceEnabled,
    hasArrived,
    walkProgress,
    startWalking,
    stopWalking,
    setIsPausedWalking,
    setWalkSpeed,
    toggleVoice,
    setHasArrived,
  } = useNavigationStore()

  if (!response || !currentRoute) return null

  const { resolved_location, alternatives } = response
  const { instructions, total_distance, estimated_time_minutes, explanation } = currentRoute
  const activeInstruction = instructions[currentStep] || instructions[0]

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* ── Destination Summary Card ─────────────────────────── */}
      <div
        style={{
          padding: '14px',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
              {resolved_location.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
              {(resolved_location.confidence * 100).toFixed(0)}% match confidence
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)' }}>
              {total_distance.toFixed(0)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              metres
            </div>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
              {estimated_time_minutes.toFixed(1)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              min walk
            </div>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#a78bfa' }}>
              {instructions.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              steps
            </div>
          </div>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Also considered: {alternatives.slice(0, 2).map((a) => a.name).join(', ')}
          </div>
        )}
      </div>

      {/* ── Arrival Celebration Card ─────────────────────────── */}
      {hasArrived && (
        <div
          className="animate-slide-up"
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.12))',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#6ee7b7', marginBottom: '4px' }}>
            You Have Arrived!
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Successfully completed route to {resolved_location.name}.
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setHasArrived(false)
                startWalking()
              }}
              className="btn btn-primary"
              style={{ padding: '7px 16px', fontSize: '12px' }}
            >
              Replay Journey
            </button>
            <button
              onClick={() => setHasArrived(false)}
              className="btn btn-ghost"
              style={{ padding: '7px 16px', fontSize: '12px' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Active Live Navigation HUD ───────────────────────── */}
      {isWalking && (
        <div
          className="animate-slide-up"
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '14px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.15)',
          }}
        >
          {/* Header row: Step & Audio */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22d3ee',
                  boxShadow: '0 0 8px #22d3ee',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Navigating Step {currentStep + 1} of {instructions.length}
              </span>
            </div>

            <button
              onClick={toggleVoice}
              style={{
                background: voiceEnabled ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: voiceEnabled ? '#a5b4fc' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title={voiceEnabled ? 'Mute voice directions' : 'Enable voice directions'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {voiceEnabled && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
              </svg>
              <span>{voiceEnabled ? 'Voice ON' : 'Muted'}</span>
            </button>
          </div>

          {/* Current Turn Instruction */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '20px',
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              {ACTION_ICONS[activeInstruction.action]}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                {activeInstruction.description}
              </div>
              {activeInstruction.landmark_hint && (
                <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>
                  Nearby: {activeInstruction.landmark_hint}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
              <span>Journey Progress</span>
              <span>{Math.round(walkProgress)}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${walkProgress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                  transition: 'width 0.2s linear',
                }}
              />
            </div>
          </div>

          {/* Controls Bar: Pause / Speed / Exit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                onClick={() => setIsPausedWalking(!isPausedWalking)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isPausedWalking ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={stopWalking}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Stop
              </button>
            </div>

            {/* Speed Multiplier */}
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255, 255, 255, 0.06)', padding: '2px', borderRadius: '8px' }}>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setWalkSpeed(spd)}
                  style={{
                    border: 'none',
                    background: walkSpeed === spd ? 'var(--color-primary)' : 'transparent',
                    color: walkSpeed === spd ? '#fff' : 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Start Navigation CTA Button (when not walking) ────── */}
      {!isWalking && !hasArrived && (
        <button
          id="start-walking-btn"
          onClick={startWalking}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: '14px',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 70, 229, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.35)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Start Live Navigation</span>
        </button>
      )}

      {/* AI Explanation */}
      {explanation && (
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.15)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.05em' }}>
            AI ROUTE SUMMARY
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {explanation}
          </p>
        </div>
      )}

      {isReplanning && (
        <div className="badge badge-amber" style={{ marginBottom: '12px', justifyContent: 'center', padding: '8px' }}>
          Replanning route…
        </div>
      )}

      {/* Instructions header */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>
        TURN-BY-TURN DIRECTIONS
      </div>

      {/* Instructions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '340px', overflowY: 'auto' }}>
        {instructions.map((instr, i) => (
          <InstructionRow
            key={`${instr.step}-${i}`}
            instr={instr}
            index={i < instructions.length - 1 ? i : -1}
            isActive={currentStep === i}
            isDone={i < currentStep}
            onClick={() => setCurrentStep(i)}
          />
        ))}
      </div>
    </div>
  )
}

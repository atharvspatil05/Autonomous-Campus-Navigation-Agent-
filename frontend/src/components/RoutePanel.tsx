import type { ActionType, Instruction } from '../types'
import { useNavigationStore } from '../store/navigationStore'

const ACTION_ICONS: Record<ActionType, string> = {
  START:        '🚦',
  TURN_LEFT:    '↰',
  TURN_RIGHT:   '↱',
  GO_STRAIGHT:  '↑',
  SLIGHT_LEFT:  '↖',
  SLIGHT_RIGHT: '↗',
  ARRIVE:       '🏁',
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
  return (
    <button
      id={`instruction-step-${instr.step}`}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        padding: '10px 12px', borderRadius: 'var(--radius-md)',
        border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
        background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
        cursor: 'pointer', width: '100%', textAlign: 'left',
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', flexShrink: 0 }}>
        <div
          className={`step-dot ${isActive ? 'active' : isDone ? 'done' : ''}`}
          style={{ marginTop: '4px' }}
        />
        {index !== -1 && (
          <div style={{
            width: '1px', height: '20px',
            background: isDone ? 'var(--color-success)' : 'var(--border)',
            marginTop: '4px',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>
            {ACTION_ICONS[instr.action]}
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 600,
            color: ACTION_COLORS[instr.action],
          }}>
            Step {instr.step}
          </span>
          {instr.distance_m > 0 && (
            <span style={{
              marginLeft: 'auto', fontSize: '11px',
              color: 'var(--text-muted)', flexShrink: 0,
            }}>
              {instr.distance_m.toFixed(0)}m
            </span>
          )}
        </div>
        <div style={{ fontSize: '13px', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.4 }}>
          {instr.description}
        </div>
        {instr.landmark_hint && (
          <div style={{ fontSize: '11px', color: 'var(--color-accent)', marginTop: '2px' }}>
            📍 {instr.landmark_hint}
          </div>
        )}
      </div>
    </button>
  )
}

export function RoutePanel() {
  const { response, currentRoute, currentStep, setCurrentStep, isReplanning } = useNavigationStore()

  if (!response || !currentRoute) return null

  const { resolved_location, alternatives } = response
  const { instructions, total_distance, estimated_time_minutes, explanation, algorithm_used } = currentRoute

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Destination card */}
      <div style={{
        padding: '14px', background: 'var(--surface-2)',
        borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '20px' }}>📍</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{resolved_location.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>
              {(resolved_location.confidence * 100).toFixed(0)}% match confidence
            </div>
          </div>
          <span className="badge badge-indigo" style={{ marginLeft: 'auto' }}>
            {algorithm_used}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-accent)' }}>
              {total_distance.toFixed(0)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>metres</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary)' }}>
              {estimated_time_minutes.toFixed(1)}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>min walk</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#a78bfa' }}>
              {instructions.length}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>steps</div>
          </div>
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Also considered: {alternatives.slice(0, 2).map(a => a.name).join(', ')}
          </div>
        )}
      </div>

      {/* AI Explanation */}
      {explanation && (
        <div style={{
          padding: '12px 14px', background: 'rgba(34,211,238,0.06)',
          border: '1px solid rgba(34,211,238,0.15)', borderRadius: 'var(--radius-md)',
          marginBottom: '12px',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '6px' }}>
            🤖 AI ROUTE SUMMARY
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {explanation}
          </p>
        </div>
      )}

      {isReplanning && (
        <div className="badge badge-amber" style={{ marginBottom: '12px', justifyContent: 'center', padding: '8px' }}>
          ⚠️ Replanning route…
        </div>
      )}

      {/* Instructions */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>
        TURN-BY-TURN DIRECTIONS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {instructions.map((instr, i) => (
          <InstructionRow
            key={instr.step}
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

import React from 'react'
import { MOCK_ROUTES } from '../../src/mocks/handlers'

export const MswInfoOverlay: React.FC<{
  visible: boolean
  onClose: () => void
}> = ({ visible, onClose }) => {
  if (!visible) return null

  const disabled = typeof window !== 'undefined' && (window as any).__mswDisabled
  const latency = typeof window !== 'undefined' ? (window as any).__mswLatencyMs : undefined
  const errorRate = typeof window !== 'undefined' ? (window as any).__mswErrorRate : undefined

  return (
    <div role="dialog" aria-modal="true" style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.86)', color: '#e5e7eb',
      zIndex: 999998, display: 'grid', placeItems: 'center', pointerEvents: 'auto'
    }}>
      <div style={{ width: 'min(1100px, 96vw)', maxHeight: '86vh', overflow: 'auto', background: 'rgba(15,23,42,0.9)', border: '1px solid #334155', borderRadius: 10, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>MSW Info</h2>
          <button onClick={onClose} style={{ padding: '6px 10px', border: '1px solid #334155', borderRadius: 6, background: 'transparent', color: '#e5e7eb' }}>Close</button>
        </div>

        <div style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#cbd5e1' }}>
          <div>Mode: <strong>{disabled ? 'Off (passthrough)' : 'On (mocked)'}</strong></div>
          <div>Latency: <strong>{latency ?? '0'} ms</strong></div>
          <div>Error rate: <strong>{errorRate ?? '0'}</strong></div>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: '8px 0 6px', fontSize: 16 }}>Routes</h3>
          <div style={{ overflowX: 'auto', border: '1px solid #334155', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} data-testid="msw-routes">
              <thead>
                <tr style={{ background: '#0b1220', color: '#93c5fd' }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>Method</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>Path</th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ROUTES.map((r) => (
                  <tr key={`${r.method}:${r.path}`}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b', color: '#fde68a', whiteSpace: 'nowrap' }}>{r.method}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{r.path}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: '#cbd5e1' }}>
          <p style={{ margin: '8px 0' }}>
            Handlers directory: <code style={{ background: '#0b1220', padding: '2px 4px', borderRadius: 4 }}>src/mocks/handlers.ts</code>
          </p>
          <p style={{ margin: '8px 0' }}>
            Useful headers: <code style={{ background: '#0b1220', padding: '2px 4px', borderRadius: 4 }}>x-mock-disable</code>, <code style={{ background: '#0b1220', padding: '2px 4px', borderRadius: 4 }}>x-mock-delay</code>, <code style={{ background: '#0b1220', padding: '2px 4px', borderRadius: 4 }}>x-mock-error-rate</code>
          </p>
          <p style={{ margin: '8px 0' }}>
            Docs: <a href="/docs/mocking-and-scenarios.md" style={{ color: '#93c5fd' }}>Mocking & Scenarios</a> • <a href="/docs/latency-profiles.md" style={{ color: '#93c5fd' }}>Latency Profiles</a>
          </p>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: 12, color: '#94a3b8' }}>
        Hint: select “MSW → Off” to passthrough real network
      </div>
    </div>
  )
}


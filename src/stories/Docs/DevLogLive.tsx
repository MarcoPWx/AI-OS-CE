import React, { useEffect, useState } from 'react'

// Minimal live Dev Log panel. If docs/status/DEVLOG.md exists in your public staticDir,
// this will attempt to fetch and render a snippet. Otherwise, it shows helpful guidance.
const DevLogLive: React.FC = () => {
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/status/DEVLOG.md')
        if (!res.ok) throw new Error(String(res.status))
        const txt = await res.text()
        if (!cancelled) setContent(txt)
      } catch (e) {
        if (!cancelled) setError('Dev Log not found (docs/status/DEVLOG.md).')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={{ maxWidth: 960, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginTop: 0 }}>Dev Log (Live)</h2>
      {content ? (
        <pre style={{ whiteSpace: 'pre-wrap' }}>{content.slice(0, 2000)}</pre>
      ) : (
        <p style={{ color: '#475569' }}>
          {error || 'Loading...' }<br/>
          Place your markdown at <code>docs/status/DEVLOG.md</code> to show real content here.
        </p>
      )}
    </div>
  )
}

export default DevLogLive


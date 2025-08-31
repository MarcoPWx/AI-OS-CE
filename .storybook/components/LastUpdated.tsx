import React from 'react';

export function LastUpdated(props: { note?: string }) {
  const [ts, setTs] = React.useState<string>('');
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      // Try docs manifest first
      try {
        const res = await fetch('/docs/docs-manifest.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const when = json?.generatedAt || json?.generated_at;
          if (mounted && when) {
            setTs(new Date(when).toLocaleString());
            return;
          }
        }
      } catch {}
      // Fallback: project.json (if served)
      try {
        const res = await fetch('/project.json', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const when = json?.generatedAt || json?.buildTime || json?.time;
          if (mounted && when) {
            setTs(new Date(when).toLocaleString());
            return;
          }
        }
      } catch {}
      // Final fallback: now
      try {
        setTs(new Date().toLocaleString());
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const footerStyle: React.CSSProperties = {
    marginTop: 16,
    paddingTop: 8,
    borderTop: '1px solid rgba(127,127,127,0.24)',
    fontSize: 12,
    opacity: 0.8,
  };

  return (
    <div style={footerStyle}>
      Last updated: {ts || '…'}
      {props.note ? ` — ${props.note}` : ''}
    </div>
  );
}

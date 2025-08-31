// src/stories/components/DefaultsChip.tsx
import React, { useEffect, useState } from 'react';

export function DefaultsChip() {
  const [cfg, setCfg] = useState<{ latencyMs: number; errorRate: number } | null>(null);
  useEffect(() => {
    let stale = false;
    const load = async () => {
      try {
        const res = await fetch('/__msw__/defaults');
        if (!stale && res.ok) {
          const j = await res.json();
          setCfg({ latencyMs: j?.latencyMs ?? 0, errorRate: j?.errorRate ?? 0 });
        }
      } catch {}
    };
    void load();
    const id = setInterval(load, 2000);
    return () => {
      stale = true;
      clearInterval(id);
    };
  }, []);

  const pillStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 9999,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.06)',
    fontSize: 12,
    fontFamily: 'monospace',
  };
  return (
    <span style={pillStyle} title="MSW global defaults (auto-refreshed)">
      defaults: latency={cfg?.latencyMs ?? 0}ms, errorRate={(cfg?.errorRate ?? 0).toFixed(2)}
    </span>
  );
}

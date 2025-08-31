// src/ui/designSystem/components/ProgressBar.tsx
import React from 'react';

export function ProgressBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div
      aria-label="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
      aria-valuetext={`${p}%`}
      style={{
        height: 6,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        data-testid="progress-inner"
        style={{ height: '100%', width: `${p}%`, background: '#00d084' }}
      />
    </div>
  );
}

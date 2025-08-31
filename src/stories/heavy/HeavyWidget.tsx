// src/stories/heavy/HeavyWidget.tsx
import React from 'react';

export default function HeavyWidget({ complexity = 1 }: { complexity?: number }) {
  // Simulate some CPU work to visualize load
  let sum = 0;
  for (let i = 0; i < complexity * 10000; i++) sum += Math.sqrt(i);
  return (
    <div style={{ padding: 12, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
      <div>
        <strong>HeavyWidget</strong> loaded (complexity={complexity})
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Simulated work sum: {sum.toFixed(2)}</div>
    </div>
  );
}

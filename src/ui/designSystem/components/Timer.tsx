// src/ui/designSystem/components/Timer.tsx
import React from 'react';

export function Timer({
  secondsLeft,
  totalSeconds,
}: {
  secondsLeft: number;
  totalSeconds: number;
}) {
  const left = Math.max(0, Math.round(secondsLeft));
  const total = Math.max(1, Math.round(totalSeconds));
  return (
    <div
      aria-label="timer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="timer-text"
      style={{ fontSize: 12, opacity: 0.8 }}
    >
      Time: {left}s / {total}s
    </div>
  );
}

// src/components/ui/progress.tsx
import React from 'react';

export const Progress: React.FC<{ value: number; className?: string }> = ({
  value,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded bg-gray-200 ${className}`}>
      <div className="h-full rounded bg-blue-600 transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
};

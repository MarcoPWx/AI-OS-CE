// src/stories/components/LastUpdated.tsx
import React from 'react';

export function LastUpdated({ iso }: { iso: string | null }) {
  if (!iso) return null;
  const label = new Date(iso).toLocaleString();
  return (
    <span style={{ fontSize: 12, opacity: 0.75 }}>Last updated: {label}</span>
  );
}


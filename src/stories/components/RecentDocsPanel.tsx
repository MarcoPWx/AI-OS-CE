// src/stories/components/RecentDocsPanel.tsx
import React, { useEffect, useMemo, useState } from 'react';

type Item = { path: string; title: string; mtime: number };
interface Manifest {
  generatedAt: string;
  total: number;
  items: Item[];
}

export function RecentDocsPanel({ limit = 10 }: { limit?: number }) {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/docs/docs-manifest.json');
        if (!res.ok) return;
        const m: Manifest = await res.json();
        setItems(m.items || []);
      } catch {}
    })();
  }, []);

  const top = useMemo(() => {
    return [...items].sort((a, b) => b.mtime - a.mtime).slice(0, limit);
  }, [items, limit]);

  if (top.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Recently updated</div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {top.map((it) => (
          <li key={it.path} style={{ marginBottom: 6 }}>
            <a href={it.path} target="_blank" rel="noreferrer">
              {it.title}
            </a>
            <span style={{ marginLeft: 8, opacity: 0.6, fontSize: 12 }}>
              {new Date(it.mtime).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

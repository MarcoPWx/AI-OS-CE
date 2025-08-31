// src/stories/utils/docs.ts
export type ManifestItem = {
  path: string;
  title?: string;
  mtime?: number;
  mtimeIso?: string;
  size?: number;
};

export type Manifest = {
  generatedAt?: string;
  generatedAtIso?: string;
  total?: number;
  items?: ManifestItem[];
  byDir?: Record<string, ManifestItem[]>;
};

const MANIFEST_PATHS = [
  '/devmentor/docs/manifest.json',
  '/devmentor/docs/docs-manifest.json',
  '/docs/docs-manifest.json',
  '/docs/manifest.json',
];

export async function fetchManifestWithFallback(): Promise<Manifest | null> {
  for (const p of MANIFEST_PATHS) {
    try {
      const res = await fetch(p, { cache: 'no-store' });
      if (!res.ok) continue;
      return (await res.json()) as Manifest;
    } catch {}
  }
  return null;
}

export function findManifestItem(manifest: Manifest | null, candidates: string[]): ManifestItem | null {
  if (!manifest) return null;
  const allItems = manifest.items || [];
  for (const c of candidates) {
    const hit = allItems.find((it) => it.path === c || it.path?.endsWith(c));
    if (hit) return hit;
  }
  return null;
}

export async function fetchDocTextWithFallback(paths: string[], apiKey?: string): Promise<string | null> {
  // Try static paths served by Storybook's staticDirs first
  for (const p of paths) {
    try {
      const res = await fetch(p, { cache: 'no-store' });
      if (res.ok) return await res.text();
    } catch {}
  }
  // Fallback to runtime docs API if provided
  if (apiKey) {
    try {
      const res = await fetch(`/api/docs/read?key=${encodeURIComponent(apiKey)}`, { cache: 'no-store' });
      if (res.ok) return await res.text();
    } catch {}
  }
  return null;
}


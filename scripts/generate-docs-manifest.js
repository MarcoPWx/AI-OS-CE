#!/usr/bin/env node
/*
 Generates a docs manifest JSON for Storybook nav.
 Scans the ./docs directory for .md and .mdx files and writes ./docs/docs-manifest.json
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_FILE = path.join(DOCS_DIR, 'docs-manifest.json');

/** @type {(dir:string) => Array<{path:string, title:string, mtime:number}>} */
function walkDocs(dir) {
  const entries = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name.startsWith('.')) continue;
      entries.push(...walkDocs(full));
    } else if (ent.isFile() && (ent.name.endsWith('.md') || ent.name.endsWith('.mdx'))) {
      try {
        const rel = '/' + path.relative(ROOT, full).replaceAll('\\', '/');
        const stat = fs.statSync(full);
        let title = path.basename(ent.name, path.extname(ent.name));
        // try read first H1 as title
        const content = fs.readFileSync(full, 'utf8');
        const m = content.match(/^#\s+(.+)$/m);
        if (m) title = m[1].trim();
        entries.push({ path: rel.startsWith('/') ? rel : '/' + rel, title, mtime: stat.mtimeMs });
      } catch {}
    }
  }
  return entries;
}

function groupByDir(items) {
  const grouped = {};
  for (const it of items) {
    const dir = it.path.replace(/^\//, '').split('/').slice(0, 2).join('/'); // e.g. docs/status
    grouped[dir] = grouped[dir] || [];
    grouped[dir].push(it);
  }
  return grouped;
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('Docs directory not found:', DOCS_DIR);
    process.exit(1);
  }
  const items = walkDocs(DOCS_DIR);
  items.sort((a, b) => a.path.localeCompare(b.path));
  const grouped = groupByDir(items);
  const manifest = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    items,
    byDir: grouped,
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));
  console.log('Wrote manifest:', path.relative(ROOT, OUT_FILE), 'items:', items.length);
}

main();

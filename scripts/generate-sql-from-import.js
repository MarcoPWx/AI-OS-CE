#!/usr/bin/env node
/*
Generate SQL seed from data/cli_import JSON for Supabase
Targets tables from 003_question_delivery.sql:
- question_categories (name, icon, color, description)
- questions (category_id, text, options, correct_answer, difficulty, explanation)
*/

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'cli_import');
const OUT_SQL = path.resolve(__dirname, '..', 'supabase', 'cli_import_seed.sql');

function main() {
  const catsPath = path.join(DATA_DIR, 'categories.json');
  const qPath = path.join(DATA_DIR, 'questions.json');
  if (!fs.existsSync(catsPath) || !fs.existsSync(qPath)) {
    console.error('Missing categories.json or questions.json. Run scripts/cli-import.js first.');
    process.exit(1);
  }
  const categories = JSON.parse(fs.readFileSync(catsPath, 'utf8'));
  const questions = JSON.parse(fs.readFileSync(qPath, 'utf8'));

  const lines = [];
  lines.push('-- Auto-generated SQL seed from CLI import');
  lines.push('BEGIN;');

  // Upsert categories by slug stored in metadata (we only have slug+name here)
  for (const c of categories) {
    const name = c.name.replace(/'/g, "''");
    const desc = (c.description || '').replace(/'/g, "''");
    const icon = (c.icon || '❓').replace(/'/g, "''");
    const color = (c.color || '#3b82f6').replace(/'/g, "''");
    const slug = (c.slug || '').replace(/'/g, "''");
    lines.push(`-- Category: ${slug}`);
    lines.push(`INSERT INTO question_categories (name, icon, color, description, metadata)
VALUES ('${name}', '${icon}', '${color}', '${desc}', jsonb_build_object('slug','${slug}'))
ON CONFLICT (name) DO NOTHING;`);
  }

  // Insert questions using a CTE to look up category by slug in metadata
  for (const q of questions) {
    const text = (q.text || '').replace(/'/g, "''");
    const expl = (q.explanation || '').replace(/'/g, "''");
    const opts = JSON.stringify(q.options).replace(/'/g, "''");
    const diff = (q.difficulty || 'medium').replace(/'/g, "''");
    const slug = (q.category || '').replace(/'/g, "''");
    const correct = Number(q.correct_answer) || 0;

    lines.push(`WITH cat AS (
  SELECT id FROM question_categories WHERE metadata->>'slug' = '${slug}' OR slug = '${slug}' LIMIT 1
)
INSERT INTO questions (category_id, text, options, correct_answer, difficulty, explanation)
SELECT id, '${text}', '${opts}'::jsonb, ${correct}, '${diff}', '${expl}' FROM cat
ON CONFLICT DO NOTHING;`);
  }

  lines.push('COMMIT;');

  fs.writeFileSync(OUT_SQL, lines.join('\n\n'));
  console.log(`✅ Wrote SQL seed: ${OUT_SQL}`);
}

if (require.main === module) {
  main();
}

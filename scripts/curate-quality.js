#!/usr/bin/env node
/*
Curate imported CLI questions using heuristic and optional AI quality signals.

Inputs (data/cli_import):
- questions.json (from scripts/cli-import.js)
- quality_report.json (from scripts/quality-evaluate.js)

Outputs (data/cli_import):
- curated.json
- curated.csv

Env controls:
- CURATE_MIN_SCORE=0.6         # minimum aggregate score
- CURATE_MIN_READABILITY=0.2   # minimum readability score
- CURATE_EXCLUDE_FLAGS=offensive,unclear,incorrect  # AI review flags to exclude
- CURATE_MAX_PER_CATEGORY=0    # limit per category (0 = unlimited)
*/

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data', 'cli_import');
const QUESTIONS_PATH = path.join(DATA_DIR, 'questions.json');
const QUALITY_PATH = path.join(DATA_DIR, 'quality_report.json');
const OUT_JSON = path.join(DATA_DIR, 'curated.json');
const OUT_CSV = path.join(DATA_DIR, 'curated.csv');

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function curate(questions, quality, cfg) {
  const {
    minScore = 0.6,
    minReadability = 0.2,
    excludeFlags = ['offensive', 'unclear', 'incorrect'],
    maxPerCategory = 0,
  } = cfg;

  const byId = new Map(quality.results.map((r) => [r.id, r]));

  // Score questions and filter
  const scored = questions.map((q) => {
    const r = byId.get(q.id) || {};
    const aggregate = typeof r.aggregate === 'number' ? r.aggregate : 0;
    const readability = typeof r.readability === 'number' ? r.readability : 0;
    const correctInRange = r.correct_in_range === 1;
    const aiScore = r.ai_review?.score ?? null;
    const flags = (r.ai_review?.flags || []).map((s) => String(s).toLowerCase());
    const hasBadFlag = flags.some((f) => excludeFlags.includes(f));

    const score = Math.max(aggregate, aiScore ?? 0);

    const include =
      correctInRange && readability >= minReadability && aggregate >= minScore && !hasBadFlag;

    return { q, r, include, score };
  });

  // Apply per-category cap if requested
  const grouped = new Map();
  for (const item of scored) {
    if (!item.include) continue;
    const cat = item.q.category || 'uncategorized';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat).push(item);
  }

  const curated = [];
  for (const [cat, items] of grouped.entries()) {
    // Sort by score desc, fall back to text length
    items.sort((a, b) => b.score - a.score || (b.q.text?.length || 0) - (a.q.text?.length || 0));
    const take = maxPerCategory > 0 ? items.slice(0, maxPerCategory) : items;
    curated.push(
      ...take.map((it) => ({
        ...it.q,
        quality: {
          aggregate: it.r.aggregate ?? null,
          readability: it.r.readability ?? null,
          option_uniqueness: it.r.option_uniqueness ?? null,
          ai_review: it.r.ai_review || null,
        },
      })),
    );
  }

  // Sort globally by category then score
  curated.sort((a, b) => (a.category || '').localeCompare(b.category || ''));

  return curated;
}

function writeCsv(rows, header) {
  const H = header || Object.keys(rows[0] || {});
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [H.join(',')].concat(rows.map((r) => H.map((h) => escape(r[h])).join(','))).join('\n');
}

function run() {
  if (!exists(QUESTIONS_PATH)) {
    console.error(`Missing ${QUESTIONS_PATH}. Run scripts/cli-import.js first.`);
    process.exit(1);
  }
  if (!exists(QUALITY_PATH)) {
    console.error(`Missing ${QUALITY_PATH}. Run scripts/quality-evaluate.js first.`);
    process.exit(1);
  }

  const questions = readJson(QUESTIONS_PATH);
  const quality = readJson(QUALITY_PATH);

  const cfg = {
    minScore: Number(process.env.CURATE_MIN_SCORE || 0.6),
    minReadability: Number(process.env.CURATE_MIN_READABILITY || 0.2),
    excludeFlags: String(process.env.CURATE_EXCLUDE_FLAGS || 'offensive,unclear,incorrect')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
    maxPerCategory: Number(process.env.CURATE_MAX_PER_CATEGORY || 0),
  };

  const curated = curate(questions, quality, cfg);

  fs.writeFileSync(OUT_JSON, JSON.stringify(curated, null, 2));

  const csvRows = curated.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    aggregate: q.quality?.aggregate ?? '',
    readability: q.quality?.readability ?? '',
    ai_score: q.quality?.ai_review?.score ?? '',
    text: q.text,
  }));
  fs.writeFileSync(
    OUT_CSV,
    writeCsv(csvRows, [
      'id',
      'category',
      'difficulty',
      'aggregate',
      'readability',
      'ai_score',
      'text',
    ]),
  );

  console.log(`✅ Curated ${curated.length} questions (from ${questions.length})`);
  console.log(`📄 ${OUT_JSON}`);
  console.log(`📄 ${OUT_CSV}`);
}

if (require.main === module) {
  run();
}

module.exports = { curate, run };

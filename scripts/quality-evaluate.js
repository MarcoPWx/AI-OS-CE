#!/usr/bin/env node
/*
 Quality evaluator for imported CLI questions
 - Reads data/cli_import/questions.json
 - Computes simple heuristic scores per question
 - Optionally augments with LLM if env vars are configured (skipped by default)
 - Outputs data/cli_import/quality_report.json and CSV
*/

const fs = require('fs');
const path = require('path');

const INPUT = path.resolve(__dirname, '..', 'data', 'cli_import', 'questions.json');
const OUT_JSON = path.resolve(__dirname, '..', 'data', 'cli_import', 'quality_report.json');
const OUT_CSV = path.resolve(__dirname, '..', 'data', 'cli_import', 'quality_report.csv');
const OUT_AI_JSON = path.resolve(__dirname, '..', 'data', 'cli_import', 'quality_ai_review.json');

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function optionUniqueness(options) {
  const set = new Set(options.map((o) => o.trim().toLowerCase()));
  return set.size / Math.max(1, options.length);
}

function readabilityScore(text) {
  // naive proxy: longer with punctuation considered more descriptive up to a cap
  const len = text.length;
  const punct = (text.match(/[\.,;:!?]/g) || []).length;
  return Math.max(0, Math.min(1, (len / 120) * 0.7 + (punct / 5) * 0.3));
}

function evaluate(q) {
  const scores = {
    option_uniqueness: optionUniqueness(q.options),
    readability: readabilityScore(q.text),
    explanation_present: q.explanation && q.explanation.trim().length > 0 ? 1 : 0,
    correct_in_range: q.correct_answer >= 0 && q.correct_answer < q.options.length ? 1 : 0,
  };
  // Aggregate score (0-1)
  const aggregate =
    scores.option_uniqueness * 0.35 +
    scores.readability * 0.35 +
    scores.explanation_present * 0.2 +
    scores.correct_in_range * 0.1;
  return { ...scores, aggregate: Number(aggregate.toFixed(3)) };
}

async function aiReviewBatch(questions, cfg) {
  const { url, apiKey, model = 'gpt-4o-mini', timeoutMs = 30000 } = cfg;

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);

  // OpenAI-compatible chat.completions request
  const sys = `You are a helpful assistant reviewing multiple-choice quiz questions for clarity and quality. Return strict JSON for each item.`;
  const items = questions.map((q, idx) => ({
    id: q.id,
    category: q.category,
    text: q.text,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation || '',
  }));

  const user = {
    task: 'Review the following questions.',
    expected_response_schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          score: { type: 'number' },
          flags: { type: 'array', items: { type: 'string' } },
          suggestions: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              explanation: { type: 'string' },
            },
          },
        },
        required: ['id', 'score', 'flags'],
      },
    },
    rubric: [
      'Clarity of question text',
      'Quality and uniqueness of distractors',
      'Factual accuracy of explanation',
      'Appropriate difficulty',
    ],
    scoring: 'Return score 0.0 to 1.0 where 1.0 is excellent.',
    data: items,
  };

  const body = {
    model,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: JSON.stringify(user) },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  };

  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  try {
    const resp = await fetch(url.replace(/\/$/, '') + '/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(to);
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      throw new Error(`LLM HTTP ${resp.status}: ${t}`);
    }
    const json = await resp.json();
    const content = json.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {};
    }
    // Support either direct array or {results: []}
    const arr = Array.isArray(parsed) ? parsed : parsed.results || [];
    return arr;
  } catch (e) {
    console.error('LLM review failed:', e.message);
    return [];
  }
}

async function run() {
  if (!exists(INPUT)) {
    console.error(`Missing input: ${INPUT}. Run scripts/cli-import.js first.`);
    process.exit(1);
  }
  const questions = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const results = questions.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    ...evaluate(q),
  }));

  // Optional AI review of low-scoring items
  const AI_ENABLED = String(process.env.AI_REVIEW_ENABLED).toLowerCase() === 'true';
  const AI_URL =
    process.env.AI_REVIEW_URL || process.env.OPENAI_BASE_URL || 'http://localhost:11434';
  const AI_KEY = process.env.AI_REVIEW_API_KEY || process.env.OPENAI_API_KEY || '';
  const AI_MODEL = process.env.AI_REVIEW_MODEL || 'gpt-4o-mini';
  const AI_THRESHOLD = Number(process.env.AI_REVIEW_THRESHOLD || 0.6);
  const AI_MAX = Math.max(1, Math.min(500, Number(process.env.AI_REVIEW_MAX || 100)));
  const AI_BATCH = Math.max(1, Math.min(20, Number(process.env.AI_REVIEW_BATCH || 10)));

  let aiReviews = [];
  if (AI_ENABLED) {
    const toReview = results.filter((r) => (r.aggregate ?? 0) < AI_THRESHOLD).slice(0, AI_MAX);

    // Join question bodies for those ids
    const byId = new Map(questions.map((q) => [q.id, q]));
    const reviewPayload = toReview.map((r) => byId.get(r.id)).filter(Boolean);

    // Batch to avoid rate limiting
    for (let i = 0; i < reviewPayload.length; i += AI_BATCH) {
      const batch = reviewPayload.slice(i, i + AI_BATCH);
      const reviewed = await aiReviewBatch(batch, { url: AI_URL, apiKey: AI_KEY, model: AI_MODEL });
      aiReviews.push(...reviewed);
    }

    // Map reviews onto results
    const byRid = new Map(aiReviews.map((r) => [r.id, r]));
    for (const r of results) {
      const ai = byRid.get(r.id);
      if (ai) {
        r.ai_review = {
          score: typeof ai.score === 'number' ? ai.score : null,
          flags: Array.isArray(ai.flags) ? ai.flags : [],
          suggestions: ai.suggestions || null,
          model: AI_MODEL,
          ts: new Date().toISOString(),
        };
      }
    }

    // Persist AI review file
    const aiOut = {
      total_reviewed: aiReviews.length,
      model: AI_MODEL,
      threshold: AI_THRESHOLD,
      results: results.filter((r) => r.ai_review),
    };
    fs.writeFileSync(OUT_AI_JSON, JSON.stringify(aiOut, null, 2));
    console.log(`🤖 AI review complete for ${aiReviews.length} items`);
    console.log(`📄 ${OUT_AI_JSON}`);
  }

  // Write JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify({ total: results.length, results }, null, 2));

  // Write CSV
  const header = [
    'id',
    'category',
    'difficulty',
    'option_uniqueness',
    'readability',
    'explanation_present',
    'correct_in_range',
    'aggregate',
  ];
  const rows = [header.join(',')].concat(results.map((r) => header.map((h) => r[h]).join(',')));
  fs.writeFileSync(OUT_CSV, rows.join('\n'));

  console.log(`✅ Quality evaluation complete for ${results.length} questions`);
  console.log(`📄 ${OUT_JSON}`);
  console.log(`📄 ${OUT_CSV}`);
}

if (require.main === module) {
  run();
}

module.exports = { run, evaluate, aiReviewBatch };

#!/usr/bin/env node
/*
 CLI Importer for DevMentor quiz-system question packs
 - Scans ../devmentor/quiz-system for question files
 - Normalizes questions to a common schema
 - Emits JSON at data/cli_import/{categories.json, questions.json}
 - Optionally prints a summary
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DEVMENTOR_ROOT = path.resolve(__dirname, '../..', 'devmentor', 'quiz-system');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'data', 'cli_import');

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function stableId(input) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 16);
}

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function loadModule(filePath) {
  try {
    const mod = require(filePath);
    // Try common export names
    return (
      mod?.default ||
      mod?.extendedQuestions ||
      mod?.coreQuestionsImproved ||
      mod?.aiConceptsQuestions ||
      mod
    );
  } catch (e) {
    console.warn(`⚠️ Failed to require ${filePath}: ${e.message}`);
    return null;
  }
}

function collectQuestionContainers(obj) {
  // Return list of {categoryKey, name, questions}
  const containers = [];
  function walk(node, keyPath = []) {
    if (!node || typeof node !== 'object') return;

    // Pattern: { name, questions: [...] }
    if (Array.isArray(node.questions) && (node.name || keyPath.length)) {
      const categoryKey = slugify(node.name || keyPath[keyPath.length - 1] || 'general');
      containers.push({
        categoryKey,
        name: node.name || keyPath[keyPath.length - 1] || 'General',
        questions: node.questions,
      });
      return; // avoid deep dive into a category node
    }
    // Pattern: top-level object with keys => { name, questions }
    for (const [k, v] of Object.entries(node)) {
      if (!v || typeof v !== 'object') continue;
      if (Array.isArray(v.questions)) {
        const categoryKey = slugify(v.name || k);
        containers.push({ categoryKey, name: v.name || k, questions: v.questions });
      } else {
        // Recurse
        walk(v, [...keyPath, k]);
      }
    }
  }
  walk(obj);
  return containers;
}

function normalizeQuestion(q, categorySlug, sourceLabel) {
  // Different packs use slightly different field names; normalize here
  const text = q.text || q.question || q.prompt || '';
  const options = Array.isArray(q.options) ? q.options.map(String) : [];
  const correctIdx =
    typeof q.correct === 'number'
      ? q.correct
      : typeof q.correct_answer === 'number'
        ? q.correct_answer
        : 0;
  const explanation = q.explanation || q.reason || '';
  const difficulty = (q.difficulty && String(q.difficulty).toLowerCase()) || 'medium';

  const idSeed = `${categorySlug}::${text}::${options.join('|')}`;
  const id = `cli_${stableId(idSeed)}`;

  return {
    id,
    category: categorySlug,
    text,
    options,
    correct_answer: correctIdx,
    explanation,
    difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
    tags: q.tags || [],
    source: sourceLabel,
  };
}

function importAll({ writeFiles = true } = {}) {
  if (!fileExists(DEVMENTOR_ROOT)) {
    throw new Error(`DevMentor question source not found at ${DEVMENTOR_ROOT}`);
  }

  const candidateFiles = [];
  // Known directories/files to scan
  const topLevel = fs.readdirSync(DEVMENTOR_ROOT);
  for (const f of topLevel) {
    if (f.endsWith('.js')) candidateFiles.push(path.join(DEVMENTOR_ROOT, f));
  }
  const questionsDir = path.join(DEVMENTOR_ROOT, 'questions');
  if (fileExists(questionsDir)) {
    for (const f of fs.readdirSync(questionsDir)) {
      if (f.endsWith('.js')) candidateFiles.push(path.join(questionsDir, f));
    }
  }

  const categories = new Map(); // slug -> { slug, name, description, icon, color }
  const questions = [];

  for (const abs of candidateFiles) {
    const mod = loadModule(abs);
    if (!mod) continue;
    const containers = collectQuestionContainers(mod);
    if (!containers.length) continue;
    const sourceLabel = path.basename(abs);

    for (const c of containers) {
      if (!categories.has(c.categoryKey)) {
        // Assign a simple icon/color based on hash
        const palette = [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#f97316',
          '#22c55e',
        ];
        const iconList = ['📚', '💻', '⚙️', '🧠', '🌐', '🔧', '🧪', '📈'];
        const hash = parseInt(stableId(c.categoryKey).slice(0, 4), 16);
        categories.set(c.categoryKey, {
          slug: c.categoryKey,
          name: c.name,
          description: `Imported from DevMentor pack (${sourceLabel})`,
          icon: iconList[hash % iconList.length],
          color: palette[hash % palette.length],
        });
      }
      for (const q of c.questions) {
        if (!q) continue;
        const nq = normalizeQuestion(q, c.categoryKey, sourceLabel);
        // Basic validation
        if (!nq.text || nq.options.length < 2) continue;
        if (nq.correct_answer < 0 || nq.correct_answer >= nq.options.length) continue;
        questions.push(nq);
      }
    }
  }

  const out = {
    categories: Array.from(categories.values()).sort((a, b) => a.slug.localeCompare(b.slug)),
    questions,
    stats: {
      total_categories: categories.size,
      total_questions: questions.length,
      by_category: Object.fromEntries(
        Array.from(categories.keys()).map((slug) => [
          slug,
          questions.filter((q) => q.category === slug).length,
        ]),
      ),
    },
  };

  if (writeFiles) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'categories.json'),
      JSON.stringify(out.categories, null, 2),
    );
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'questions.json'),
      JSON.stringify(out.questions, null, 2),
    );
    fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(out.stats, null, 2));
    console.log(
      `✅ Import complete: ${out.questions.length} questions across ${out.categories.length} categories`,
    );
    console.log(`📁 Output: ${OUTPUT_DIR}`);
  }

  return out;
}

if (require.main === module) {
  try {
    const result = importAll({ writeFiles: true });
    // print brief summary
    const top = Object.entries(result.stats.by_category)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    console.log('📊 Top categories:', top);
  } catch (e) {
    console.error('Import failed:', e.message);
    process.exit(1);
  }
}

module.exports = { importAll };

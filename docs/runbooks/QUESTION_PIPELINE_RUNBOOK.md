# QUESTION PIPELINE RUNBOOK

> Status: Complete  
> Last Updated: 2025-08-30  
> Owner: QuizMentor Team

## Overview

End-to-end pipeline to bring questions from the original CLI packs into QuizMentor, evaluate quality, seed the database, and serve via API.

## Steps

1. Import from CLI packs
   - Source: ../devmentor/quiz-system
   - Command: `node scripts/cli-import.js`
   - Outputs: data/cli_import/categories.json, questions.json, summary.json

2. Evaluate quality (with optional AI review)
   - Command: `node scripts/quality-evaluate.js`
   - Outputs: data/cli_import/quality_report.json, quality_report.csv
   - Heuristics: option uniqueness, readability, explanation, bounds
   - Optional AI Review (OpenAI-compatible):
     - Env vars:
       ```
       AI_REVIEW_ENABLED=true
       AI_REVIEW_URL=http://localhost:11434
       # or a hosted OpenAI-compatible base URL
       # AI_REVIEW_URL=https://api.openai.com
       # AI_REVIEW_API_KEY={{OPENAI_API_KEY}}
       AI_REVIEW_MODEL=gpt-4o-mini
       AI_REVIEW_THRESHOLD=0.6
       AI_REVIEW_MAX=100
       AI_REVIEW_BATCH=10
       ```
     - Output: data/cli_import/quality_ai_review.json
   - Command: `node scripts/quality-evaluate.js`
   - Outputs: data/cli_import/quality_report.json, quality_report.csv
   - Heuristics: option uniqueness, readability, explanation, bounds
   - Optional: LLM reviewer for low-scoring items (configure in script)

3. Seed Supabase
   - Generate seed: `node scripts/generate-sql-from-import.js`
   - Apply: run supabase/cli_import_seed.sql in Supabase SQL editor or via psql
   - Target tables: question_categories, questions (003_question_delivery.sql)

4. Switch API to DB mode (optional)
   - Set env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, API_USE_SUPABASE=true
   - Endpoint: `/api/quiz/questions?categoryId=<uuid|slug>&difficulty=<level>&limit=<n>&offset=<n>&random=true`

5. Curate for editors
   - Command: `node scripts/curate-quality.js`
   - Outputs: data/cli_import/curated.json, curated.csv
   - Use Storybook → Docs/Quality Curation Dashboard to review suggestions

6. Monitor & iterate
   - Use quality_report to flag categories for review
   - Re-run import/evaluation as packs change

## Examples

Minimum viable import question (normalized):

```json path=null start=null
{
  "id": "cli_abcdef0123456789",
  "category": "javascript",
  "text": "What does === do in JavaScript?",
  "options": ["Assignment", "Loose equality", "Strict equality", "Not equal"],
  "correct_answer": 2,
  "explanation": "=== checks value and type without coercion.",
  "difficulty": "easy"
}
```

## Troubleshooting

- Import found 0 questions
  - Check devmentor/quiz-system exists and contains \*.js packs
  - Ensure module exports are objects with { name, questions } or collections thereof
- Quality report empty
  - Ensure data/cli_import/questions.json exists; re-run importer
- DB results empty
  - Verify seed ran successfully and questions.is_active = true
  - categoryId filter may be a slug while DB has no metadata.slug — add it or use UUID

## Related Docs

- Storybook: Docs/Question Ingestion & AI Reasoning
- Storybook: Docs/AI Quality Pipeline
- Storybook: Docs/DB-Backed Questions (Supabase)
- Migrations: supabase/migrations/003_question_delivery.sql

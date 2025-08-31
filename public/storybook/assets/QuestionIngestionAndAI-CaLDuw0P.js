import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import"./index-DsK6wAlP.js";import{M as t}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./preview-D9Wp3BY3.js";import"./iframe-D4bCNOrd.js";import"./DocsRenderer-CFRXHY34-C4U-gtkH.js";import"./react-18-CQGH5bLm.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Docs/Question Ingestion & AI Reasoning"}),`
`,e.jsx(n.h1,{id:"question-ingestion--ai-reasoning",children:"Question Ingestion & AI Reasoning"}),`
`,e.jsx(n.p,{children:"This guide explains:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"How to import the original CLI question sets"}),`
`,e.jsx(n.li,{children:"How to seed the database and switch the API to Supabase"}),`
`,e.jsx(n.li,{children:"How the AI/quality pipeline evaluates questions and how to extend it"}),`
`]}),`
`,e.jsx(n.h2,{id:"import-cli-questions",children:"Import CLI Questions"}),`
`,e.jsx(n.p,{children:"Use the importer to scan DevMentor CLI packs and generate JSON in this app."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/cli-import.js
`})}),`
`,e.jsx(n.p,{children:"This writes:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"data/cli_import/categories.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/questions.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/summary.json"}),`
`]}),`
`,e.jsx(n.h2,{id:"evaluate-quality-heuristics-with-ai-hook",children:"Evaluate Quality (Heuristics with AI Hook)"}),`
`,e.jsx(n.p,{children:"Run heuristic quality scoring for all questions (readability, option uniqueness, explanation presence, bounds):"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/quality-evaluate.js
`})}),`
`,e.jsx(n.p,{children:"Outputs:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"data/cli_import/quality_report.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/quality_report.csv"}),`
`]}),`
`,e.jsx(n.p,{children:"To add LLM-based review, extend scripts/quality-evaluate.js to call your local/hosted model behind environment variables. Recommended flow: heuristics first → sample low-scoring items → LLM review."}),`
`,e.jsx(n.h2,{id:"curation-for-editors",children:"Curation for Editors"}),`
`,e.jsx(n.p,{children:"After evaluation (and optional AI review), merge results into a single curator-friendly file:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/curate-quality.js
`})}),`
`,e.jsx(n.p,{children:"Outputs:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"data/cli_import/curated.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/curated.csv"}),`
`]}),`
`,e.jsx(n.p,{children:"View interactively in Storybook → Docs/Quality Curation Dashboard."}),`
`,e.jsx(n.h2,{id:"seed-the-database-supabase",children:"Seed the Database (Supabase)"}),`
`,e.jsx(n.p,{children:"Generate a SQL seed from the imported JSON that targets the canonical schema defined in supabase/migrations/003_question_delivery.sql (question_categories, questions):"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/generate-sql-from-import.js
# Then run the generated SQL in your Supabase project (SQL Editor or psql)
`})}),`
`,e.jsx(n.p,{children:"Ensure these env vars are set on the API server for DB usage:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"SUPABASE_URL"}),`
`,e.jsx(n.li,{children:"SUPABASE_SERVICE_ROLE_KEY"}),`
`,e.jsx(n.li,{children:"API_USE_SUPABASE=true"}),`
`]}),`
`,e.jsx(n.h2,{id:"switch-api-to-supabase",children:"Switch API to Supabase"}),`
`,e.jsx(n.p,{children:"Set the following environment variables for the API service:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-env",children:`SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY={{service_role_key}}
API_USE_SUPABASE=true
`})}),`
`,e.jsx(n.p,{children:"Endpoint:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`curl "http://localhost:PORT/api/quiz/questions?categoryId=javascript&limit=10&random=true"
`})}),`
`,e.jsx(n.p,{children:"You can also filter by difficulty:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`curl "http://localhost:PORT/api/quiz/questions?categoryId=javascript&difficulty=medium&limit=5"
`})}),`
`,e.jsx(n.p,{children:"When API_USE_SUPABASE=true, the API endpoint uses Supabase instead of JSON:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"GET /api/quiz/questions?categoryId=...&difficulty=...&limit=...&offset=...&random=true"}),`
`,e.jsx(n.li,{children:"categoryId accepts a UUID (category_id) or a slug/name from question_categories.metadata.slug/name"}),`
`,e.jsx(n.li,{children:"difficulty filters by 'easy' | 'medium' | 'hard'"}),`
`,e.jsx(n.li,{children:"random performs an in-memory shuffle of a reasonable over-fetch window"}),`
`]}),`
`,e.jsx(n.p,{children:"When API_USE_SUPABASE=false (default), the endpoint serves from data/cli_import/questions.json if present, or returns stubs."}),`
`,e.jsx(n.h2,{id:"how-the-ai-reasons",children:'How the AI "reasons"'}),`
`,e.jsx(n.p,{children:"We use a two-stage approach:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Heuristic Scoring (fast, consistent)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Option Uniqueness: penalizes near-duplicates among options"}),`
`,e.jsx(n.li,{children:"Readability: basic proxy using text length + punctuation density"}),`
`,e.jsx(n.li,{children:"Explanation Presence: reward if explanation exists"}),`
`,e.jsx(n.li,{children:"Correctness Bounds: ensure correct index in range"}),`
`,e.jsx(n.li,{children:"Aggregate score (0–1) combines the above"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"LLM-assisted Review (optional, configurable)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["For items below a threshold (e.g., < 0.6), call a local/hosted LLM to:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Check factual accuracy"}),`
`,e.jsx(n.li,{children:"Flag ambiguous phrasing"}),`
`,e.jsx(n.li,{children:"Suggest better distractors"}),`
`,e.jsx(n.li,{children:"Propose refined explanations"}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:"Store review metadata for curation dashboards or gating (e.g., only publish items with aggregate ≥ 0.7 or AI-reviewed OK)"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:"This mirrors the harvesting pipeline where we filter by confidence and optionally enhance with RAG/LLM (see Python scripts in harvest_output/ and rag_enhancer.py)."}),`
`,e.jsx(n.h2,{id:"recommended-thresholds",children:"Recommended thresholds"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"aggregate ≥ 0.8: Excellent"}),`
`,e.jsx(n.li,{children:"0.6–0.79: Good (candidate for LLM spot-checks)"}),`
`,e.jsx(n.li,{children:"0.4–0.59: Needs review"}),`
`,e.jsx(n.li,{children:"< 0.4: Likely reject"}),`
`]}),`
`,e.jsx(n.h2,{id:"see-also",children:"See also"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Docs/AI Quality Pipeline (with examples)"}),`
`,e.jsx(n.li,{children:"Docs/DB-Backed Questions (Supabase)"}),`
`,e.jsx(n.li,{children:"Quality Curation Dashboard (interactive)"}),`
`]})]})}function f(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{f as default};

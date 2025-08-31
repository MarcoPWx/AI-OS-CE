import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as l}from"./index-Di0Mt_3y.js";import"./index-B7dshnwf.js";import{M as r}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./preview-Dqse4s9m.js";import"./iframe-D0C5GYr5.js";import"./DocsRenderer-CFRXHY34-ffwpAilP.js";import"./react-18-CQGH5bLm.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...l(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Docs/Beta Checklist"}),`
`,e.jsx(n.h1,{id:"beta-readiness-checklist",children:"Beta Readiness Checklist"}),`
`,e.jsx(n.p,{children:"This page summarizes the steps needed to ship the ingestion → quality → curation → DB delivery flow for beta."}),`
`,e.jsx(n.p,{children:"See also: docs/BETA_READINESS_CHECKLIST.md for the full list."}),`
`,e.jsx(n.h2,{id:"data-ingestion--quality",children:"Data ingestion & quality"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Import CLI packs"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/cli-import.js
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Heuristic quality pass"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/quality-evaluate.js
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Optional AI review (OpenAI-compatible)"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-env",children:`AI_REVIEW_ENABLED=true
AI_REVIEW_URL=http://localhost:11434
# Or hosted
# AI_REVIEW_URL=https://api.openai.com
# AI_REVIEW_API_KEY={{OPENAI_API_KEY}}
AI_REVIEW_MODEL=gpt-4o-mini
AI_REVIEW_THRESHOLD=0.6
AI_REVIEW_MAX=100
AI_REVIEW_BATCH=10
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Curate for editors"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/curate-quality.js
`})}),`
`,e.jsx(n.p,{children:"Outputs: data/cli_import/curated.json, curated.csv"}),`
`,e.jsx(n.h2,{id:"database--api",children:"Database & API"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Generate seed and apply in Supabase (003_question_delivery)"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/generate-sql-from-import.js
# Apply supabase/cli_import_seed.sql in Supabase
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Switch API to DB mode"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-env",children:`SUPABASE_URL=... # your URL
SUPABASE_SERVICE_ROLE_KEY={{service_role_key}}
API_USE_SUPABASE=true
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Smoke test"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`curl "http://localhost:PORT/api/quiz/questions?limit=5&random=true"
`})}),`
`,e.jsx(n.h2,{id:"storybook--dashboards",children:"Storybook & dashboards"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Docs/Question Ingestion & AI Reasoning"}),`
`,e.jsx(n.li,{children:"[ ] Docs/AI Quality Pipeline (with examples)"}),`
`,e.jsx(n.li,{children:"[ ] Docs/DB-Backed Questions (Supabase)"}),`
`,e.jsx(n.li,{children:"[ ] Quality Curation Dashboard (interactive)"}),`
`]}),`
`,e.jsx(n.h2,{id:"cicd-quick-scan-github-actions",children:"CI/CD quick scan (GitHub Actions)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Lint + TypeScript checks"}),`
`,e.jsx(n.li,{children:"[ ] Unit/Integration/E2E tests"}),`
`,e.jsx(n.li,{children:"[ ] Storybook build + interaction tests"}),`
`,e.jsx(n.li,{children:"[ ] Visual regression (Chromatic)"}),`
`,e.jsx(n.li,{children:"[ ] Security checks"}),`
`,e.jsx(n.li,{children:"[ ] (Optional) Load test within thresholds"}),`
`]}),`
`,e.jsx(n.h2,{id:"mobile-smoke",children:"Mobile smoke"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Expo dev build: run a quiz flow"}),`
`,e.jsx(n.li,{children:"[ ] Offline spot checks"}),`
`]}),`
`,e.jsx(n.h2,{id:"gono-go",children:"Go/No-Go"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"[ ] Staging seeded & API_USE_SUPABASE=true"}),`
`,e.jsx(n.li,{children:"[ ] Docs current"}),`
`,e.jsx(n.li,{children:"[ ] Known issues accepted for beta"}),`
`]})]})}function _(i={}){const{wrapper:n}={...l(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{_ as default};

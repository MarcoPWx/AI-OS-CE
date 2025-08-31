import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import"./index-B7dshnwf.js";import{M as t}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./preview-Dqse4s9m.js";import"./iframe-D0C5GYr5.js";import"./DocsRenderer-CFRXHY34-ffwpAilP.js";import"./react-18-CQGH5bLm.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Docs/DB-Backed Questions (Supabase)"}),`
`,e.jsx(n.h1,{id:"db-backed-questions-supabase",children:"DB-Backed Questions (Supabase)"}),`
`,e.jsx(n.p,{children:"This page explains how the API serves questions from Supabase when enabled."}),`
`,e.jsx(n.h2,{id:"enable-db-mode",children:"Enable DB Mode"}),`
`,e.jsx(n.p,{children:"Set environment variables for the API process:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-env",children:`SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY={{service_role_key}}
API_USE_SUPABASE=true
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"categoryId can be a UUID or a slug/name found in question_categories.metadata.slug or name."}),`
`,e.jsx(n.li,{children:"difficulty must be one of: easy | medium | hard."}),`
`,e.jsx(n.li,{children:"random=true: over-fetches and shuffles in memory for variety."}),`
`]}),`
`,e.jsx(n.h2,{id:"example-requests",children:"Example Requests"}),`
`,e.jsx(n.p,{children:"Fetch 10 random questions from a category by slug:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`curl "http://localhost:PORT/api/quiz/questions?categoryId=javascript&limit=10&random=true"
`})}),`
`,e.jsx(n.p,{children:"Fetch 5 medium questions by category UUID:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`curl "http://localhost:PORT/api/quiz/questions?categoryId=00000000-0000-0000-0000-000000000000&difficulty=medium&limit=5"
`})}),`
`,e.jsx(n.h2,{id:"data-model-003_question_deliverysql",children:"Data Model (003_question_delivery.sql)"}),`
`,e.jsx(n.p,{children:"Tables used:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"question_categories: id, name, icon, color, description, metadata"}),`
`,e.jsx(n.li,{children:"questions: id, category_id, text, options (jsonb), correct_answer, difficulty, explanation, is_active"}),`
`]}),`
`,e.jsx(n.p,{children:"Recommended metadata fields:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"metadata.slug: short identifier used in categoryId filter (non-UUID)"}),`
`]}),`
`,e.jsx(n.h2,{id:"seeding-from-import-json",children:"Seeding from Import JSON"}),`
`,e.jsx(n.p,{children:"If you imported CLI questions:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/generate-sql-from-import.js
# Apply supabase/cli_import_seed.sql in Supabase
`})}),`
`,e.jsx(n.h2,{id:"troubleshooting",children:"Troubleshooting"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"401/403: Ensure SUPABASE_SERVICE_ROLE_KEY is valid in server environment."}),`
`,e.jsx(n.li,{children:"Empty results: Confirm categories exist and that questions.is_active = true."}),`
`,e.jsx(n.li,{children:"Performance: Add indexes (already included in migrations) and prefer UUID categoryId for direct matches."}),`
`]})]})}function g(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{g as default};

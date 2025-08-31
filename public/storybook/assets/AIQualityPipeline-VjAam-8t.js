import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import"./index-DsK6wAlP.js";import{M as t}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./preview-D9Wp3BY3.js";import"./iframe-D4bCNOrd.js";import"./DocsRenderer-CFRXHY34-C4U-gtkH.js";import"./react-18-CQGH5bLm.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(t,{title:"Docs/AI Quality Pipeline"}),`
`,e.jsx(n.h1,{id:"ai-quality-evaluation-pipeline",children:"AI Quality Evaluation Pipeline"}),`
`,e.jsx(n.p,{children:"This document explains how question quality is evaluated and curated for QuizMentor."}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsx(n.p,{children:"The pipeline runs over all imported questions and computes a quality score per item, combining:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Option uniqueness (avoid near-duplicate choices)"}),`
`,e.jsx(n.li,{children:"Readability of the question text"}),`
`,e.jsx(n.li,{children:"Presence of an explanation"}),`
`,e.jsx(n.li,{children:"Correct-answer bounds validation"}),`
`]}),`
`,e.jsx(n.p,{children:"An aggregate score (0-1) summarizes the above."}),`
`,e.jsx(n.h2,{id:"running-the-pipeline",children:"Running the pipeline"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Import the DevMentor CLI questions"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/cli-import.js
`})}),`
`,e.jsx(n.p,{children:"This generates:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"data/cli_import/categories.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/questions.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/summary.json"}),`
`]}),`
`,e.jsxs(n.ol,{start:"2",children:[`
`,e.jsx(n.li,{children:"Evaluate quality"}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/quality-evaluate.js
`})}),`
`,e.jsx(n.p,{children:"Outputs:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"data/cli_import/quality_report.json"}),`
`,e.jsx(n.li,{children:"data/cli_import/quality_report.csv"}),`
`]}),`
`,e.jsx(n.h2,{id:"interpreting-results",children:"Interpreting results"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"aggregate >= 0.8: Excellent"}),`
`,e.jsx(n.li,{children:"0.6 - 0.79: Good"}),`
`,e.jsx(n.li,{children:"0.4 - 0.59: Needs review"}),`
`,e.jsx(n.li,{children:"< 0.4: Likely problematic"}),`
`]}),`
`,e.jsx(n.h2,{id:"examples-beforeafter",children:"Examples (Before/After)"}),`
`,e.jsx(n.p,{children:"Below is a hypothetical example showing how an AI reviewer might refine a question."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "id": "cli_1234abcd5678ef90",
  "category": "networking-protocols",
  "text": "Which protocol is used to send emails?",
  "options": ["IMAP", "POP3", "SMTP", "HTTP"],
  "correct_answer": 2,
  "explanation": "SMTP is used to send email.",
  "difficulty": "easy"
}
`})}),`
`,e.jsx(n.p,{children:"AI reviewer suggestions:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Clarify that IMAP/POP3 are retrieval protocols; SMTP handles sending."}),`
`,e.jsx(n.li,{children:"Improve distractors so there’s less domain overlap confusion."}),`
`]}),`
`,e.jsx(n.p,{children:"After revision (example):"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "text": "Which protocol is primarily responsible for sending emails between servers?",
  "options": ["IMAP (retrieval)", "POP3 (retrieval)", "SMTP (sending)", "DNS (name resolution)"],
  "correct_answer": 2,
  "explanation": "SMTP (Simple Mail Transfer Protocol) handles sending; IMAP/POP3 handle retrieval; DNS resolves hostnames.",
  "difficulty": "easy"
}
`})}),`
`,e.jsx(n.h2,{id:"optional-llm-assisted-review",children:"Optional LLM-assisted review"}),`
`,e.jsx(n.p,{children:"Enable an OpenAI-compatible endpoint (Ollama or hosted) via environment variables and the script will auto-review low-scoring questions and write quality_ai_review.json."}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-env",children:`AI_REVIEW_ENABLED=true
# For Ollama (OpenAI-compatible), defaults to localhost:11434 if not set
AI_REVIEW_URL=http://localhost:11434
# For hosted, e.g., OpenAI-compatible gateway
# AI_REVIEW_URL=https://api.openai.com
# AI_REVIEW_API_KEY={{OPENAI_API_KEY}}
AI_REVIEW_MODEL=gpt-4o-mini
AI_REVIEW_THRESHOLD=0.6     # review items below this aggregate score
AI_REVIEW_MAX=100           # max items to review
AI_REVIEW_BATCH=10          # batch size per request
`})}),`
`,e.jsx(n.p,{children:"Run:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`node scripts/quality-evaluate.js
`})}),`
`,e.jsx(n.p,{children:"Outputs:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"data/cli_import/quality_ai_review.json (AI-reviewed subset with flags, suggestions, and scores)"}),`
`]}),`
`,e.jsx(n.p,{children:"For production, run heuristics first, then sample questions below a threshold for human/AI review."}),`
`,e.jsx(n.h2,{id:"feeding-scores-back-into-the-app",children:"Feeding scores back into the app"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:'Scores can be joined to questions by id. You can store them in a dedicated table (e.g., question_analytics or a new question_quality table) and surface badges or filters in UI (e.g., "Show only 0.7+ quality").'}),`
`]}),`
`,e.jsx(n.h2,{id:"as-part-of-scrapingharvest",children:"As part of scraping/harvest"}),`
`,e.jsx(n.p,{children:"During harvest, a similar scoring pass can filter low-confidence items before they reach the app. See harvest_output/* and Python scripts like rag_enhancer.py and compare_quality.py for inspiration."})]})}function v(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{v as default};

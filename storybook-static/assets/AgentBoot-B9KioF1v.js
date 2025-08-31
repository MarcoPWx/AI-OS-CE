import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as t}from"./index-Di0Mt_3y.js";import{M as r}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function i(s){const n={h1:"h1",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...t(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(r,{title:"Docs/Agent Boot"}),`
`,e.jsx(n.h1,{id:"agent-boot",children:"Agent Boot"}),`
`,e.jsx(n.h1,{id:"agent-boot-contract",children:"Agent Boot Contract"}),`
`,e.jsx(n.p,{children:"Purpose"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"This document makes the project “agent-ready.” It defines the minimum I need to operate instantly, the guardrails I must follow, and how we collaborate via TDD and clean code practices."}),`
`]}),`
`,e.jsx(n.p,{children:"Constraints & Allowed Tools"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Terminal only; no external web browsing."}),`
`,e.jsx(n.li,{children:"Non-interactive commands; avoid pagers; prefer --no-pager or non-paged output."}),`
`,e.jsx(n.li,{children:"No secrets printed. Use env var names only (e.g., OPENAI_API_KEY) and never echo values."}),`
`,e.jsx(n.li,{children:"Destructive actions (delete/migrate/overwrite) require explicit consent."}),`
`]}),`
`,e.jsx(n.p,{children:"Canonical Docs (single source of truth)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"DevLog: docs/status/DEVLOG.md"}),`
`,e.jsx(n.li,{children:"Epics: docs/roadmap/EPICS.md"}),`
`,e.jsx(n.li,{children:"System Status: docs/SYSTEM_STATUS.md"}),`
`]}),`
`,e.jsx(n.p,{children:"Core Commands"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Dev server: npm run dev or npm run dev:mock"}),`
`,e.jsx(n.li,{children:"Storybook: npm run storybook"}),`
`,e.jsx(n.li,{children:"Build: npm run build"}),`
`,e.jsx(n.li,{children:"Unit tests: npm test"}),`
`,e.jsx(n.li,{children:"E2E tests: npm run test:e2e (smokes: npm run test:smoke:e2e)"}),`
`,e.jsx(n.li,{children:"Lint: npm run lint (fix: npm run lint:fix)"}),`
`,e.jsx(n.li,{children:"Format: npm run format"}),`
`]}),`
`,e.jsx(n.p,{children:"Agent Operations (how to ask)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Analyze: “Agent, read the Agent Boot page and canonical docs; propose top 5 priorities with TDD steps.”"}),`
`,e.jsx(n.li,{children:"Update docs: “Agent, update DevLog/System Status/Epics from this session.”"}),`
`,e.jsx(n.li,{children:"TDD feature: “Agent, implement <feature> via TDD: write failing tests, make it pass, refactor, update docs.”"}),`
`,e.jsx(n.li,{children:"Refactor: “Agent, refactor <area> without changing external behavior; update tests/docs.”"}),`
`]}),`
`,e.jsx(n.p,{children:"TDD Policy"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Red-Green-Refactor:",`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Write or adjust a failing test (Given/When/Then); commit."}),`
`,e.jsx(n.li,{children:"Implement the minimal change to pass; commit."}),`
`,e.jsx(n.li,{children:"Refactor for clarity/performance; keep green; commit."}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:"Coverage criteria: 80% min for lines, branches, functions, statements. Fails under thresholds."}),`
`,e.jsx(n.li,{children:"Flaky tests: mark @flaky, file a TODO with issue/ref, fix or quarantine with justification."}),`
`]}),`
`,e.jsx(n.p,{children:"Clean Code Guidelines"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Keep functions short and single-purpose. Extract helpers for clarity."}),`
`,e.jsx(n.li,{children:"Favor pure functions; isolate side-effects (I/O, network, time, randomness) behind interfaces."}),`
`,e.jsx(n.li,{children:"Explicit errors: differentiate user vs system errors; never swallow exceptions silently."}),`
`,e.jsx(n.li,{children:"Naming: intent-revealing names; consistent casing; no abbreviations that hide meaning."}),`
`,e.jsx(n.li,{children:"Comments: explain why, not what; keep code self-explanatory."}),`
`,e.jsx(n.li,{children:"Logging: structured key-value logs; no secrets; include correlation IDs if available."}),`
`,e.jsx(n.li,{children:"Config: env-driven; sane defaults; validate at startup."}),`
`]}),`
`,e.jsx(n.p,{children:"Testing Guidelines"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Unit: deterministic, stable selectors/IDs; no real network; mock time/random."}),`
`,e.jsx(n.li,{children:"Integration: limited scope; MSW for HTTP; assert contracts (shape/status)."}),`
`,e.jsx(n.li,{children:"E2E: smokes for critical flows; avoid brittle selectors; control timing with explicit waits."}),`
`,e.jsx(n.li,{children:"Accessibility: run axe checks on key pages/components where feasible."}),`
`]}),`
`,e.jsx(n.p,{children:"Storybook Authoring Rules"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"MDX v3 constraints: imports/exports only at top; put state inside React.use*."}),`
`,e.jsx(n.li,{children:"Canonicalization: DevLog/Epics/System Status stories load only the canonical doc paths."}),`
`,e.jsx(n.li,{children:"Include a “Last Updated” badge (manifest-based if available) on key doc pages."}),`
`,e.jsx(n.li,{children:"Link each story to related epics/tests (where useful)."}),`
`]}),`
`,e.jsx(n.p,{children:"Security & Compliance"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"BYOK: keys reside in memory only; never persisted."}),`
`,e.jsx(n.li,{children:"Content-Security-Policy: keep connect-src restricted to allowed domains."}),`
`,e.jsx(n.li,{children:"Data handling: no PII in logs; redact sensitive content in errors."}),`
`]}),`
`,e.jsx(n.p,{children:"Risk Gates (ask before proceeding)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Deleting files, DB migrations, rewriting large swaths of tests, or changing public API shapes."}),`
`,e.jsx(n.li,{children:"Running commands that could disrupt local state (docker prune, rm -rf, etc.)."}),`
`]}),`
`,e.jsx(n.p,{children:"Change Request Mini-DSL (optional)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Scope: feature | fix | refactor | docs"}),`
`,e.jsx(n.li,{children:"Context: <short business/tech context>"}),`
`,e.jsx(n.li,{children:"Acceptance: <Given/When/Then>"}),`
`,e.jsx(n.li,{children:"Constraints: <perf, a11y, API, deps>"}),`
`,e.jsx(n.li,{children:"Touch: <paths/areas>"}),`
`,e.jsx(n.li,{children:"Risk: low | medium | high"}),`
`]}),`
`,e.jsx(n.p,{children:"Code Review Checklist (self-check)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Does a failing test precede the change? Are tests minimal but meaningful?"}),`
`,e.jsx(n.li,{children:"Are names clear? Any dead code or duplicate logic left?"}),`
`,e.jsx(n.li,{children:"Are errors surfaced with actionable messages? No secret leakage?"}),`
`,e.jsx(n.li,{children:"Is the change small and scoped? Could it be split further?"}),`
`,e.jsx(n.li,{children:"Are docs updated (DevLog/System Status/Epics)?"}),`
`]}),`
`,e.jsx(n.p,{children:"Boot Prompts (copy/paste)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Analyze: “Agent: Read Agent Boot and canonical docs; propose a 5-item TDD plan.”"}),`
`,e.jsx(n.li,{children:"Update docs: “Agent: Update DevLog/System Status/Epics from this session.”"}),`
`,e.jsx(n.li,{children:"Implement: “Agent: Implement <feature> via TDD. Start with tests; minimal code; then docs.”"}),`
`]}),`
`,e.jsx(n.p,{children:"Directory Orientation (example)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"App pages/API: src/app/**/*"}),`
`,e.jsx(n.li,{children:"Components: src/components/**/*"}),`
`,e.jsx(n.li,{children:"Docs: docs/**/* (canonical docs above)"}),`
`,e.jsx(n.li,{children:"Stories: src/stories/**/*"}),`
`,e.jsxs(n.li,{children:["Tests: src/components/",e.jsxs(n.strong,{children:["/",e.jsx(n.strong,{children:"tests"})," and tests/e2e/"]}),"/*"]}),`
`]}),`
`,e.jsx(n.p,{children:"Acceptance Criteria for This Contract"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"One canonical doc each for DevLog, Epics, System Status."}),`
`,e.jsx(n.li,{children:"Storybook boot page present and linked from top-level nav."}),`
`,e.jsx(n.li,{children:"Agent operates via TDD, updates docs on request, and respects guardrails."}),`
`]})]})}function m(s={}){const{wrapper:n}={...t(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{m as default};

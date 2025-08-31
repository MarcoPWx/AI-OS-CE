import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as l}from"./index-Di0Mt_3y.js";import{M as c,S as i}from"./index-Bpi5BZRR.js";import{L as d}from"./LastUpdated-4hnobFg0.js";import{B as t}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(n){const s={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...l(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"service-catalog",children:"Service Catalog"}),`
`,`
`,e.jsx(c,{title:"Specs/Service Catalog"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(s.p,{children:"Authoritative reference for services present in this repo and how to exercise them. All endpoints and shapes listed here map to real code unless marked concept."}),`
`,e.jsx(s.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"HTTP Mocks (MSW)"}),`
`,e.jsx(s.li,{children:"Supabase-style REST Mocks"}),`
`,e.jsx(s.li,{children:"Express API (stubs/enhanced)"}),`
`,e.jsx(s.li,{children:"WebSocket Mock"}),`
`,e.jsx(s.li,{children:"Status JSON"}),`
`,e.jsx(s.li,{children:"Service-to-Service Flows"}),`
`]}),`
`,e.jsx(s.h2,{id:"http-mocks-msw",children:"HTTP Mocks (MSW)"}),`
`,e.jsx("a",{id:"msw"}),`
`,e.jsx(s.p,{children:"Global defaults"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["GET /",e.jsx(s.strong,{children:"msw"}),"/defaults → ",e.jsx(s.code,{children:"{ latencyMs: number, errorRate: number }"})]}),`
`,e.jsxs(s.li,{children:["POST /",e.jsx(s.strong,{children:"msw"}),"/defaults ",e.jsx(s.code,{children:"{ latencyMs?: number, errorRate?: number }"})," → same"]}),`
`,e.jsx(s.li,{children:"Skip defaults per-request: header x-msw-no-defaults: 1"}),`
`]}),`
`,e.jsx(s.p,{children:"Lessons"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"GET /api/lessons"}),`
`,e.jsx(s.li,{children:"Out 200:"}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{
  "lessons": [ { "id": "js-basics", "title": "JavaScript Basics", "progress": 0.2 }, ... ]
}
`})}),`
`,e.jsx(s.p,{children:"Quizzes"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"GET /api/quizzes"}),`
`,e.jsx(s.li,{children:"Out 200:"}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "quizzes": [ { "id": "q1", "category": "javascript", "difficulty": "easy" }, ... ] }
`})}),`
`,e.jsx(s.p,{children:"Login"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["POST /api/login ",e.jsx(s.code,{children:"{ email }"})]}),`
`,e.jsx(s.li,{children:"Out 200:"}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "token": "mock-token-123", "user": { "id": "demo", "email": "demo@quizmentor.app" } }
`})}),`
`,e.jsx(s.p,{children:"Cache demo (ETag)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"GET /api/cache (optionally with If-None-Match)"}),`
`,e.jsx(s.li,{children:'Out 200 with headers ETag: "demo-etag-abc123", Cache-Control: public, max-age=60:'}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "ts": "2024-01-01T00:00:00Z", "value": 42 }
`})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Out 304 Not Modified with same ETag"}),`
`]}),`
`,e.jsx(s.p,{children:"Rate limiting demo"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"GET /api/ratelimit"}),`
`,e.jsx(s.li,{children:"Window: 10s; Limit: 3 per x-client-id (default anon)"}),`
`,e.jsx(s.li,{children:"Out 200:"}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "ok": true, "remaining": 2 }
`})}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Out 429 with headers Retry-After, X-RateLimit-*:"}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "error": "rate_limited" }
`})}),`
`,e.jsx(s.p,{children:"Tooltip generation (Storybook-only)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["POST /api/tooltips/generate ",e.jsx(s.code,{children:"{ input: string }"})]}),`
`,e.jsxs(s.li,{children:["Triggers inside input:",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"TRIGGER_RATE_LIMIT → 429 + Retry-After: 3"}),`
`,e.jsx(s.li,{children:"TRIGGER_ERROR → 500 text/plain"}),`
`,e.jsx(s.li,{children:'TRIGGER_CACHED → 200 with ETag "tooltips-etag-v1", next call with If-None-Match → 304'}),`
`]}),`
`]}),`
`,e.jsx(s.li,{children:"Default 200:"}),`
`]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "input": "text", "html": "<p>Tooltip for: <em>text</em></p>" }
`})}),`
`,e.jsx(s.h2,{id:"supabase-style-rest-mocks",children:"Supabase-style REST Mocks"}),`
`,e.jsx("a",{id:"supabase-rest"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["POST /auth/v1/token (password) → 200 ",e.jsx(s.code,{children:"{ access_token, refresh_token, user }"})]}),`
`,e.jsxs(s.li,{children:["POST /auth/v1/signup → 200 ",e.jsx(s.code,{children:"{ user }"})]}),`
`,e.jsxs(s.li,{children:["GET /auth/v1/user → 200 ",e.jsx(s.code,{children:"{ user }"})]}),`
`,e.jsxs(s.li,{children:["POST /auth/v1/logout → 200 ",e.jsx(s.code,{children:"{}"})]}),`
`,e.jsx(s.li,{children:"GET /rest/v1/question_categories → array rows with nested questions count"}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"GET /rest/v1/questions?category_id=eq.<id>"})," → array of question rows"]}),`
`,e.jsxs(s.li,{children:["GET /rest/v1/remote_config → ",e.jsx(s.code,{children:"{ questions_version }"})]}),`
`,e.jsx(s.li,{children:"GET/POST /rest/v1/profiles → profile row CRUD"}),`
`]}),`
`,e.jsx(s.h2,{id:"express-api-stubsenhanced",children:"Express API (stubs/enhanced)"}),`
`,e.jsx("a",{id:"express-api"}),`
`,e.jsx(s.p,{children:"Quiz"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["POST /api/quiz/session → 200 ",e.jsx(s.code,{children:"{ sessionId, categoryId, difficulty, createdAt }"})]}),`
`,e.jsxs(s.li,{children:["GET /api/quiz/questions → 200 ",e.jsx(s.code,{children:"{ questions: [...] }"})]}),`
`,e.jsxs(s.li,{children:["POST /api/quiz/answer → 200 ",e.jsx(s.code,{children:"{ correct, xp, streak, bonuses }"})]}),`
`,e.jsxs(s.li,{children:["GET /api/quiz/leaderboard → 200 ",e.jsx(s.code,{children:"{ leaders }"})]}),`
`]}),`
`,e.jsx(s.p,{children:"Users"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["GET /api/users/me → 200 ",e.jsx(s.code,{children:"{ userId, name, level, xp, streak, premium }"})]}),`
`,e.jsxs(s.li,{children:["POST /api/users/export → 200 ",e.jsx(s.code,{children:"{ status: 'queued', jobId }"})]}),`
`,e.jsxs(s.li,{children:["DELETE /api/users/me → 200 ",e.jsx(s.code,{children:"{ deleted: true, at }"})]}),`
`]}),`
`,e.jsx(s.p,{children:"Analytics"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["POST /api/analytics/event → 200 ",e.jsx(s.code,{children:"{ received, event, userId, ts }"})]}),`
`]}),`
`,e.jsx(s.h2,{id:"websocket-mock",children:"WebSocket Mock"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"websocket"}),`- Events include connect/disconnect, lobby:created|joined|updated,
game:starting|started|ended, question:start|end, scores:updated, message:*, task:update. - Source:
src/services/mockWebSocket.ts - Abstraction (mock vs real): src/lib/socket.ts`]}),`
`,e.jsx(s.h2,{id:"status-json",children:"Status JSON"}),`
`,e.jsx("a",{id:"status-json"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"docs/status/SYSTEM_STATUS_STATE.json"}),`
`,e.jsxs(s.li,{children:["Shape: ",e.jsx(s.code,{children:"{ status: 'green'|'degraded'|'outage'|'unknown', lastValidated: ISO8601 }"})]}),`
`]}),`
`,e.jsx(s.h2,{id:"service-to-service-flows",children:"Service-to-Service Flows"}),`
`,e.jsx("a",{id:"flows"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"See also: Specs/Service-to-Service Orchestration for a focused playground."}),`
`]}),`
`,e.jsx(s.p,{children:"Storybook Dev (UI ⇄ MSW)"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-mermaid",children:`sequenceDiagram
  participant UI as Storybook UI
  participant MSW as MSW Handlers
  UI->>MSW: GET /api/lessons
  MSW-->>UI: 200 { lessons }
  UI->>MSW: GET /api/cache (If-None-Match)
  MSW-->>UI: 304 Not Modified
  UI->>MSW: GET /api/ratelimit x4
  MSW-->>UI: 429 after 3rd with Retry-After
`})}),`
`,e.jsx(s.p,{children:"Conceptual Production (UI → API → Supabase)"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-mermaid",children:`sequenceDiagram
  participant UI as App/Web
  participant API as Express API
  participant DB as Supabase
  UI->>API: POST /api/quiz/session
  API->>DB: insert quiz_sessions
  DB-->>API: 201 session
  API-->>UI: 201 session
  UI->>API: GET /api/quiz/questions?sessionId
  API->>DB: select quiz_questions by category/difficulty
  DB-->>API: rows
  API-->>UI: 200 sanitized questions
`})}),`
`,e.jsx(s.h2,{id:"quick-links",children:"Quick Links"}),`
`,e.jsx(t,{}),`
`,e.jsx(d,{note:"Service Catalog"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["API Playground: ",e.jsx(i,{id:"api-playground--default"})]}),`
`,e.jsxs(s.li,{children:["Network Playground: ",e.jsx(i,{id:"dev-networkplayground--default"})]}),`
`,e.jsxs(s.li,{children:["Swagger: ",e.jsx(i,{id:"api-swagger--default"})]}),`
`]})]})}function g(n={}){const{wrapper:s}={...l(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(r,{...n})}):r(n)}export{g as default};

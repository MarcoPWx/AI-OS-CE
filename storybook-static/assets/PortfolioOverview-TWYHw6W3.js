import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import{M as l}from"./index-Bpi5BZRR.js";import{L as t}from"./LastUpdated-4hnobFg0.js";import{B as a}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function i(s){const n={code:"code",em:"em",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"quizmentor-portfolio-overview",children:"QuizMentor: Portfolio Overview"}),`
`,`
`,e.jsx(l,{title:"Docs/Portfolio Overview"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(n.p,{children:"Welcome to the comprehensive, interview-ready overview of QuizMentor. This page is structured as a learning session you can read end‑to‑end, with live demos available elsewhere in Storybook."}),`
`,e.jsx(n.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Vision & Product Pillars"}),`
`,e.jsx(n.li,{children:"Feature Catalog"}),`
`,e.jsx(n.li,{children:"Service Inventory & I/O"}),`
`,e.jsx(n.li,{children:"Journeys"}),`
`,e.jsx(n.li,{children:"Security & Privacy Model"}),`
`]}),`
`,e.jsx(n.h2,{id:"vision-and-product-pillars",children:"Vision and Product Pillars"}),`
`,e.jsx("a",{id:"vision"}),`
`,e.jsx(n.p,{children:"Vision"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Make technical upskilling effortless, trustworthy, and engaging through a gamified, resilient learning experience."}),`
`]}),`
`,e.jsx(n.p,{children:"Product pillars"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Trust‑first UX: clear states, recoverable errors, transparent status, consistent visuals."}),`
`,e.jsx(n.li,{children:"Learn‑by‑doing: interactive quizzes, instant feedback, lightweight multiplayer collaboration."}),`
`,e.jsx(n.li,{children:"Quality gates by default: interaction tests, a11y checks, visual regression, coverage thresholds."}),`
`,e.jsx(n.li,{children:"Open‑box DX: Storybook as a learning hub (API Playground, Swagger, Network demos, Docs browser)."}),`
`,e.jsx(n.li,{children:"Resilience & Observability: cache/ETag, rate‑limit handling, status signals, observability events."}),`
`]}),`
`,e.jsx(n.h2,{id:"product-framing-goals-success-nongoals-assumptions",children:"Product Framing: Goals, Success, Non‑Goals, Assumptions"}),`
`,e.jsx(n.p,{children:"Goals"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Ship a resilient, fun learning experience that teaches quickly and builds trust"}),`
`,e.jsx(n.li,{children:"Maximize Weekly Learning Progress (WLp): sessions completed, streak adherence, accuracy gains"}),`
`,e.jsx(n.li,{children:"Provide a developer‑first platform for rapid iteration and safe changes"}),`
`]}),`
`,e.jsx(n.p,{children:"Success metrics"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Activation rate (onboarding → first quiz within N minutes) > 70%"}),`
`,e.jsx(n.li,{children:"Quiz completion rate > 85%; median sessions/week > 3"}),`
`,e.jsx(n.li,{children:"Docs learning engagement (Start Here and API Playground usage) trending upward week over week"}),`
`]}),`
`,e.jsx(n.p,{children:"Non‑goals (for now)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Full content authoring CMS inside the app (use curated content/fixtures)"}),`
`,e.jsx(n.li,{children:"Complex paywall + billing flows (keep demo/simple for interviews)"}),`
`,e.jsx(n.li,{children:"Deep offline persistence beyond light caching"}),`
`]}),`
`,e.jsx(n.p,{children:"Assumptions"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Supabase is the target backend for Auth/Postgres/Realtime"}),`
`,e.jsx(n.li,{children:"Storybook is our primary learning and demo surface"}),`
`,e.jsx(n.li,{children:"MSW/WS scenarios sufficiently model expected networking behaviors during early phases"}),`
`]}),`
`,e.jsx(n.h2,{id:"personas-and-system-context",children:"Personas and System Context"}),`
`,e.jsx(n.p,{children:"Personas"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Learner (primary): wants quick, reliable practice with clear progress and feedback."}),`
`,e.jsx(n.li,{children:"Team Lead (secondary): wants visible status, consistency, and quality gates."}),`
`,e.jsx(n.li,{children:"Content Author (secondary): wants stable contracts and predictable rendering."}),`
`,e.jsx(n.li,{children:"Platform Admin (secondary): wants observability, versioned docs, smooth rollout."}),`
`]}),`
`,e.jsx(n.p,{children:"System context (Mermaid)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`flowchart LR
  subgraph Client
    App[Web App (React/Expo)]
    SB[Storybook (Docs+Demos)]
  end

  subgraph Backend/Services
    API[(API Gateway/Routes)]
    DB[(Supabase: Auth + Postgres + Realtime)]
    AI[(AI Assist Service)]
    OBS[(Observability/Events Sink)]
  end

  subgraph Dev Support
    MSW[(MSW: HTTP Mocks)]
    WS[(Mock WebSocket: Scenarios)]
    SSE[(SSE Demo Server)]
    SPEC[(OpenAPI Spec)]
    CI[(CI: Lint/Test/Build/Analysis)]
  end

  App <--> API
  API <--> DB
  App --> OBS
  App --> AI
  SB --> MSW
  SB --> WS
  SB --> SPEC
  SB --> SSE
  CI --> SB
`})}),`
`,e.jsx(n.h2,{id:"highlevel-sequence-diagrams",children:"High‑Level Sequence Diagrams"}),`
`,e.jsx(n.p,{children:"Epic CRUD (Product/Epics)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`sequenceDiagram
  participant U as Product Owner
  participant UI as Epic Manager (UI)
  participant API as API Routes
  participant DB as Supabase DB

  U->>UI: Create/Update Epic
  UI->>API: POST/PUT /epics {title,status,eta}
  API->>DB: Upsert epic row
  DB-->>API: OK
  API-->>UI: 200 {epic}
  UI-->>U: Render updated list
`})}),`
`,e.jsx(n.p,{children:"System Status refresh"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`sequenceDiagram
  participant U as Viewer
  participant App as Storybook Decorator
  participant Docs as /docs/status/SYSTEM_STATUS_STATE.json

  U->>App: Open Story
  App->>Docs: GET JSON (no-cache)
  Docs-->>App: {status, lastValidated}
  App-->>U: Show GREEN/DEGRADED/OUTAGE pill with tooltip
`})}),`
`,e.jsx(n.p,{children:"Incident + AI Assist (concept)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`sequenceDiagram
  participant U as Operator
  participant App as Console
  participant AI as AI Assist Service
  participant RB as Runbooks/Docs

  U->>App: Report incident signal
  App->>AI: POST /assist {symptoms, logs}
  AI-->>App: Suggested steps + runbook refs
  App->>RB: Link to matching runbook sections
  App-->>U: Guided resolution workflow
`})}),`
`,e.jsx(n.h2,{id:"feature-catalog",children:"Feature Catalog"}),`
`,e.jsx("a",{id:"feature-catalog"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Capability map (what we ship and why)",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Learn: Quiz engine, instant feedback, results analytics"}),`
`,e.jsx(n.li,{children:"Collaborate: Multiplayer demo, shared status, resilient sessions"}),`
`,e.jsx(n.li,{children:"Understand: Docs/Help hub in Storybook (Start Here, Quick Index, Repo Docs Browser)"}),`
`,e.jsx(n.li,{children:"Assure: Quality gates (play(), a11y, coverage, visual checks), CI insights"}),`
`,e.jsx(n.li,{children:"Observe: Status pill, event naming, SSE demo, bundle analysis"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"service-dependency-graph-mermaid",children:"Service Dependency Graph (Mermaid)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`graph LR
  subgraph Frontend
    A[React/Expo App]
    SB[Storybook]
  end

  subgraph Platform
    MSW[(MSW Handlers)]
    WS[(Mock WebSocket)]
    SSE[(SSE Demo Server)]
    SPEC[(OpenAPI Spec)]
  end

  subgraph Backend Targets (Planned)
    API[(API Routes)]
    SUPA[(Supabase Auth/Postgres/Realtime)]
    AI[(AI Assist Service)]
    OBS[(Observability Sink)]
  end

  A-->API
  API-->SUPA
  A-->OBS
  A-->AI

  SB-->MSW
  SB-->WS
  SB-->SPEC
  SB-->SSE
`})}),`
`,e.jsx(n.h2,{id:"service-inventory-and-io",children:"Service Inventory and I/O"}),`
`,e.jsx("a",{id:"service-inventory-io"}),`
`,e.jsx(n.p,{children:"This section enumerates what exists in this repository today and how to exercise it. Nothing listed here is hypothetical; it’s backed by code and/or stories in this project."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"HTTP mocks (MSW) — src/mocks/handlers.ts"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Global controls",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["GET /",e.jsx(n.strong,{children:"msw"}),"/defaults → ",e.jsx(n.code,{children:"{ latencyMs: number, errorRate: number }"})]}),`
`,e.jsxs(n.li,{children:["POST /",e.jsx(n.strong,{children:"msw"}),"/defaults ",e.jsx(n.code,{children:"{ latencyMs?: number, errorRate?: number }"})," → same shape"]}),`
`,e.jsx(n.li,{children:"Per-request opt-out header: x-msw-no-defaults: 1"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Lessons",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"GET /api/lessons"}),`
`,e.jsx(n.li,{children:"In: optional headers (x-client-id, x-msw-no-defaults)"}),`
`,e.jsxs(n.li,{children:["Out: 200 ",e.jsx(n.code,{children:"{ lessons: [{ id, title, progress }] }"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Quizzes",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"GET /api/quizzes"}),`
`,e.jsxs(n.li,{children:["Out: 200 ",e.jsx(n.code,{children:"{ quizzes: [{ id, category, difficulty }] }"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Login",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["POST /api/login ",e.jsx(n.code,{children:"{ email }"})]}),`
`,e.jsxs(n.li,{children:["Out: 200 ",e.jsx(n.code,{children:"{ token, user: { id, email } }"})," with Cache-Control: no-store"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Cache demo (ETag)",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"GET /api/cache with optional If-None-Match"}),`
`,e.jsxs(n.li,{children:["Out: 200 ",e.jsx(n.code,{children:"{ ts, value }"}),' with ETag: "demo-etag-abc123" and Cache-Control: public, max-age=60; or 304 Not Modified with ETag']}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Rate limiting demo",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"GET /api/ratelimit"}),`
`,e.jsx(n.li,{children:"In: header x-client-id (default 'anon')"}),`
`,e.jsx(n.li,{children:"Window: 10s; Limit: 3"}),`
`,e.jsxs(n.li,{children:["Out: 200 ",e.jsx(n.code,{children:"{ ok, remaining }"})," with X-RateLimit-* headers; or 429 ",e.jsx(n.code,{children:"{ error: 'rate_limited' }"})," with Retry-After"]}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Tooltip generation mock — src/mocks/handlers.storybook.ts"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["POST /api/tooltips/generate ",e.jsx(n.code,{children:"{ input: string }"})]}),`
`,e.jsxs(n.li,{children:["Special triggers inside input",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"TRIGGER_RATE_LIMIT → 429 with Retry-After: 3"}),`
`,e.jsx(n.li,{children:"TRIGGER_ERROR → 500 text/plain"}),`
`,e.jsx(n.li,{children:'TRIGGER_CACHED → 200 JSON with ETag: "tooltips-etag-v1"; subsequent call with If-None-Match returns 304'}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Default success: 200 ",e.jsx(n.code,{children:"{ input, html }"})]}),`
`,e.jsx(n.li,{children:"Honors x-msw-no-defaults to skip latency/error injection"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Supabase-style REST mocks — src/mocks/msw/handlers.ts"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Auth",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["POST /auth/v1/token body grant_type=password → 200 ",e.jsx(n.code,{children:"{ access_token, token_type, expires_in, refresh_token, user }"})]}),`
`,e.jsxs(n.li,{children:["POST /auth/v1/signup → 200 ",e.jsx(n.code,{children:"{ user }"})]}),`
`,e.jsxs(n.li,{children:["GET /auth/v1/user → 200 ",e.jsx(n.code,{children:"{ user }"})]}),`
`,e.jsxs(n.li,{children:["POST /auth/v1/logout → 200 ",e.jsx(n.code,{children:"{}"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Domain tables",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"GET /rest/v1/question_categories → 200 array of rows with nested questions count"}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"GET /rest/v1/questions?category_id=eq.<id>"})," → 200 array of ",e.jsx(n.code,{children:"{ id, category_id, text, options, correct_answer, difficulty, explanation, points, order_index, metadata }"})]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["GET /rest/v1/remote_config → 200 ",e.jsx(n.code,{children:"{ questions_version }"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.code,{children:"GET /rest/v1/profiles?id=eq.<userId>"})," → 200 profile row; ",e.jsx(n.code,{children:"POST /rest/v1/profiles"})," → 201 created row"]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Express API (stubs and enhanced) — api/src/routes/*.ts"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Quiz",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["POST /api/quiz/session → 200 ",e.jsx(n.code,{children:"{ sessionId, categoryId, difficulty, createdAt }"})," (enhanced: 201 DB row via Supabase; auth required)"]}),`
`,e.jsxs(n.li,{children:["GET /api/quiz/questions → 200 ",e.jsx(n.code,{children:"{ questions: [{ id, text, options, correct_answer, difficulty, explanation, points, order_index }] }"})," (enhanced: requires sessionId, returns sanitized questions)"]}),`
`,e.jsxs(n.li,{children:["POST /api/quiz/answer → 200 ",e.jsx(n.code,{children:"{ correct, xp, streak, bonuses }"})," (enhanced: records answer, returns explanation, nextQuestion flag)"]}),`
`,e.jsxs(n.li,{children:["GET /api/quiz/leaderboard → 200 ",e.jsx(n.code,{children:"{ leaders }"})," (enhanced: paginated profiles-based leaderboard)"]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Users",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["GET /api/users/me → 200 ",e.jsx(n.code,{children:"{ userId, name, level, xp, streak, premium }"})]}),`
`,e.jsxs(n.li,{children:["POST /api/users/export → 200 ",e.jsx(n.code,{children:"{ status: 'queued', jobId }"})]}),`
`,e.jsxs(n.li,{children:["DELETE /api/users/me → 200 ",e.jsx(n.code,{children:"{ deleted: true, at }"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Analytics",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["POST /api/analytics/event → 200 ",e.jsx(n.code,{children:"{ received, event, userId, ts }"})]}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"WebSocket mock & abstraction"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["src/services/mockWebSocket.ts enumerates events (e.g., connect, lobby:",e.jsx(n.em,{children:", game:"}),", scores:updated, message:*, task:update). Used by Live/TaskBoard and multiplayer demos."]}),`
`,e.jsx(n.li,{children:"src/lib/socket.ts provides a socket factory that swaps to a MockSocket when USE_WS_MOCKS (env flags) are set."}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Status JSON — docs/status/SYSTEM_STATUS_STATE.json"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Shape: ",e.jsx(n.code,{children:"{ status: 'green' | 'degraded' | 'outage' | 'unknown', lastValidated: ISO8601 }"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Interactive stories (discoverability)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"API/Playground — exercise mocked endpoints; supports MSW presets and per-story overrides"}),`
`,e.jsx(n.li,{children:"Dev/NetworkPlayground — set MSW global defaults and view a live request timeline"}),`
`,e.jsx(n.li,{children:"API/Swagger — renders docs/api-specs/openapi/quizmentor-api-v1.yaml"}),`
`,e.jsx(n.li,{children:"Docs/Epics/Epic Manager — interactive epics filtering; Empty/Loading/Error variants"}),`
`,e.jsx(n.li,{children:"Live/TaskBoard — WebSocket scenario demo (select with WS Scenario toolbar)"}),`
`,e.jsx(n.li,{children:"Docs/Repo Docs Browser, Docs/Quick Index — navigate repo docs within Storybook"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"end-to-end-journeys-interactive-inside-storybook",children:"End-to-End Journeys (interactive, inside Storybook)"}),`
`,e.jsx("a",{id:"journeys"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Epic review and filtering",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open Docs/Epics/Epic Manager → toggle Status/Priority → observe chips and list updates"}),`
`,e.jsx(n.li,{children:"Variant drill-down: switch to Empty/Loading/Error stories"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["API exploration and resilience",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open API/Playground → call GET /api/lessons → see JSON"}),`
`,e.jsx(n.li,{children:"Switch to GET /api/cache → call twice: 200 then 304 with ETag"}),`
`,e.jsx(n.li,{children:"Switch to GET /api/ratelimit → call 4x: observe 429 + Retry-After"}),`
`,e.jsx(n.li,{children:"Switch to POST /api/tooltips/generate → type TRIGGER_* words → observe 429/500/304 behavior"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Network conditions at scale",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open Dev/NetworkPlayground → set latency/error → Run Scenario (sequential) or Run Concurrent → inspect timeline rows"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["API contract reading",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open API/Swagger → adjust doc expansion and TryItOut → browse operations from docs/api-specs/openapi/quizmentor-api-v1.yaml"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Realtime awareness",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open Live/TaskBoard → change WS Scenario toolbar to taskBoardLive / disconnectRecovery → observe event updates"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"data-model-erd-mermaid",children:"Data Model ERD (Mermaid)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`erDiagram
  USER ||--o{ QUIZ_SESSION : has
  QUIZ_SESSION ||--|{ RESULT : generates
  QUIZ_SESSION }o--|| QUIZ : for
  QUIZ ||--|{ QUESTION : contains
  USER ||--o{ ACHIEVEMENT : earns

  USER {
    uuid id PK
    string email
    string display_name
    int level
    int xp
    jsonb preferences
  }
  QUIZ_SESSION {
    uuid id PK
    uuid user_id FK
    uuid quiz_id FK
    int score
    int correct
    int total
    timestamptz created_at
  }
  RESULT {
    uuid id PK
    uuid session_id FK
    uuid question_id FK
    boolean correct
    int time_ms
  }
  QUIZ {
    uuid id PK
    string category
    string difficulty
  }
  QUESTION {
    uuid id PK
    string prompt
    json options
    int correct_index
  }
  ACHIEVEMENT {
    uuid id PK
    uuid user_id FK
    string code
    timestamptz unlocked_at
  }
`})}),`
`,e.jsx(n.h2,{id:"concept-extended-erd-future-not-implemented",children:"Concept: Extended ERD (future, not implemented)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`erDiagram
  ORGANIZATION ||--o{ USER : includes
  ORGANIZATION ||--o{ API_KEY : owns
  USER ||--o{ AUDIT_EVENT : generates

  ORGANIZATION {
    uuid id PK
    string name
    timestamptz created_at
  }
  API_KEY {
    uuid id PK
    uuid org_id FK
    string key_hash
    timestamptz created_at
    timestamptz last_used_at
    boolean revoked
  }
  AUDIT_EVENT {
    uuid id PK
    uuid user_id FK
    string event_type
    json payload
    timestamptz created_at
  }
`})}),`
`,e.jsx(n.h2,{id:"concept-generation-streaming-sequence-future",children:"Concept: Generation Streaming Sequence (future)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`sequenceDiagram
  participant U as User (UI)
  participant App as Web App
  participant API as API Routes
  participant Stream as SSE/Streaming Channel

  U->>App: Request generated explanation/tooltips
  App->>API: POST /tooltips/generate {input}
  API-->>Stream: Open stream and emit tokens
  Stream-->>App: token, token, token...
  App-->>U: Update UI progressively (streaming)
  API-->>App: [DONE]
`})}),`
`,e.jsx(n.h2,{id:"security--privacy-model",children:"Security & Privacy Model"}),`
`,e.jsx("a",{id:"security-privacy"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Authentication & session",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Supabase OAuth (GitHub) + email/password; short‑lived access tokens and refresh rotation"}),`
`,e.jsx(n.li,{children:"Native secure storage on device; memory + refresh strategy on web"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Authorization & data access",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Principle of least privilege; server‑side checks; per‑org API keys for backend integrations (hash at rest)"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Data protection",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"PII classification; no secrets in client logs; redact sensitive fields in observability events"}),`
`,e.jsx(n.li,{children:"HTTPS everywhere; CORS configured for Storybook dev"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Supply chain & CI",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Dependency vigilance via bundle analysis; mdx/eslint; docs link‑check"}),`
`,e.jsx(n.li,{children:"Gates: coverage thresholds, a11y scans; optional Chromatic visual approvals"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"north-star-metrics--kpis",children:"North Star Metrics & KPIs"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"North Star: Weekly Learning Progress (WLp) — weighted composite of sessions completed, streak adherence, and accuracy improvements"}),`
`,e.jsxs(n.li,{children:["KPIs",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Activation rate (onboarding → first quiz within N minutes)"}),`
`,e.jsx(n.li,{children:"Weekly active learners; median sessions/week"}),`
`,e.jsx(n.li,{children:"Quiz completion rate; average correct per session"}),`
`,e.jsx(n.li,{children:"Time to first correct; retry rates; streak distribution"}),`
`,e.jsx(n.li,{children:"Docs learning engagement (Start Here views, API Playground usage)"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"risks--mitigations",children:"Risks & Mitigations"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Auth complexity (OAuth + email)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Mitigation: Spec-first plan, Storybook Auth Smoke, unit/E2E on flows"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Test brittleness (RN/Expo)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Mitigation: Stabilize jest-expo config, limit flakiness surface, add quarantined label"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Overweight bundles"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Mitigation: analyze-storybook, code splitting for heavy widgets, subpath imports"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Docs drift"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Mitigation: helpDoc pill, link-check in CI, docs manifest + Quick Index"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Epics (Roadmap/Epics)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Epic Manager demo; links to EPIC_MANAGEMENT_CURRENT.md"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Status (System visibility)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Storybook status pill (GREEN/DEGRADED/OUTAGE); current status doc and validation record"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"AI Assist (Concept)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Prompt→suggestions→runbook links; planned integration"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Docs/Help"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Start Here, Quick Index, Repo Docs Browser, Mocking & Scenarios, Bundling & Performance"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Quality Gates"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Storybook Test Runner (play functions), a11y scans, coverage thresholds, docs link‑check, Chromatic ready"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:"Observability"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Event naming in user stories, SSE demo, status JSON, bundle analysis artifact in CI"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"30-detailed-user-stories",children:"30 Detailed User Stories"}),`
`,e.jsx(n.p,{children:"Notation: AC = Acceptance Criteria; Alt = Alternate/Failure path; Obs = Observability events"}),`
`,e.jsx(n.p,{children:"Onboarding & Auth"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"US‑001: As a new user, I want a first‑run onboarding so I can set preferences fast."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Sees categories; can skip; lands on Home in < 2 clicks; choices persisted."}),`
`,e.jsx(n.li,{children:"Alt: Offline → defaults applied and queued persistence; banner shown."}),`
`,e.jsx(n.li,{children:"Obs: onboarding_started, onboarding_completed, onboarding_skipped."}),`
`]}),`
`,e.jsxs(n.ol,{start:"2",children:[`
`,e.jsx(n.li,{children:"US‑002: As a user, I can sign in via GitHub OAuth."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Redirect to provider; callback sets session; see user initials; secure storage."}),`
`,e.jsx(n.li,{children:"Alt: Provider error → clear message; retry or fallback to email."}),`
`,e.jsxs(n.li,{children:["Obs: auth_start, auth_success, auth_error ",e.jsx(n.code,{children:"{provider}"}),"."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"3",children:[`
`,e.jsx(n.li,{children:"US‑003: As a user, I can create an account with email/password."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Validation; verification email (if configured); sign‑in; profile scaffold."}),`
`,e.jsx(n.li,{children:"Alt: Existing email → suggestion to sign in; rate limit on repeated attempts."}),`
`,e.jsxs(n.li,{children:["Obs: signup_start, signup_success, signup_error ",e.jsx(n.code,{children:"{reason}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Quiz & Learning 4) US‑004: As a learner, I can start a quiz from Home by category."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Loads 10 questions; progress visible; timer optional; back is safe."}),`
`,e.jsx(n.li,{children:"Alt: Network fail → fallback to cached/fixtures; banner; retry works."}),`
`,e.jsxs(n.li,{children:["Obs: quiz_start ",e.jsx(n.code,{children:"{category}"}),", question_shown ",e.jsx(n.code,{children:"{id}"}),"."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"5",children:[`
`,e.jsx(n.li,{children:"US‑005: As a learner, I receive instant feedback per answer."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Correct/incorrect animation; streak/XP updates; explanation visible."}),`
`,e.jsx(n.li,{children:"Alt: Animation disabled setting respected; reduced motion supported."}),`
`,e.jsxs(n.li,{children:["Obs: answer_submitted ",e.jsx(n.code,{children:"{correct}"}),", xp_updated, streak_updated."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"6",children:[`
`,e.jsx(n.li,{children:"US‑006: As a learner, I can finish and view detailed results."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Score, grade, accuracy, time; Retry/Share/Next actions."}),`
`,e.jsx(n.li,{children:"Alt: Share blocked (permissions) → graceful fallback."}),`
`,e.jsxs(n.li,{children:["Obs: quiz_completed ",e.jsx(n.code,{children:"{score}"}),", results_viewed."]}),`
`]}),`
`,e.jsx(n.p,{children:"Results & Analytics 7) US‑007: As a learner, I can review past results."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Results list; filters by category/date; detail page."}),`
`,e.jsx(n.li,{children:"Alt: No data → empty state guidance."}),`
`,e.jsx(n.li,{children:"Obs: results_history_viewed."}),`
`]}),`
`,e.jsxs(n.ol,{start:"8",children:[`
`,e.jsx(n.li,{children:"US‑008: As a learner, I can see analytics over time."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Charts/metrics with period filters; performance by category."}),`
`,e.jsx(n.li,{children:"Alt: Loading skeletons; no data states."}),`
`,e.jsxs(n.li,{children:["Obs: analytics_viewed ",e.jsx(n.code,{children:"{range}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Multiplayer (demo) 9) US‑009: As a user, I can create a lobby and share a code."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Code generated; copy friendly; players join."}),`
`,e.jsx(n.li,{children:"Alt: Lobby full → clear error; rate‑limit join attempts."}),`
`,e.jsx(n.li,{children:"Obs: lobby_created, lobby_joined, lobby_error."}),`
`]}),`
`,e.jsxs(n.ol,{start:"10",children:[`
`,e.jsx(n.li,{children:"US‑010: As a user, I can start a synchronized quiz."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Countdown; same questions; live score updates."}),`
`,e.jsx(n.li,{children:"Alt: Disconnection → rejoin; minimal drift."}),`
`,e.jsx(n.li,{children:"Obs: match_started, question_broadcast, scores_updated."}),`
`]}),`
`,e.jsx(n.p,{children:"Settings & Profile 11) US‑011: As a user, I can update profile (avatar, username, bio)."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Validation; preview; persisted; immediate UI refresh."}),`
`,e.jsx(n.li,{children:"Alt: Username taken → try another; avatar upload fail → retry."}),`
`,e.jsxs(n.li,{children:["Obs: profile_updated ",e.jsx(n.code,{children:"{fields}"}),"."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"12",children:[`
`,e.jsx(n.li,{children:"US‑012: As a user, I can change app settings (theme, language, notifications)."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Instant theme switch; i18n strings updated; persisted."}),`
`,e.jsx(n.li,{children:"Alt: Unsupported language → default fallback with notice."}),`
`,e.jsxs(n.li,{children:["Obs: settings_changed ",e.jsx(n.code,{children:"{keys}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Premium & Monetization 13) US‑013: As a user, I see a paywall when accessing premium features."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Benefits listed; plan chooser; CTA leads to payment."}),`
`,e.jsx(n.li,{children:"Alt: Dismiss path; intent capture for later follow‑up."}),`
`,e.jsx(n.li,{children:"Obs: paywall_viewed, paywall_cta_clicked."}),`
`]}),`
`,e.jsxs(n.ol,{start:"14",children:[`
`,e.jsx(n.li,{children:"US‑014: As a user, I can complete a premium upgrade (mock/demo)."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Payment success simulated; features unlocked state."}),`
`,e.jsx(n.li,{children:"Alt: Payment error → retry/backoff."}),`
`,e.jsx(n.li,{children:"Obs: upgrade_started, upgrade_success, upgrade_error."}),`
`]}),`
`,e.jsx(n.p,{children:"Error Recovery & Status 15) US‑015: As a user, I see network errors and recover quickly."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Timeouts show banner; retry works; cached data used."}),`
`,e.jsx(n.li,{children:"Alt: Persistent errors → helpful link to troubleshooting."}),`
`,e.jsxs(n.li,{children:["Obs: network_error ",e.jsx(n.code,{children:"{type}"}),", retry_clicked."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"16",children:[`
`,e.jsx(n.li,{children:"US‑016: As a user, I see a visible system status indicator."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: GREEN/DEGRADED/OUTAGE pill; tooltip includes last validated."}),`
`,e.jsx(n.li,{children:"Alt: Status JSON missing → fallback gray state."}),`
`,e.jsx(n.li,{children:"Obs: status_viewed."}),`
`]}),`
`,e.jsx(n.p,{children:"Docs & Learning (Storybook) 17) US‑017: As a developer, I find a Start Here page with curated links."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Links to Quick Index, Swagger, API Playground, Demos."}),`
`,e.jsx(n.li,{children:"Alt: Link check in CI prevents dead links."}),`
`,e.jsx(n.li,{children:"Obs: docs_landing_viewed."}),`
`]}),`
`,e.jsxs(n.ol,{start:"18",children:[`
`,e.jsx(n.li,{children:"US‑018: As a developer, I can browse repo docs inside Storybook."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: MD view with link list; search/filter panel; custom path support."}),`
`,e.jsx(n.li,{children:"Alt: 404 shows helpful message."}),`
`,e.jsxs(n.li,{children:["Obs: repo_docs_opened ",e.jsx(n.code,{children:"{path}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"API & Mocks 19) US‑019: As a developer, I can view the API spec inside Storybook."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Swagger story; TryItOut toggle; doc/model expansion controls."}),`
`,e.jsx(n.li,{children:"Alt: Spec not found → helpful instructions."}),`
`,e.jsxs(n.li,{children:["Obs: swagger_viewed ",e.jsx(n.code,{children:"{options}"}),"."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"20",children:[`
`,e.jsx(n.li,{children:"US‑020: As a developer, I can exercise endpoints with realistic conditions."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: API Playground with MSW latency/error presets; opt‑out header; timeline in Network Playground."}),`
`,e.jsx(n.li,{children:"Alt: Unhandled routes logged; docs link provided."}),`
`,e.jsxs(n.li,{children:["Obs: api_call_made ",e.jsx(n.code,{children:"{endpoint,status,ms}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Epics & Roadmap 21) US‑021: As a PM, I can filter epics by State/Priority."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Inline filters; search; empty state; quick detail view."}),`
`,e.jsx(n.li,{children:"Alt: API error → banner; cached last success state."}),`
`,e.jsxs(n.li,{children:["Obs: epics_filtered ",e.jsx(n.code,{children:"{status,priority}"}),"."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"22",children:[`
`,e.jsx(n.li,{children:"US‑022: As a PM, I can update epic details."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Save in place; optimistic UI; rollback on error."}),`
`,e.jsx(n.li,{children:"Alt: Conflicts → merge suggestion; retry."}),`
`,e.jsxs(n.li,{children:["Obs: epic_updated ",e.jsx(n.code,{children:"{fields}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"AI Assist (concept) 23) US‑023: As an operator, I want AI to summarize an incident and propose steps."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Prompt; suggested steps; runbook links; confidence score."}),`
`,e.jsx(n.li,{children:"Alt: Low confidence → ask for more signals."}),`
`,e.jsxs(n.li,{children:["Obs: ai_assist_requested ",e.jsx(n.code,{children:"{context}"}),", ai_assist_proposed."]}),`
`]}),`
`,e.jsx(n.p,{children:"Observability & Quality Gates 24) US‑024: As an engineer, I want coverage to block regressions."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: src/components ≥ 60%; global ≥ 50%; reported in PR."}),`
`,e.jsx(n.li,{children:"Alt: Flaky UI tests quarantined with visibility."}),`
`,e.jsxs(n.li,{children:["Obs: coverage_reported ",e.jsx(n.code,{children:"{thresholds}"}),"."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"25",children:[`
`,e.jsx(n.li,{children:"US‑025: As an engineer, I want a11y checks on core docs/pages."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Axe scan runs in Storybook Test Runner; violations fail CI."}),`
`,e.jsx(n.li,{children:"Alt: Ignored rules documented (e.g., color contrast tokens)."}),`
`,e.jsxs(n.li,{children:["Obs: a11y_scan_completed ",e.jsx(n.code,{children:"{count}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Performance & Bundling 26) US‑026: As an engineer, I can analyze bundles easily."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: analyze:storybook produces HTML artifact in CI."}),`
`,e.jsx(n.li,{children:"Alt: Missing plugin → docs pointer to fix."}),`
`,e.jsx(n.li,{children:"Obs: bundle_analysis_uploaded."}),`
`]}),`
`,e.jsxs(n.ol,{start:"27",children:[`
`,e.jsx(n.li,{children:"US‑027: As an engineer, I can lazy‑load heavy components."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: React.lazy + Suspense demo; verified new chunk loads."}),`
`,e.jsx(n.li,{children:"Alt: Network fail → fallback UI."}),`
`,e.jsxs(n.li,{children:["Obs: lazy_chunk_loaded ",e.jsx(n.code,{children:"{name}"}),"."]}),`
`]}),`
`,e.jsx(n.p,{children:"Internationalization & Accessibility 28) US‑028: As a global user, I can switch language/theme."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Strings update; RTL support (planned); persisted."}),`
`,e.jsx(n.li,{children:"Alt: Language not fully translated → fallbacks flagged."}),`
`,e.jsxs(n.li,{children:["Obs: locale_changed ",e.jsx(n.code,{children:"{lang}"}),", theme_changed."]}),`
`]}),`
`,e.jsxs(n.ol,{start:"29",children:[`
`,e.jsx(n.li,{children:"US‑029: As an a11y‑conscious user, the app meets WCAG 2.1 AA."}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Roles/labels; focus order; reduced motion; color contrast."}),`
`,e.jsx(n.li,{children:"Alt: Non‑compliant element flagged in CI."}),`
`,e.jsx(n.li,{children:"Obs: a11y_violation_detected."}),`
`]}),`
`,e.jsx(n.p,{children:"Security & Privacy 30) US‑030: As a user, my session is secure and revocable."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"AC: Short‑lived tokens; refresh; logout clears storage; no secrets in logs."}),`
`,e.jsx(n.li,{children:"Alt: Token invalid → re‑auth prompt; safe redirect."}),`
`,e.jsx(n.li,{children:"Obs: auth_logout, token_refresh."}),`
`]}),`
`,e.jsx(n.h2,{id:"system-status-diagrams-mermaid",children:"System Status Diagrams (Mermaid)"}),`
`,e.jsx(n.p,{children:"State transitions"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`stateDiagram-v2
  [*] --> Unknown
  Unknown --> Green: Validation OK
  Unknown --> Degraded: Partial failures
  Unknown --> Outage: Major failures
  Green --> Degraded: Check fails
  Degraded --> Green: Recovery
  Degraded --> Outage: Escalation
  Outage --> Green: Full restoration
`})}),`
`,e.jsx(n.p,{children:"Validation record"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`graph TD
  A[Build Storybook] --> B[Test Runner]
  B --> C[Bundle Analysis]
  C --> D[Docs Link Check]
  D --> E[Update Status JSON]
`})}),`
`,e.jsx(n.h2,{id:"nonfunctional-requirements",children:"Non‑Functional Requirements"}),`
`,e.jsx(n.p,{children:"Performance"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:`Fast TTI in Storybook docs (<1s on local dev); quiz flow snappy; lazy‑load heavy bits.
Accessibility`}),`
`,e.jsx(n.li,{children:`WCAG 2.1 AA; play() and axe scans in CI on key pages.
Security`}),`
`,e.jsx(n.li,{children:`Supabase auth; short‑lived tokens; secure storage; no plaintext secrets.
Observability`}),`
`,e.jsx(n.li,{children:`Structured client events for flows, errors, and retries; SSE demo for live education.
Internationalization`}),`
`,e.jsx(n.li,{children:"Language switch scaffolding; plan for RTL; theme tokens for consistent visuals."}),`
`]}),`
`,e.jsx(n.h2,{id:"testing-strategy--learning-demos",children:"Testing Strategy & Learning Demos"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Unit/Integration: Jest + Testing Library; coverage gates per path."}),`
`,e.jsx(n.li,{children:"Interaction: Storybook Test Runner play(); per‑story MSW overrides."}),`
`,e.jsx(n.li,{children:"E2E: Playwright targeting Storybook/app; multiplayer and auth planned."}),`
`,e.jsx(n.li,{children:"Visual: Chromatic (optional); prefer deterministic stories."}),`
`,e.jsx(n.li,{children:"Learning via Storybook: Start Here, Quick Index, API Playground, Swagger, Network Playground, Live Task Board, Code Split Demo."}),`
`]}),`
`,e.jsx(n.h2,{id:"phased-roadmap-highlevel",children:"Phased Roadmap (high‑level)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`gantt
  dateFormat  YYYY-MM-DD
  title QuizMentor Roadmap
  section Foundation
  Storybook hub & mocks           :done,   f0, 2025-08-20, 2025-08-28
  Docs & Quality Gates           :done,   f1, 2025-08-22, 2025-08-29
  section Phase 1 (Auth & Quiz)
  Supabase OAuth + email         :active, p1, 2025-08-29, 7d
  Quiz endpoints backing         :        p2, after p1, 6d
  Results interactions           :        p3, after p2, 4d
  section Phase 2 (Analytics)
  Analytics persistence & charts :        p4, 2025-09-10, 7d
  section Phase 3 (Realtime & Premium)
  Multiplayer hardening          :        p5, 2025-09-20, 7d
  Paywall demo hardening         :        p6, after p5, 5d
  section Phase 4 (Polish)
  A11y/i18n/perf pass            :        p7, 2025-10-01, 7d
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Phase 0 (Foundation): Storybook hub, mocks, flows, CI gates, status (DONE)"}),`
`,e.jsx(n.li,{children:"Phase 1 (Auth & Quiz Backing): Supabase OAuth/email; quiz endpoints; results interactions"}),`
`,e.jsx(n.li,{children:"Phase 2 (Analytics & Reporting): Persistence and charts; results history; export"}),`
`,e.jsx(n.li,{children:"Phase 3 (Multiplayer & Premium): Real‑time match; paywall demo hardening; invoices"}),`
`,e.jsx(n.li,{children:"Phase 4 (Polish & Rollout): A11y audits, i18n pass, perf tuning, docs freeze"}),`
`]}),`
`,e.jsx(n.h2,{id:"quick-instructions-storybook",children:"Quick Instructions (Storybook)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Run: ",e.jsx(n.code,{children:"npm run storybook"})]}),`
`,e.jsx(n.li,{children:"Open: http://localhost:7007"}),`
`,e.jsx(n.li,{children:"Suggested order: Docs/00 Start Here → Docs/Portfolio Overview (this page) → API/Playground → API/Swagger → Dev/NetworkPlayground → Live/TaskBoard → Docs/Bundling & Performance → Auth/Smoke."}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"where-to-go-next",children:"Where to go next"}),`
`,e.jsx(a,{}),`
`,e.jsxs(n.p,{children:[e.jsx(t,{note:"Portfolio Overview"}),`- Docs/00 Start Here — the curated entry point - Docs/Quick
Index — quick links to the most‑used docs and key stories - Docs/Mocking & Scenarios — how MSW and
WS scenarios are wired, with interactive drills - API/Playground — exercise endpoints and try
presets (Default/Slower/Flaky/Chaos) - Dev/NetworkPlayground — set global latency/error and view a
live timeline - API/Swagger — browse the OpenAPI spec from
docs/api-specs/openapi/quizmentor-api-v1.yaml - Docs/Epics & Roadmap — links to
EPIC_MANAGEMENT_CURRENT.md - Docs/System Status — links to SYSTEM_STATUS_CURRENT.md`]})]})}function S(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{S as default};

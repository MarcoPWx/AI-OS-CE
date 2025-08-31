import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import{L as a}from"./LastUpdated-4hnobFg0.js";import{I as d}from"./InlineTOC-C7is7SsK.js";import{B as o}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(i){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...s(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"architecture",children:"Architecture"}),`
`,`
`,e.jsx(t,{title:"Overview/Architecture"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(n.p,{children:"A focused reference for the system’s architecture, mapped directly to what exists in this repository. No speculative features are presented as implemented; “concept” sections are clearly labeled."}),`
`,e.jsx(n.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"System Map & Dependencies (#system-map)"}),`
`,e.jsx(n.li,{children:"Layered View (#layered-view)"}),`
`,e.jsx(n.li,{children:"Data Model — Current ERD (#data-model-current)"}),`
`,e.jsx(n.li,{children:"Data Model — Extended ERD (concept) (#data-model-extended)"}),`
`,e.jsx(n.li,{children:"Pointers"}),`
`]}),`
`,e.jsx(d,{items:[{id:"system-map",label:"System Map"},{id:"layered-view",label:"Layered View"},{id:"data-model-current",label:"ERD — Current"},{id:"data-model-extended",label:"ERD — Extended (concept)"}]}),`
`,e.jsx(n.h2,{id:"system-map--dependencies",children:"System Map & Dependencies"}),`
`,e.jsx("a",{id:"system-map"}),`
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
`,e.jsx(n.p,{children:"Notes"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"MSW handlers: src/mocks/handlers.ts, src/mocks/handlers.storybook.ts, src/mocks/msw/handlers.ts"}),`
`,e.jsx(n.li,{children:"WebSocket mock: src/services/mockWebSocket.ts; socket abstraction: src/lib/socket.ts"}),`
`,e.jsx(n.li,{children:"Express routes (stubs/enhanced): api/src/routes/*.ts"}),`
`,e.jsx(n.li,{children:"OpenAPI spec served by Swagger story: docs/api-specs/openapi/quizmentor-api-v1.yaml"}),`
`]}),`
`,e.jsx(n.h2,{id:"layered-view",children:"Layered View"}),`
`,e.jsx("a",{id:"layered-view"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`graph LR
  subgraph Layer: Client (UI)
    A[React/Expo App]
    SB[Storybook]
  end

  subgraph Layer: Platform (Dev/Middleware)
    MSW[(MSW Handlers)]
    WS[(Mock WebSocket)]
    SSE[(SSE Demo Server)]
    SPEC[(OpenAPI Spec)]
  end

  subgraph Layer: Backend Targets (Planned/Real)
    API[(API Routes)]
    SUPA[(Supabase Auth/Postgres/Realtime)]
    OBS[(Observability Sink)]
    AI[(AI Assist Service)]
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
`,e.jsx(n.p,{children:"Layering"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Client: interactive stories and app views"}),`
`,e.jsx(n.li,{children:"Platform: local developer middleware for mocks, specs, and streaming demos"}),`
`,e.jsx(n.li,{children:"Backend Targets: actual or planned integrations reachable via API"}),`
`]}),`
`,e.jsx(n.h2,{id:"data-model--current-erd",children:"Data Model — Current ERD"}),`
`,e.jsx("a",{id:"data-model-current"}),`
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
`,e.jsx(n.h2,{id:"data-model--extended-erd-concept",children:"Data Model — Extended ERD (concept)"}),`
`,e.jsx("a",{id:"data-model-extended"}),`
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
`,e.jsx(n.h2,{id:"pointers",children:"Pointers"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Service I/O inventory and journeys live in: Docs/Portfolio Overview (Service Inventory & I/O, End-to-End Journeys)"}),`
`,e.jsx(n.li,{children:"API reference: API/Swagger"}),`
`,e.jsx(n.li,{children:"Mock exploration: API/Playground, Dev/NetworkPlayground"}),`
`]}),`
`,e.jsx(o,{}),`
`,e.jsx(a,{note:"Architecture"})]})}function E(i={}){const{wrapper:n}={...s(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(r,{...i})}):r(i)}export{E as default};

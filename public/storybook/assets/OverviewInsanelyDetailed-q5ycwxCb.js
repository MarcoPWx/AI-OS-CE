import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as l}from"./index-Di0Mt_3y.js";import{M as o,C as i,S as r}from"./index-Dd9QK8Sf.js";import{L as c}from"./LastUpdated-4hnobFg0.js";import{I as a}from"./InlineTOC-C7is7SsK.js";import{B as d}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function t(n){const s={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...l(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"overview-insanely-detailed",children:"Overview (Insanely Detailed)"}),`
`,`
`,e.jsx(o,{title:"Overview/Overview (Insanely Detailed)"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(s.p,{children:"This page is the deep dive. It links to architecture, service catalog, full specs, and journeys you can run entirely in Storybook. Everything here maps to code in the repo; concept sections are explicitly labeled."}),`
`,e.jsx(s.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Service-to-Service (Storybook Dev) (#service-to-service)"}),`
`,e.jsx(s.li,{children:"Journeys (#journeys)"}),`
`]}),`
`,e.jsx(a,{items:[{id:"service-to-service",label:"Service-to-Service"},{id:"journeys",label:"Journeys"}]}),`
`,e.jsx(s.h2,{id:"start-here",children:"Start Here"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Portfolio Overview: Docs/Portfolio Overview"}),`
`,e.jsx(s.li,{children:"Architecture: Overview/Architecture"}),`
`,e.jsx(s.li,{children:"Service Catalog: Specs/Service Catalog"}),`
`]}),`
`,e.jsx(s.h2,{id:"what-exists-ground-truth",children:"What Exists (Ground Truth)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["HTTP Mocks (MSW)",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"src/mocks/handlers.ts — lessons, quizzes, login, cache (ETag), rate-limit, defaults control"}),`
`,e.jsx(s.li,{children:"src/mocks/handlers.storybook.ts — tooltips/generate with TRIGGER_* behaviors"}),`
`,e.jsx(s.li,{children:"src/mocks/msw/handlers.ts — Supabase-style REST for auth, categories, questions, profiles"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Express API routes (stubs/enhanced)",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"api/src/routes/quiz.routes.ts, quiz.routes.enhanced.ts, user.routes.ts, analytics.routes.ts"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["WebSocket Mock + Abstraction",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"src/services/mockWebSocket.ts, src/lib/socket.ts"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["API Spec",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"docs/api-specs/openapi/quizmentor-api-v1.yaml (rendered in API/Swagger)"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Status JSON",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"docs/status/SYSTEM_STATUS_STATE.json"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Docs (current truth)",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"docs/status/EPIC_MANAGEMENT_CURRENT.md, SYSTEM_STATUS_CURRENT.md"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(s.h2,{id:"run-it-now",children:"Run It Now"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["API Playground",`
`,e.jsx(i,{children:e.jsx(r,{id:"api-playground--default"})}),`
`]}),`
`,e.jsxs(s.li,{children:["Network Playground",`
`,e.jsx(i,{children:e.jsx(r,{id:"dev-networkplayground--default"})}),`
`]}),`
`,e.jsxs(s.li,{children:["Swagger (OpenAPI)",`
`,e.jsx(i,{children:e.jsx(r,{id:"api-swagger--default"})}),`
`]}),`
`,e.jsxs(s.li,{children:["Epic Manager",`
`,e.jsx(i,{children:e.jsx(r,{id:"docs-epics-epic-manager--default"})}),`
`]}),`
`]}),`
`,e.jsx(s.h2,{id:"service-to-service-storybook-dev",children:"Service-to-Service (Storybook Dev)"}),`
`,e.jsx("a",{id:"service-to-service"}),`
`,e.jsx(s.p,{children:`In Storybook dev, the UI talks to MSW handlers in-process. The conceptual production flow is UI →
API → Supabase (and back). See Service Catalog for detailed I/O and the Architecture page for
layered/system maps.`}),`
`,e.jsx(s.h2,{id:"journeys-see-also-specsjourneysuser-journeys--detailed-catalog",children:"Journeys (see also: Specs/Journeys/User Journeys — Detailed Catalog)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Lowest Valley: error, 304, and 429 paths (rate limit demo)"}),`
`,e.jsx(s.li,{children:"Highest Mount: smooth quiz flow with analytics and results"}),`
`,e.jsx(s.li,{children:"Live: TaskBoard (WS) with scenario switches"}),`
`]}),`
`,e.jsx(s.h2,{id:"journeys",children:"Journeys"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"journeys"}),`- Lowest Valley: ?path=/story/specs-journeys-lowest-valley--page - Highest
Mount: ?path=/story/specs-journeys-highest-mount--page`]}),`
`,e.jsx(s.h2,{id:"pointers",children:"Pointers"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Architecture — Overview/Architecture"}),`
`,e.jsx(s.li,{children:"Service Catalog — Specs/Service Catalog"}),`
`,e.jsx(s.li,{children:"Epic Management — Specs/Epic Management — Full Spec"}),`
`,e.jsx(s.li,{children:"System Status — Specs/System Status — Full Spec"}),`
`,e.jsx(s.li,{children:"Security — Specs/Security/Security & Privacy — Extended Model"}),`
`,e.jsx(s.li,{children:"Observability — Observability/Observability Stack"}),`
`,e.jsx(s.li,{children:"Journeys — Specs/Journeys/User Journeys — Detailed Catalog"}),`
`]}),`
`,e.jsx(d,{}),`
`,e.jsx(c,{note:"Overview (Insanely Detailed)"})]})}function b(n={}){const{wrapper:s}={...l(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(t,{...n})}):t(n)}export{b as default};

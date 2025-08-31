import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(n){const s={h1:"h1",li:"li",ol:"ol",p:"p",ul:"ul",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"labs-s2s-orchestration--patterns-and-exercises",children:"Labs: S2S Orchestration — Patterns and Exercises"}),`
`,`
`,e.jsx(t,{title:"Labs/S2S Orchestration"}),`
`,e.jsx(s.p,{children:"What this lab covers"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Service-to-service flows with contracts and mocks"}),`
`,e.jsx(s.li,{children:"Exercising API shapes via MSW, API Playground, and Swagger"}),`
`,e.jsx(s.li,{children:"Contract tests and migration to real services"}),`
`]}),`
`,e.jsx(s.p,{children:"Where to explore (stories)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"src/stories/s2s/S2SArchitecture.stories.tsx — diagrams and building blocks"}),`
`,e.jsx(s.li,{children:"src/stories/s2s/S2SDashboard.stories.tsx — live controls for flows"}),`
`,e.jsx(s.li,{children:"src/stories/Swagger.stories.tsx — OpenAPI-based exploration"}),`
`,e.jsx(s.li,{children:"src/stories/ApiPlayground.stories.tsx — request builders with per-story MSW handlers"}),`
`]}),`
`,e.jsx(s.p,{children:"Docs to read"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:".storybook/stories/SpecsServiceCatalog.mdx — endpoints, mocks, and flows"}),`
`,e.jsx(s.li,{children:".storybook/stories/SpecsDataEvents.mdx — analytics event taxonomy"}),`
`,e.jsx(s.li,{children:".storybook/stories/SpecsS2S.mdx — S2S concepts and patterns"}),`
`]}),`
`,e.jsx(s.p,{children:"Exercises"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Define a minimal event contract",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"name, ts, sessionId/userId, payload"}),`
`,e.jsx(s.li,{children:"Validate in API Playground against MSW"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Build an MSW handler for POST /api/analytics/event",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Return 201 and echo key fields"}),`
`,e.jsx(s.li,{children:"Add error branches (400, 500) and verify UI behavior"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Make a supertest contract",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Given a valid event, expect 201 and saved record; else 400"}),`
`,e.jsx(s.li,{children:"Document shape in OpenAPI and verify Swagger story"}),`
`]}),`
`]}),`
`,e.jsxs(s.li,{children:["Switch to real endpoint",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Backed by Supabase insert; keep the MSW path for Storybook"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(s.p,{children:"Tips"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Keep request/response shapes versioned (v1) to avoid silent drift"}),`
`,e.jsx(s.li,{children:"Prefer contract tests to detect schema breaks early"}),`
`,e.jsx(s.li,{children:"Use MSW to simulate retries/latency/error profiles (see Latency Profiles lab)"}),`
`]})]})}function p(n={}){const{wrapper:s}={...i(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(r,{...n})}):r(n)}export{p as default};

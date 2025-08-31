import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as o}from"./index-Di0Mt_3y.js";import{M as i,C as t,S as l}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function s(r){const n={code:"code",h1:"h1",h2:"h2",li:"li",p:"p",ul:"ul",...o(),...r.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"latency--error-profiles",children:"Latency & Error Profiles"}),`
`,`
`,e.jsx(i,{title:"Docs/Latency & Error Profiles"}),`
`,e.jsx(n.p,{children:"This page documents global latency and error profiles for MSW handlers and provides a live playground to see how UI and endpoints behave under different network conditions."}),`
`,e.jsx(n.h2,{id:"how-it-works",children:"How it works"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Handlers in ",e.jsx(n.code,{children:"src/mocks/handlers.ts"})," read global defaults: ",e.jsx(n.code,{children:"{ latencyMs, errorRate }"}),"."]}),`
`,e.jsxs(n.li,{children:["You can set them via a control endpoint in the mock layer:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"POST /__msw__/defaults"})," with JSON ",e.jsx(n.code,{children:"{ latencyMs: number, errorRate: number }"})]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"GET /__msw__/defaults"})," to read current config"]}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:"These defaults are applied in addition to route-specific behaviors (e.g., ETag on /api/cache, rate limiting on /api/ratelimit)."}),`
`]}),`
`,e.jsx(n.h2,{id:"network-playground",children:"Network Playground"}),`
`,e.jsx(n.p,{children:"Use the interactive playground to set defaults and run a scenario across several endpoints (lessons, quizzes, cache, ratelimit, login):"}),`
`,e.jsx(t,{children:e.jsx(l,{id:"dev-networkplayground--default"})}),`
`,e.jsx(n.p,{children:"Tips:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Start with latency 100–500ms and errorRate 0.1–0.2 to see realistic slow/error states."}),`
`,e.jsx(n.li,{children:'Click "Run Scenario" to get a full timeline of status/durations.'}),`
`]}),`
`,e.jsx(n.h2,{id:"notes",children:"Notes"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"The API Playground stories also demonstrate per-story MSW overrides (errors/timeouts/empty data)."}),`
`,e.jsxs(n.li,{children:["To disable global injection for specific requests (e.g., in the Network Playground), send header ",e.jsx(n.code,{children:"x-msw-no-defaults: 1"}),"."]}),`
`,e.jsx(n.li,{children:"You can also use the “MSW Profile” toolbar to apply presets globally (Default/Slower/Flaky/Chaos) or reset defaults."}),`
`,e.jsx(n.li,{children:'The "Live WS → SSE Fallback" demo is separate and focuses on realtime transport behavior.'}),`
`]})]})}function m(r={}){const{wrapper:n}={...o(),...r.components};return n?e.jsx(n,{...r,children:e.jsx(s,{...r})}):s(r)}export{m as default};

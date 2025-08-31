import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-Di0Mt_3y.js";import{M as a}from"./index-Dd9QK8Sf.js";import{L as r}from"./LastUpdated-4hnobFg0.js";import{I as o}from"./InlineTOC-C7is7SsK.js";import{B as d}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function s(t){const n={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...i(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"observability-stack",children:"Observability Stack"}),`
`,`
`,e.jsx(a,{title:"Observability/Observability Stack",parameters:{helpDocs:[{href:"?path=/story/specs-service-catalog--page#flows",title:"Service Catalog"},{href:"?path=/story/overview-architecture--page#layered-view",title:"Architecture"}]}}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(n.p,{children:"What exists today and how we observe it, plus planned extensions."}),`
`,e.jsx(n.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Today (in-repo) (#today)"}),`
`,e.jsx(n.li,{children:"Planned (concept) (#planned)"}),`
`,e.jsx(n.li,{children:"Guidance (#guidance)"}),`
`]}),`
`,e.jsx(o,{items:[{id:"today",label:"Today"},{id:"planned",label:"Planned"},{id:"guidance",label:"Guidance"}]}),`
`,e.jsx(n.h2,{id:"today-in-repo",children:"Today (in-repo)"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"today"}),`- Status JSON: docs/status/SYSTEM_STATUS_STATE.json consumed by status stories -
Storybook Test Runner: play() assertions; can add a11y scans - API Demos: response shapes, headers
(ETag, Retry-After) visible in stories - Network Playground: live request timeline with
status/duration`]}),`
`,e.jsx(n.h2,{id:"planned-concept",children:"Planned (concept)"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"planned"}),`- Structured client events: quiz_start, answer_submitted, quiz_completed,
network_error - Event pipeline: /api/analytics/event → aggregation store - Tracing: frontend spans
(navigation, requests) → backend spans (routes, DB) - Metrics: rate-limit counters, cache hit rates,
request latency percentiles`]}),`
`,e.jsx(n.h2,{id:"guidance",children:"Guidance"}),`
`,e.jsx("a",{id:"guidance"}),`
`,e.jsx(d,{}),`
`,e.jsxs(n.p,{children:[e.jsx(r,{note:"Observability"}),`- Use Service Catalog to find endpoints and expected
headers/status codes - Add play() checks to enforce critical invariants`]})]})}function f(t={}){const{wrapper:n}={...i(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(s,{...t})}):s(t)}export{f as default};

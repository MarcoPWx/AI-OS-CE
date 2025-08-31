import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as a}from"./index-Di0Mt_3y.js";import{M as l,C as r,S as s}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function t(i){const n={h1:"h1",h2:"h2",li:"li",p:"p",ul:"ul",...a(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"lowest-valley-journeys",children:"Lowest Valley Journeys"}),`
`,`
`,e.jsx(l,{title:"Specs/Journeys/Lowest Valley",parameters:{helpDocs:[{href:"?path=/story/specs-service-catalog--page#flows",title:"Service Catalog — Flows"}]}}),`
`,e.jsx(n.p,{children:"Resilience-first journeys that exercise error paths and recovery behaviors using the real stories and mocks in this repository."}),`
`,e.jsx(n.h2,{id:"rate-limiting-429",children:"Rate Limiting (429)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:['Open Dev/NetworkPlayground and click "Run Scenario". The 4th /api/ratelimit call returns 429 with Retry-After.',`
`,e.jsx(r,{children:e.jsx(s,{id:"dev-networkplayground--default"})}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"caching-etag--304",children:"Caching (ETag → 304)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:['Open API/Playground, select GET /api/cache, click "Call API" twice — second call returns 304 Not Modified.',`
`,e.jsx(r,{children:e.jsx(s,{id:"api-playground--default"})}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"s2s-failure-500",children:"S2S Failure (500)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Dev/S2S Orchestration: set Trace Fail At = validate and click Start to visualize degraded trace."}),`
`,e.jsxs(n.li,{children:["Deep Link: ?path=/story/dev-s2s-orchestration--default&traceFail=validate&traceDelay=300&noDefaults=1",`
`,e.jsx(r,{children:e.jsx(s,{id:"dev-s2s-orchestration--default"})}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"server-error-500",children:"Server Error (500)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["API/Playground: choose POST /api/tooltips/generate and type TRIGGER_ERROR in the input, then call.",`
`,e.jsx(r,{children:e.jsx(s,{id:"api-playground--error-lessons"})}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"empty-state-epics",children:"Empty State (Epics)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Epic Manager (Empty variant) demonstrates empty list handling and messaging.",`
`,e.jsx(r,{children:e.jsx(s,{id:"docs-epics-epic-manager--empty"})}),`
`]}),`
`]})]})}function m(i={}){const{wrapper:n}={...a(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{m as default};

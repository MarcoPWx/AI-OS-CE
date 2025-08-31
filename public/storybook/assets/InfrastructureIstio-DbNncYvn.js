import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as n}from"./index-Di0Mt_3y.js";import{M as r}from"./index-Dd9QK8Sf.js";import{I as o}from"./InlineTOC-C7is7SsK.js";import{B as c}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function t(i){const s={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...n(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"istio--ingress-egress-and-traffic-policies-concept",children:"Istio — Ingress, Egress, and Traffic Policies (concept)"}),`
`,`
`,e.jsx(r,{title:"Infrastructure/Istio — Ingress, Egress, and Traffic Policies"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(s.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Ingress (#ingress)"}),`
`,e.jsx(s.li,{children:"Egress (#egress)"}),`
`,e.jsx(s.li,{children:"Traffic Policies (#traffic)"}),`
`,e.jsx(s.li,{children:"Telemetry (#telemetry)"}),`
`,e.jsx(s.li,{children:"Notes (#notes)"}),`
`]}),`
`,e.jsx(o,{items:[{id:"ingress",label:"Ingress"},{id:"egress",label:"Egress"},{id:"traffic",label:"Traffic Policies"},{id:"telemetry",label:"Telemetry"},{id:"notes",label:"Notes"}]}),`
`,e.jsx(s.p,{children:"This is a concept document (not implemented in this repository). It outlines desired mesh policies for staged rollout and resilience."}),`
`,e.jsx(s.h2,{id:"ingress-concept",children:"Ingress (concept)"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"ingress"}),`- Gateway: TLS termination; virtual service routes to API service - Canary:
header-based or percentage-based traffic shifting`]}),`
`,e.jsx(s.h2,{id:"egress-concept",children:"Egress (concept)"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"egress"}),`- Restrict external calls; allowlisted hosts for AI/telemetry - Outbound
retries/backoff policies`]}),`
`,e.jsx(s.h2,{id:"traffic-policies-concept",children:"Traffic Policies (concept)"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"traffic"}),`- Circuit breakers and outlier detection per route - Timeouts aligned to client
expectations (e.g., 2s for login) - Retries for idempotent GETs with jitter`]}),`
`,e.jsx(s.h2,{id:"telemetry-concept",children:"Telemetry (concept)"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"telemetry"}),`- Access logs; request/response metrics; distributed tracing context
propagation`]}),`
`,e.jsx(s.h2,{id:"notes",children:"Notes"}),`
`,e.jsx("a",{id:"notes"}),`
`,e.jsxs(s.p,{children:[e.jsx(c,{}),`- Use Storybook Network Playground to reason about retry/backoff and latency budgets in
dev.`]})]})}function u(i={}){const{wrapper:s}={...n(),...i.components};return s?e.jsx(s,{...i,children:e.jsx(t,{...i})}):t(i)}export{u as default};

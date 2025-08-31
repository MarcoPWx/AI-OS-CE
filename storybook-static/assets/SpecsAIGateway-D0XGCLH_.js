import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-Di0Mt_3y.js";import{M as r}from"./index-Bpi5BZRR.js";import{B as o}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function t(i){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...s(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"ai-gateway--full-specification-concept",children:"AI Gateway — Full Specification (concept)"}),`
`,`
`,e.jsx(r,{title:"Specs/AI/AI Gateway — Full Specification"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(n.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Endpoints (concept)"}),`
`,e.jsx(n.li,{children:"Errors"}),`
`,e.jsx(n.li,{children:"Security"}),`
`,e.jsx(n.li,{children:"Observability"}),`
`,e.jsx(n.li,{children:"Notes"}),`
`]}),`
`,e.jsx(n.p,{children:"This is a concept document (not implemented in this repository). It describes the intended interface for an AI gateway used for streaming generation."}),`
`,e.jsx(n.h2,{id:"endpoints-concept",children:"Endpoints (concept)"}),`
`,e.jsx("a",{id:"endpoints"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["POST /ai/generate",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["In: ",e.jsx(n.code,{children:"{ input: string, context?: object, stream?: boolean }"})]}),`
`,e.jsxs(n.li,{children:["Out (non-stream): ",e.jsx(n.code,{children:"{ id, output: string, tokens: number, latencyMs }"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["GET /ai/stream?requestId=...",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Server-Sent Events (SSE): data: ",e.jsx(n.code,{children:"{ token: string, index: number }"})," ... data: ",e.jsx(n.code,{children:"[DONE]"})]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h2,{id:"errors",children:"Errors"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"errors"}),"- 400 validation_failed ",e.jsx(n.code,{children:"{(field, message)}"}),` - 401 unauthorized - 429
rate_limited (Retry-After) - 5xx upstream_error`]}),`
`,e.jsx(n.h2,{id:"security",children:"Security"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"security"}),`- Bearer tokens; scope-based access - PII redaction in logs; prompt content
hashing`]}),`
`,e.jsx(n.h2,{id:"observability",children:"Observability"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"observability"}),`- Events: ai_request_started, ai_token_streamed, ai_request_completed,
ai_request_failed`]}),`
`,e.jsx(n.h2,{id:"notes",children:"Notes"}),`
`,e.jsx("a",{id:"notes"}),`
`,e.jsxs(n.p,{children:[e.jsx(o,{}),`- For Storybook demos, use POST /api/tooltips/generate with TRIGGER_* inputs as a
stand-in for real streaming behavior.`]})]})}function m(i={}){const{wrapper:n}={...s(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{m as default};

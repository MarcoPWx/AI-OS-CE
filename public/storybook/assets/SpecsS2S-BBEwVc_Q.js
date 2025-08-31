import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import{M as t,C as o,S as d}from"./index-Dd9QK8Sf.js";import{I as c}from"./InlineTOC-C7is7SsK.js";import{B as a}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function s(i){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...r(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"service-to-service-orchestration",children:"Service-to-Service Orchestration"}),`
`,`
`,e.jsx(t,{title:"Specs/Service-to-Service Orchestration"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(n.p,{children:"This page documents composite flows between internal services and provides a hands-on playground."}),`
`,e.jsx(n.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Overview (#overview)"}),`
`,e.jsx(n.li,{children:"Sequence (#sequence)"}),`
`,e.jsx(n.li,{children:"Playground (#playground)"}),`
`]}),`
`,e.jsx(c,{items:[{id:"overview",label:"Overview"},{id:"sequence",label:"Sequence"},{id:"playground",label:"Playground"}]}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsx("a",{id:"overview"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Composite endpoint: POST ",e.jsx(n.code,{children:"/api/quiz/start"})]}),`
`,e.jsxs(n.li,{children:["Inputs: ",e.jsx(n.code,{children:"{ topic: string, difficulty: 'easy'|'medium'|'hard' }"})]}),`
`,e.jsxs(n.li,{children:["Outputs: ",e.jsx(n.code,{children:"{ sessionId, questions: [...], profile: {...}, validation: [...] }"})]}),`
`]}),`
`,e.jsx(n.h2,{id:"sequence",children:"Sequence"}),`
`,e.jsx("a",{id:"sequence"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-mermaid",children:`participant AE as Adaptive Engine participant LO as Learning Orchestrator participant BV as Bloom
Validator

UI->>API: POST /api/quiz/start { topic, difficulty }
API->>AE: GET /recommendations/{userId}
AE-->>API: { recommendedDifficulty, learningStyle }
API->>LO: POST /sessions/start { topic, difficulty, userId }
LO-->>API: { id, questions }
API->>BV: POST /validate/batch { questions }
BV-->>API: { results }
API-->>UI: { sessionId, questions, profile, validation }

`})}),`
`,e.jsx(n.h2,{id:"playground",children:"Playground"}),`
`,e.jsx("a",{id:"playground"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Use the Dev/S2S Orchestration story to run the composite flow with MSW."}),`
`]}),`
`,e.jsx(o,{children:e.jsx(d,{id:"dev-s2s-orchestration--default"})}),`
`,e.jsx(a,{}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{})})]})}function y(i={}){const{wrapper:n}={...r(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{y as default};

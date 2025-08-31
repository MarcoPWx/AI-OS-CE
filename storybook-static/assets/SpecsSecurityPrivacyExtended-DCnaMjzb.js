import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-Di0Mt_3y.js";import{M as r}from"./index-Bpi5BZRR.js";import{I as a}from"./InlineTOC-C7is7SsK.js";import{B as o}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function t(n){const i={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...s(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"security--privacy--extended-model",children:"Security & Privacy — Extended Model"}),`
`,`
`,e.jsx(r,{title:"Specs/Security/Security & Privacy — Extended Model"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(i.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Authentication (#auth)"}),`
`,e.jsx(i.li,{children:"Authorization (#authz)"}),`
`,e.jsx(i.li,{children:"Data Protection (#data)"}),`
`,e.jsx(i.li,{children:"Secrets (#secrets)"}),`
`,e.jsx(i.li,{children:"Privacy (#privacy)"}),`
`,e.jsx(i.li,{children:"Observability Hygiene (#obs)"}),`
`]}),`
`,e.jsx(a,{items:[{id:"auth",label:"Authentication"},{id:"authz",label:"Authorization"},{id:"data",label:"Data Protection"},{id:"secrets",label:"Secrets"},{id:"privacy",label:"Privacy"},{id:"obs",label:"Observability Hygiene"}]}),`
`,e.jsx(i.p,{children:"Expanded guidance. Items not in this repo are labeled concept."}),`
`,e.jsx(i.h2,{id:"authentication-in-repo-plan",children:"Authentication (in-repo plan)"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"auth"}),`- Supabase OAuth (GitHub) + email/password - Short-lived access tokens; refresh
rotation`]}),`
`,e.jsx(i.h2,{id:"authorization-concept",children:"Authorization (concept)"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"authz"}),"- Role-based controls on API routes - Organization scoping for multi-tenant data"]}),`
`,e.jsx(i.h2,{id:"data-protection",children:"Data Protection"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"data"}),`- PII classification; redact in client logs (in-repo guidance) - HTTPS everywhere
(deployment policy)`]}),`
`,e.jsx(i.h2,{id:"secrets",children:"Secrets"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"secrets"}),`- Never expose secrets in stories or logs - Use environment variables and secret
managers (deployment policy)`]}),`
`,e.jsx(i.h2,{id:"privacy",children:"Privacy"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"privacy"}),"- Data export/delete endpoints (stubs): /api/users/export, DELETE /api/users/me"]}),`
`,e.jsx(i.h2,{id:"observability-hygiene",children:"Observability Hygiene"}),`
`,e.jsx("a",{id:"obs"}),`
`,e.jsxs(i.p,{children:[e.jsx(o,{}),"- No plaintext tokens; include requestId; sample sizes for logs"]})]})}function b(n={}){const{wrapper:i}={...s(),...n.components};return i?e.jsx(i,{...n,children:e.jsx(t,{...n})}):t(n)}export{b as default};

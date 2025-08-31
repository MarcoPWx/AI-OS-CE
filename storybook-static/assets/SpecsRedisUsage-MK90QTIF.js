import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as t}from"./index-Di0Mt_3y.js";import{M as o}from"./index-Bpi5BZRR.js";import{I as r}from"./InlineTOC-C7is7SsK.js";import{B as a}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function n(s){const i={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...t(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"redis-usage-concept",children:"Redis Usage (concept)"}),`
`,`
`,e.jsx(o,{title:"Specs/Redis/Redis Usage"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(i.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Keyspaces (#keyspaces)"}),`
`,e.jsx(i.li,{children:"Operations (#operations)"}),`
`,e.jsx(i.li,{children:"Observability (#observability)"}),`
`,e.jsx(i.li,{children:"Alignment (#alignment)"}),`
`,e.jsx(i.li,{children:"Notes (#notes)"}),`
`]}),`
`,e.jsx(r,{items:[{id:"keyspaces",label:"Keyspaces"},{id:"operations",label:"Operations"},{id:"observability",label:"Observability"},{id:"alignment",label:"Alignment"},{id:"notes",label:"Notes"}]}),`
`,e.jsx(i.p,{children:"This is a concept document (not implemented in this repository). It outlines proposed Redis usage patterns aligned with behaviors demonstrated via MSW in Storybook."}),`
`,e.jsx(i.h2,{id:"keyspaces-concept",children:"Keyspaces (concept)"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"keyspaces"}),"- ratelimit:",clientId,`- Fields: count, resetAt - TTL: 10s (matches demo
window) - cache:etag:`,resourceKey,`- Fields: etag, payload, updatedAt - TTL: 60s (matches /api/cache
demo header) - session:quiz:`,sessionId,"- Fields: userId, categoryId, difficulty, progress - TTL: 24h"]}),`
`,e.jsx(i.h2,{id:"operations-concept",children:"Operations (concept)"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"operations"}),`- Increment rate-limit counter atomically; enforce Retry-After based on
resetAt - Serve 304 when If-None-Match == stored ETag; else update etag/payload`]}),`
`,e.jsx(i.h2,{id:"observability",children:"Observability"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"observability"}),"- Emit metrics for hits/misses, rate-limit blocks, and key evictions"]}),`
`,e.jsx(i.h2,{id:"alignment",children:"Alignment"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"alignment"}),`- Mirrors MSW demos in /api/ratelimit and /api/cache for predictable dev
parity`]}),`
`,e.jsx(i.h2,{id:"notes",children:"Notes"}),`
`,e.jsx("a",{id:"notes"}),`
`,e.jsxs(i.p,{children:[e.jsx(a,{}),"- This repository does not contain Redis code; this page is for planned design."]})]})}function u(s={}){const{wrapper:i}={...t(),...s.components};return i?e.jsx(i,{...s,children:e.jsx(n,{...s})}):n(s)}export{u as default};

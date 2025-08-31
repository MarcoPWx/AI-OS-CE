import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as o}from"./index-Di0Mt_3y.js";import{M as t,C as i,S as l}from"./index-Dd9QK8Sf.js";import{I as a}from"./InlineTOC-C7is7SsK.js";import{B as d}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(s){const n={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"user-journeys--detailed-catalog",children:"User Journeys — Detailed Catalog"}),`
`,`
`,e.jsx(t,{title:"Specs/Journeys/User Journeys — Detailed Catalog"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(n.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Lowest Valley (Resilience) (#lv)"}),`
`,e.jsx(n.li,{children:"Highest Mount (Happy Paths) (#hm)"}),`
`,e.jsx(n.li,{children:"Live Demos (#live)"}),`
`,e.jsx(n.li,{children:"Direct Links (#links)"}),`
`,e.jsx(n.li,{children:"Notes (#notes)"}),`
`]}),`
`,e.jsx(a,{items:[{id:"lv",label:"Lowest Valley"},{id:"hm",label:"Highest Mount"},{id:"live",label:"Live Demos"},{id:"links",label:"Direct Links"},{id:"notes",label:"Notes"}]}),`
`,e.jsx(n.p,{children:"A catalog of runnable journeys inside Storybook, from lowest valley (error paths) to highest mount (ideal flows)."}),`
`,e.jsx(n.h2,{id:"lowest-valley-resilience",children:"Lowest Valley (Resilience)"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"lv"}),`- Rate limiting: Dev/NetworkPlayground → Run Scenario → observe 429 path; backoff
strategies - Caching: API/Playground → GET /api/cache twice → 200 then 304 - Errors: API/Playground
→ tooltips/generate with TRIGGER_ERROR → 500 handling - Empty states: Docs/Epics/Epic Manager →
Empty story`]}),`
`,e.jsx(n.h2,{id:"highest-mount-happy-paths",children:"Highest Mount (Happy Paths)"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"hm"}),`- Lessons → Quizzes: API/Playground defaults → call lessons/quizzes; confirm OK
responses - Epic filtering: Docs/Epics/Epic Manager → use filters and search to refine - Swagger
exploration: API/Swagger → expand models and operations`]}),`
`,e.jsx(n.h2,{id:"live-demos",children:"Live Demos"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"live"}),`- WebSocket scenarios: Live/TaskBoard → switch WS Scenario toolbar to taskBoardLive
/ disconnectRecovery`]}),`
`,e.jsx(n.h2,{id:"direct-links",children:"Direct Links"}),`
`,e.jsxs(n.p,{children:[e.jsx("a",{id:"links"}),"- API Playground:"]}),`
`,e.jsx(i,{children:e.jsx(l,{id:"api-playground--default"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Network Playground:"}),`
`]}),`
`,e.jsx(i,{children:e.jsx(l,{id:"dev-networkplayground--default"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Swagger:"}),`
`]}),`
`,e.jsx(i,{children:e.jsx(l,{id:"api-swagger--default"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Epic Manager:"}),`
`]}),`
`,e.jsx(i,{children:e.jsx(l,{id:"docs-epics-epic-manager--default"})}),`
`,e.jsx(n.h2,{id:"notes",children:"Notes"}),`
`,e.jsx("a",{id:"notes"}),`
`,e.jsxs(n.p,{children:[e.jsx(d,{}),"- These journeys are grounded in MSW handlers and story variants present in this repo."]})]})}function v(s={}){const{wrapper:n}={...o(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(r,{...s})}):r(s)}export{v as default};

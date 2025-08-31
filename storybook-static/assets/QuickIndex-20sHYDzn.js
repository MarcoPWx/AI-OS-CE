import{j as s}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as l}from"./index-Di0Mt_3y.js";import{M as m}from"./index-Bpi5BZRR.js";import{r as i,R as o}from"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function h({limit:t=10}){const[e,a]=i.useState([]);i.useEffect(()=>{(async()=>{try{const n=await fetch("/docs/docs-manifest.json");if(!n.ok)return;const r=await n.json();a(r.items||[])}catch{}})()},[]);const c=i.useMemo(()=>[...e].sort((n,r)=>r.mtime-n.mtime).slice(0,t),[e,t]);return c.length===0?null:o.createElement("div",{style:{marginTop:16}},o.createElement("div",{style:{fontWeight:600,marginBottom:8}},"Recently updated"),o.createElement("ul",{style:{listStyle:"none",padding:0}},c.map(n=>o.createElement("li",{key:n.path,style:{marginBottom:6}},o.createElement("a",{href:n.path,target:"_blank",rel:"noreferrer"},n.title),o.createElement("span",{style:{marginLeft:8,opacity:.6,fontSize:12}},new Date(n.mtime).toLocaleString())))))}function d(t){const e={h1:"h1",h2:"h2",li:"li",p:"p",ul:"ul",...l(),...t.components};return s.jsxs(s.Fragment,{children:[s.jsx(e.h1,{id:"quick-index",children:"Quick Index"}),`
`,`
`,s.jsx(m,{title:"Docs/Quick Index"}),`
`,s.jsx(e.p,{children:"A curated, faster way to jump to the most useful repo docs and story-based tools inside Storybook."}),`
`,s.jsx(e.h2,{id:"most-used-repo-docs",children:"Most-used repo docs"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:"/docs/README.md"}),`
`,s.jsx(e.li,{children:"/docs/MASTER_DOCUMENTATION_INDEX.md"}),`
`,s.jsx(e.li,{children:"/docs/status/TECH_STACK_CHEAT_SHEET.md"}),`
`,s.jsx(e.li,{children:"/docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md"}),`
`,s.jsx(e.li,{children:"/docs/STORYBOOK_TESTING.md"}),`
`,s.jsx(e.li,{children:"/docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md"}),`
`,s.jsx(e.li,{children:"/docs/mocks/WEBSOCKET_MOCKS.md"}),`
`,s.jsx(e.li,{children:"/docs/API_DOCUMENTATION.md"}),`
`,s.jsx(e.li,{children:"/docs/flows/ALL_USER_FLOWS.md"}),`
`,s.jsx(e.li,{children:"/docs/flows/FLOW_COVERAGE_MATRIX.md"}),`
`,s.jsx(e.li,{children:"/docs/runbooks/ENHANCED_FEATURES_RUNBOOK.md"}),`
`,s.jsx(e.li,{children:"/docs/status/SYSTEM_STATUS_CURRENT.md"}),`
`,s.jsx(e.li,{children:"/docs/status/SYSTEM_STATUS.md"}),`
`,s.jsx(e.li,{children:"/docs/status/EPIC_MANAGEMENT_CURRENT.md"}),`
`,s.jsx(e.li,{children:"/docs/status/EPIC_MANAGEMENT.md"}),`
`,s.jsx(e.li,{children:"/docs/status/DEVLOG.md"}),`
`,s.jsx(e.li,{children:"/docs/status/BUNDLING_AND_PERFORMANCE_GUIDE.md"}),`
`,s.jsx(e.li,{children:"/docs/status/READINESS_CHECKLIST.md"}),`
`,s.jsx(e.li,{children:"/docs/auth/AUTH_WIRING_PLAN.md"}),`
`]}),`
`,s.jsx(e.p,{children:"Tip: You can also open these from the “Docs/Repo Docs Browser” story and browse within Storybook."}),`
`,s.jsx(h,{limit:10}),`
`,s.jsx(e.h2,{id:"useful-stories-and-pages",children:"Useful stories and pages"}),`
`,s.jsxs(e.ul,{children:[`
`,s.jsx(e.li,{children:"API Playground: ?path=/story/api-playground--default"}),`
`,s.jsx(e.li,{children:"Swagger UI (API Spec): ?path=/story/api-swagger--default"}),`
`,s.jsx(e.li,{children:"Repo Docs Browser: ?path=/story/docs-repo-docs-browser--default"}),`
`,s.jsx(e.li,{children:"Network Playground: ?path=/story/dev-networkplayground--default"}),`
`,s.jsx(e.li,{children:"Live Task Board (WebSocket): ?path=/story/live-taskboard--default"}),`
`,s.jsx(e.li,{children:"Mocking & Scenarios (Docs): ?path=/story/docs-mocking-scenarios--page"}),`
`,s.jsx(e.li,{children:"Tech Stack + API (Docs): ?path=/story/docs-tech-stack-api--page"}),`
`,s.jsx(e.li,{children:"Portfolio Overview (Docs): ?path=/story/docs-portfolio-overview--page"}),`
`]})]})}function f(t={}){const{wrapper:e}={...l(),...t.components};return e?s.jsx(e,{...t,children:s.jsx(d,{...t})}):d(t)}export{f as default};

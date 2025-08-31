import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import{M as n,C as i,S as d}from"./index-Dd9QK8Sf.js";import{L as a}from"./LastUpdated-4hnobFg0.js";import{I as l}from"./InlineTOC-C7is7SsK.js";import{B as c}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function o(t){const s={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...r(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"system-status--full-spec",children:"System Status — Full Spec"}),`
`,`
`,e.jsx(n,{title:"Specs/System Status — Full Spec",parameters:{helpDocs:[{href:"?path=/story/overview-architecture--page#layered-view",title:"Architecture"}]}}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(s.p,{children:"Source of truth lives in the repository and is viewable via the Repo Docs Browser. The status JSON is used by stories to display the current state."}),`
`,e.jsx(s.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Repo Docs (#repo-docs)"}),`
`,e.jsx(s.li,{children:"JSON Shape (#json)"}),`
`,e.jsx(s.li,{children:"Related Story (#related)"}),`
`]}),`
`,e.jsx(l,{items:[{id:"repo-docs",label:"Repo Docs"},{id:"json",label:"JSON Shape"},{id:"related",label:"Related"}]}),`
`,e.jsx(s.h2,{id:"repo-docs",children:"Repo Docs"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"repo-docs"}),"- /docs/status/SYSTEM_STATUS_CURRENT.md - /docs/status/SYSTEM_STATUS.md"]}),`
`,e.jsx(i,{children:e.jsx(d,{id:"docs-repo-docs-browser--default"})}),`
`,e.jsx(s.h2,{id:"json-shape-served-file",children:"JSON Shape (served file)"}),`
`,e.jsx("a",{id:"json"}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{children:`{ "status": "green|degraded|outage|unknown", "lastValidated": "ISO8601" }
`})}),`
`,e.jsx(s.h2,{id:"related-story",children:"Related Story"}),`
`,e.jsx("a",{id:"related"}),`
`,e.jsx(c,{}),`
`,e.jsxs(s.p,{children:[e.jsx(a,{note:"System Status Full Spec"}),"- Docs/System Status (links to current docs)"]})]})}function v(t={}){const{wrapper:s}={...r(),...t.components};return s?e.jsx(s,{...t,children:e.jsx(o,{...t})}):o(t)}export{v as default};

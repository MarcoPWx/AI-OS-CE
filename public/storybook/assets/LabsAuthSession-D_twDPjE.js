import{j as s}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as t}from"./index-Di0Mt_3y.js";import{M as o}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function i(e){const n={h1:"h1",li:"li",ol:"ol",p:"p",ul:"ul",...t(),...e.components};return s.jsxs(s.Fragment,{children:[s.jsx(n.h1,{id:"labs-auth--session--mock-flows-and-guards",children:"Labs: Auth & Session — Mock flows and guards"}),`
`,`
`,s.jsx(o,{title:"Labs/Auth & Session"}),`
`,s.jsx(n.p,{children:"What this lab covers"}),`
`,s.jsxs(n.ul,{children:[`
`,s.jsx(n.li,{children:"Mock auth flows (email/GitHub), session persistence, and guarded actions"}),`
`]}),`
`,s.jsx(n.p,{children:"Stories to use"}),`
`,s.jsxs(n.ul,{children:[`
`,s.jsx(n.li,{children:"src/stories/AuthSmoke.stories.tsx — high-level smoke"}),`
`,s.jsx(n.li,{children:"src/stories/AuthMSWFlow.stories.tsx — MSW-backed scenarios"}),`
`,s.jsx(n.li,{children:"AppWithAuth.tsx — wraps AuthContext; shows MockBanner in mock mode"}),`
`]}),`
`,s.jsx(n.p,{children:"Docs"}),`
`,s.jsxs(n.ul,{children:[`
`,s.jsx(n.li,{children:".storybook/stories/SpecsSecurityPrivacyExtended.mdx (auth considerations)"}),`
`,s.jsx(n.li,{children:".storybook/stories/SpecsServiceCatalog.mdx (auth endpoints)"}),`
`]}),`
`,s.jsx(n.p,{children:"Exercises"}),`
`,s.jsxs(n.ol,{children:[`
`,s.jsxs(n.li,{children:["Session persistence",`
`,s.jsxs(n.ul,{children:[`
`,s.jsx(n.li,{children:"Login via mock flow; reload; confirm user restored"}),`
`]}),`
`]}),`
`,s.jsxs(n.li,{children:["Guarded actions",`
`,s.jsxs(n.ul,{children:[`
`,s.jsx(n.li,{children:"Attempt a protected action while logged out → expect blocked"}),`
`,s.jsx(n.li,{children:"Login and re-try → expect allowed"}),`
`]}),`
`]}),`
`,s.jsxs(n.li,{children:["Error paths",`
`,s.jsxs(n.ul,{children:[`
`,s.jsx(n.li,{children:"Simulate 401/403 in MSW; verify UI states"}),`
`]}),`
`]}),`
`]})]})}function j(e={}){const{wrapper:n}={...t(),...e.components};return n?s.jsx(n,{...e,children:s.jsx(i,{...e})}):i(e)}export{j as default};

import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(s){const e={h1:"h1",li:"li",ol:"ol",p:"p",ul:"ul",...i(),...s.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.h1,{id:"labs-security--privacy--headers-and-data-handling",children:"Labs: Security & Privacy — Headers and data handling"}),`
`,`
`,n.jsx(t,{title:"Labs/Security & Privacy"}),`
`,n.jsx(e.p,{children:"What this lab covers"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Security headers, auth risks, data handling (no PII in logs), and rate limits"}),`
`]}),`
`,n.jsx(e.p,{children:"Stories/Docs to use"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"src/stories/SecurityPlayground.stories.tsx — interactive checks"}),`
`,n.jsx(e.li,{children:".storybook/stories/SpecsSecurityPrivacyExtended.mdx — extended model"}),`
`,n.jsx(e.li,{children:".storybook/stories/SpecsServiceCatalog.mdx — endpoints and policies"}),`
`]}),`
`,n.jsx(e.p,{children:"Exercises"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:["Headers",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Enumerate desired headers (CSP, HSTS, X-Frame-Options, etc.)"}),`
`,n.jsx(e.li,{children:"Note current status; capture deltas for API layer"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["Data handling",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Grep for console.* and ensure no PII or secrets; keep structured logs"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["Auth risks",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Walk auth stories for token handling; ensure memory-only and no leaks"}),`
`]}),`
`]}),`
`]})]})}function j(s={}){const{wrapper:e}={...i(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(r,{...s})}):r(s)}export{j as default};

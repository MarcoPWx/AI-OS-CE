import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import{M as l}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function i(s){const e={code:"code",h1:"h1",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...r(),...s.components};return n.jsxs(n.Fragment,{children:[n.jsx(e.h1,{id:"labs-sentry--crash--release-health-expoeas",children:"Labs: Sentry — Crash & Release Health (Expo/EAS)"}),`
`,`
`,n.jsx(l,{title:"Labs/Sentry — Crash & Release Health"}),`
`,n.jsx(e.p,{children:"Goal"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Capture JS/native crashes and release health in iOS/Android builds with minimal friction. Keep it off by default; enable via env when needed."}),`
`]}),`
`,n.jsx(e.p,{children:"Two approaches"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsx(e.li,{children:"sentry-expo (recommended for Expo/EAS)"}),`
`]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Pros: Auto source-map upload and symbolication in EAS builds"}),`
`,n.jsxs(e.li,{children:["Steps (overview):",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Install: expo install sentry-expo"}),`
`,n.jsxs(e.li,{children:["Config: add plugin to app.json/app.config.js",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:'plugins: ["sentry-expo"]'}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["Init in app entry and gate via env:",`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-ts",children:`import * as Sentry from 'sentry-expo';

if (process.env.EXPO_PUBLIC_ENABLE_SENTRY === '1' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableInExpoDevelopment: true,
    debug: false,
    tracesSampleRate: 0.1,
  });
}
`})}),`
`]}),`
`,n.jsx(e.li,{children:"Build with EAS; source maps upload automatically"}),`
`]}),`
`]}),`
`]}),`
`,n.jsxs(e.ol,{start:"2",children:[`
`,n.jsx(e.li,{children:"@sentry/react-native (already present)"}),`
`]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Pros: No extra dependency"}),`
`,n.jsx(e.li,{children:"Cons: Manual source-map and native symbol uploads in EAS builds"}),`
`,n.jsxs(e.li,{children:["Steps (overview):",`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Init in app entry (gate via env):",`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-ts",children:`import * as Sentry from '@sentry/react-native';

if (process.env.EXPO_PUBLIC_ENABLE_SENTRY === '1' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.1,
  });
}
`})}),`
`]}),`
`,n.jsx(e.li,{children:"Configure CLI to upload JS source maps and native symbols during EAS builds"}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.p,{children:"Env and secrets"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Do not print SENTRY_DSN. Set SENTRY_DSN and EXPO_PUBLIC_ENABLE_SENTRY=1 in the build environment when you want crash capture."}),`
`,n.jsx(e.li,{children:"Keep it off (default) for mock UI iteration builds."}),`
`]}),`
`,n.jsx(e.p,{children:"Validation steps"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Trigger a test exception in a sandbox screen when EXPO_PUBLIC_ENABLE_SENTRY=1"}),`
`,n.jsx(e.li,{children:"Confirm event appears in Sentry with readable stack"}),`
`,n.jsx(e.li,{children:"Verify release health tracks crash-free users (optional)"}),`
`]}),`
`,n.jsx(e.p,{children:"Interview talk track"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Explain the gating: crashes on when needed, off for pure UI sessions"}),`
`,n.jsx(e.li,{children:"sentry-expo vs @sentry/react-native tradeoffs"}),`
`,n.jsx(e.li,{children:"Show how symbolication/source maps work so stacks are readable"}),`
`]})]})}function u(s={}){const{wrapper:e}={...r(),...s.components};return e?n.jsx(e,{...s,children:n.jsx(i,{...s})}):i(s)}export{u as default};

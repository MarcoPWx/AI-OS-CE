import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import{M as o}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function l(i){const e={h1:"h1",li:"li",ol:"ol",p:"p",ul:"ul",...r(),...i.components},{MockBanner:s}=e;return s||c("MockBanner"),n.jsxs(n.Fragment,{children:[n.jsx(e.h1,{id:"labs-mobile-mock-beta--on-device-ui-iteration",children:"Labs: Mobile Mock Beta — On-Device UI Iteration"}),`
`,`
`,n.jsx(o,{title:"Labs/Mobile Mock Beta"}),`
`,n.jsx(e.p,{children:"What this lab covers"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Run the app on iOS/Android using 100% mocks (no real backend)"}),`
`,n.jsx(e.li,{children:"See the Demo/Mock banner overlay and verify console logs"}),`
`,n.jsx(e.li,{children:"Understand how mock gating works in code and which env vars control it"}),`
`]}),`
`,n.jsx(e.p,{children:"Quickstart"}),`
`,n.jsxs(e.ol,{children:[`
`,n.jsxs(e.li,{children:["Set env for mock mode",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"EXPO_PUBLIC_USE_ALL_MOCKS=1"}),`
`,n.jsx(e.li,{children:"EXPO_PUBLIC_MOCK_BANNER=1"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["Build/run on device or simulator (dev build)",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"iOS: run a dev build then install on simulator/device"}),`
`,n.jsx(e.li,{children:"Android: run a dev build then install on emulator/device"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["Smoke path (device)",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Launch → Home → Category → Quiz → Results"}),`
`,n.jsx(e.li,{children:"Toggle network off (airplane mode) and repeat → should still work"}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.p,{children:"How it works (code pointers)"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["Banner overlay",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"src/components/MockBanner.tsx — visible when mock flags are on"}),`
`,n.jsxs(e.li,{children:["AppWithAuth.tsx — renders ",n.jsx(s,{})," if USE_MOCKS/EXPO_PUBLIC_USE_ALL_MOCKS/EXPO_PUBLIC_MOCK_BANNER is set"]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["Mock gating for Supabase",`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:["lib/supabase.ts (RN)",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Uses mock client when EXPO_PUBLIC_USE_ALL_MOCKS=1 or USE_MOCKS=true"}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["src/lib/supabase.ts (web/shared)",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Prefers mock Supabase when USE_MOCKS=true or EXPO_PUBLIC_USE_ALL_MOCKS=1"}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,n.jsxs(e.li,{children:["MSW (web only)",`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"In App.tsx, MSW is started in web when EXPO_PUBLIC_USE_MSW=1 or EXPO_PUBLIC_USE_ALL_MOCKS=1"}),`
`]}),`
`]}),`
`]}),`
`,n.jsx(e.p,{children:"Acceptance criteria (Mobile Mock Beta)"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"Build: EAS dev/preview builds install and run on-device with only mock services"}),`
`,n.jsx(e.li,{children:"UX: Core quiz loop stable; visuals themed; mock banner visible"}),`
`,n.jsx(e.li,{children:"Privacy: No secrets; no PII"}),`
`,n.jsx(e.li,{children:"QA: Smoke path passes on iOS and Android"}),`
`,n.jsx(e.li,{children:"Docs: DevLog/System Status updated"}),`
`]}),`
`,n.jsx(e.p,{children:"Troubleshooting"}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"If you see network errors, ensure mock flags are set and any real client init is guarded"}),`
`,n.jsx(e.li,{children:"If banner doesn’t show, verify EXPO_PUBLIC_MOCK_BANNER=1 or USE_MOCKS=true"}),`
`,n.jsx(e.li,{children:"If logs are missing, use a dev build and run in a debugger (Flipper/Xcode/Android Studio)"}),`
`]})]})}function m(i={}){const{wrapper:e}={...r(),...i.components};return e?n.jsx(e,{...i,children:n.jsx(l,{...i})}):l(i)}function c(i,e){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{m as default};

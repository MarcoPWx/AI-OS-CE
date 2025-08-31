import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as s}from"./index-Di0Mt_3y.js";import{M as l}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(e){const i={h1:"h1",li:"li",p:"p",ul:"ul",...s(),...e.components};return n.jsxs(n.Fragment,{children:[n.jsx(i.h1,{id:"labs-device-matrix--iosandroid-smoke-and-interview-demo",children:"Labs: Device Matrix — iOS/Android smoke and interview demo"}),`
`,`
`,n.jsx(l,{title:"Labs/Device Matrix"}),`
`,n.jsx(i.p,{children:"Purpose"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"Run a fast, repeatable device matrix to de-risk crashes and showcase workflow in interviews."}),`
`]}),`
`,n.jsx(i.p,{children:"Matrix (minimum viable)"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"iPhone 13/14 (iOS 17.x)"}),`
`,n.jsx(i.li,{children:"Pixel 6/7 (Android 13/14)"}),`
`,n.jsx(i.li,{children:"Optional: low-end Android (Android 12) for perf sanity"}),`
`]}),`
`,n.jsx(i.p,{children:"Build flavor"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsxs(i.li,{children:["Dev/preview builds with mocks on-device",`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"EXPO_PUBLIC_USE_ALL_MOCKS=1"}),`
`,n.jsx(i.li,{children:"EXPO_PUBLIC_MOCK_BANNER=1"}),`
`]}),`
`]}),`
`,n.jsx(i.li,{children:"Keep logs enabled (Xcode/Android Studio/Flipper)"}),`
`]}),`
`,n.jsx(i.p,{children:"Smoke scenarios (each device)"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"Cold launch → Home → pick Category → 10 Q quiz → Results"}),`
`,n.jsx(i.li,{children:"Airplane mode repeat (offline fallback)"}),`
`,n.jsx(i.li,{children:"Theme spot check (light/dark)"}),`
`,n.jsx(i.li,{children:"Background/resume during quiz"}),`
`,n.jsx(i.li,{children:"Rotations (Android), notch/safe areas (iOS)"}),`
`,n.jsx(i.li,{children:"Basic a11y: labels present on key controls"}),`
`]}),`
`,n.jsx(i.p,{children:"What to capture"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"Time to first interaction (rough)"}),`
`,n.jsx(i.li,{children:"Any jank/crash points and red screens"}),`
`,n.jsx(i.li,{children:"Screenshots for store listing (portrait)"}),`
`,n.jsx(i.li,{children:"Console warnings around transitions"}),`
`]}),`
`,n.jsx(i.p,{children:"Exit criteria"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"No crashes, no unhandled rejections/red screens"}),`
`,n.jsx(i.li,{children:"Smooth quiz loop; offline fallback works"}),`
`,n.jsx(i.li,{children:"No obvious layout issues across device families"}),`
`]}),`
`,n.jsx(i.p,{children:"Interview talk track"}),`
`,n.jsxs(i.ul,{children:[`
`,n.jsx(i.li,{children:"Start at Labs/Index → Labs/Mobile Mock Beta"}),`
`,n.jsx(i.li,{children:"Explain mock gating, banner, and why we iterate UI first"}),`
`,n.jsx(i.li,{children:"Walk the device smoke checklist live, narrate findings"}),`
`,n.jsx(i.li,{children:"Close with Labs/S2S Orchestration to demonstrate contract-first thinking"}),`
`]})]})}function u(e={}){const{wrapper:i}={...s(),...e.components};return i?n.jsx(i,{...e,children:n.jsx(r,{...e})}):r(e)}export{u as default};

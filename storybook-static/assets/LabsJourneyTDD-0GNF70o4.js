import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(s){const n={h1:"h1",li:"li",ol:"ol",p:"p",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"labs-journeydriven-tdd--mocks-first-then-msw",children:"Labs: Journey‑Driven TDD — Mocks First, Then MSW"}),`
`,`
`,e.jsx(t,{title:"Labs/Journey‑Driven TDD"}),`
`,e.jsx(n.p,{children:"Why"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Build features by walking a real user journey, driving it with tests and mocks."}),`
`,e.jsx(n.li,{children:"Start with pure UI and fake data; then plug in MSW contract; finally migrate to real services."}),`
`]}),`
`,e.jsx(n.p,{children:"Recipe (RGR)"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Red — write or adjust a failing story/test",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Use play() in a journey demo or a component story to encode Given/When/Then"}),`
`,e.jsx(n.li,{children:"Example: QuizFlowDemo play() asserts 10 Q journey completes"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Green — make the smallest change to pass",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Use mock data first (EXPO_PUBLIC_USE_ALL_MOCKS=1)"}),`
`,e.jsx(n.li,{children:"Avoid wiring real clients; keep tests deterministic"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Refactor — clean up while still green",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Extract helpers; clarify names; remove dead code"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:"MSW contract step"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Create a handler that matches the intended endpoint (e.g., POST /api/quiz/start)"}),`
`,e.jsx(n.li,{children:"Update story play() to assert shape/status; add error branches (400/500)"}),`
`,e.jsx(n.li,{children:"Once stable, keep MSW for Storybook, start real endpoint wiring guarded by env"}),`
`]}),`
`,e.jsx(n.p,{children:"Where to try it"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"User journeys: ?path=/story/labs-user-journeys--page"}),`
`,e.jsx(n.li,{children:"S2S orchestration: ?path=/story/labs-s2s-orchestration--page"}),`
`,e.jsx(n.li,{children:"API Playground: ?path=/story/api-playground--default"}),`
`,e.jsx(n.li,{children:"Quiz flow demo: ?path=/story/quizflowdemo--default"}),`
`]}),`
`,e.jsx(n.p,{children:"Tips"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Keep tests short and purposeful; assert behaviors not implementation"}),`
`,e.jsx(n.li,{children:"Use global MSW profile toolbar (default/slower/flaky/chaos) to harden behaviors"}),`
`,e.jsx(n.li,{children:"Record learnings in DevLog and link user journeys to epics"}),`
`]})]})}function u(s={}){const{wrapper:n}={...i(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(r,{...s})}):r(s)}export{u as default};

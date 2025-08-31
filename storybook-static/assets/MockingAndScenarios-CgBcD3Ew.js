import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as l}from"./index-Di0Mt_3y.js";import{M as c,C as i,S as r}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function o(n){const s={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",strong:"strong",ul:"ul",...l(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"mocking--scenarios",children:"Mocking & Scenarios"}),`
`,e.jsxs(s.blockquote,{children:[`
`,e.jsxs(s.p,{children:["Web-only docs page. Use ",e.jsx(s.code,{children:"npm run storybook"})," and open http://localhost:7007."]}),`
`]}),`
`,`
`,e.jsx(c,{title:"Docs/Mocking & Scenarios"}),`
`,e.jsx(s.h1,{id:"mocking--scenarios-1",children:"Mocking & Scenarios"}),`
`,e.jsx(s.p,{children:"This page summarizes how our stories use HTTP mocks (MSW) and WebSocket mock scenarios."}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"API Playground story exercises HTTP endpoints via MSW."}),`
`,e.jsx(s.li,{children:"Live Task Board story demonstrates a real-time feed via the WebSocket mock."}),`
`,e.jsx(s.li,{children:"The WS Scenario toolbar lets you switch deterministic scenarios on the fly."}),`
`]}),`
`,e.jsx(s.h2,{id:"http-mocking-msw",children:"HTTP mocking (MSW)"}),`
`,e.jsx(s.p,{children:"Handlers:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"GET /api/lessons, GET /api/quizzes: sample data"}),`
`,e.jsx(s.li,{children:"GET /api/cache: ETag + Cache-Control; call twice → 304"}),`
`,e.jsx(s.li,{children:"GET /api/ratelimit: multiple calls → 429 with Retry-After"}),`
`,e.jsx(s.li,{children:"POST /api/login: mock token"}),`
`,e.jsxs(s.li,{children:["POST /api/tooltips/generate: special triggers in the ",e.jsx(s.code,{children:"input"})," body",`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"TRIGGER_RATE_LIMIT → 429 with Retry-After"}),`
`,e.jsx(s.li,{children:"TRIGGER_ERROR → 500 error"}),`
`,e.jsx(s.li,{children:"TRIGGER_CACHED → 200 with ETag; next call → 304"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(s.h2,{id:"websocket-scenarios",children:"WebSocket scenarios"}),`
`,e.jsx(s.p,{children:"Use the WS Scenario toolbar (top in Storybook):"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"lobbyBasic (default)"}),`
`,e.jsx(s.li,{children:"matchHappyPath (fast countdown + questions)"}),`
`,e.jsx(s.li,{children:"disconnectRecovery (brief disconnect)"}),`
`,e.jsx(s.li,{children:"taskBoardLive (periodic task:update events)"}),`
`]}),`
`,e.jsxs(s.p,{children:["Live Task Board is pre-configured with ",e.jsx(s.code,{children:"globals: { wsScenario: 'taskBoardLive' }"}),"."]}),`
`,e.jsx(s.h2,{id:"try-it",children:"Try it"}),`
`,e.jsx(s.h3,{id:"api-playground",children:"API Playground"}),`
`,e.jsx(i,{children:e.jsx(r,{id:"api-playground--default"})}),`
`,e.jsx(s.p,{children:"Tips:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Switch endpoints in the dropdown"}),`
`,e.jsx(s.li,{children:"For tooltips, type TRIGGER_* words into the input"}),`
`]}),`
`,e.jsx(s.h3,{id:"live-task-board",children:"Live Task Board"}),`
`,e.jsx(i,{children:e.jsx(r,{id:"live-taskboard--default"})}),`
`,e.jsx(s.p,{children:"Use the WS toolbar to switch scenarios."}),`
`,e.jsx(s.h3,{id:"live-ws--sse-fallback-real-sse",children:"Live WS → SSE fallback (real SSE)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Start SSE server in another terminal: ",e.jsx(s.code,{children:"npm run sse:demo"})," (serves http://localhost:3002/api/sse-demo)"]}),`
`,e.jsxs(s.li,{children:["Or run both Storybook + SSE at once: ",e.jsx(s.code,{children:"npm run storybook:with-sse"})]}),`
`,e.jsx(s.li,{children:"Then open the WS→SSE fallback demo:"}),`
`]}),`
`,e.jsx(i,{children:e.jsx(r,{id:"live-ws-sse-fallback--default"})}),`
`,e.jsx(s.h2,{id:"where-to-find-things",children:"Where to find things"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"HTTP mocks (MSW): src/mocks/handlers.ts; wired in .storybook/preview.ts"}),`
`,e.jsx(s.li,{children:"Per-story overrides: see ApiPlayground story parameters (msw.handlers)"}),`
`,e.jsxs(s.li,{children:["Global defaults: “MSW Profile” toolbar; control endpoints /",e.jsx(s.strong,{children:"msw"}),"/defaults"]}),`
`,e.jsxs(s.li,{children:["Disable defaults per-request: set header ",e.jsx(s.code,{children:"x-msw-no-defaults: 1"})," (NetworkPlayground has a toggle)"]}),`
`,e.jsxs(s.li,{children:["Per-story no-defaults: set story parameter ",e.jsx(s.code,{children:"mswNoDefaults: true"})," to auto-inject the header via fetch wrapper"]}),`
`,e.jsx(s.li,{children:"Defaults chip: small pill showing current latency/error; used in API/Playground"}),`
`,e.jsx(s.li,{children:"WebSocket mock: src/services/mockWebSocket.ts; scenario via WS toolbar or WS_MOCK_SCENARIO"}),`
`,e.jsx(s.li,{children:"API docs: API/Swagger story renders public/swagger.json"}),`
`,e.jsx(s.li,{children:"Live demos: Live/TaskBoard (WS), Live/WS SSE Fallback (SSE)"}),`
`,e.jsx(s.li,{children:"Repo docs: Docs/Repo Docs Browser reads Markdown from /docs; Docs/Quick Index lists the most-used files"}),`
`,e.jsx(s.li,{children:"Flags: USE_MOCKS, EXPO_PUBLIC_USE_MSW, EXPO_PUBLIC_USE_WS_MOCKS, EXPO_PUBLIC_USE_ALL_MOCKS"}),`
`]}),`
`,e.jsx(s.h2,{id:"related-documentation",children:"Related documentation"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Local guide: docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md"}),`
`,e.jsx(s.li,{children:"Storybook + MSW Testing: docs/STORYBOOK_TESTING.md"}),`
`,e.jsx(s.li,{children:"WS API: docs/WEBSOCKET_API.md"}),`
`,e.jsx(s.li,{children:"WS Mocks: docs/mocks/WEBSOCKET_MOCKS.md"}),`
`,e.jsx(s.li,{children:"Service Mocking Architecture: docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md"}),`
`]})]})}function u(n={}){const{wrapper:s}={...l(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(o,{...n})}):o(n)}export{u as default};

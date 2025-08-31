import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as o}from"./index-Di0Mt_3y.js";import{M as r,C as t,S as i}from"./index-Dd9QK8Sf.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function l(s){const n={a:"a",blockquote:"blockquote",h1:"h1",h2:"h2",li:"li",p:"p",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"tech-stack--api-playground",children:"Tech Stack + API Playground"}),`
`,`
`,e.jsx(r,{title:"Docs/Tech Stack + API"}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["Looking for a guided, hands-on exploration? Open the Technology Overview Lab: ",e.jsx(n.a,{href:"?path=/story/labs-technology-overview-lab--page",children:"Labs/Technology Overview Lab"})]}),`
`]}),`
`,e.jsx(n.h2,{id:"tech-stack-cheat-sheet-condensed",children:"Tech Stack Cheat Sheet (condensed)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Platforms: TypeScript 5.x, React 19 (web), React Native 0.79 (Expo 53)"}),`
`,e.jsx(n.li,{children:"UI: react-native + react-native-web, React DOM"}),`
`,e.jsx(n.li,{children:"Data: TanStack Query, fetch/axios, AsyncStorage/localStorage"}),`
`,e.jsx(n.li,{children:"Styling: nativewind + tailwindcss, gradients, platform tokens"}),`
`,e.jsx(n.li,{children:"Realtime: WebSocket, socket.io-client (optional)"}),`
`,e.jsx(n.li,{children:"Backend: Supabase (Auth, Postgres, Realtime)"}),`
`,e.jsx(n.li,{children:"Mocks: MSW v2 (web/tests) + MockEngine (RN), MockWebSocket"}),`
`,e.jsx(n.li,{children:"Storybook: v8, Test Runner (play()), Chromatic"}),`
`,e.jsx(n.li,{children:"API Docs: Swagger UI, API Playground"}),`
`]}),`
`,e.jsx(n.p,{children:"Links:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"docs/status/TECH_STACK_CHEAT_SHEET.md"}),`
`,e.jsx(n.li,{children:"docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md"}),`
`,e.jsx(n.li,{children:"docs/mocks/WEBSOCKET_MOCKS.md"}),`
`,e.jsx(n.li,{children:"docs/STORYBOOK_TESTING.md"}),`
`,e.jsx(n.li,{children:"docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md"}),`
`,e.jsx(n.li,{children:"Docs/Quick Index (Storybook): ?path=/story/docs-quick-index--page"}),`
`]}),`
`,e.jsx(n.h2,{id:"interactive-api-playground",children:"Interactive: API Playground"}),`
`,e.jsx(t,{children:e.jsx(i,{id:"api-playground--default"})}),`
`,e.jsx(n.p,{children:"Tips:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:'Select endpoint in the dropdown and click "Call API"'}),`
`,e.jsx(n.li,{children:"For tooltips, try typing TRIGGER_ERROR, TRIGGER_RATE_LIMIT, TRIGGER_CACHED"}),`
`]}),`
`,e.jsx(n.h2,{id:"api-reference-swagger",children:"API Reference (Swagger)"}),`
`,e.jsx(t,{children:e.jsx(i,{id:"api-swagger--default"})}),`
`,e.jsx(n.h2,{id:"live-ws--sse-fallback-real-sse",children:"Live WS → SSE Fallback (Real SSE)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Start the SSE demo server in another terminal:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"npm run sse:demo (default http://localhost:3002/api/sse-demo)"}),`
`,e.jsx(n.li,{children:"Or run both automatically: npm run storybook:with-sse"}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:"Then use the controls below to start/stop and tweak endpoints."}),`
`,e.jsx(n.li,{children:'For auth-protected streams, enable "Use fetch-based SSE" and set Authorization/X-Custom headers (native EventSource does not support custom headers).'}),`
`]}),`
`,e.jsx(t,{children:e.jsx(i,{id:"live-ws-sse-fallback--default"})})]})}function m(s={}){const{wrapper:n}={...o(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(l,{...s})}):l(s)}export{m as default};

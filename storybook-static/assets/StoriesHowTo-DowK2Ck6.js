import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-Di0Mt_3y.js";import{M as o}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function i(n){const s={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",ul:"ul",...r(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"how-to-write-and-maintain-stories-csf--mdx",children:"How to write and maintain stories (CSF + MDX)"}),`
`,e.jsxs(s.blockquote,{children:[`
`,e.jsxs(s.p,{children:["Web-only docs page. Use ",e.jsx(s.code,{children:"npm run storybook"})," and open http://localhost:7007."]}),`
`]}),`
`,`
`,e.jsx(o,{title:"Docs/Stories How-To"}),`
`,e.jsx(s.h1,{id:"stories-how-to",children:"Stories: How-To"}),`
`,e.jsx(s.p,{children:"Authoring reference"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"See docs/status/AUTHORING_MDX_GUIDE.md for MDX authoring patterns (Canvas/Story/Controls, naming conventions)."}),`
`]}),`
`,e.jsx(s.h2,{id:"csf-vs-mdx",children:"CSF vs MDX"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["CSF (",e.jsx(s.code,{children:".stories.tsx"}),") is the source of truth for executable examples, tests (play functions), and Chromatic."]}),`
`,e.jsxs(s.li,{children:["MDX (",e.jsx(s.code,{children:".mdx"}),") is for narrative docs that stitch multiple CSF stories together; web-only."]}),`
`]}),`
`,e.jsx(s.h2,{id:"where-to-put-things",children:"Where to put things"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Co-locate CSF with components: ",e.jsx(s.code,{children:"src/components/<Name>/<Name>.stories.tsx"}),"."]}),`
`,e.jsxs(s.li,{children:["Flows and demos: ",e.jsx(s.code,{children:"src/stories/*.stories.tsx"}),"."]}),`
`,e.jsxs(s.li,{children:["Narrative docs: ",e.jsx(s.code,{children:".storybook/stories/*.mdx"}),"."]}),`
`]}),`
`,e.jsx(s.h2,{id:"definition-of-done-per-story",children:"Definition of Done (per story)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Covers key states: default, loading, empty/disabled, error, success."}),`
`,e.jsx(s.li,{children:"Args wired to Controls with sensible defaults."}),`
`,e.jsxs(s.li,{children:["One ",e.jsx(s.code,{children:"play()"})," function for a primary user action (where meaningful)."]}),`
`,e.jsx(s.li,{children:"Optional per-story MSW overrides for error/timeout."}),`
`,e.jsxs(s.li,{children:[e.jsx(s.code,{children:"parameters.docs.description"})," includes usage/context."]}),`
`,e.jsx(s.li,{children:"Deterministic output for Chromatic (animations settled; disable snapshots if too dynamic)."}),`
`,e.jsx(s.li,{children:"Renders on RN on-device or explicitly marked web-only."}),`
`]}),`
`,e.jsx(s.h2,{id:"msw-per-story-overrides",children:"MSW per-story overrides"}),`
`,e.jsxs(s.p,{children:["Use ",e.jsx(s.code,{children:"parameters.msw.handlers"})," to override endpoints per story:"]}),`
`,e.jsx(s.pre,{children:e.jsx(s.code,{className:"language-ts",children:`export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [http.get('/api/lessons', () => new HttpResponse('Server error', { status: 500 }))],
    },
  },
};
`})}),`
`,e.jsx(s.h2,{id:"ws-scenarios-toolbar",children:"WS scenarios (toolbar)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Use the toolbar to pick: ",e.jsx(s.code,{children:"lobbyBasic | matchHappyPath | disconnectRecovery | taskBoardLive"}),"."]}),`
`,e.jsxs(s.li,{children:["The mock WebSocket reads ",e.jsx(s.code,{children:"window.__WS_MOCK_SCENARIO__"}),"."]}),`
`]}),`
`,e.jsx(s.h2,{id:"theme--platform-toolbar",children:"Theme & Platform (toolbar)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["Theme: ",e.jsx(s.code,{children:"light | dark"}),"."]}),`
`,e.jsxs(s.li,{children:["Platform: ",e.jsx(s.code,{children:"web | ios | android"})," (cosmetic tokens for fonts/radii)."]}),`
`]}),`
`,e.jsx(s.h2,{id:"checklist-quick",children:"Checklist (quick)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"[ ] Default + important states"}),`
`,e.jsx(s.li,{children:"[ ] Controls wired for interactive props"}),`
`,e.jsx(s.li,{children:"[ ] Docs description explains intent"}),`
`,e.jsx(s.li,{children:"[ ] One play() for core interaction"}),`
`,e.jsx(s.li,{children:"[ ] Per-story MSW overrides for error/timeout if applicable"}),`
`,e.jsx(s.li,{children:"[ ] Stable Chromatic snapshot (or disabled when noisy)"}),`
`]}),`
`,e.jsx(s.h2,{id:"examples",children:"Examples"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"API Playground: MSW + interaction"}),`
`,e.jsx(s.li,{children:"Live Task Board: WebSocket scenario (taskBoardLive)"}),`
`,e.jsx(s.li,{children:"LessonCard: Interactive story with play()"}),`
`]}),`
`,e.jsx(s.h2,{id:"related-docs",children:"Related docs"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"docs/status/STORYBOOK_AND_DOCS_DECISIONS.md"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"docs/STORYBOOK_TESTING.md"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md"})}),`
`,e.jsx(s.li,{children:e.jsx(s.code,{children:"docs/mocks/WEBSOCKET_MOCKS.md"})}),`
`]})]})}function m(n={}){const{wrapper:s}={...r(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(i,{...n})}):i(n)}export{m as default};

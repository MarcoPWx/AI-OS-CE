import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as n}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";const{addons:o}=__STORYBOOK_MODULE_PREVIEW_API__,{UPDATE_GLOBALS:l}=__STORYBOOK_MODULE_CORE_EVENTS__;function r(i){const s={h1:"h1",li:"li",p:"p",ul:"ul",...n(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"labs-index--coverage-map",children:"Labs: Index — Coverage Map"}),`
`,`
`,e.jsx(t,{title:"Labs/Index"}),`
`,e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center",margin:"12px 0 4px 0"},children:[e.jsx("button",{style:{padding:"8px 12px",borderRadius:8,border:"1px solid rgba(59,130,246,0.5)",background:"rgba(2,6,23,0.9)",color:"#e5e7eb",fontWeight:700,cursor:"pointer"},onClick:()=>{try{o.getChannel().emit(l,{globals:{presenterGuide:"labs",presenterStep:0}})}catch{}},children:e.jsx(s.p,{children:"▶ Start Presentation"})}),e.jsx("span",{style:{fontSize:12,color:"#64748b"},children:"Tip: press g g to toggle the Presenter overlay"})]}),`
`,e.jsx(s.p,{children:"Purpose"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"One place to understand and navigate all Labs covering functionality, user stories, and S2S flows."}),`
`]}),`
`,e.jsx(s.p,{children:"Labs overview"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Mobile Mock Beta — device builds with full mocks"}),`
`,e.jsx(s.li,{children:"Device Matrix — iOS/Android smoke and interview demo"}),`
`,e.jsx(s.li,{children:"Auth & Session — mock auth, session persistence, guarded actions"}),`
`,e.jsx(s.li,{children:"Quiz & Content — categories, questions, fallback"}),`
`,e.jsx(s.li,{children:"Gamification & Achievements — XP, levels, badges"}),`
`,e.jsx(s.li,{children:"Leaderboard & Social — rankings and social loops"}),`
`,e.jsx(s.li,{children:"Onboarding & Profile — first run, profile basics"}),`
`,e.jsx(s.li,{children:"Error & Offline — network failures, fallback flows"}),`
`,e.jsx(s.li,{children:"S2S Orchestration — contracts, MSW, Swagger, supertest"}),`
`,e.jsx(s.li,{children:"Performance & Device Metrics — budgets and checks"}),`
`,e.jsx(s.li,{children:"Security & Privacy — headers, data handling"}),`
`,e.jsx(s.li,{children:"Accessibility — key screens checks"}),`
`,e.jsx(s.li,{children:"Sentry — crash & release health (Expo/EAS)"}),`
`]}),`
`,e.jsx(s.p,{children:"Map to stories (selected)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Auth: src/stories/AuthSmoke.stories.tsx, src/stories/AuthMSWFlow.stories.tsx"}),`
`,e.jsx(s.li,{children:"Quiz: src/stories/QuizFlowDemo.stories.tsx, src/stories/QuizScreen.stories.tsx, src/stories/QuizEngineSandbox.stories.tsx"}),`
`,e.jsx(s.li,{children:"Gamification: src/stories/gamification/GamificationSystem.stories.tsx"}),`
`,e.jsx(s.li,{children:"Leaderboard: src/screens/LeaderboardScreenGameified.tsx (link via MDX notes)"}),`
`,e.jsx(s.li,{children:"Journeys: src/stories/journeys/UserJourneys.stories.tsx, .storybook/stories/SpecsJourneysDetailed.mdx"}),`
`,e.jsx(s.li,{children:"S2S: src/stories/S2SOrchestration.stories.tsx, Swagger, ApiPlayground"}),`
`,e.jsx(s.li,{children:"Network: src/stories/NetworkPlayground.stories.tsx, TransportFallback.stories.tsx"}),`
`,e.jsx(s.li,{children:"Performance: src/stories/CodeSplitDemo.stories.tsx, .storybook/stories/BundlingAndPerformance.mdx"}),`
`,e.jsx(s.li,{children:"Security: src/stories/SecurityPlayground.stories.tsx, .storybook/stories/SpecsSecurityPrivacyExtended.mdx"}),`
`,e.jsx(s.li,{children:"Accessibility: .storybook/test-runner.ts (axe), run guidance in lab"}),`
`]}),`
`,e.jsx(s.p,{children:"Coverage checklist (fill as you validate)"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"[ ] All user journeys exercised via Labs/User Journeys"}),`
`,e.jsx(s.li,{children:"[ ] All S2S contracts tested via Labs/S2S Orchestration"}),`
`,e.jsx(s.li,{children:"[ ] Mock device builds validated via Labs/Mobile Mock Beta"}),`
`,e.jsx(s.li,{children:"[ ] Performance budgets verified via Labs/Performance"}),`
`,e.jsx(s.li,{children:"[ ] Security headers and data handling validated via Labs/Security & Privacy"}),`
`,e.jsx(s.li,{children:"[ ] Accessibility checks completed on key screens"}),`
`]})]})}function m(i={}){const{wrapper:s}={...n(),...i.components};return s?e.jsx(s,{...i,children:e.jsx(r,{...i})}):r(i)}export{m as default};

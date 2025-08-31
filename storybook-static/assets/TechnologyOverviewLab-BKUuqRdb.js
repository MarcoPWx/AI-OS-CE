import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(s){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...i(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"technology-overview-lab",children:"Technology Overview Lab"}),`
`,e.jsx(t,{title:"Labs/Technology Overview Lab"}),`
`,e.jsx(n.p,{children:"Welcome to the Technology Overview Lab for QuizMentor. This lab helps you:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Understand the stack and where each technology is used in this repo"}),`
`,e.jsx(n.li,{children:"Jump into live stories (Swagger/API, Journeys, S2S) and docs"}),`
`,e.jsx(n.li,{children:"Run hands-on exercises with MSW and WebSocket scenarios (toolbar controls)"}),`
`]}),`
`,e.jsx(n.p,{children:"Tip: Use the toolbar at the top of Storybook"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"WS Scenario: choose realtime mock scenarios (lobbyBasic, matchHappyPath, etc.)"}),`
`,e.jsx(n.li,{children:"MSW Profile: set latency/error profiles (default, slower, flaky, chaos)"}),`
`,e.jsx(n.li,{children:"Theme/Platform: switch visual tokens"}),`
`]}),`
`,e.jsx(n.h2,{id:"quickstart-510-minutes",children:"Quickstart (5–10 minutes)"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["API: Open ",e.jsx(n.a,{href:"?path=/story/api-swagger--default",children:"API/Swagger"}),", set docExpansion to full, and try an endpoint."]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.ol,{start:"2",children:[`
`,e.jsx(n.li,{children:'Network: Switch MSW Profile to "flaky" and re-run any API story; observe React Query retries.'}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.ol,{start:"3",children:[`
`,e.jsx(n.li,{children:'Realtime: Set WS Scenario to "matchHappyPath" and open “Quiz/Quiz Engine Sandbox” and “Network Playground”.'}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.ol,{start:"4",children:[`
`,e.jsxs(n.li,{children:["Journeys: Open ",e.jsx(n.a,{href:"?path=/story/analytics-user-journey-map--default",children:"Journeys/User Journey Map"})," and traverse linked stories."]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.ol,{start:"5",children:[`
`,e.jsxs(n.li,{children:["S2S: Open ",e.jsx(n.a,{href:"?path=/story/architecture-s2s-service-mesh--architecture-overview",children:"S2S Architecture"})," and “Dashboard/S2S Architecture”."]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.ol,{start:"6",children:[`
`,e.jsxs(n.li,{children:["Docs: Open ",e.jsx(n.a,{href:"?path=/story/docs-repo-docs-browser--default",children:"Repo Docs Browser"})," and load TECH_STACK_CHEAT_SHEET.md."]}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:"Section Index"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#project-card",children:"Project Card"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#stack-overview",children:"Stack Overview"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#examples-by-technology",children:"Examples by Technology"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#user-stories-tie-in",children:"User Stories Tie-in"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#s2s-system-to-system-orchestration",children:"S2S (System-to-System) Orchestration"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#hands-on-lab-exercises",children:"Hands-on Lab Exercises"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"#references",children:"References"})}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"project-card",children:"Project Card"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Project: QuizMentor"}),`
`,e.jsx(n.li,{children:"Repo/Path: NatureQuest/QuizMentor"}),`
`,e.jsx(n.li,{children:"Overview: Gamified learning app with Expo/React Native (plus web) and an Express API, documented via Storybook labs with Swagger and MSW."}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"stack-overview",children:"Stack Overview"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Frontend",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"React 19, React Native 0.79, Expo 53, React Native Web"}),`
`,e.jsx(n.li,{children:"Expo Router; React Navigation (stack, tabs, gesture-handler, screens, safe-area-context)"}),`
`,e.jsx(n.li,{children:"State/Data: Zustand, TanStack React Query 5"}),`
`,e.jsx(n.li,{children:"Styling: NativeWind + Tailwind 3"}),`
`,e.jsx(n.li,{children:"UI/UX: Lottie, react-native-toast-message"}),`
`,e.jsx(n.li,{children:"Networking/Realtime: axios, Socket.IO client, SSE demo"}),`
`,e.jsx(n.li,{children:"Storage: react-native-mmkv"}),`
`,e.jsx(n.li,{children:"Expo modules: notifications, av, haptics, device, constants, etc."}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Backend",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Node.js 20, Express, cors, helmet, express-rate-limit"}),`
`,e.jsx(n.li,{children:"Redis (ioredis), Sentry, PostHog"}),`
`,e.jsx(n.li,{children:"supabase-js (server), zod (validation)"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Services",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Supabase (auth/db), Socket.IO client abstraction, in-app analytics queue"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Infra",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Docker Compose 3.8 (PostgreSQL 15, Redis 7), Locust 2.17"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Testing",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Jest + jest-expo, Testing Library, MSW, Playwright, Detox, @axe-core/playwright"}),`
`,e.jsx(n.li,{children:"Storybook Test Runner + @storybook/test"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Docs",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Storybook (react-vite), Swagger UI React (OpenAPI), react-markdown + remark-gfm, Chromatic"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"examples-by-technology",children:"Examples by Technology"}),`
`,e.jsx(n.h3,{id:"react-navigation-stack",children:"React Navigation (Stack)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<NavigationContainer>
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerStyle: { backgroundColor: '#3b82f6' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'QuizMentor' }} />
    <Stack.Screen name="Test" component={TestScreen} options={{ title: 'Test' }} />
  </Stack.Navigator>
</NavigationContainer>
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Learn more: Journeys and flows under “Flows” and “Journeys” stories."}),`
`]}),`
`,e.jsx(n.h3,{id:"tanstack-react-query-client-caching",children:"TanStack React Query (Client caching)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof APIError) {
          if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'always',
      networkMode: 'online',
    },
  },
});
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"See also: providers/QueryProvider.tsx for toasts and cache hooks."}),`
`]}),`
`,e.jsx(n.h3,{id:"zustand-local-game-session",children:"Zustand (Local game session)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export const useGameStore = create<State & Actions>((set, get) => ({
  session: null,
  questions: [],
  start: (topic, difficulty) => {
    const questions = dummyQuestions(topic, difficulty);
    const session = createSession({ topic, difficulty, questions });
    set({ session, questions });
  },
  answer: (selectedIndex: number) => {
    const { session } = get();
    if (!session) return;
    set({ session: answerCurrent(session, selectedIndex) });
  },
  next: () => {
    const { session, questions } = get();
    if (!session) return;
    set({ session: next(session, questions) });
  },
  reset: () => set({ session: null, questions: [] }),
}));
`})}),`
`,e.jsx(n.h3,{id:"supabase-client",children:"Supabase (Client)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: { headers: { 'x-platform': Platform.OS } },
});
`})}),`
`,e.jsx(n.h3,{id:"socketio-client-mockable",children:"Socket.IO Client (Mockable)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`export function createSocket(url: string, options?: any): any {
  if (USE_WS_MOCKS) {
    return new MockSocket(url, options);
  }
  const { io } = require('socket.io-client');
  return io(url, options);
}
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Try: Use WS Scenario toolbar control to switch realtime demos."}),`
`]}),`
`,e.jsx(n.h3,{id:"storybook--msw-initialization",children:"Storybook + MSW initialization"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { initialize, mswDecorator } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import storybookHandlers from '../src/mocks/handlers.storybook';

// Initialize MSW addon
initialize({ onUnhandledRequest: 'bypass' });
`})}),`
`,e.jsx(n.h3,{id:"swagger-ui-react-openapi",children:"Swagger UI React (OpenAPI)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<SwaggerUI
  url="/docs/api-specs/openapi/quizmentor-api-v1.yaml"
  docExpansion={args.docExpansion}
  defaultModelsExpandDepth={args.defaultModelsExpandDepth}
  defaultModelExpandDepth={args.defaultModelExpandDepth}
  defaultModelRendering={args.defaultModelRendering}
  filter={args.filter}
  displayOperationId={args.displayOperationId}
  persistAuthorization={args.persistAuthorization}
/>
`})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Open the API doc story: ",e.jsx(n.a,{href:"?path=/story/api-swagger--default",children:"API/Swagger"})]}),`
`]}),`
`,e.jsx(n.h3,{id:"jest-unitintegration",children:"Jest (Unit/Integration)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-js",children:`module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup.ts',
    '@testing-library/jest-native/extend-expect',
  ],
`})}),`
`,e.jsx(n.h3,{id:"playwright-web-e2e",children:"Playwright (Web E2E)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`webServer: {
  command: CMD_PREFIX,
  url: 'http://localhost:3003',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
},
`})}),`
`,e.jsx(n.h3,{id:"detox-native-e2e",children:"Detox (Native E2E)"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-js",children:`module.exports = {
  testRunner: {
    args: { $0: 'jest', config: 'e2e/jest.config.js' },
    jest: { setupFilesAfterEnv: ['<rootDir>/e2e/jest.setup.js'] },
  },
  apps: { 'ios.debug': { type: 'ios.app', binaryPath: 'ios/build/.../QuizMentor.app', build: 'xcodebuild ...' } },
  devices: { simulator: { type: 'ios.simulator', device: { type: 'iPhone 14' } } },
  configurations: { 'ios.sim.debug': { app: 'ios.debug', device: 'simulator' } },
};
`})}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"user-stories-tie-in",children:"User Stories Tie-in"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Journeys:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Explore story: “Journeys/UserJourneyMap” → ",e.jsx(n.a,{href:"?path=/story/journeys-userjourneymap--default",children:"Open"})]}),`
`,e.jsxs(n.li,{children:["Explore catalog: “Specs/Journeys Detailed” → ",e.jsx(n.a,{href:"?path=/story/specs-journeys-detailed--page",children:"Open"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Flows:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"“Flows/Quick Index” and “Flows” narratives map category→screen→service touches"}),`
`,e.jsx(n.li,{children:"Try toggling MSW Profile to simulate network conditions for each flow"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Auth + Profiles:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Stories: “Auth Smoke”, “Auth MSW Flow”; Docs: AUTHENTICATION_DESIGN.md"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Leaderboard + Gamification:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Stories: “Gamification System”, “Leaderboard Screen”; Docs: enhancedGamification services"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"s2s-system-to-system-orchestration",children:"S2S (System-to-System) Orchestration"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Architecture & Dashboards:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["“S2S/S2S Architecture” → ",e.jsx(n.a,{href:"?path=/story/s2s-s2sarchitecture--default",children:"Open"})]}),`
`,e.jsxs(n.li,{children:["“S2S/S2S Dashboard” → ",e.jsx(n.a,{href:"?path=/story/s2s-s2sdashboard--default",children:"Open"})]}),`
`,e.jsxs(n.li,{children:["“Specs/S2S” (full narrative) → ",e.jsx(n.a,{href:"?path=/story/specs-s2s--page",children:"Open"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["API Gateway & Validation:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Express + helmet + rate-limit in api/src/index.ts; OpenAPI served via Storybook"}),`
`,e.jsxs(n.li,{children:["Swagger: ",e.jsx(n.a,{href:"?path=/story/api-swagger--default",children:"Open API Doc"})]}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Realtime:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Use WS Scenario toolbar to simulate lobby/match/disconnect flows"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"hands-on-lab-exercises",children:"Hands-on Lab Exercises"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Explore the API"}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Open ",e.jsx(n.a,{href:"?path=/story/api-swagger--default",children:"API/Swagger"})]}),`
`,e.jsx(n.li,{children:"Try “docExpansion: full” and enable “Try It Out”"}),`
`,e.jsxs(n.li,{children:["Follow links to Repo Docs Browser → ",e.jsx(n.a,{href:"?path=/story/docs-repo-docs-browser--default",children:"Docs/Repo Docs Browser"})]}),`
`]}),`
`,e.jsxs(n.ol,{start:"2",children:[`
`,e.jsx(n.li,{children:"Simulate Network Conditions (MSW)"}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Set MSW Profile → flaky or chaos"}),`
`,e.jsx(n.li,{children:"Open “Testing/E2E Test Dashboard” and observe retry/backoff in React Query"}),`
`]}),`
`,e.jsxs(n.ol,{start:"3",children:[`
`,e.jsx(n.li,{children:"Realtime Scenarios (WS)"}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Choose WS Scenario → “matchHappyPath”"}),`
`,e.jsx(n.li,{children:"Open “Quiz/Quiz Engine Sandbox” and “Network Playground” to see events"}),`
`]}),`
`,e.jsxs(n.ol,{start:"4",children:[`
`,e.jsx(n.li,{children:"Journeys Mapping"}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Open “Journeys/User Journey Map” and then visit stories referenced from each node"}),`
`,e.jsx(n.li,{children:"Cross-check docs: docs/status/TECH_STACK_CHEAT_SHEET.md"}),`
`]}),`
`,e.jsxs(n.ol,{start:"5",children:[`
`,e.jsx(n.li,{children:"End-to-End"}),`
`]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Web: run Playwright against Expo web (see playwright.config.ts notes)"}),`
`,e.jsx(n.li,{children:"Native: run Detox basic journey (see e2e/detox/*.e2e.ts)"}),`
`]}),`
`,e.jsx(n.hr,{}),`
`,e.jsx(n.h2,{id:"references",children:"References"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Storybook Start: ",e.jsx(n.a,{href:"?path=/story/start-here--page",children:"Start Here"})]}),`
`,e.jsxs(n.li,{children:["Tech Stack & API: ",e.jsx(n.a,{href:"?path=/story/tech-stack-and-api--page",children:"Tech Stack & API"})]}),`
`,e.jsxs(n.li,{children:["Repo Docs Browser: ",e.jsx(n.a,{href:"?path=/story/docs-repo-docs-browser--default",children:"Docs/Repo Docs Browser"})]}),`
`,e.jsxs(n.li,{children:["Swagger UI: ",e.jsx(n.a,{href:"?path=/story/api-swagger--default",children:"API/Swagger"})]}),`
`,e.jsx(n.li,{children:"OpenAPI Spec: /docs/api-specs/openapi/quizmentor-api-v1.yaml"}),`
`,e.jsx(n.li,{children:"Architecture narratives: .storybook/stories/* (Overview, Architecture, Specs)"}),`
`]})]})}function u(s={}){const{wrapper:n}={...i(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(r,{...s})}):r(s)}export{u as default};

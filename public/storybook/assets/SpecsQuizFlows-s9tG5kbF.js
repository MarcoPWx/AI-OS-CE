import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as a}from"./index-Di0Mt_3y.js";import{M as c,C as n,S as t}from"./index-Dd9QK8Sf.js";import{I as l}from"./InlineTOC-C7is7SsK.js";import{B as d}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D4bCNOrd.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(s){const i={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...a(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(i.h1,{id:"quiz-flows--end-to-end-specifications",children:"Quiz Flows — End-to-End Specifications"}),`
`,`
`,e.jsx(c,{title:"Specs/Quiz Flows — End-to-End"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(i.p,{children:"This page documents end-to-end quiz flows with service-to-service (S2S) interactions, data writes, and observability notes."}),`
`,e.jsx(i.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Login & Start Quiz (#login-start)"}),`
`,e.jsx(i.li,{children:"Timed Quiz Q&A (#timed-qa)"}),`
`,e.jsx(i.li,{children:"Results & Analytics (#results)"}),`
`,e.jsx(i.li,{children:"Practice Mode (#practice)"}),`
`,e.jsx(i.li,{children:"Offline Flow (#offline)"}),`
`,e.jsx(i.li,{children:"Rate Limit & Caching (#rate-cache)"}),`
`,e.jsx(i.li,{children:"Leaderboard Submission (#leaderboard)"}),`
`,e.jsx(i.li,{children:"Achievements Unlock (#achievements)"}),`
`,e.jsx(i.li,{children:"Data Export & Account Deletion (#data-privacy)"}),`
`,e.jsx(i.li,{children:"Related Stories (#stories)"}),`
`]}),`
`,e.jsx(l,{items:[{id:"login-start",label:"Login & Start Quiz"},{id:"timed-qa",label:"Timed Quiz Q&A"},{id:"results",label:"Results & Analytics"},{id:"practice",label:"Practice Mode"},{id:"offline",label:"Offline Flow"},{id:"rate-cache",label:"Rate Limit & Caching"},{id:"leaderboard",label:"Leaderboard Submission"},{id:"achievements",label:"Achievements Unlock"},{id:"data-privacy",label:"Data Export & Deletion"},{id:"stories",label:"Related Stories"}]}),`
`,e.jsx(i.h2,{id:"login--start-quiz",children:"Login & Start Quiz"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"login-start"}),`- Trigger: User logs in and starts quiz session (topic + difficulty) - S2S:
POST /api/quiz/start → recommendations → session:start → validate:batch - DB Writes: - sessions:
insert (userId, topic, difficulty, createdAt) - session_events: insert (type='start', sessionId) -
Observability: - Logs: requestId propagation; userId redacted policy - Metrics: s2s.latency,
s2s.errors`]}),`
`,e.jsx(i.pre,{children:e.jsx(i.code,{className:"language-mermaid",children:`sequenceDiagram
  participant UI as App/Web
  participant API as API Gateway (composite)
  participant AE as Adaptive Engine
  participant LO as Learning Orchestrator
  participant BV as Bloom Validator

  UI->>API: POST /api/quiz/start { topic, difficulty }
  API->>AE: GET /recommendations/{userId}
  AE-->>API: { recommendedDifficulty }
  API->>LO: POST /sessions/start
  LO-->>API: { id, questions }
  API->>BV: POST /validate/batch
  BV-->>API: { results }
  API-->>UI: { sessionId, questions, profile, validation }
`})}),`
`,e.jsx(i.h2,{id:"timed-quiz-qa",children:"Timed Quiz Q&A"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"timed-qa"}),`- Trigger: User answers timed questions - DB Writes: - session_answers: insert
(sessionId, questionId, selectedIndex, correct, elapsedMs) - streaks: update (increment/reset) -
xp_events: insert (base, multiplier) - Observability: - Events: question_viewed, answer_submitted,
answer_correct/incorrect - Metrics: question.time_to_answer, accuracy`]}),`
`,e.jsx(i.h2,{id:"results--analytics",children:"Results & Analytics"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"results"}),`- Trigger: User completes quiz - DB Writes: - sessions: update (completedAt,
score, timeTaken) - analytics_events: insert (category_accuracy, time_series) - Observability: -
Events: quiz_completed, results_viewed - Metrics: quiz.completion_rate, quiz.avg_score`]}),`
`,e.jsx(i.h2,{id:"practice-mode",children:"Practice Mode"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"practice"}),"- Trigger: User selects Practice - Behavior: No timer, instant feedback, no XP"]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"DB Writes: - practice_sessions: insert - practice_feedback: insert (questionId, hintUsed)"}),`
`]}),`
`,e.jsx(i.h2,{id:"offline-flow",children:"Offline Flow"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"offline"}),`- Trigger: No connectivity - Behavior: Local cache of questions; defer writes -
DB Writes: - local cache; sync queue; upon reconnect → sessions & answers upsert`]}),`
`,e.jsx(i.h2,{id:"rate-limit--caching",children:"Rate Limit & Caching"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"rate-cache"}),`- Trigger: Burst traffic or repeat fetch - Behavior: Respect 429 Retry-After;
ETag 304 path - Observability: rate_limited, cached_hit`]}),`
`,e.jsx(i.h2,{id:"leaderboard-submission",children:"Leaderboard Submission"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"leaderboard"}),`- Trigger: Post-results XP/level changes - DB Writes: - leaderboard_scores:
upsert (userId, weekly/monthly/allTime) - Observability: leaderboard.updated`]}),`
`,e.jsx(i.h2,{id:"achievements-unlock",children:"Achievements Unlock"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"achievements"}),`- Trigger: Threshold met (streaks, accuracy, volume) - DB Writes: -
achievements: insert (userId, badgeId) - xp_events: insert (bonus) - Observability:
achievement_unlocked (rarity)`]}),`
`,e.jsx(i.h2,{id:"data-export--account-deletion",children:"Data Export & Account Deletion"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"data-privacy"}),`- Export: enqueue job → deliver via email link - Delete: purge PII, retain
aggregated analytics where policy allows`]}),`
`,e.jsx(i.h2,{id:"related-stories",children:"Related Stories"}),`
`,e.jsxs(i.p,{children:[e.jsx("a",{id:"stories"}),"- S2S Orchestration:"]}),`
`,e.jsx(n,{children:e.jsx(t,{id:"dev-s2s-orchestration--default"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"API Playground:"}),`
`]}),`
`,e.jsx(n,{children:e.jsx(t,{id:"api-playground--default"})}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Network Playground:"}),`
`]}),`
`,e.jsx(n,{children:e.jsx(t,{id:"dev-networkplayground--default"})}),`
`,e.jsx(d,{})]})}function v(s={}){const{wrapper:i}={...a(),...s.components};return i?e.jsx(i,{...s,children:e.jsx(r,{...s})}):r(s)}export{v as default};

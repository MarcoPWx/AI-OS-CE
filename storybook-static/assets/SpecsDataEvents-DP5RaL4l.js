import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as i}from"./index-Di0Mt_3y.js";import{M as t}from"./index-Bpi5BZRR.js";import{I as a}from"./InlineTOC-C7is7SsK.js";import{B as d}from"./BackToTop-BkC3T4EJ.js";import"./index-R2V08a_e.js";import"./iframe-D0C5GYr5.js";import"./index-B25VQ0Mk.js";import"./index-BMU9HDYU.js";import"./index-DrFu-skq.js";function r(n){const s={h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",ul:"ul",...i(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(s.h1,{id:"data-events--persistence--reference",children:"Data Events & Persistence — Reference"}),`
`,`
`,e.jsx(t,{title:"Specs/Data Events & Persistence"}),`
`,e.jsx("a",{id:"top"}),`
`,e.jsx(s.p,{children:"This page enumerates key domain events, their intended persistence, and observability metadata."}),`
`,e.jsx(s.h3,{id:"table-of-contents",children:"Table of Contents"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Sessions (#sessions)"}),`
`,e.jsx(s.li,{children:"Answers & Streaks (#answers)"}),`
`,e.jsx(s.li,{children:"XP & Levels (#xp)"}),`
`,e.jsx(s.li,{children:"Achievements (#achievements)"}),`
`,e.jsx(s.li,{children:"Leaderboards (#leaderboards)"}),`
`,e.jsx(s.li,{children:"Privacy & Data Lifecycle (#privacy)"}),`
`]}),`
`,e.jsx(a,{items:[{id:"sessions",label:"Sessions"},{id:"answers",label:"Answers & Streaks"},{id:"xp",label:"XP & Levels"},{id:"achievements",label:"Achievements"},{id:"leaderboards",label:"Leaderboards"},{id:"privacy",label:"Privacy & Lifecycle"}]}),`
`,e.jsx(s.h2,{id:"sessions",children:"Sessions"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"sessions"}),`- session_started: sessions.insert(userId, topic, difficulty, createdAt) -
session_completed: sessions.update(completedAt, score) - Observability: requestId, sessionId,
userId(pseudonymized)`]}),`
`,e.jsx(s.h2,{id:"answers--streaks",children:"Answers & Streaks"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"answers"}),`- answer_submitted: session_answers.insert(sessionId, qId, idx, correct,
elapsedMs) - streak_updated: streaks.update(userId, current, max) - Observability: questionId,
correctness, latencyMs`]}),`
`,e.jsx(s.h2,{id:"xp--levels",children:"XP & Levels"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"xp"}),`- xp_awarded: xp_events.insert(userId, base, multiplier, totalDelta) -
level_progressed: users.update(level, xp) - Observability: xp.balance, xp.delta`]}),`
`,e.jsx(s.h2,{id:"achievements",children:"Achievements"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"achievements"}),`- achievement_unlocked: achievements.insert(userId, badgeId, rarity) -
Observability: badgeId, rarity, sourceEvent`]}),`
`,e.jsx(s.h2,{id:"leaderboards",children:"Leaderboards"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"leaderboards"}),`- leaderboard_upserted: leaderboard_scores.upsert(userId, scope, score) -
Observability: scope(weekly|monthly|all), rankDelta`]}),`
`,e.jsx(s.h2,{id:"privacy--data-lifecycle",children:"Privacy & Data Lifecycle"}),`
`,e.jsxs(s.p,{children:[e.jsx("a",{id:"privacy"}),`- export_requested: exports.enqueue(userId) - account_deleted: purge PII; retain
aggregates per policy - Observability: audit trail for privacy actions`]}),`
`,e.jsx(d,{})]})}function v(n={}){const{wrapper:s}={...i(),...n.components};return s?e.jsx(s,{...n,children:e.jsx(r,{...n})}):r(n)}export{v as default};

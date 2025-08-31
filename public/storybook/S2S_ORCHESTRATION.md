# S2S Orchestration Scenarios (Mock-first)

Last Updated: 2025-08-29
Status: CURRENT — Validated via Storybook play() tests

Overview

- We model a composite endpoint that orchestrates multiple downstream services to start a quiz session.
- The mock endpoint lives in Storybook MSW handlers as POST /api/quiz/start.
- Failure injection and latency/jitter controls are provided via request headers.

Endpoint

- POST /api/quiz/start
  - Body: { topic: string, difficulty: 'easy' | 'medium' | 'hard' }
  - Headers:
    - x-msw-no-defaults: '1' to bypass global MSW latency/error defaults
    - x-trace-fail: 'recommendations' | 'session' | 'validate' to force failure at a step
    - x-trace-delay: number (ms) to add delay to the request
    - x-trace-jitter: number (ms) random additional delay

Response (Happy Path)
200 OK
{
"sessionId": "sess\_...",
"profile": { "userId": "demo-user", "recommendedDifficulty": "medium", "learningStyle": "visual" },
"questions": [...],
"validation": [{ "id": "q1", "ok": true }, ...],
"trace": [
{ "step": "recommendations", "service": "adaptive-engine", "status": 200 },
{ "step": "session:start", "service": "learning-orchestrator", "status": 201 },
{ "step": "validate:batch", "service": "bloom-validator", "status": 200 }
]
}

Response (Failure Example: validate)
500
{
"error": "Trace failure at validate:batch",
"sessionId": "sess\_...",
"profile": { ... },
"questions": [...],
"trace": [
{ "step": "recommendations", "service": "adaptive-engine", "status": 200 },
{ "step": "session:start", "service": "learning-orchestrator", "status": 201 },
{ "step": "validate:batch", "service": "bloom-validator", "status": 500 }
]
}

Storybook

- Story: Dev/S2S Orchestration (src/stories/S2SOrchestration.stories.tsx)
- Controls: topic, difficulty, noDefaults, traceFail, traceDelay, traceJitter, chaos (randomized failure)
- Helpers:
  - Copy cURL for the current request
  - Quick buttons: Happy (all good), Validate Failure (500), Chaos Demo

Testing (TDD)

- Happy Path: Status 200, trace shows 200/201/200 for steps
- Validate Failure: Status 500, error message includes 'validate:batch' and trace shows 500 at validation
- Chaos Demo: not suitable for deterministic CI; use locally

Next

- Add session persistence preview (planned)
- Add analytics write-preview (planned)

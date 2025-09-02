# Edition Matrix: Community (OSS) vs Pro (Private)

This matrix draws clear boundaries between the open-source core and the private Pro feature set.

## Community Edition (OSS)
- Storybook-first developer environment (UI + MSW + examples)
- Agent Boot CLI basics:
  - update-docs, create-epic, update-epic, list-epics, github-status, workflow-status, sync-github
- Documentation and runbooks (User Journeys, S2S Architecture, Strategy)
- Basic SecurityLab and PerformanceMonitor
- Clean Code Advisor (read-only suggestions) + Language Detector (read-only)
- Manual-first: nothing auto-runs; safe by default

## Pro (Private)
- Guardrail Engine (input/output guardrails, policy YAML, acceptance criteria, tripwires)
- Durable state store and queues:
  - epics.json (source of truth)
  - outbox.json (GitHub comment queue)
  - metrics.json, suggestions.json, pattern_history.json
- EPICS.md renderer (idempotent) from epics.json
- Daemon/watch mode (status, queue-list, queue-flush, guardrails-evaluate)
- Resilience utilities and demos:
  - circuitBreaker, backoff, timeout, retry, rateLimiter, bulkhead, dedupe, sse (with backpressure)
- Debug Mode + evaluation loop (datasets, metrics, reports)
- Multi-agent blackboard with Queen coordinator (fast scheduling)
- Optional Arbiter via Ollama (local PASS/FAIL with rationale)
- Enterprise add-ons (later): SSO/SAML, RBAC, audit logs

## Boundary Rules
- CE focuses on visibility, learning, and manual control. No background automation or guardrail enforcement.
- Pro adds autonomy, governance, and evaluation—opt-in and policy-gated.
- CE Clean Code Advisor and Language Detector provide read-only guidance; Pro can propose structured refactors (policy-gated), never auto-apply without confirmation.
- All LLM usage is optional and local-first (via Ollama) in Pro. No secrets are logged; GitHub CLI auth required for GH operations.


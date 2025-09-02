# Strategy & Positioning (vs. solveIT) + Cost Model

## Positioning
AI-OS-Storybook is a Storybook-first, local-first developer product with an AI agent that manages documentation, epics, and GitHub workflows. It prioritizes transparency, education, and safe manual control—then layers opt-in guardrails, multi-engine blackboard, and evaluation.

Key differentiators vs. solveIT (hypothetical):
- Storybook-first UX: Real UI components, MSW, and interactive playgrounds for tangible validation. Not just CLI/agents.
- Manual-first, safe-by-default: Nothing auto-runs; opt-in daemon/watch; explicit guardrails and tripwires.
- Transparent guardrails: Policies and acceptance criteria are code, not magic prompts. Deterministic artifacts.
- Open-source core: Immediate value for teams; Pro adds autonomy and guardrails without locking core features.
- Evaluate-and-learn loop: Built-in Debug Mode, pattern history, and lessons to grow teams’ applied AI skill, not just outputs.
- Privacy and cost: Local-first (Ollama optional) keeps data in-house and LLM costs near-zero in dev.

## Product Tiers
- V1 (Open-Source Core)
  - Fully configured Storybook
  - Agent Boot CLI (update docs, create/list/update epics, GH status)
  - MSW and tests scaffold
  - Clear readme and runbooks
- Pro (Private, Paid)
  - Guardrail Engine + multi-engine blackboard
  - Durable state (epics.json) + outbox queue
  - Daemon/watch + status/queue commands
  - Resilience utilities (breaker, backoff, SSE, etc.) with demos
  - Debug Mode + evaluation pipeline
  - Optional local arbiter (Ollama)

## Cloud Cost Model
- Local development: $0 LLM (Ollama) + dev machine resources only. gh CLI for GH integration.
- Cloud (optional):
  - Light container for daemon + GH sync (Tiny vCPU/RAM)
  - LLM usage: remain local via Ollama; or gated to external providers with strict budgets and sampling.
- Cost controls:
  - Turn off allow_github_writes and autonomous by default
  - Gate LLM calls via policy; sample evaluations; cap tokens
  - No always-on heavy inference; only on-demand proposals/evals

## Go-To-Market
- OSS core adoption → Pro upsell (guardrails/autonomy)
- Content strategy: Storybook demos + resilience/evaluation lessons
- Integrations: GitHub-native flows; optional VS Code extension later

## Risks & Mitigations
- Risk: Auto-agents creating unwanted changes → Mitigation: manual-first, tripwires, confirmations
- Risk: Cost growth with LLMs → Mitigation: local Ollama default, gating, sampling
- Risk: Complexity → Mitigation: Situations, blackboard, clearly scoped engines


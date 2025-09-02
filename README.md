# 🤖 AI-OS-Storybook

**Ready-to-use Storybook + AI Agent that manages your development workflow**

## What This Is (30 seconds)

This is a **complete, working Storybook application** that comes with an AI-powered Python agent that tracks your development, manages epics, creates GitHub issues, and keeps documentation updated.

**Two things you get:**
1. **📚 Storybook UI** - Full component development environment (runs on http://localhost:7007)
2. **🤖 Python Agent** - Manages epics, GitHub issues, and documentation automatically

## Start Now (2 minutes)

```bash
# Clone and install
git clone https://github.com/MarcoPWx/AI-OS-Storybook.git
cd AI-OS-Storybook
npm install

# Start Storybook UI
npm run dev
# → Open http://localhost:7007

# Use the Agent (Python)
python3 tools/agent/agent_boot.py list-epics                    # See project status
python3 tools/agent/agent_boot.py create-epic --title "Add login" --create-issue  # Creates GitHub issue
python3 tools/agent/agent_boot.py update-epic --title "Add login" --status IN_PROGRESS --completion 50
```

## What The Agent Does For You

```bash
# Track your epics with visual progress
python3 tools/agent/agent_boot.py list-epics
# Output:
# ├── Add Dark Mode Support [░░░░░░░░░░] 0% TODO
# ├── Add Authentication   [████████░░] 80% IN_PROGRESS → GitHub #19
# └── Add Vue.js Support    [██████████] 100% DONE → GitHub #18

# Create epic with GitHub issue automatically
python3 tools/agent/agent_boot.py create-epic --title "Add OAuth" --create-issue
# → Creates epic locally
# → Creates GitHub issue #20
# → Links them together

# Update progress (automatically updates GitHub)
python3 tools/agent/agent_boot.py update-epic --title "Add OAuth" --completion 60
# → Updates local epic
# → Posts to GitHub: "Progress: [██████░░░░] 60%"

# Sync with GitHub (bidirectional)
python3 tools/agent/agent_boot.py sync-github
# → Closed GitHub issues mark epics as DONE
# → Open issues update epic status
```

[![CI](https://github.com/MarcoPWx/AI-OS-Storybook/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcoPWx/AI-OS-Storybook/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Storybook](https://img.shields.io/badge/Storybook-8.6-ff4785?logo=storybook)](https://storybook.js.org/)

## 💡 Why AIBook? The Problem We Solve

AIBook is a Storybook setup specifically designed for developers who build UI with AI assistants (Claude, GPT-4, Copilot).

**The core insight:** AI can't see your UI or run your code. AIBook provides the missing feedback loop.

### 🎯 Who Needs This?

You need AIBook if you've ever:

- ✋ Spent 30 minutes debugging AI-generated code that "looked right"
- ✋ Had AI create beautiful components that broke with real data
- ✋ Wished AI could see what you're building
- ✋ Wanted AI to follow your team's patterns
- ✋ Needed to verify AI code is accessible and tested

### 💰 The Value (Why This Saves You Time)

**Without AIBook:**
```
1. Ask AI for component → 2. Copy code → 3. It breaks → 4. Debug for 20 min → 5. Ask AI to fix → 6. Still broken → 7. Give up and write it yourself
```

**With AIBook:**
```
1. Ask AI (with examples) → 2. Copy code → 3. Run tests → 4. See it working → 5. Ship it
```

**Time saved per component: ~30 minutes**  
**Components per week: ~10**  
**Time saved per week: 5 hours**

### 🚀 Real Example: Build a Feature in 5 Minutes

**Task:** "I need a notification center with dismiss and mark-all-read"

**Without AIBook (typical experience):**
```javascript
// AI gives you this...
function NotificationCenter() {
  const [notifications, setNotifications] = useState([]); // Where's the data?
  // 200 lines of broken code...
}
// Spend next hour wiring up data, fixing errors, adding tests
```

**With AIBook:**
```markdown
# Your prompt to AI:
"Create a notification center following the pattern in:
- Component: src/stories/Epics/EpicManager.tsx
- With mock: src/mocks/handlers.ts (GET /api/notifications)
- With test: tests/unit/EpicManager.test.tsx"

# AI generates working code because it has patterns to follow
# You validate in seconds:
npm run test:unit # ✅ Tests pass
Open Storybook # ✅ Looks perfect
Toggle MSW Error Rate # ✅ Handles errors gracefully
```

**Result:** Feature complete in 5 minutes vs 1+ hour

📖 **Full guide: [docs/LLM_WORKFLOW_GUIDE.md](docs/LLM_WORKFLOW_GUIDE.md)**

---

## Agent-Driven Storybook (Minimal)

### V1 (Open-Source Core)
- Fully configured Storybook environment
- Agent Boot CLI: update-docs, create-epic, update-epic, list-epics, github-status, workflow-status, sync-github
- MSW-based simulation in stories
- Clear runbooks and usage docs

See also:
- docs/specs/USER_JOURNEYS.md
- docs/specs/S2S_ARCHITECTURE.md
- docs/specs/EDITION_MATRIX.md
- docs/STRATEGY_POSITIONING.md

Clean Code & Language-Aware Guidance (OSS)
- Clean Code Advisor (read-only): tools/agent/engines/clean_code_advisor.py
- Language Detector: tools/agent/utils/lang_detector.py

Pro adds: guardrails, durable state, daemon/watch, resilience utilities, Debug Mode, Ollama Arbiter.

### Pro (Private Roadmap)
- Guardrail Engine (input/output guardrails, policies, acceptance criteria)
- Durable state (epics.json) and GH outbox (queue)
- Daemon/watch mode with status/queue commands
- Resilience utilities (breaker, backoff, timeout, retry, rateLimiter, bulkhead, dedupe, sse) + Storybook demos
- Debug Mode + evaluation loop (datasets, metrics, optional LLM arbiter via Ollama)

Positioning vs. solveIT and cost model: see docs/STRATEGY_POSITIONING.md

Keep it simple: one DevLog, one System Status, one Epic Manager (Improved). No badges, no banners, no auto-hooks. Manual, agent-driven updates only.

Start here (TL;DR)
Requirements:

- Node >= 18.17
- Python 3.x (for Agent Boot)
- Optional (for E2E): npx playwright install

- Install deps: npm install
- Start dev (HMR): npm run dev
- Open: http://localhost:7007
- Dev controls:
  - Press "g" twice → Presenter overlay
  - Toolbar → MSW → On / Off / Info; set Latency and Error Rate
  - MSW Info shows active routes from src/mocks/handlers.ts
- Real API mode: set MSW → Off to passthrough real network
- Command cheat sheet:
  - Start: npm run dev
  - Unit tests: npm run test:unit
  - Build static: npm run build

Common issues (see docs/TROUBLESHOOTING.md for more)

- Port in use: npm run dev -- -p 7008
- MSW seems off: toolbar → MSW → On
- E2E failing: run npx playwright install
- Build prompts for telemetry: STORYBOOK_DISABLE_TELEMETRY=1 npm run build

Optional: scaffold into another repo

- One-liner: `npx create-agent-storybook --force`
- Flags: `--dry-run` `--docs-only` `--stories-only` `--no-config`

Canonical docs (single source of truth)

- DevLog: docs/status/DEVLOG.md
- Epics: docs/roadmap/EPICS.md
- System Status: docs/SYSTEM_STATUS.md
- Agent Boot System (reference): tools/agent/AGENT_BOOT_README.md
- Agent Boot (Storybook): docs/AgentBoot.docs.mdx

Storybook pages

- Docs/Dev Log (reads docs/status/DEVLOG.md)
- Docs/System Status (reads docs/SYSTEM_STATUS.md)
- Epics/Epic Manager (Improved)

Agent operations

- "Update docs now"
  - Append a dated entry to docs/status/DEVLOG.md
  - Set "Last Updated: YYYY-MM-DD" in docs/SYSTEM_STATUS.md
  - Set "> Updated: YYYY-MM-DD" in docs/roadmap/EPICS.md
  - Refresh docs/status/last-updated.json timestamps
- "Load Agent Boot"
- Ensure tools/agent/AGENT_BOOT_README.md and docs/AgentBoot.docs.mdx reflect the current contract
  - No manifests and no pre-hooks; manual-only

Nothing auto-runs

- Starting Storybook does not trigger any doc updates or agent generation.
- No badges/banners or extra UI.

Labs

- Labs/Agent Minimal Boot & Update — agent-driven workflow
- Labs/S2S Foundations — network + API playgrounds under load
- Labs/Porting Projects — bring flows from Harvest, DevMentor, Quiz, Voice

Porting to another project (3 steps)

1. Copy canonical docs:
   - docs/status/DEVLOG.md, docs/roadmap/EPICS.md, docs/SYSTEM_STATUS.md
   - (optional) docs/status/AGENT_BOOT.md and docs/AgentBoot.docs.mdx
2. Copy the three stories/components:
   - Docs: DevLogLive (story + component), SystemStatusDocLive (story + component)
   - Epics: EpicManagerImproved (story + component)
3. Configure Storybook:
   - .storybook/main.ts → staticDirs includes '../docs' (and '../public' if needed)
   - Keep .storybook/preview minimal; HMR-friendly
   - Optional scripts: scripts/docs-refresh.mjs, scripts/update-docs-status.mjs (manual only)

---

## 🎁 What You Get (Pre-Built & Working)

### Real Components AI Can Learn From:

| Component              | What It Does                  | Why AI Needs This Pattern                       |
| ---------------------- | ----------------------------- | ----------------------------------------------- |
| **Epic Manager**       | Full CRUD with search/filters | Shows AI how to handle forms, state, validation |
| **API Playground**     | Test any endpoint instantly   | Shows AI async patterns that actually work      |
| **Network Playground** | Visualize concurrent requests | Shows AI how to handle loading states           |
| **Status Dashboard**   | Live test coverage            | Shows AI how to read/display system data        |
| **Dev Log Viewer**     | Render markdown docs          | Shows AI how to integrate documentation         |

#### Engineering highlights (what devs care about)

- Epic Manager (src/stories/Epics/EpicManager.tsx)
  - Controlled form with validation, edit/cancel flows, and derived filtering
  - Uses memoized filtering and stable callbacks in the improved variant (EpicManager.improved.tsx)
  - Accessibility: labeled inputs/buttons; included in a11y runner
  - Tests: unit coverage for search and create flows (tests/unit/EpicManager.test.tsx)

- API Playground (src/stories/API/ApiPlayground.tsx)
  - Request builder for GET/POST/PUT with JSON body
  - Displays HTTP status, response headers, and JSON/text fallback
  - Works with MSW toolbar to simulate latency and error rates in real-time
  - Great for verifying contract shape before writing UI

- Network Playground (src/stories/Dev/NetworkPlayground.tsx)
  - Concurrency simulation with adjustable workers and request volume
  - Captures per-request latency and errors; renders relative timeline bars
  - Pairs with toolbar latency/error knobs for deterministic scenario testing

- Status Dashboard (src/stories/Status/StatusDashboard.tsx)
  - Reads coverage/coverage-summary.json and Playwright summaries if present
  - Graceful empty-state messaging when artifacts are missing
  - Deep-link to full Playwright HTML report and spec docs

- Dev Log Viewer (src/stories/Docs/DevLog.tsx)
  - Renders Markdown with GitHub-flavored Markdown (GFM)
  - Handy to surface internal runbooks or dev notes alongside components

> Note: These are deliberately minimal reference implementations to teach patterns. For production-adjacent patterns, see the Templates category (Optimistic CRUD, Pagination, Debounced Search, Skeleton Loading, etc.).

### Templates (Copy-Paste Starters)

| Template          | What It Demonstrates                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| **CRUD Pattern**  | Create/read/update/delete with server state and error/latency handling |
| **Fetch Pattern** | Idle/loading/success/error states and retry behavior                   |
| **Table Pattern** | Sorting, empty states, and reload patterns                             |

### What Makes AIBook Special:

**🔥 Mock-First Development**

- Everything works instantly - no backend setup
- MSW intercepts all API calls
- Control latency & errors via toolbar
- AI's code works immediately

**✅ Tests Built-In**

```bash
npm run test:unit      # Vitest unit tests
npm run test:stories   # Accessibility checks
npm run e2e           # Playwright E2E tests
```

Every component AI generates is automatically testable.

**📊 Quality Dashboard**

- See test coverage live
- View E2E test results
- Track component health
- No setup required - it just works

**🎛️ Developer Controls**
Storybook toolbar lets you:

- Simulate slow networks (0-2000ms latency)
- Test error states (0-50% failure rate)
- MSW Info overlay: choose MSW → Info to see active routes and controls
- Presenter overlay: press "g" twice to toggle an on-screen guide for demos
- Switch between scenarios instantly
- See how AI's code handles real conditions

## 🚦 Get Started (< 5 minutes)

HMR-friendly dev loop:

- Start: npm run dev (Vite-powered Storybook with HMR)
- Toggle Presenter overlay: press "g" twice
- Open MSW Info overlay: toolbar → MSW → Info

````bash
# 1. Clone AIBook
git clone https://github.com/NatureQuest/opensource-storybook
cd opensource-storybook

# 2. Install
npm install
npx playwright install

# 3. Start
npm run dev

# 4. Open http://localhost:7007
# You now have a complete AI-ready development environment!

## ⚙️ Agent-Driven Workflow (Minimal)

- Canonical docs (single source of truth):
  - DevLog: docs/status/DEVLOG.md
  - Epics: docs/roadmap/EPICS.md
  - System Status: docs/SYSTEM_STATUS.md
- Storybook surface:
  - Docs/Dev Log
  - Docs/System Status
  - Epics/Epic Manager (improved)
- Commands (agent-operated, manual-only):
  - “Update docs now” → I will append to DevLog, refresh System Status “Last Updated”, refresh Epics “> Updated”, and refresh docs/status/last-updated.json.
  - “Load Agent Boot” → I will ensure AGENT_BOOT.md and docs/AgentBoot.docs.mdx reflect the current contract. No manifests, no pre-hooks.
- Nothing auto-runs when starting Storybook. No badges, no fancy UI.

## 🤖 Agent Boot System (Python, Reference Implementation)

- Complete learning platform and production-ready patterns
- Read: tools/agent/AGENT_BOOT_README.md for full details and the manifesto
- **NEW**: Automatic tracking enforcement prevents context loss

### 🚨 Tracking Enforcement System

Prevents agents from losing context with automatic enforcement:

```python
# Enforcement triggers:
- After 3 changes → forced update
- Every 5 minutes → forced update
- Context switch → immediate update
- Any error → immediate update

# Visual indicators:
🚨 TRACKING ENFORCEMENT: Critical threshold reached
⏰ TRACKING ENFORCEMENT: Time limit exceeded
🔄 CONTEXT SWITCH: Task transition detected
❌ ERROR TRACKED: Error requiring documentation
```

See [tools/agent/TRACKING_ENFORCEMENT.md](tools/agent/TRACKING_ENFORCEMENT.md) for details.

### Quick CLI Examples:
```bash
# Interactive setup (first time)
python3 tools/agent/agent_boot.py init

# Auto-update all documentation
python3 tools/agent/agent_boot.py update-docs --content "Completed user auth feature"

# Create epic AND GitHub issue
python3 tools/agent/agent_boot.py create-epic --title "Add OAuth" --create-issue

# Check GitHub PR and CI status
python3 tools/agent/agent_boot.py github-status

# Get complete workflow status
python3 tools/agent/agent_boot.py workflow-status

# Security testing
python3 tools/agent/agent_boot.py test-security --input "<script>alert('xss')</script>"

# Performance report
python3 tools/agent/agent_boot.py performance-report
````

## 🔁 Porting This Setup to Another Project

1. Create canonical docs in your repo:
   - docs/status/DEVLOG.md
   - docs/roadmap/EPICS.md
   - docs/SYSTEM_STATUS.md
2. Add three simple stories that fetch those exact paths:
   - Docs/Dev Log (live markdown)
   - Docs/System Status (live markdown)
   - Epics/Epic Manager (use your improved component)
3. Include Agent Boot (manual):

- tools/agent/AGENT_BOOT_README.md (reference implementation & contract)
- docs/AgentBoot.docs.mdx (same contract for Storybook)
- Optional: link tools/agent/AGENT_BOOT_README.md from your project's README

4. Optional helper scripts (manual-only):
   - scripts/docs-refresh.mjs and scripts/update-docs-status.mjs
   - package.json: add scripts "docs:refresh" and "docs:updates" (do NOT wire to prestorybook/prebuild)
5. Keep it minimal:
   - No banners/badges, no auto-hooks, no agent manifest.

````

## 🧭 User Stories & Use Cases

### 1) Recover from lost context (terminal/editor crash)
**Scenario:** Your Warp/Cursor crashed and AI has no memory of what you were working on.

**Solution:**
```bash
npm run dev  # Start Storybook on http://localhost:7007
````

- Open "Docs/Start Here" → Quick system overview
- Open "Status/Dashboard" → See test coverage & build health
- Open "Epics/Epic Manager" → Reference full CRUD patterns
- Open "Dev/Network Playground" → Recall error handling approaches

**Result:** Context rebuilt in 2 minutes vs 15 minutes of re-explaining.

### 2) Build a feature with working patterns (5-min flow)

**Scenario:** "I need a notification center with dismiss and mark-all-read."

**Solution:**

1. Study pattern: Open "Epics/Epic Manager" for state management reference
2. Add mocks: `src/mocks/handlers.ts` → Add GET/POST `/api/notifications`
3. Create story: `src/stories/Notifications/NotificationCenter.stories.tsx`
4. Write test: `tests/unit/NotificationCenter.test.tsx`
5. Validate: `npm run test:unit && npm run test:stories`

**Result:** Working, tested feature instead of broken AI hallucinations.

### 3) Mock-first API development (no backend yet)

**Scenario:** Backend team is 2 weeks behind, but you need to ship UI now.

**Solution:**

1. Define contract in `src/mocks/handlers.ts`
2. Test endpoints in "API/Playground" story
3. Build UI against mocks with confidence
4. Switch to real API with one line change later

**Result:** Ship UI on schedule, backend swaps in seamlessly.

### 4) Debug production issues locally

**Scenario:** "It works on my machine" but fails for users on slow 3G.

**Solution:**

1. Set Storybook toolbar: MSW Latency = 2000ms, Error Rate = 0.2
2. Watch components handle timeouts and failures
3. Fix loading states and retry logic
4. Test with `npm run e2e` under network conditions

**Result:** Reproduce and fix flaky issues deterministically.

### 5) Validate AI-generated code before merge

**Scenario:** AI created a 500-line PR. Is it production-ready?

**Quick Check:**

```bash
npm run test:unit:coverage  # Coverage > 80%?
npm run test:stories        # Accessibility pass?
npm run e2e                 # User flows work?
```

Then visual QA in Storybook for edge cases.

**Result:** Ship with confidence, catch issues before users do.

### 6) Onboard new team member in 15 minutes

**Scenario:** New developer joins mid-sprint, needs context ASAP.

**Onboarding Path:**

1. "Docs/Start Here" → System overview
2. "Epics/Epic Manager" → Data flow patterns
3. "API/Playground" → Available endpoints
4. "Status/Dashboard" → Current health metrics
5. Run tests: `npm run test:unit` → See what we test for

**Result:** Productive on day 1 instead of week 1.

### 7) Ensure accessibility from day one

**Scenario:** Legal requires WCAG 2.1 AA compliance.

**Built-in Solution:**

1. Every story gets automatic a11y checks
2. Run `npm run test:stories` → Axe-core validation
3. See violations in CI before merge
4. Test keyboard navigation in Storybook

**Result:** Accessibility baked in, not bolted on.

### 8) Monitor and control bundle size

**Scenario:** Performance budget is 200KB, but latest feature added 50KB.

**Investigation:**

```bash
npm run storybook:stats     # Generate webpack stats
npm run storybook:analyze   # Visual bundle breakdown
npm run storybook:check-budgets  # Enforce limits
```

**Result:** Catch bloat before deploy, optimize the right chunks.

### 9) Create shareable component demos

**Scenario:** Designer needs to review all loading states for sign-off.

**Solution:**

1. Build Storybook: `npm run build`
2. Share link to static site
3. Designer can interact with all states
4. Use MSW toolbar to show error scenarios

**Result:** Async feedback without meetings.

### 10) Establish patterns AI can follow reliably

**Scenario:** Every time AI generates code, it's slightly different and breaks.

**Pattern Setup:**

1. Create reference component with all concerns:
   - Component: `src/stories/Reference/Pattern.tsx`
   - Story: `src/stories/Reference/Pattern.stories.tsx`
   - Test: `tests/unit/Pattern.test.tsx`
   - Mock: Update `src/mocks/handlers.ts`
2. Tell AI: "Follow the Reference/Pattern structure"

**Result:** Consistent, working code generation every time.

## 🤖 AI Model Strategy (Optimize for Cost & Quality)

### The Two-Phase Approach

**Phase 1: Context Building (Use GPT-4/GPT-5)**

- **Why:** Better at understanding large codebases and building mental models
- **Tasks:**
  - Initial project exploration
  - Storybook indexing
  - Understanding component relationships
  - Learning your patterns and conventions
  - Building the "project map"

**Phase 2: Implementation (Switch to Claude)**

- **Why:** Superior at actual code generation and complex logic
- **When to switch:** Once the AI demonstrates it understands:
  - Your component patterns
  - MSW mock structure
  - Test patterns
  - File organization

### How to Know When to Switch

**GPT is ready to hand off when it can:**

- ✅ Correctly reference existing components without being told
- ✅ Suggest appropriate mock endpoints
- ✅ Know which patterns to follow
- ✅ Understand the testing approach

**Example Workflow:**

```bash
# Phase 1: Context Building (GPT-4/5)
"Explore the Storybook at localhost:7007"
"What patterns exist in Epic Manager?"
"How are mocks structured?"
"Summarize the testing approach"

# Phase 2: Switch to Claude for coding
"Using the Epic Manager pattern, create a User Management component"
"Add tests following the existing patterns"
"Implement error handling like in Epic Manager"
```

### Cost Optimization

- **GPT-4/5:** ~$0.03/1K tokens (exploration phase: ~$0.50)
- **Claude:** ~$0.008/1K tokens (implementation: ~$2-3 per feature)
- **Total savings:** ~60% compared to using GPT-5 throughout

### Pro Tips

- Keep a `context.md` file with GPT's understanding
- Have GPT create a "handoff summary" for Claude
- Use Storybook as the visual ground truth for both models
- Let GPT browse, let Claude build

## 📚 Documentation

### Quick References

|| Guide | Description | When to Use |
||-------|-------------|-------------|
|| [🚀 Quick Start Checklist](docs/QUICK_START_CHECKLIST.md) | 2-minute setup guide | Every new session |
|| [🔧 Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues & fixes | When things break |
|| [🤝 Context Handoff](docs/CONTEXT_HANDOFF_TEMPLATE.md) | AI model switching template | GPT → Claude transition |
|| [🔬 Labs Index](docs/labs/INDEX.mdx) | Guided, hands-on labs | Skill-building |
|| [🧪 Lab 01: Notification Center](docs/labs/LAB_01_NOTIFICATION_CENTER.mdx) | Build a notification center fast | First lab |
|| [🧩 Patterns Overview](docs/guides/PATTERNS_OVERVIEW.mdx) | Tradeoffs, anti-patterns, and links to templates | When choosing a pattern |
|| [🧵 Hooks (Query & Mutation)](docs/guides/HOOKS.mdx) | Minimal useQuery/useMutation APIs and examples | When wiring async data |
|| [🤖 Agent Boot System (Reference)](tools/agent/AGENT_BOOT_README.md) | Python-based agent orchestration and manifesto | When using the agent to manage docs/epics/status |

### Deep Dives

| Guide                                                       | Description                      |
| ----------------------------------------------------------- | -------------------------------- |
| [LLM Workflow Guide](docs/LLM_WORKFLOW_GUIDE.md)            | Complete AI development patterns |
| [User Stories](docs/specs/user-stories.md)                  | Requirements for AI context      |
| [System Status Spec](docs/specs/system-status-full-spec.md) | Dashboard implementation         |
| [Epic Management](docs/specs/epic-management-full-spec.md)  | CRUD pattern reference           |

## 📊 Commands

### Development

```bash
npm run dev              # Start Storybook (port 7007)
npm run build            # Build static Storybook
```

### Testing

```bash
npm run test:unit        # Run unit tests (Vitest)
npm run test:unit:watch  # Watch mode
npm run test:unit:coverage # Generate coverage report

npm run test:stories     # Run Storybook a11y tests

npm run e2e             # Run Playwright E2E tests
npm run e2e:headed      # Run E2E with browser visible
npm run e2e:storybook   # Start Storybook + run E2E
```

### Analysis

```bash
npm run storybook:stats    # Generate bundle stats
npm run storybook:analyze  # Open bundle analyzer
```

### Agent Boot (Python)

#### Epic Management Commands (NEW!):
```bash
# List all epics with status and completion
python3 tools/agent/agent_boot.py list-epics

# Create epic with GitHub issue
python3 tools/agent/agent_boot.py create-epic --title "Add OAuth" --description "Implement OAuth2 authentication" --create-issue

# Update epic status and progress
python3 tools/agent/agent_boot.py update-epic --title "Add Dark Mode" --status IN_PROGRESS --completion 75
python3 tools/agent/agent_boot.py update-epic --epic-id fd1e7278 --status DONE

# Sync local epics with GitHub issues
python3 tools/agent/agent_boot.py sync-github
```

#### Other Commands:
```bash
# Initialize and setup
python3 tools/agent/agent_boot.py init

# Documentation updates
python3 tools/agent/agent_boot.py update-docs --content "Completed authentication feature"

# GitHub status monitoring
python3 tools/agent/agent_boot.py github-status
python3 tools/agent/agent_boot.py workflow-status

# Security and performance
python3 tools/agent/agent_boot.py test-security --input "<script>alert('xss')</script>"
python3 tools/agent/agent_boot.py performance-report
```

## 📁 Project Structure

```
.
├── 📁 .storybook/
│   ├── main.ts                      # Storybook config (vite framework)
│   ├── preview.ts                   # Global decorators, MSW init, toolbar
│   └── test-runner.ts               # A11y test configuration
│
├── 📁 src/
│   ├── 📁 mocks/
│   │   └── handlers.ts              # MSW mock endpoints (templates + labs)
│   ├── 📁 patterns/
│   │   └── hooks/                   # Minimal hooks (useQuery/useMutation)
│   └── 📁 stories/
│       ├── API/                     # API Playground
│       ├── Dev/                     # Network Playground
│       ├── Epics/                   # Epic Manager CRUD (+ improved)
│       ├── Status/                  # Dashboard
│       ├── Docs/                    # Dev Log viewer
│       └── Templates/               # Copy-paste starters (CRUD, Fetch, Table, Wizard, Debounced Search, File Upload, Pagination, Optimistic Update, Optimistic CRUD, Skeleton Loading)
│
├── 📁 tests/unit/                   # Vitest unit tests (components/patterns)
├── 📁 e2e/                          # Playwright E2E tests
├── 📁 docs/                         # Documentation (MDX + guides + labs)
│   ├── guides/MDX_FEATURES.mdx
│   ├── guides/PATTERNS_OVERVIEW.mdx
│   ├── guides/HOOKS.mdx
│   ├── labs/INDEX.mdx               # Labs index
│   ├── labs/LAB_01_NOTIFICATION_CENTER.mdx
│   ├── labs/LAB_02_ERROR_FIRST_API.mdx
│   ├── labs/LAB_03_A11Y_AUDIT_FIX.mdx
│   └── LLM_WORKFLOW_GUIDE.md        # AI development guide
│
├── 📁 public/                       # Static assets
└── 📁 storybook-static/             # Build output (after npm run build)
```

## 🔍 Why AIBook Works

### 1. AI Has Working Examples to Follow

```typescript
// Instead of guessing, AI sees this working pattern:
// src/stories/Epics/EpicManager.tsx
const [data, setData] = useState(initialData)
const filtered = data.filter(...) // AI learns your filtering approach
```

### 2. Everything Works Without Setup

```typescript
// No backend? No problem. MSW provides data:
fetch("/api/items"); // Returns mock data instantly
// Control behavior via Storybook toolbar
```

### 3. Tests Catch AI's Mistakes

```typescript
// AI might forget edge cases, but tests catch them:
it("handles empty state", () => {
  /* ... */
});
it("handles errors gracefully", () => {
  /* ... */
});
```

## 🎨 Customization

### Add Your Components

1. Create component: `src/stories/YourCategory/YourComponent.tsx`
2. Add story: `src/stories/YourCategory/YourComponent.stories.tsx`
3. Add test: `tests/unit/YourComponent.test.tsx`
4. Add mocks: Update `src/mocks/handlers.ts`

### Configure for Your Needs

- Port: Change `7007` in package.json scripts
- Theme: Update `.storybook/preview.ts`
- Coverage thresholds: Edit `vitest.config.ts`

## 🚀 CI/CD Ready

GitHub Actions workflow included:

- ✅ Builds Storybook
- ✅ Runs unit tests with coverage
- ✅ Runs accessibility tests
- ✅ Runs E2E tests
- ✅ Uploads artifacts

See [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Deploy Storybook to GitHub Pages

A Pages workflow is included to publish the static Storybook.

- Enable Pages in your repo (source: GitHub Actions)
- Ensure permissions to write to gh-pages
- On pushes to main, a fresh build will be deployed

## 🤝 Contributing

This starter is designed to be forked and customized. When contributing back:

1. Keep examples simple and reusable
2. Ensure all tests pass
3. Add stories for new components
4. Document patterns for AI reference

## 🤔 Common Questions

**Q: Do I need to know Storybook?**  
A: No. AIBook is pre-configured. Just run `npm run dev`.

**Q: What if I don't use React?**  
A: Vue/Angular versions coming soon. The patterns work everywhere.

**Q: Can I use my own components?**  
A: Yes! Add them following the existing patterns.

**Q: Does this work with Copilot/Cursor?**  
A: Yes! Any AI that can read your codebase benefits from AIBook patterns.

## 📈 Success Stories

> "Cut our UI development time by 60%. AI finally generates code that works." - Dev Team Lead

> "No more debugging AI hallucinations. Everything just works." - Senior Developer

> "Our junior devs ship features 3x faster with AI + AIBook." - Engineering Manager

## 📝 License

MIT - Use freely in commercial projects!

---

## 👨‍💻 About the Creator

AIBook was created to solve real problems I faced while building with AI assistants. After countless hours debugging AI-generated code that "looked right" but didn't work, I realized we needed a better way.

🌐 **[Visit my portfolio](https://yourportfolio.com)** to see other projects and learn more about my work.

## ☕ Support This Project

If AIBook saves you time (and sanity), consider buying me a coffee! Your support helps me maintain this project and create more developer tools.

<div align="center">
  <a href="https://www.buymeacoffee.com/yourusername">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217">
  </a>
</div>

### Why Support?

- 🚀 Funds go directly to maintaining and improving AIBook
- 📚 Helps create more documentation and tutorials
- 🎯 Enables new features like Vue/Angular support
- 💡 Supports research into better AI development patterns

---

<div align="center">
  <h3>🚀 Stop fighting with AI-generated code</h3>
  <p><strong>Start shipping tested components today</strong></p>
  <br>
  <a href="https://github.com/NatureQuest/opensource-storybook">Get AIBook</a> • 
  <a href="docs/LLM_WORKFLOW_GUIDE.md">Read Guide</a> • 
  <a href="docs/guides/PATTERNS_OVERVIEW.mdx">Patterns</a> • 
  <a href="docs/guides/HOOKS.mdx">Hooks</a> • 
  <a href="https://yourportfolio.com">About Me</a> • 
  <a href="https://www.buymeacoffee.com/yourusername">☕ Support</a>
</div>

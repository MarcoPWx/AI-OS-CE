#!/usr/bin/env python3
"""
Generator: 1000 AI user journeys for development workflows
- Writes docs/specs/AI_USER_JOURNEYS_1000.md deterministically
- Categories include: Planning, Code Gen, Refactoring, Testing, CI/CD, Security, Performance,
  Accessibility, Docs, Migrations, Data, Infra, Observability, Team/Process, Frontend, Backend, Fullstack
"""
from __future__ import annotations
from pathlib import Path

CATEGORIES = [
    "Planning", "Code Generation", "Refactoring", "Testing", "CI/CD", "Security", "Performance",
    "Accessibility", "Documentation", "Migrations", "Data", "Infrastructure", "Observability",
    "Team & Process", "Frontend", "Backend", "Fullstack",
]

SEEDS = [
    "Create feature spec", "Break down epic", "Define acceptance criteria", "Estimate effort", "Identify risks",
    "Scaffold component", "Generate service layer", "Write API client", "Create hook", "Add story",
    "Extract function", "Simplify branching", "Introduce pattern", "Remove duplication", "Modularize code",
    "Write unit tests", "Add integration test", "Mock network", "Generate fixtures", "Increase coverage",
    "Setup pipeline", "Add lint stage", "Run a11y tests", "Cache dependencies", "Publish artifacts",
    "Threat model", "Validate inputs", "Escape output", "Rotate keys", "Fix dependency vuln",
    "Profile hot path", "Add caching", "Parallelize work", "Reduce bundle", "Set budgets",
    "Add ARIA", "Keyboard nav", "Color contrast", "Focus order", "Live regions",
    "Update DevLog", "System Status", "API docs", "Changelog", "ADR",
    "DB migration", "Schema evolve", "Data backfill", "Zero-downtime", "Rollback plan",
    "ETL job", "Data validation", "Streaming", "Batch process", "Index tuning",
    "Provision infra", "IaC update", "Secrets mgmt", "Scale autos", "Blue/green deploy",
    "Tracing spans", "Structured logs", "Error triage", "Alert tuning", "SLO report",
    "Define workflow", "Code review", "Pair program", "Retrospective", "Onboarding",
    "UI layout", "State mgmt", "API integration", "Forms & a11y", "Styling system",
    "API design", "DB layer", "Background jobs", "AuthN/Z", "Observability hooks",
    "End-to-end flow", "Client-server contract", "Resilience", "Rate limiting", "Feature flags",
]

TARGET = 1000

def main() -> None:
    out = ["# 1000 AI User Journeys for Development\n"]
    i = 1
    while i <= TARGET:
        for cat in CATEGORIES:
            for seed in SEEDS:
                if i > TARGET:
                    break
                out.append(f"{i}. [{cat}] {seed}")
                i += 1
            if i > TARGET:
                break
    dest = Path("docs/specs/AI_USER_JOURNEYS_1000.md")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text("\n".join(out), encoding="utf-8")
    print(f"Wrote {dest} with {TARGET} journeys")

if __name__ == "__main__":
    main()


# Docs Merge Policy

Purpose
- Ensure non-destructive, reasoned consolidation of duplicated docs while preserving provenance and clarity.

Invariants
- No data loss: never delete or overwrite existing docs; always add/insert.
- Canonical paths are the single source of truth:
  - DevLog: docs/status/DEVLOG.md
  - Epics: docs/roadmap/EPICS.md
  - System Status: docs/SYSTEM_STATUS.md
- Status pages (e.g., docs/status/EPIC_MANAGEMENT_CURRENT.md) remain; if consolidated, add pointers instead of deleting.

Merge flow (per type)
- DevLog
  - Append missing dated entries from legacy (docs/DEVLOG.md) into canonical with provenance.
  - Keep legacy file and add a top pointer to the canonical path.
- Epics
  - EPICS.md is the stable long-lived narrative.
  - docs/status/EPIC_MANAGEMENT_CURRENT.md is the live status. Do not move status content; ensure EPICS.md has a canonical notice.
- System Status
  - docs/SYSTEM_STATUS.md is canonical.
  - docs/status/SYSTEM_STATUS_CURRENT.md should include a pointer to the canonical doc.

Tooling
- Dry-run: npm run docs:merge
  - Scans likely duplicates, writes plan to docs/status/MERGE_REPORT.md, no changes.
- Apply: npm run docs:merge:apply
  - Executes minimal merges, archives originals to docs/archive/YYYY-MM-DD/<path>, writes MERGE_REPORT.md.

Documentation
- For any applied merge, commit the MERGE_REPORT with a short PR explanation: what moved, where, and why; provenance of moved sections; confirmation originals were preserved.


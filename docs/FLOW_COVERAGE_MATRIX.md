# CE Flow Coverage Matrix

This matrix tracks core flows in the Community Edition (CE). CE is module/CLI-only; no UI module is included.

Legend
- Status: planned | manual | automated
- Trace: correlationId visible (in headers/logs)

Flows
1) Local HTTP request with MSW echo
- Path: Run a CE script or test that calls GET /api/ping (MSW intercepts)
- Expected: JSON { ok: true, time } or injected error if configured
- Trace: X-Correlation-Id echoed from request header
- Status: manual

2) CLI flow with correlation tagging
- Path: Generate a correlation ID; run a CLI step; log cid=...
- Expected: CLI logs include the same cid across steps
- Trace: X-Correlation-Id included on any local HTTP calls
- Status: manual

3) Docs updates (optional manual)
- Path: Update DevLog/System Status using CLI
- Expected: On-disk files updated; commit references correlation ID if relevant
- Trace: cid recorded in DevLog entry if desired
- Status: manual

Notes
- Correlation IDs are echoed by MSW handlers for /api/ping and /api/echo.
- Keep correlation discipline even locally: it makes reproduction and handoff trivial later.


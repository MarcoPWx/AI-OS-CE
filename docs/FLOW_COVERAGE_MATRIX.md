# CE Flow Coverage Matrix

This matrix tracks the core flows we support in the Community Edition (CE). Each flow should be demoable in Storybook and testable with lightweight checks.

Legend
- Status: planned | manual | automated
- Trace: correlationId visible (headers/UI)

Flows
1) MSW Toggle + Ping Health
- Path: Docs toolbar → MSW On; GET /api/ping via external tools or future story
- Expected: JSON { ok: true, time } or injected error based on knobs
- Trace: X-Correlation-Id echoed from request header
- Status: manual

2) API Playground Request/Response
- Path: API/Playground → select endpoint → set params → Send Request
- Expected: Simulated status + headers (Content-Type, X-Request-ID, X-Response-Time)
- Trace: X-Correlation-Id generated in UI and shown in response headers
- Status: manual (ready for play() automation later)

3) Network Playground Load Test (simulated)
- Path: Dev/Network Playground → configure concurrentRequests & requestDelay → Start Load Test
- Expected: stats populated; recent results stream visible
- Trace: N/A (local simulation)
- Status: manual

4) Docs live readers
- Path: Docs/Dev Log, Docs/System Status in Storybook
- Expected: Markdown renders from docs/status/DEVLOG.md and docs/SYSTEM_STATUS.md
- Trace: N/A
- Status: manual

Notes
- Correlation IDs are echoed by MSW handlers for /api/ping and /api/echo.
- API Playground simulates calls but now displays X-Correlation-Id to demonstrate basic tracing.
- When we add story play() tests, convert Status to automated accordingly.


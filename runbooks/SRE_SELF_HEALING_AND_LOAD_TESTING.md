# SRE Self-Healing and Load Testing Runbook

Owner: Platform/SRE
Scope: QuizMentor API + workers, web, admin, background jobs, Supabase (Postgres, Storage, Auth), OpenAI integration, caches (Redis/Qdrant), and DigitalOcean App Platform or Kubernetes.

1. Purpose

- Provide actionable procedures to maintain reliability, scale beyond 1,000+ concurrent users, and recover quickly from failures.
- Standardize load testing, capacity planning, and incident response.

2. Service Level Objectives (suggested starting points)

- Availability: 99.9% monthly
- Error rate (5xx): < 0.5% per hour
- Latency p95: < 400 ms for synchronous API, p99 < 1,000 ms
- Background jobs time-to-drain: < 5 minutes for typical backlogs
- Cost: Within budget thresholds; automated alerts on 20% week-over-week increase
  Adjust per product needs and user tiers.

3. Monitoring & Alerting

- Metrics: Request count, error rate, latency percentiles, CPU/memory/utilization, queue length, DB connections, cache hit ratio, OpenAI call latency and error rate.
- Logs: Structured JSON logs with correlation/trace IDs. Include request_id, user_id (if available), route, status_code, latency_ms.
- Tracing: Enable OpenTelemetry for API, background workers, and DB calls.
- Dashboards: System overview, API latencies and error rates, DB health, cache performance, OpenAI dependency health, queues.
- Alerts (examples):
  - 5xx error rate > 1% for 5 minutes
  - p95 latency > 800 ms for 5 minutes
  - DB CPU > 80% for 10 minutes or connections > 80% of pool
  - Cache hit ratio < 70% for 15 minutes
  - OpenAI dependency error rate > 5% or latency > 2,000 ms

4. Self-Healing Patterns

- Health probes
  - Readiness probe: gate traffic until service has warm caches and DB connection established.
  - Liveness probe: restart unresponsive processes.
  - Startup probe: protect cold start; disable excessive restarts during boot.
- Horizontal scaling
  - Scale replicas on CPU/Memory and (if on K8s) custom metrics like request rate and queue length.
  - Ensure PodDisruptionBudget (PDB) to keep service available during maintenance.
- Backoff and retries
  - Implement exponential backoff when calling downstream (DB, cache, OpenAI). Use circuit breakers and timeouts.
- Degraded mode
  - If OpenAI is slow/unavailable: use cached responses, simplified in-cluster models, or queue-and-respond-later patterns with user notifications.
- Resource controls
  - Requests/limits sized to avoid node contention; cap max concurrency per pod to avoid DB saturation.
- Configuration safety
  - Feature flags for switching models and disabling heavy features.
  - Guardrails for max payload sizes and rate limits.

5. DigitalOcean App Platform (DOAP) specifics

- Scaling
  - Configure autoscaling for service (min/max instances). Start with min=2, max=10.
  - Verify health checks (HTTP path /healthz and /readyz, 200 OK) and proper timeouts.
- Rollbacks
  - Use DOAP’s previous deployment rollback or re-deploy pinned image tag.
- Logs & metrics
  - Use DO insights for CPU/mem, request metrics. Export logs to a centralized system where possible.

6. Supabase specifics

- Postgres
  - Use connection pooling (pgBouncer) and set max connections conservatively.
  - Add read replicas for heavy read paths.
  - Create essential indexes; monitor slow queries (pg_stat_statements).
- Auth and RLS
  - Ensure RLS policies don’t create slow filters. Profile queries on hot paths.
- Storage
  - Use CDN for public assets; avoid hot-spotting large downloads.

7. Kubernetes optional patterns (if using K8s)

- Use HPA with CPU (60-70%) and memory (70-80%) targets; consider custom metrics for RPS and queue length.
- Configure PDB: minAvailable: 1 or 60% depending on traffic.
- Anti-affinity to spread replicas across nodes.
- Graceful termination: preStop hook to stop accepting new requests and drain in-flight requests.

8. Load Testing with Locust

- Goals
  - Validate SLOs under expected and peak load.
  - Characterize breakpoints for capacity planning.
- Local quick start
  - docker-compose provided in ops/locust. Or run Locust directly with Python.
  - HEADLESS recommended for CI.
- Target selection
  - Test a representative mix: health, validation, plan generation, adaptive session next/submit, analytics.
- Data management
  - Use synthetic or anonymized data. Never use production credentials or data.
- Warm-up
  - Warm caches: 5–10 minutes at 20–30% target load before main run.
- Running examples
  - See ops/locust/.env.example. Use QM_API_TOKEN for auth if your API requires it.
- Thresholds
  - Define fail gates for error rate and latency percentiles; apply in CI to prevent regressions.

9. CI/CD: Scheduled load testing

- GitHub Actions workflow (.github/workflows/loadtest-locust.yml) runs nightly.
- Outputs CSV artifacts and a summarized CSV via scripts/export_locust_csv_summary.js.
- Configure secrets:
  - QM_LOADTEST_BASE_URL
  - QM_LOADTEST_API_TOKEN (if required)
  - Optional: QM_LOADTEST_USERS, QM_LOADTEST_SPAWN, QM_LOADTEST_RUNTIME, QM_LOADTEST_THRESHOLD_FAIL_RATIO, QM_LOADTEST_THRESHOLD_P95

10. Interpreting results and capacity planning

- Look at:
  - p95 and p99 trends during steady-state.
  - Error rate spikes correlated with DB saturation (connections, CPU) or external dependency slowness.
  - Throughput ceilings: when RPS plateaus but latency rises.
- Actions:
  - Scale horizontally if CPU-bound and DB is healthy.
  - Add read replicas or increase pool if DB-bound; optimize slow queries, add indexes.
  - Increase cache TTL or coverage if cache miss rate high.
  - Implement degraded mode for OpenAI and cache results.

11. Common incident playbooks

- 5xx spike
  - Check recent deploys; roll back if needed.
  - Inspect logs for common errors; correlate with DB and OpenAI.
  - Scale up temporarily and throttle expensive endpoints.
- Latency p95 > SLO
  - Identify endpoints with worst tail latencies; profile DB queries.
  - Add caching where safe; reduce N+1 calls; batch requests.
- DB connection saturation
  - Reduce app concurrency; increase pooler capacity; add read replica; fix connection leaks.
- OpenAI dependency degraded
  - Enable circuit breaker and degraded mode; use cached or simplified responses; queue heavy tasks.

12. Security and safeguards

- Never hardcode secrets. Use Vault/Secrets Manager.
- Rate limit public APIs; implement WAF rules if necessary.
- Red-team heavy endpoints with fuzz and abuse testing.

13. Admin dashboard integration (optional)

- Pull latest CI load test artifacts (CSV) and render charts.
- Display: current SLOs, last test p50/p95/p99, error rate, throughput, and trends.
- Provide a one-click trigger for ad-hoc load test in staging using GitHub workflow_dispatch.

14. How to run

- Local with compose (UI):
  - See ops/locust/docker-compose.yml; open http://localhost:8089
- Local headless (CLI):
  - Python: locust -f ops/locust/locustfile.py --headless -u 200 -r 20 --run-time 10m --host https://staging.example.com --csv=./artifacts/locust
- CI: configured in .github/workflows/loadtest-locust.yml

15. Change management

- Keep this runbook in version control. Update thresholds as SLOs and architecture evolve.
- Link this runbook from your on-call documentation and incident management tool.

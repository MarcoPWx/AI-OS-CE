# QuizMentor $200/Month Production Architecture

## Infrastructure Breakdown ($196/month)

### Primary Infrastructure: Hetzner Cloud (€51 ≈ $56)

```yaml
Nodes:
  - Master Node (CPX31): €16.90/month
    - 4 vCPU, 8GB RAM, 160GB NVMe
    - Runs: Control plane, Unleash, monitoring

  - Worker Node 1 (CPX31): €16.90/month
    - 4 vCPU, 8GB RAM, 160GB NVMe
    - Runs: AI engines (Bloom, Adaptive), Redis

  - Worker Node 2 (CPX31): €16.90/month
    - 4 vCPU, 8GB RAM, 160GB NVMe
    - Runs: PostgreSQL primary, Qdrant, backup services

Additional:
  - Load Balancer: €5.39/month
  - Volumes (100GB backup): €4.80/month
  - Floating IPs: €1.49/month
```

### Edge & CDN: Cloudflare ($15)

```yaml
Services:
  - CDN & DDoS Protection: Free tier
  - Workers (edge compute): $5/month
  - R2 Storage (100GB): $5/month
  - D1 Database (edge cache): $5/month
```

### Managed Services ($125)

```yaml
Core Services:
  - Supabase (Auth + Realtime): $25/month
  - OpenAI API (GPT-4): $50/month
  - Resend (Email): $20/month
  - Upstash (Redis + Queues): $10/month
  - Vercel (Frontend): $20/month

Free Tier Services:
  - GitHub Actions: Free (2000 min/month)
  - Sentry: Free (5K errors/month)
  - PostHog: Free (1M events/month)
```

## Why This Setup at $200?

### ✅ Perfect Balance:

- **3 Hetzner nodes** = Full redundancy + dedicated resources
- **24GB total RAM** = All AI models stay hot in memory
- **12 vCPUs** = Handle 5000+ concurrent users
- **Global edge** = <100ms latency worldwide
- **Managed services** = Less ops overhead, more building

### 🚀 Key Features:

1. **Zero-downtime deployments** (Blue-green)
2. **A/B testing built-in** (Feature flags)
3. **Auto-scaling ready** (K3s + HPA)
4. **Global performance** (Cloudflare edge)
5. **Full observability** (Metrics, logs, traces)

## Architecture Diagram:

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare (Global Edge)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   CDN    │  │ Workers  │  │    R2    │  │    D1    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │   Hetzner Load Balancer     │
         └──────────────┬──────────────┘
                        │
    ┌───────────────────┼───────────────────┐
    │                   │                   │
┌───▼────┐        ┌─────▼─────┐      ┌─────▼─────┐
│Master  │        │ Worker 1  │      │ Worker 2  │
│CPX31   │        │  CPX31    │      │  CPX31    │
├────────┤        ├───────────┤      ├───────────┤
│-K3s    │        │-AI Engine │      │-PostgreSQL│
│-Unleash│        │-Bloom Val │      │-Qdrant    │
│-Grafana│        │-Adaptive  │      │-Backup    │
│-Prometheus      │-Redis     │      │-Loki      │
└────────┘        └───────────┘      └───────────┘

External Services:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │  OpenAI  │  │  Resend  │  │ Upstash  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

## What You Get vs Other Options:

| Metric   | AWS ($400+) | DigitalOcean ($300) | Our Hetzner ($200) |
| -------- | ----------- | ------------------- | ------------------ |
| vCPUs    | 8           | 8                   | 12                 |
| RAM      | 16GB        | 16GB                | 24GB               |
| Storage  | 300GB EBS   | 400GB               | 480GB NVMe         |
| Transfer | 1TB         | 4TB                 | 60TB               |
| Regions  | Global      | 14                  | 1 + CDN            |
| Support  | Business    | Standard            | Community          |

## Migration Path:

### Month 1-2: Start Small ($150)

- 2 Hetzner nodes only
- Basic setup

### Month 3-6: Current Plan ($200)

- 3 nodes + all services
- Full redundancy

### Month 7+: Scale ($300+)

- Add more nodes as needed
- Multi-region if required

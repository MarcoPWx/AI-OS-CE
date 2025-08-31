# Autonomous Quiz Generation System - Cloud Deployment Guide

## 🚀 System Overview

This is a **fully autonomous, self-improving quiz generation system** that:

- **Generates** 50-200 questions daily from web sources
- **Tests** every question for quality and difficulty
- **Learns** from user feedback to improve
- **Deploys** high-quality questions automatically
- **Scales** horizontally based on demand

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   Load Balancer      │
         │   (Ingress/ALB)      │
         └──────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐         ┌──────────────┐
│  API Service │         │ Web Scraper  │
│  (FastAPI)   │         │   Workers    │
└──────┬───────┘         └──────┬───────┘
       │                         │
       └────────┬────────────────┘
                │
    ┌───────────┴──────────────┐
    ▼           ▼              ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐
│  Redis  │ │Postgres │ │ Celery Beat  │
│  Cache  │ │Database │ │  Scheduler   │
└─────────┘ └─────────┘ └──────────────┘
                │
                ▼
        ┌──────────────┐
        │   S3 Bucket  │
        │   (Backups)  │
        └──────────────┘
```

## Deployment Options

### Option 1: AWS EKS (Recommended for Production)

```bash
# 1. Create EKS cluster
eksctl create cluster \
  --name quiz-generator \
  --region us-east-1 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 5

# 2. Install required add-ons
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml

# 3. Deploy the application
kubectl apply -f k8s-deployment.yaml

# 4. Get the load balancer URL
kubectl get ingress -n quiz-generator
```

### Option 2: Google GKE

```bash
# 1. Create GKE cluster
gcloud container clusters create quiz-generator \
  --zone us-central1-a \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 5

# 2. Get credentials
gcloud container clusters get-credentials quiz-generator

# 3. Deploy
kubectl apply -f k8s-deployment.yaml
```

### Option 3: Docker Compose (Development/Small Scale)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: quizdb
      POSTGRES_USER: quizuser
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  worker:
    build: .
    command: celery -A autonomous_system worker --loglevel=info
    environment:
      DATABASE_URL: postgresql://quizuser:${DB_PASSWORD}@postgres:5432/quizdb
      REDIS_URL: redis://redis:6379/0
      S3_BUCKET: ${S3_BUCKET}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - postgres
      - redis
    scale: 3

  beat:
    build: .
    command: celery -A autonomous_system beat --loglevel=info
    environment:
      DATABASE_URL: postgresql://quizuser:${DB_PASSWORD}@postgres:5432/quizdb
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis

  flower:
    build: .
    command: celery -A autonomous_system flower
    ports:
      - '5555:5555'
    environment:
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
```

## Daily Operation Schedule

The system runs autonomously with this schedule:

| Time              | Task                 | Description                                  |
| ----------------- | -------------------- | -------------------------------------------- |
| **6:00 AM**       | Generate Daily Batch | Scrapes sources, generates 100+ questions    |
| **Every 30 min**  | Scrape Trending      | Monitors Stack Overflow, GitHub trending     |
| **12:00 PM**      | Quality Assessment   | Reviews staged questions                     |
| **Every 4 hours** | Learn from Feedback  | Adjusts generation based on user data        |
| **6:00 PM**       | Auto Deploy          | Deploys high-quality questions (>0.85 score) |
| **2:00 AM**       | Backup to S3         | Full database backup                         |
| **Every 5 min**   | Health Check         | System monitoring                            |

## Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/quizdb

# Redis
REDIS_URL=redis://localhost:6379/0

# AWS
AWS_REGION=us-east-1
S3_BUCKET=quiz-content-bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# AI (Optional)
OPENAI_API_KEY=sk-...

# Quality Settings
MIN_QUALITY_SCORE=0.75
AUTO_DEPLOY_THRESHOLD=10
FEEDBACK_LEARNING_RATE=0.1
```

## Monitoring & Observability

### 1. Celery Flower (Task Monitoring)

```bash
# Access at http://localhost:5555
celery -A autonomous_system flower
```

### 2. Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'quiz-generator'
    static_configs:
      - targets: ['api-service:8000']
```

### 3. Grafana Dashboard

Import dashboard from `grafana-dashboard.json` for:

- Questions generated per hour
- Quality score trends
- User feedback metrics
- System health status

### 4. Slack Notifications

The system sends automatic notifications for:

- ✅ Successful generation batches
- 🚀 Auto-deployments
- ⚠️ Quality issues
- ❌ System failures

## Cost Analysis

### AWS (Monthly Estimate)

- **EKS Cluster**: $72 (control plane)
- **EC2 Instances**: 3 × t3.medium = $90
- **RDS PostgreSQL**: db.t3.micro = $15
- **ElastiCache Redis**: cache.t3.micro = $13
- **S3 Storage**: 100GB = $2.30
- **Data Transfer**: ~$10
- **Total**: ~$202/month

### Optimization Tips

1. Use Spot Instances for workers (save 70%)
2. Schedule workers to scale down at night
3. Use S3 Intelligent-Tiering for backups
4. Consider Fargate for sporadic workloads

## Deployment Steps

### 1. Build and Push Docker Image

```bash
# Build
docker build -t quiz-generator:latest .

# Tag for registry
docker tag quiz-generator:latest your-registry/quiz-generator:latest

# Push
docker push your-registry/quiz-generator:latest
```

### 2. Initialize Database

```bash
# Run migrations
kubectl exec -it postgres-0 -n quiz-generator -- psql -U quizuser -d quizdb

# Or use Alembic
alembic upgrade head
```

### 3. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace quiz-generator

# Create secrets
kubectl create secret generic quiz-secrets \
  --from-literal=DATABASE_URL=... \
  --from-literal=OPENAI_API_KEY=... \
  -n quiz-generator

# Deploy all resources
kubectl apply -f k8s-deployment.yaml

# Check status
kubectl get all -n quiz-generator
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n quiz-generator

# Check logs
kubectl logs -f deployment/celery-worker -n quiz-generator

# Test health endpoint
curl http://quiz-gen.yourdomain.com/health
```

## Self-Learning Features

The system continuously improves through:

1. **Feedback Loop**
   - Tracks user ratings, response times, accuracy
   - Deactivates poor questions (rating < 2.5)
   - Promotes high-performers for variations

2. **Dynamic Source Selection**
   - Identifies content gaps
   - Prioritizes underrepresented categories
   - Focuses on successful patterns

3. **Quality Evolution**
   - Adjusts difficulty targeting
   - Learns optimal question formats
   - Improves distractor generation

## Scaling Strategies

### Horizontal Scaling

```yaml
# Increase workers during peak
kubectl scale deployment celery-worker --replicas=10 -n quiz-generator
```

### Auto-scaling Based on Queue Length

```python
# Custom metric for HPA
queue_length = redis.llen('celery')
if queue_length > 100:
    scale_workers(10)
```

### Multi-Region Deployment

```bash
# Deploy to multiple regions for global coverage
regions=("us-east-1" "eu-west-1" "ap-southeast-1")
for region in "${regions[@]}"; do
  eksctl create cluster --region $region ...
done
```

## Maintenance

### Daily Tasks (Automated)

- ✅ Generate new questions
- ✅ Test quality
- ✅ Deploy approved content
- ✅ Backup database
- ✅ Clean old logs

### Weekly Tasks

- Review quality metrics
- Adjust generation parameters
- Update source URLs
- Check cost optimization

### Monthly Tasks

- Analyze user feedback trends
- Update ML models
- Rotate API keys
- Security patches

## Troubleshooting

### Common Issues

1. **Low Generation Rate**

```bash
# Check worker logs
kubectl logs -l app=celery-worker -n quiz-generator --tail=100

# Scale workers
kubectl scale deployment celery-worker --replicas=5
```

2. **High Failure Rate**

```bash
# Check source availability
curl -I https://kubernetes.io/docs/

# Review error patterns
kubectl exec -it redis-0 -- redis-cli
> LRANGE celery-task-meta* 0 -1
```

3. **Database Connection Issues**

```bash
# Test connection
kubectl run -it --rm psql --image=postgres:14 --restart=Never -- \
  psql postgresql://quizuser:password@postgres-service:5432/quizdb
```

## Security Best Practices

1. **Secrets Management**
   - Use Kubernetes Secrets or AWS Secrets Manager
   - Rotate keys quarterly
   - Never commit secrets to git

2. **Network Security**
   - Use NetworkPolicies to restrict pod communication
   - Enable TLS for all external endpoints
   - Implement rate limiting

3. **Data Protection**
   - Encrypt database at rest
   - Use S3 encryption for backups
   - Implement GDPR compliance for user data

## Success Metrics

Track these KPIs:

| Metric            | Target | Current |
| ----------------- | ------ | ------- |
| Questions/Day     | 100+   | -       |
| Quality Pass Rate | >75%   | -       |
| Auto-Deploy Rate  | >20%   | -       |
| User Satisfaction | >4.0/5 | -       |
| System Uptime     | 99.9%  | -       |
| Cost per Question | <$0.01 | -       |

## Conclusion

This autonomous system will:

- Generate 3,000+ questions/month
- Maintain 75%+ quality standard
- Learn and improve continuously
- Cost <$250/month to operate
- Scale from 500 to 10,000+ questions

**Next Steps:**

1. Deploy to your cloud provider
2. Configure environment variables
3. Start the system
4. Monitor metrics
5. Watch it grow!

For support, check logs at:

- Celery Flower: http://your-domain:5555
- Grafana: http://your-domain:3000
- Application: http://quiz-gen.yourdomain.com/health

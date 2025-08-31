# QuizMentor Deployment Runbook

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Initial Setup](#initial-setup)
3. [Deployment Process](#deployment-process)
4. [Rollback Procedures](#rollback-procedures)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Required Accounts

- [ ] DigitalOcean account with billing configured
- [ ] Supabase account (Pro plan recommended)
- [ ] GitHub account with repository access
- [ ] Expo account for mobile builds
- [ ] Domain name registered and configured
- [ ] CloudFlare account (free tier is fine)

### Required Tools

```bash
# Install required CLI tools
brew install doctl              # DigitalOcean CLI
npm install -g eas-cli          # Expo Application Services
npm install -g vercel           # Vercel CLI (optional)
npm install -g supabase         # Supabase CLI

# Authenticate tools
doctl auth init
eas login
supabase login
```

### Environment Preparation

```bash
# 1. Clone repository
git clone https://github.com/your-org/QuizMentor.git
cd QuizMentor

# 2. Create environment files
cp .env.example .env.production
cp admin-dashboard/.env.local.example admin-dashboard/.env.local

# 3. Generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -hex 16      # For CRON_SECRET
```

---

## Initial Setup

### Step 1: Supabase Configuration

```bash
# 1. Create new Supabase project
supabase projects create quizmentor-prod --org-id your-org-id --region us-east-1

# 2. Get project credentials
supabase projects api-keys --project-ref your-project-ref

# Save these values:
# - Project URL: https://xxxxx.supabase.co
# - Anon Key: eyJhbGciOi...
# - Service Role Key: eyJhbGciOi... (keep secret!)
```

#### Configure Supabase Database

```sql
-- Run in Supabase SQL Editor

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pgsodium";

-- 2. Create vault schema
CREATE SCHEMA IF NOT EXISTS vault;

-- 3. Create secrets table
CREATE TABLE vault.secrets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  secret bytea NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  rotation_period interval DEFAULT '90 days'::interval,
  last_rotated_at timestamptz DEFAULT now()
);

-- 4. Create feature flags table
CREATE TABLE public.feature_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_overrides jsonb DEFAULT '[]'::jsonb,
  conditions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create quiz tables
CREATE TABLE public.questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_answer integer NOT NULL,
  explanation text,
  bloom_level text NOT NULL,
  difficulty text NOT NULL,
  topic text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  quiz_id uuid,
  score numeric,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6. Create analytics views
CREATE OR REPLACE VIEW analytics_dashboard AS
SELECT
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN created_at > now() - interval '1 day' THEN user_id END) as active_today,
  COUNT(*) as quizzes_completed,
  AVG(score) as avg_score
FROM user_sessions
WHERE completed_at IS NOT NULL;

-- 7. Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
CREATE POLICY "Public questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Step 2: DigitalOcean Setup

#### Create Container Registry

```bash
# Create registry
doctl registry create quizmentor

# Login to registry
doctl registry login

# Get registry endpoint
REGISTRY_ENDPOINT=$(doctl registry get --format Endpoint --no-header)
echo "Registry: $REGISTRY_ENDPOINT"
```

#### Create App Platform Apps

```bash
# 1. Deploy API Backend
doctl apps create --spec .do/app-simplified.yaml --wait

# Get app ID
API_APP_ID=$(doctl apps list --format ID --no-header | head -1)

# 2. Deploy Admin Dashboard
cd admin-dashboard
doctl apps create --spec .do/app.yaml --wait

# Get admin app ID
ADMIN_APP_ID=$(doctl apps list --format ID --no-header | tail -1)
```

### Step 3: Configure DNS

```bash
# 1. Get app domains
API_DOMAIN=$(doctl apps get $API_APP_ID --format DefaultIngress --no-header)
ADMIN_DOMAIN=$(doctl apps get $ADMIN_APP_ID --format DefaultIngress --no-header)

# 2. Configure CloudFlare DNS
# Add these records in CloudFlare dashboard:
# A record: api.yourdomain.com -> DigitalOcean IP
# A record: admin.yourdomain.com -> DigitalOcean IP
# CNAME record: www -> yourdomain.com
```

---

## Deployment Process

### Production Deployment Steps

#### 1. Pre-deployment Checks

```bash
# Run tests
npm test
npm run test:e2e

# Check for secrets in code
git secrets --scan

# Verify environment variables
./scripts/verify-env.sh production
```

#### 2. Database Migrations

```bash
# Backup database first
supabase db dump -f backup-$(date +%Y%m%d-%H%M%S).sql

# Run migrations
supabase db push --db-url $DATABASE_URL

# Verify migrations
supabase db diff --db-url $DATABASE_URL
```

#### 3. Deploy API Backend

```bash
# Build and push Docker image
docker build -t quizmentor-api:latest ./api
docker tag quizmentor-api:latest $REGISTRY_ENDPOINT/quizmentor-api:latest
docker push $REGISTRY_ENDPOINT/quizmentor-api:latest

# Update DigitalOcean app
doctl apps update $API_APP_ID --spec .do/app-simplified.yaml

# Monitor deployment
doctl apps logs $API_APP_ID --follow
```

#### 4. Deploy Expo Web

```bash
# Build for web
npx expo export:web

# Deploy to DigitalOcean Static Site
doctl apps create-deployment $WEB_APP_ID

# OR deploy to Vercel
vercel --prod
```

#### 5. Deploy Admin Dashboard

```bash
cd admin-dashboard

# Build production
npm run build

# Deploy
doctl apps create-deployment $ADMIN_APP_ID

# Verify deployment
curl -I https://admin.yourdomain.com/health
```

#### 6. Deploy Mobile Apps (if needed)

```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios

# Android
eas build --platform android --profile production
eas submit --platform android

# OTA Update (for quick fixes)
eas update --branch production --message "Deployment $(date +%Y%m%d)"
```

### Blue-Green Deployment

```bash
#!/bin/bash
# blue-green-deploy.sh

# 1. Deploy to staging slot
doctl apps update $API_APP_ID --spec .do/app-staging.yaml

# 2. Run smoke tests
npm run test:smoke -- --env=staging

# 3. Switch traffic
if [ $? -eq 0 ]; then
  echo "Smoke tests passed, switching traffic..."
  doctl apps update $API_APP_ID --spec .do/app-production.yaml
else
  echo "Smoke tests failed, rolling back..."
  exit 1
fi

# 4. Monitor for 5 minutes
sleep 300

# 5. Check error rates
ERROR_RATE=$(curl -s https://api.yourdomain.com/metrics | jq .error_rate)
if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
  echo "High error rate detected, rolling back..."
  doctl apps update $API_APP_ID --spec .do/app-previous.yaml
fi
```

### Canary Deployment

```bash
#!/bin/bash
# canary-deploy.sh

# 1. Deploy canary version (10% traffic)
kubectl apply -f k8s/canary-deployment.yaml

# 2. Update feature flag for canary
curl -X PATCH https://api.yourdomain.com/admin/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"key": "canary-version", "rollout_percentage": 10}'

# 3. Monitor metrics for 1 hour
sleep 3600

# 4. Check success metrics
SUCCESS_RATE=$(curl -s https://api.yourdomain.com/metrics/canary | jq .success_rate)

if (( $(echo "$SUCCESS_RATE > 0.95" | bc -l) )); then
  echo "Canary successful, increasing rollout..."
  # Gradually increase to 25%, 50%, 100%
  for PERCENT in 25 50 100; do
    curl -X PATCH https://api.yourdomain.com/admin/feature-flags \
      -d "{\"key\": \"canary-version\", \"rollout_percentage\": $PERCENT}"
    sleep 1800 # Wait 30 minutes between increases
  done
else
  echo "Canary failed, rolling back..."
  curl -X PATCH https://api.yourdomain.com/admin/feature-flags \
    -d '{"key": "canary-version", "rollout_percentage": 0}'
fi
```

---

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

```bash
#!/bin/bash
# immediate-rollback.sh

# 1. Revert to previous deployment
doctl apps rollback $API_APP_ID

# 2. Clear CDN cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# 3. Notify team
./scripts/notify-slack.sh "⚠️ Production rollback initiated for $API_APP_ID"
```

### Database Rollback

```bash
#!/bin/bash
# db-rollback.sh

# 1. Stop API services to prevent data corruption
doctl apps update $API_APP_ID --spec .do/maintenance-mode.yaml

# 2. Restore database backup
supabase db restore --backup-id $BACKUP_ID

# 3. Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM questions;"

# 4. Restart services
doctl apps update $API_APP_ID --spec .do/app-production.yaml
```

### Feature Flag Emergency Disable

```sql
-- Connect to Supabase SQL editor and run:
UPDATE feature_flags
SET enabled = false,
    rollout_percentage = 0
WHERE key = 'problematic-feature';

-- Broadcast change to all connected clients
SELECT pg_notify('feature_flag_change', '{"key": "problematic-feature", "enabled": false}');
```

---

## Post-Deployment Verification

### Health Checks

```bash
#!/bin/bash
# health-check.sh

ENDPOINTS=(
  "https://api.yourdomain.com/health"
  "https://admin.yourdomain.com/health"
  "https://www.yourdomain.com"
)

for endpoint in "${ENDPOINTS[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)
  if [ $response -eq 200 ]; then
    echo "✅ $endpoint is healthy"
  else
    echo "❌ $endpoint returned $response"
    ./scripts/notify-slack.sh "Health check failed for $endpoint"
  fi
done
```

### Performance Verification

```bash
# Run lighthouse tests
npm install -g @lhci/cli
lhci autorun --config=lighthouse.config.js

# Load testing
npm install -g artillery
artillery run tests/load-test.yml

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourdomain.com/api/quiz
```

### Database Verification

```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Verify replication lag (if applicable)
SELECT
  slot_name,
  pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS replication_lag
FROM pg_replication_slots;
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Deployment Fails

```bash
# Check deployment logs
doctl apps logs $API_APP_ID --type=build

# Common fixes:
# - Verify Docker image builds locally
# - Check environment variables are set
# - Ensure registry has enough space
```

#### 2. Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
SELECT * FROM pg_stat_activity WHERE state = 'idle';

# Reset connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < now() - interval '10 minutes';
```

#### 3. High Memory Usage

```bash
# Check app metrics
doctl apps get-metrics $API_APP_ID --resource=memory

# Restart instances
doctl apps restart $API_APP_ID

# Scale horizontally if needed
doctl apps update $API_APP_ID --spec .do/app-scaled.yaml
```

#### 4. Feature Flag Not Working

```sql
-- Debug feature flag
SELECT * FROM feature_flags WHERE key = 'your-flag';

-- Check user overrides
SELECT * FROM feature_flags
WHERE key = 'your-flag'
AND user_overrides @> '"user-id"'::jsonb;

-- Force refresh
UPDATE feature_flags
SET updated_at = now()
WHERE key = 'your-flag';
```

### Emergency Contacts

```yaml
On-Call Rotation:
  Primary: +1-xxx-xxx-xxxx
  Secondary: +1-xxx-xxx-xxxx

Escalation:
  Level 1: DevOps Team
  Level 2: Engineering Lead
  Level 3: CTO

External Support:
  DigitalOcean: support@digitalocean.com
  Supabase: support@supabase.com
  Expo: support@expo.dev
```

### Monitoring Dashboards

- **DigitalOcean Monitoring**: https://cloud.digitalocean.com/apps/YOUR_APP_ID/metrics
- **Supabase Dashboard**: https://app.supabase.com/project/YOUR_PROJECT_ID
- **CloudFlare Analytics**: https://dash.cloudflare.com
- **Admin Dashboard**: https://admin.yourdomain.com/dashboard

---

## Deployment Checklist Template

```markdown
## Deployment Date: \_**\_/\_\_**/\_\_\_\_

## Version: \***\*\_\*\***

## Deployed By: \***\*\_\*\***

### Pre-Deployment

- [ ] Code reviewed and approved
- [ ] Tests passing (Unit, Integration, E2E)
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Rollback plan documented

### During Deployment

- [ ] Database backed up
- [ ] Maintenance mode enabled (if needed)
- [ ] Database migrations run
- [ ] API deployed
- [ ] Frontend deployed
- [ ] Cache cleared

### Post-Deployment

- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Performance metrics normal
- [ ] Error rates normal
- [ ] User acceptance verified
- [ ] Monitoring alerts configured

### Sign-off

- [ ] DevOps Engineer: \***\*\_\*\***
- [ ] QA Engineer: \***\*\_\*\***
- [ ] Product Manager: \***\*\_\*\***
```

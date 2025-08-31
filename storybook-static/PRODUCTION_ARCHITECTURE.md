# QuizMentor Production Architecture

## 🚨 Critical Issues You've Identified

1. **Scraper & Cron Jobs** - Need separate hosting
2. **Remote Config Dashboard** - Change settings without redeploy
3. **Database Performance** - PostgreSQL vs NoSQL vs Vector DB
4. **AI Engine Latency** - Can't have 5-second response times
5. **Verification & Testing** - Must test before production

Let's solve each properly.

---

## 🏗️ Complete Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CloudFlare CDN                         │
│                 (Static Assets + DDoS)                   │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│              Next.js App (Vercel Edge)                   │
│                  - Frontend (React)                      │
│                  - API Routes (Edge Runtime)             │
│                  - ISR for cached pages                  │
└─────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Supabase      │  │  Upstash Redis  │  │    Qdrant       │
│  (Auth + SQL)   │  │  (Cache + Queue)│  │ (Vector Search) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  GitHub Actions │  │   QStash        │  │   Modal/Railway │
│   (Scrapers)    │  │  (Cron Jobs)    │  │  (AI Processing)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 1️⃣ Database Architecture (Hybrid Approach)

### Why Hybrid?

- **PostgreSQL (Supabase)**: User data, sessions, auth - needs ACID
- **Redis (Upstash)**: Hot questions cache, leaderboards - needs speed
- **Qdrant**: Question similarity search, AI embeddings - needs vectors

```typescript
// lib/db/hybrid-store.ts
export class HybridDataStore {
  private supabase: SupabaseClient;
  private redis: Redis;
  private qdrant: QdrantClient;

  // Fast question retrieval - Redis first, then PostgreSQL
  async getQuestion(id: string) {
    // L1 Cache: Redis (< 1ms)
    const cached = await this.redis.get(`q:${id}`);
    if (cached) return cached;

    // L2 Storage: PostgreSQL (5-10ms)
    const { data } = await this.supabase.from('questions').select('*').eq('id', id).single();

    // Cache for next time
    await this.redis.set(`q:${id}`, data, { ex: 3600 });
    return data;
  }

  // Bulk question loading for sessions
  async getQuestionBatch(ids: string[]) {
    // Use Redis pipeline for efficiency
    const pipeline = this.redis.pipeline();
    ids.forEach((id) => pipeline.get(`q:${id}`));
    const cached = await pipeline.exec();

    // Get missing from PostgreSQL
    const missing = ids.filter((id, i) => !cached[i]);
    if (missing.length > 0) {
      const { data } = await this.supabase.from('questions').select('*').in('id', missing);

      // Cache them
      const cachePipeline = this.redis.pipeline();
      data.forEach((q) => cachePipeline.set(`q:${q.id}`, q, { ex: 3600 }));
      await cachePipeline.exec();
    }

    return mergeResults(cached, data);
  }

  // Similar questions using vector search
  async findSimilarQuestions(text: string, limit = 10) {
    // Get embedding from OpenAI
    const embedding = await this.getEmbedding(text);

    // Search in Qdrant
    const results = await this.qdrant.search({
      collection: 'questions',
      vector: embedding,
      limit,
      with_payload: true,
    });

    return results.map((r) => r.payload);
  }
}
```

### Database Schema Optimizations

```sql
-- Partitioned tables for scale
CREATE TABLE quiz_sessions (
  -- ... columns ...
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE quiz_sessions_2024_01 PARTITION OF quiz_sessions
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Materialized views for analytics
CREATE MATERIALIZED VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) as total_sessions,
  AVG(score) as avg_score,
  MAX(streak_days) as best_streak
FROM quiz_sessions
GROUP BY user_id;

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats;
END;
$$ LANGUAGE plpgsql;

-- Index for faster queries
CREATE INDEX CONCURRENTLY idx_questions_composite
  ON questions(category, difficulty, bloom_level)
  WHERE is_active = true;
```

---

## 2️⃣ Scraper & Cron Job Architecture

### Option A: GitHub Actions (Free, Simple)

```yaml
# .github/workflows/scraper.yml
name: Question Scraper

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch: # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run scraper
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          node scripts/scraper.js

      - name: Validate scraped content
        run: |
          node scripts/validate-scraped.js

      - name: Send notification
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Scraper failed!'
```

### Option B: QStash (Serverless Cron)

```typescript
// app/api/cron/scrape/route.ts
import { verifySignature } from '@upstash/qstash/nextjs';

export const POST = verifySignature(async (req) => {
  // This runs on schedule via QStash
  const scraper = new QuestionScraper();

  try {
    // Scrape in chunks to avoid timeout
    const sources = await getScrapeSources();

    for (const source of sources) {
      // Queue each source as separate job
      await qstash.publishJSON({
        url: `${process.env.NEXT_PUBLIC_URL}/api/jobs/scrape-source`,
        body: { source },
        retries: 3,
      });
    }

    return Response.json({ queued: sources.length });
  } catch (error) {
    await notifyError(error);
    throw error;
  }
});

// app/api/jobs/scrape-source/route.ts
export async function POST(req: Request) {
  const { source } = await req.json();

  // Scrape with timeout protection
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000));

  const scrape = scrapeSource(source);
  const result = await Promise.race([scrape, timeout]);

  // Process with AI
  const validated = await validateWithBloom(result);

  // Store in database
  await storeQuestions(validated);

  return Response.json({ processed: validated.length });
}
```

### Option C: Railway (Dedicated Workers)

```typescript
// workers/scraper/index.ts
import { CronJob } from 'cron';
import { Worker } from 'bullmq';

// Background worker that runs continuously
const scraperWorker = new Worker(
  'scraper',
  async (job) => {
    const { url, selector } = job.data;

    // Use Puppeteer for dynamic content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const content = await page.$$eval(selector, (elements) => elements.map((el) => el.textContent));

    await browser.close();

    // Process and validate
    const questions = await processContent(content);
    await validateQuestions(questions);

    return { processed: questions.length };
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

// Schedule jobs
new CronJob('0 */6 * * *', async () => {
  const sources = await getSources();
  for (const source of sources) {
    await scraperQueue.add('scrape', source);
  }
});
```

---

## 3️⃣ Remote Config Dashboard

### Dynamic Configuration System

```typescript
// lib/config/remote-config.ts
export class RemoteConfig {
  private static instance: RemoteConfig;
  private cache = new Map<string, any>();
  private lastFetch = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  static getInstance() {
    if (!this.instance) {
      this.instance = new RemoteConfig();
    }
    return this.instance;
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    // Check cache first
    if (this.cache.has(key) && Date.now() - this.lastFetch < this.CACHE_TTL) {
      return this.cache.get(key);
    }

    // Fetch from Supabase
    const { data } = await supabase.from('config').select('value').eq('key', key).single();

    const value = data?.value ?? defaultValue;
    this.cache.set(key, value);
    this.lastFetch = Date.now();

    return value;
  }

  // Real-time updates
  subscribe(key: string, callback: (value: any) => void) {
    return supabase
      .channel('config_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'config',
          filter: `key=eq.${key}`,
        },
        (payload) => {
          this.cache.set(key, payload.new.value);
          callback(payload.new.value);
        },
      )
      .subscribe();
  }
}

// Usage in your engine
const config = RemoteConfig.getInstance();

export async function getAdaptiveSettings() {
  return {
    flowThreshold: await config.get('adaptive.flow_threshold', 0.7),
    difficultyStep: await config.get('adaptive.difficulty_step', 0.5),
    spacedRepetitionEnabled: await config.get('features.spaced_repetition', true),
    aiValidationEnabled: await config.get('features.ai_validation', true),
    scraperEnabled: await config.get('scraper.enabled', false),
    scraperSources: await config.get('scraper.sources', []),
  };
}
```

### Admin Dashboard

```typescript
// app/admin/config/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ConfigDashboard() {
  const [configs, setConfigs] = useState([]);
  const [testMode, setTestMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Load configs
    loadConfigs();

    // Subscribe to changes
    const subscription = supabase
      .channel('config_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'config'
      }, handleConfigChange)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const updateConfig = async (key: string, value: any) => {
    // Test mode: preview changes without saving
    if (testMode) {
      await testConfigChange(key, value);
      return;
    }

    // Update in database
    await supabase
      .from('config')
      .upsert({ key, value, updated_at: new Date() });

    // Invalidate CDN cache
    await fetch('/api/cache/purge', {
      method: 'POST',
      body: JSON.stringify({ keys: [key] })
    });
  };

  return (
    <div className="p-8">
      <h1>Remote Configuration Dashboard</h1>

      <div className="mb-4">
        <label>
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
          />
          Test Mode (preview without saving)
        </label>
      </div>

      <div className="grid gap-4">
        <ConfigSection
          title="AI Engine Settings"
          configs={[
            { key: 'ai.model', type: 'select', options: ['gpt-3.5', 'gpt-4', 'claude'] },
            { key: 'ai.temperature', type: 'slider', min: 0, max: 1, step: 0.1 },
            { key: 'ai.cache_ttl', type: 'number', unit: 'seconds' }
          ]}
        />

        <ConfigSection
          title="Adaptive Learning"
          configs={[
            { key: 'adaptive.flow_threshold', type: 'slider', min: 0, max: 1 },
            { key: 'adaptive.difficulty_adjustment_rate', type: 'number' },
            { key: 'adaptive.min_questions_per_session', type: 'number' }
          ]}
        />

        <ConfigSection
          title="Scraper Settings"
          configs={[
            { key: 'scraper.enabled', type: 'toggle' },
            { key: 'scraper.schedule', type: 'cron' },
            { key: 'scraper.sources', type: 'json', schema: scraperSourceSchema }
          ]}
        />

        <ConfigSection
          title="Feature Flags"
          configs={[
            { key: 'features.new_ui', type: 'toggle' },
            { key: 'features.beta_engine', type: 'percentage' },
            { key: 'features.maintenance_mode', type: 'toggle', critical: true }
          ]}
        />
      </div>

      <MonitoringPanel />
    </div>
  );
}
```

---

## 4️⃣ Performance Optimization Strategy

### Multi-Level Caching

```typescript
// lib/cache/multi-level.ts
export class MultiLevelCache {
  private l1: Map<string, any> = new Map(); // Memory (< 1ms)
  private l2: Redis; // Redis (1-5ms)
  private l3: SupabaseClient; // PostgreSQL (5-50ms)

  async get(key: string): Promise<any> {
    // L1: Memory cache
    if (this.l1.has(key)) {
      return this.l1.get(key);
    }

    // L2: Redis
    const cached = await this.l2.get(key);
    if (cached) {
      this.l1.set(key, cached);
      return cached;
    }

    // L3: Database
    const { data } = await this.l3.from('cache').select('value').eq('key', key).single();

    if (data) {
      // Populate upper levels
      await this.l2.set(key, data.value, { ex: 3600 });
      this.l1.set(key, data.value);
      return data.value;
    }

    return null;
  }

  async set(key: string, value: any, ttl = 3600) {
    // Write to all levels
    this.l1.set(key, value);
    await this.l2.set(key, value, { ex: ttl });
    await this.l3.from('cache').upsert({ key, value });
  }
}
```

### Edge Optimization

```typescript
// app/api/questions/[id]/route.ts
export const runtime = 'edge'; // Runs at edge locations

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Use edge KV for ultra-low latency
  const cached = await env.KV.get(`question:${params.id}`);
  if (cached) {
    return Response.json(cached, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=86400',
      },
    });
  }

  // Fallback to origin
  const data = await fetchFromOrigin(params.id);

  // Cache at edge
  await env.KV.put(`question:${params.id}`, data, { expirationTtl: 3600 });

  return Response.json(data);
}
```

---

## 5️⃣ Pre-Production Testing & Verification

### Staging Environment

```typescript
// lib/env/staging.ts
export function getStagingConfig() {
  return {
    supabase: {
      url: process.env.NEXT_PUBLIC_STAGING_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_STAGING_SUPABASE_ANON_KEY,
    },
    redis: {
      url: process.env.STAGING_REDIS_URL,
    },
    ai: {
      // Use cheaper models in staging
      model: 'gpt-3.5-turbo',
      mockResponses: true, // Use mock responses for testing
    },
  };
}

// Staging-only routes
if (process.env.VERCEL_ENV === 'preview') {
  // Enable debug endpoints
  app.get('/api/debug/cache', debugCacheHandler);
  app.get('/api/debug/config', debugConfigHandler);
  app.post('/api/debug/reset', resetStagingData);
}
```

### Load Testing

```javascript
// tests/load/k6-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Scale to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'], // Error rate under 10%
  },
};

export default function () {
  // Test question fetching
  const questionRes = http.get('https://staging.quizmentor.app/api/questions/random');
  check(questionRes, {
    'question fetched': (r) => r.status === 200,
    'fast response': (r) => r.timings.duration < 200,
  });

  // Test session creation
  const sessionRes = http.post('https://staging.quizmentor.app/api/sessions/start', {
    topic: 'math',
    difficulty: 3,
  });
  check(sessionRes, {
    'session created': (r) => r.status === 201,
  });

  sleep(1);
}
```

### Synthetic Monitoring

```typescript
// monitoring/synthetic.ts
import { chromium } from 'playwright';

async function runSyntheticTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Test critical user journey
    await page.goto('https://staging.quizmentor.app');

    // Login
    await page.click('[data-test="login-github"]');
    await page.waitForURL('**/dashboard');

    // Start quiz
    await page.click('[data-test="start-quiz"]');
    await page.waitForSelector('[data-test="question-card"]');

    // Answer question
    await page.click('[data-test="answer-option-0"]');
    await page.click('[data-test="submit-answer"]');

    // Check adaptation happened
    const difficulty = await page.getAttribute('[data-test="difficulty-indicator"]', 'data-level');

    if (!difficulty) {
      throw new Error('Adaptation failed');
    }

    // Report success
    await reportMetric('synthetic.test.success', 1);
  } catch (error) {
    await reportMetric('synthetic.test.failure', 1);
    await notifyOncall(error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run every 5 minutes
setInterval(runSyntheticTest, 5 * 60 * 1000);
```

---

## 6️⃣ Vector Database (Qdrant) Integration

### When You Need It

- Semantic question search
- Finding similar questions
- AI-powered recommendations
- Duplicate detection

```typescript
// lib/vector/qdrant.ts
import { QdrantClient } from '@qdrant/js-client';

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export async function indexQuestion(question: Question) {
  // Generate embedding
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question.text,
  });

  // Store in Qdrant
  await qdrant.upsert({
    collection_name: 'questions',
    points: [
      {
        id: question.id,
        vector: embedding.data[0].embedding,
        payload: {
          text: question.text,
          category: question.category,
          difficulty: question.difficulty,
          bloom_level: question.bloom_level,
        },
      },
    ],
  });
}

export async function findSimilar(text: string, filters?: any) {
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  const results = await qdrant.search({
    collection_name: 'questions',
    vector: embedding.data[0].embedding,
    limit: 10,
    filter: filters,
    with_payload: true,
  });

  return results;
}
```

---

## 🚀 Deployment Checklist

### Pre-Launch

- [ ] Load test with expected traffic (k6/Artillery)
- [ ] Security audit (OWASP scan)
- [ ] Database indexes optimized
- [ ] CDN configured (CloudFlare)
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured (Mixpanel/Amplitude)
- [ ] Monitoring dashboards ready (Grafana)
- [ ] Runbooks documented
- [ ] Backup strategy tested
- [ ] Rate limiting configured
- [ ] DDoS protection enabled

### Launch Day

- [ ] Feature flags set to gradual rollout
- [ ] Support team briefed
- [ ] Monitoring alerts configured
- [ ] Database connection pooling verified
- [ ] Cache warmed up
- [ ] Synthetic tests running
- [ ] Rollback plan ready

### Post-Launch

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review user feedback
- [ ] Scale resources if needed
- [ ] Document lessons learned

---

## 💰 Cost Optimization

### Estimated Monthly Costs

```
Vercel Pro:         $20  (Frontend + API)
Supabase Pro:       $25  (Auth + PostgreSQL)
Upstash:           $10  (Redis + QStash)
Qdrant Cloud:      $25  (Vector search)
OpenAI:            $50  (AI validation)
CloudFlare:        $20  (CDN + DDoS)
Monitoring:        $0   (Free tiers)
----------------------------
Total:             ~$150/month for production
```

### Scaling Costs

- 10K users: ~$150/month
- 100K users: ~$500/month
- 1M users: ~$2000/month

---

**The key insight**: Start with PostgreSQL + Redis cache. Add Qdrant only when you need semantic search. Use GitHub Actions for scrapers initially. Upgrade to dedicated workers only at scale.

# Integrating Your Existing QuizMentor Engine with Next.js + Supabase

## 🎯 The Challenge

You've built a sophisticated self-learning engine with:

- **BloomsTaxonomyValidator** - Question classification and validation
- **AdaptiveLearningEngine** - ML-inspired adaptive algorithms
- **SelfLearningOrchestrator** - Coordinates the learning experience

Now we need to deploy this WITHOUT overengineering. Here's how.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│      Next.js Frontend (Vercel)          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│    Next.js API Routes (Your Engine)     │
│  - /api/bloom/validate                  │
│  - /api/adaptive/adjust                 │
│  - /api/orchestrator/session            │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│  Your TS    │ │Supabase │ │OpenAI (opt) │
│   Engine    │ │   DB    │ │  for NLP    │
└─────────────┘ └─────────┘ └─────────────┘
```

## 🔧 Step 1: Adapt Your Services for Next.js API Routes

Your existing services become API routes. No microservices needed!

### File Structure

```
app/
├── api/
│   ├── bloom/
│   │   ├── validate/
│   │   │   └── route.ts       # POST /api/bloom/validate
│   │   └── classify/
│   │       └── route.ts       # POST /api/bloom/classify
│   ├── adaptive/
│   │   ├── adjust/
│   │   │   └── route.ts       # POST /api/adaptive/adjust
│   │   ├── flow-state/
│   │   │   └── route.ts       # POST /api/adaptive/flow-state
│   │   └── recommendations/
│   │       └── route.ts       # GET /api/adaptive/recommendations
│   └── orchestrator/
│       ├── session/
│       │   └── route.ts       # POST /api/orchestrator/session
│       └── learning-path/
│           └── route.ts       # POST /api/orchestrator/learning-path
└── lib/
    └── engine/                 # YOUR EXISTING ENGINE CODE
        ├── bloomsTaxonomyValidator.ts
        ├── adaptiveLearningEngine.ts
        └── selfLearningOrchestrator.ts
```

---

## 🚀 Step 2: Wrap Your Engine in API Routes

### Bloom's Taxonomy Validator API

```typescript
// app/api/bloom/validate/route.ts
import { NextResponse } from 'next/server';
import BloomsTaxonomyValidator from '@/lib/engine/bloomsTaxonomyValidator';
import { createClient } from '@/lib/supabase/server';

const validator = BloomsTaxonomyValidator.getInstance();

export async function POST(request: Request) {
  try {
    // Get user (for permissions)
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get question from request
    const question = await request.json();

    // Use your existing validator
    const validation = validator.validateQuestion(question);

    // Store validation results in Supabase (optional)
    await supabase.from('question_validations').insert({
      question_id: question.id,
      user_id: user.id,
      validation_result: validation,
      created_at: new Date(),
    });

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}

// Batch validation endpoint
export async function PUT(request: Request) {
  const questions = await request.json();
  const validator = BloomsTaxonomyValidator.getInstance();
  const results = validator.validateQuestionSet(questions);
  return NextResponse.json(results);
}
```

### Adaptive Engine API

```typescript
// app/api/adaptive/adjust/route.ts
import { NextResponse } from 'next/server';
import { AdaptiveLearningEngine } from '@/lib/engine/adaptiveLearningEngine';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, performance } = await request.json();

  // Initialize engine with user data from Supabase
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const engine = new AdaptiveLearningEngine({
    userId: user.id,
    profile: profile,
  });

  // Use your existing adaptive logic
  const adjustments = await engine.adjustDifficulty(performance);
  const flowState = engine.analyzeFlowState(performance);
  const recommendations = engine.generateRecommendations();

  // Store in Supabase
  await supabase
    .from('learning_sessions')
    .update({
      adaptations: adjustments,
      flow_state: flowState,
      recommendations: recommendations,
    })
    .eq('id', sessionId);

  return NextResponse.json({
    adjustments,
    flowState,
    recommendations,
  });
}
```

### Orchestrator API

```typescript
// app/api/orchestrator/session/route.ts
import { NextResponse } from 'next/server';
import { SelfLearningOrchestrator } from '@/lib/engine/selfLearningOrchestrator';
import { createClient } from '@/lib/supabase/server';
import { redis } from '@/lib/redis'; // Optional caching

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { topic, difficulty } = await request.json();

  // Check cache for existing session
  const cacheKey = `session:${user.id}:${topic}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  // Initialize orchestrator
  const orchestrator = SelfLearningOrchestrator.getInstance();

  // Generate optimal session using your existing logic
  const session = await orchestrator.generateOptimalSession(user.id, topic, {
    questionCount: 10,
    difficulty,
  });

  // Store in Supabase
  const { data: dbSession } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      questions: session.questions,
      config: session.sessionParams,
      pedagogical_metadata: session.pedagogicalMetadata,
    })
    .select()
    .single();

  // Cache for quick retrieval
  if (redis) {
    await redis.set(cacheKey, dbSession, { ex: 3600 });
  }

  return NextResponse.json(dbSession);
}
```

---

## 💾 Step 3: Connect Your Engine to Supabase

Modify your engine classes to use Supabase as the data store:

```typescript
// lib/engine/adaptiveLearningEngine.ts
import { createClient } from '@/lib/supabase/server';

export class AdaptiveLearningEngine {
  private supabase;

  constructor(config: any) {
    this.supabase = createClient();
    // Your existing initialization
  }

  async getUserProgress(userId: string) {
    // Instead of in-memory or file storage, use Supabase
    const { data } = await this.supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId);

    return this.processProgressData(data);
  }

  async saveAdaptation(userId: string, adaptation: any) {
    await this.supabase.from('adaptations').insert({
      user_id: userId,
      ...adaptation,
      created_at: new Date(),
    });
  }

  // Keep your existing ML algorithms intact
  calculateDifficultyAdjustment(performance: number): number {
    // Your existing logic remains the same
    const momentum = this.momentumOptimizer.optimize(performance);
    return this.applyAdaptiveRate(momentum);
  }
}
```

---

## 🎨 Step 4: Frontend Integration

Call your engine from React components:

```typescript
// components/QuizSession.tsx
'use client';

import { useState, useEffect } from 'react';

export default function QuizSession() {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Start session using your orchestrator
  const startSession = async () => {
    const response = await fetch('/api/orchestrator/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'mathematics',
        difficulty: 3
      })
    });

    const data = await response.json();
    setSession(data);
  };

  // Submit answer and get adaptation
  const submitAnswer = async (answer: string) => {
    // Validate with Bloom's
    const validation = await fetch('/api/bloom/validate', {
      method: 'POST',
      body: JSON.stringify({
        question: session.questions[currentQuestion],
        answer
      })
    });

    // Adjust difficulty with adaptive engine
    const adaptation = await fetch('/api/adaptive/adjust', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: session.id,
        performance: calculatePerformance(answer)
      })
    });

    const { adjustments } = await adaptation.json();

    // Apply adjustments to next question
    applyAdjustments(adjustments);
  };

  return (
    <div>
      {/* Your quiz UI */}
    </div>
  );
}
```

---

## 🚢 Step 5: Deploy Everything Together

### Option A: Vercel (Simplest)

Your engine runs as part of the Next.js app:

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@upstash/redis": "^1.28.0",
    "next": "14.0.4"
  }
}
```

Deploy:

```bash
vercel
```

### Option B: Docker (If you need more control)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy your engine and app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - UPSTASH_REDIS_REST_URL=${REDIS_URL}
```

---

## 🔄 Step 6: Migration Path

### From Your Current Services to API Routes

1. **Move service classes to `lib/engine/`**

   ```bash
   mkdir -p app/lib/engine
   cp services/*.ts app/lib/engine/
   ```

2. **Update imports to use Supabase**

   ```typescript
   // Before: File/memory storage
   const data = await fs.readFile('data.json');

   // After: Supabase
   const { data } = await supabase.from('table').select();
   ```

3. **Replace internal HTTP calls with direct function calls**

   ```typescript
   // Before: Microservices
   const result = await fetch('http://bloom-validator:3012/validate');

   // After: Direct import
   const result = validator.validateQuestion(question);
   ```

---

## ⚡ Performance Optimizations

### 1. Use Edge Runtime for Fast APIs

```typescript
// app/api/bloom/validate/route.ts
export const runtime = 'edge'; // Runs at edge locations
```

### 2. Cache Heavy Computations

```typescript
const cacheKey = `bloom:${questionHash}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;

const result = validator.validateQuestion(question);
await redis.set(cacheKey, result, { ex: 3600 });
```

### 3. Background Jobs for Heavy Processing

```typescript
// Use Vercel Cron or Supabase Edge Functions
// app/api/cron/process-adaptations/route.ts
export async function GET() {
  // Process adaptations in background
  await processAdaptationQueue();
  return NextResponse.json({ ok: true });
}
```

---

## 🎯 What You Get

1. **Your existing engine logic** - Completely preserved
2. **Simple deployment** - Just `vercel` or `docker compose up`
3. **Built-in auth** - GitHub OAuth via Supabase
4. **Database** - PostgreSQL via Supabase
5. **Caching** - Optional Redis via Upstash
6. **No Kubernetes complexity** - Everything in one Next.js app
7. **Cost effective** - Free tier covers most use cases

---

## 📝 Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: Redis for caching
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx

# Optional: OpenAI for enhanced NLP
OPENAI_API_KEY=sk-xxxx

# Your engine config
BLOOM_CONFIDENCE_THRESHOLD=0.7
ADAPTIVE_FLOW_THRESHOLD=0.75
SPACED_REPETITION_ENABLED=true
```

---

## 🚀 Quick Start Commands

```bash
# 1. Create Next.js app
npx create-next-app@latest quizmentor --typescript --tailwind --app

# 2. Copy your engine
cp -r services/* quizmentor/app/lib/engine/

# 3. Install dependencies
cd quizmentor
npm install @supabase/supabase-js @supabase/ssr

# 4. Set up Supabase
# - Create project at supabase.com
# - Run migrations (copy from our schema)
# - Enable GitHub auth

# 5. Create API routes wrapping your engine

# 6. Run locally
npm run dev

# 7. Deploy
vercel
```

---

## ✅ Checklist

- [ ] Move engine code to `lib/engine/`
- [ ] Create API routes for each service method
- [ ] Set up Supabase project
- [ ] Configure GitHub OAuth
- [ ] Update engine to use Supabase instead of file storage
- [ ] Add caching where needed
- [ ] Deploy to Vercel
- [ ] Test end-to-end flow

---

**The Bottom Line**: Your sophisticated engine doesn't need microservices. It runs beautifully as part of a Next.js app with Supabase handling the infrastructure complexity!

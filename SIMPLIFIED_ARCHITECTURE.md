# QuizMentor Simplified Architecture with Supabase

## 🎯 The Reality Check

You're right - we were overengineering! Let's build something that actually makes sense for a real project.

## 📊 Simplified Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                 │
│      (Vercel or Self-hosted)            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Next.js API Routes              │
│    (Backend logic in /api folder)       │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│  Supabase   │ │  Redis  │ │   OpenAI    │
│ (Auth + DB) │ │ (Cache) │ │    API      │
└─────────────┘ └─────────┘ └─────────────┘
```

## 🚀 What We Actually Need

### 1. Supabase (Handles Multiple Things!)

- **PostgreSQL Database** - Built-in, no setup needed
- **Authentication** - GitHub OAuth out of the box!
- **Real-time subscriptions** - For live updates
- **Storage** - For user avatars, documents
- **Row Level Security** - Database-level security

### 2. Next.js Full-Stack App

- **Frontend** - React components
- **API Routes** - Backend logic in same project
- **Server Components** - Direct database access
- **Edge Functions** - For compute-heavy tasks

### 3. Optional Services

- **Redis/Upstash** - Only if we need caching
- **OpenAI API** - For AI features
- **Vercel** - For deployment (or self-host)

## 🏗️ Actual Project Structure

```
QuizMentor/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx     # GitHub OAuth login
│   │   └── callback/
│   │       └── page.tsx     # OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx       # Protected layout
│   │   ├── page.tsx         # Dashboard
│   │   ├── quiz/
│   │   │   └── [id]/
│   │   │       └── page.tsx # Quiz taking
│   │   └── analytics/
│   │       └── page.tsx     # Learning analytics
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts # Supabase auth callback
│   │   ├── quiz/
│   │   │   ├── start/
│   │   │   │   └── route.ts # Start quiz session
│   │   │   └── submit/
│   │   │       └── route.ts # Submit answers
│   │   └── ai/
│   │       └── validate/
│   │           └── route.ts # Validate with AI
│   └── layout.tsx           # Root layout
├── components/
│   ├── QuizCard.tsx
│   ├── ProgressBar.tsx
│   └── AuthButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware
│   ├── redis.ts             # Redis client (if needed)
│   └── openai.ts            # OpenAI client
├── services/                 # Business logic
│   ├── quiz.service.ts      # Quiz logic
│   ├── adaptive.service.ts  # Adaptive learning
│   └── bloom.service.ts     # Bloom's taxonomy
└── types/
    └── database.ts          # Generated from Supabase

```

## 💾 Supabase Database Schema

```sql
-- Users table (managed by Supabase Auth)
-- Automatically created with GitHub OAuth

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  skill_level INTEGER DEFAULT 1,
  learning_style JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT CHECK (type IN ('multiple-choice', 'true-false', 'short-answer')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  category TEXT,
  options JSONB,
  correct_answer TEXT,
  bloom_level INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz sessions
CREATE TABLE quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  questions JSONB NOT NULL,
  responses JSONB,
  score DECIMAL(5,2),
  adaptations JSONB
);

-- Learning progress
CREATE TABLE learning_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  question_id UUID REFERENCES questions,
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_seen TIMESTAMP,
  next_review TIMESTAMP,
  mastery_level DECIMAL(3,2)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON quiz_sessions
  FOR ALL USING (auth.uid() = user_id);
```

## 🔐 GitHub OAuth Setup with Supabase

### 1. Configure GitHub OAuth App

```
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App:
   - Application name: QuizMentor
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/callback
3. Copy Client ID and Client Secret
```

### 2. Configure Supabase

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### 3. Login Component

```typescript
// components/LoginButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginButton() {
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error:', error)
  }

  return (
    <button onClick={handleGitHubLogin}>
      Login with GitHub
    </button>
  )
}
```

## 🚦 Do We Need Redis?

### When You DON'T Need Redis:

- Supabase connection pooling handles most caching needs
- Next.js has built-in caching
- For <1000 concurrent users
- Simple session management

### When You NEED Redis:

- Heavy real-time features (live quiz competitions)
- Complex session state
- Rate limiting
- Leaderboards
- Temporary data that shouldn't hit the database

### If Yes, Use Upstash (Serverless Redis):

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache quiz session
await redis.set(`session:${sessionId}`, sessionData, { ex: 3600 });

// Get cached session
const session = await redis.get(`session:${sessionId}`);
```

## 🎯 Actual Implementation Steps

### Step 1: Set Up Supabase Project

```bash
# Create Supabase project at supabase.com
# Get your project URL and anon key

# Install Supabase CLI (optional)
brew install supabase/tap/supabase

# Initialize locally
supabase init
supabase start
```

### Step 2: Create Next.js App

```bash
npx create-next-app@latest quizmentor-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd quizmentor-app

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @upstash/redis # Optional
npm install openai # For AI features
```

### Step 3: Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
OPENAI_API_KEY=your_openai_key
```

### Step 4: Core Services Implementation

```typescript
// services/quiz.service.ts
import { createClient } from '@/lib/supabase/server';

export class QuizService {
  async startSession(userId: string, config: any) {
    const supabase = createClient();

    // Get questions based on user level
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('difficulty', config.difficulty)
      .limit(10);

    // Create session
    const { data: session } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        questions: questions,
        config: config,
      })
      .select()
      .single();

    return session;
  }

  async submitAnswer(sessionId: string, questionId: string, answer: string) {
    // Validate answer
    // Update progress
    // Apply adaptive logic
  }
}
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Automatic deploys on git push
```

### Option 2: Self-Host with Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
```

### Option 3: Traditional VPS

```bash
# On your server
npm run build
pm2 start npm --name "quizmentor" -- start
```

## ✅ What This Gives You

1. **Authentication** - GitHub OAuth working in minutes
2. **Database** - PostgreSQL with migrations, RLS
3. **Real-time** - Live updates without WebSocket setup
4. **Caching** - Optional Redis only if needed
5. **Deployment** - One-click deploy to Vercel
6. **Cost** - Free tier covers most use cases

## 🎯 Actual Next Steps

1. **Create Supabase Project**

   ```bash
   # Go to supabase.com
   # Create new project
   # Enable GitHub OAuth in Authentication settings
   ```

2. **Clone Starter**

   ```bash
   npx create-next-app@latest --example with-supabase
   ```

3. **Add Your Logic**
   - Quiz components
   - Adaptive algorithms
   - Bloom's validation

4. **Deploy**
   ```bash
   vercel
   ```

## 💰 Cost Comparison

### Overengineered (Kubernetes + Microservices):

- Kubernetes cluster: $100-500/month
- Multiple databases: $50-200/month
- Monitoring stack: $50-100/month
- Development time: 2-3 months
- **Total: $200-800/month + massive complexity**

### Simplified (Supabase + Next.js):

- Supabase free tier: $0 (up to 500MB database)
- Vercel free tier: $0 (up to 100GB bandwidth)
- Upstash Redis free tier: $0 (up to 10,000 requests/day)
- Development time: 2-3 weeks
- **Total: $0-25/month for most projects**

## 🤔 When to Use Kubernetes?

Use Kubernetes when you have:

- 100,000+ daily active users
- Multiple teams working on different services
- Complex deployment requirements
- Budget for DevOps team
- Need for specific compliance (HIPAA, etc.)

For QuizMentor, the simplified stack is perfect!

---

**Bottom Line**: Start simple with Supabase + Next.js. You can always add complexity later if needed. Most successful products never need Kubernetes-level complexity.

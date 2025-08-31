# QuizMentor Quick Start with Supabase + Next.js

Note: For the React Native/Expo app, start with runbooks/DEVELOPER_MOCK_RUNBOOK.md for local mock workflows and docs/SUPABASE_SETUP_GUIDE.md for Supabase configuration.

This guide gets you from zero to GitHub login and working APIs in under an hour, without Kubernetes. You can add Redis later if needed.

---

## TL;DR

- Use Supabase for Auth (GitHub OAuth), DB, RLS
- Use Next.js for frontend + API routes (full stack)
- Skip Kubernetes for now; deploy on Vercel
- Add Redis (Upstash) only if you need caching/real-time heavy features

---

## 1) Set up Supabase (10 min)

- Create a project at supabase.com
- Get your Project URL and anon key
- Enable GitHub OAuth:
  - GitHub: Settings → Developer settings → OAuth Apps → New OAuth App
    - Homepage URL: http://localhost:3000
    - Authorization callback URL: http://localhost:3000/auth/callback
  - Copy Client ID/Secret and configure them in Supabase → Authentication → Providers → GitHub

Apply the schema (open Supabase SQL editor and paste supabase/schema.sql from this repo).

---

## 2) Create the Next.js app (10–15 min)

Run:

```bash
npx create-next-app@latest quizmentor-web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
cd quizmentor-web
npm i @supabase/supabase-js @supabase/ssr
# Optional caching
# npm i @upstash/redis
```

Create .env.local:

```bash
cp .env.example .env.local # if you use a template
# Or create manually
```

Add these values:

```env
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
# optional
# UPSTASH_REDIS_REST_URL=<your_url>
# UPSTASH_REDIS_REST_TOKEN=<your_token>
# OPENAI_API_KEY=<your_key>
```

---

## 3) Add Supabase clients (browser + server)

Create these helper files:

```ts path=null start=null
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

```ts path=null start=null
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

Optional Redis wrapper:

```ts path=null start=null
// lib/redis.ts
// Only if you enabled Upstash
import { Redis } from '@upstash/redis';
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

---

## 4) GitHub login button and callback

```tsx path=null start=null
// app/(auth)/login/page.tsx
'use client';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) alert(error.message);
  };
  return <button onClick={signIn}>Login with GitHub</button>;
}
```

```tsx path=null start=null
// app/auth/callback/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function CallbackPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');
  redirect('/(auth)/login');
}
```

Create a protected layout and page:

```tsx path=null start=null
// app/(dashboard)/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/(auth)/login');
  return <>{children}</>;
}
```

```tsx path=null start=null
// app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <main>Welcome {user?.email}</main>;
}
```

---

## 5) Start a quiz session (API route + service)

Service (simple example):

```ts path=null start=null
// services/quiz.service.ts
import { createClient } from '@/lib/supabase/server';

export class QuizService {
  static async startSession(userId: string, cfg: { difficulty?: number; count?: number }) {
    const supabase = createClient();
    const difficulty = cfg.difficulty ?? 1;
    const count = Math.min(Math.max(cfg.count ?? 10, 1), 25);

    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty)
      .limit(count);
    if (qErr) throw qErr;

    const { data: session, error: sErr } = await supabase
      .from('quiz_sessions')
      .insert({ user_id: userId, questions })
      .select()
      .single();
    if (sErr) throw sErr;

    return session;
  }
}
```

API route:

```ts path=null start=null
// app/api/quiz/start/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuizService } from '@/services/quiz.service';

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  try {
    const session = await QuizService.startSession(user.id, body);
    return NextResponse.json(session);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
```

---

## 6) Do we need Redis?

- Not required for MVP.
- Add only if you need: rate limiting, leaderboards, heavy real-time features, or caching expensive AI responses.

Caching example (optional):

```ts path=null start=null
// app/api/ai/validate/route.ts
import { NextResponse } from 'next/server';
// import { redis } from '@/lib/redis'

export async function POST(req: Request) {
  const body = await req.json();
  const key = `ai:validate:${JSON.stringify(body).length}`;
  // const cached = await redis.get(key)
  // if (cached) return NextResponse.json(cached)

  // const result = await callOpenAI(body)
  const result = { ok: true }; // placeholder
  // await redis.set(key, result, { ex: 3600 })
  return NextResponse.json(result);
}
```

---

## 7) Testing

- Unit: Jest or Vitest
- E2E: Playwright

Example unit test:

```ts path=null start=null
// tests/unit/quiz.service.test.ts
import { describe, it, expect } from 'vitest';

describe('QuizService', () => {
  it('starts a session with defaults', async () => {
    expect(true).toBe(true); // mock supabase in actual test
  });
});
```

Example e2e (Playwright):

```ts path=null start=null
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('login page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/(auth)/login');
  await expect(page.getByText('Login')).toBeVisible();
});
```

---

## 8) Deploy on Vercel (5 min)

```bash
npm i -g vercel
vercel link
vercel # follow prompts
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# add optional envs if used
vercel deploy --prod
```

---

## 9) Migration path to Kubernetes (later)

- Only consider k8s when you have high scale, complex team/org needs, or strict compliance.
- Until then, Vercel + Supabase + (optionally) Upstash will likely meet your needs with minimal ops.

---

Questions I can help with next:

- Hooking up your existing TypeScript adaptive engine into Next.js API routes
- Building the dashboard UI (progress, analytics)
- Writing proper unit tests with Supabase client mocks
- Adding OpenAI-powered validation safely with caching

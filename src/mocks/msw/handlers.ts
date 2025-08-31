import { http, HttpResponse } from 'msw';
import { devQuizData } from '../../../services/devQuizData';
import { quizData } from '../../../services/quizData';
import { expandedQuizData } from '../../../services/expandedQuizData';
import { authHandlers } from '../handlers/auth';
import { batchHandlers } from '../handlers/batch';

// Utility to combine all categories
const allCategories = [...quizData, ...devQuizData, ...expandedQuizData];

// Build a map from category id to questions
const categoryMap = new Map<string, any>();
for (const cat of allCategories) {
  categoryMap.set(cat.id, cat);
}

function parseCategoryId(url: URL): string | undefined {
  // Supabase REST: category_id=eq.<id>
  const params = url.searchParams;
  for (const [key, value] of params.entries()) {
    if (key === 'category_id' && value.startsWith('eq.')) {
      return value.slice(3);
    }
  }
  return undefined;
}

export const handlers = [
  // Batch processing handlers first so tests/integration pick them up
  ...batchHandlers,

  // Custom app-level auth mocks (GitHub, email/password, sessions)
  ...authHandlers,

  // Auth: password grant
  http.post(/.*\/auth\/v1\/token.*/, async ({ request }) => {
    try {
      const body = await request.json();
      if (body.grant_type === 'password') {
        const email = body.email || 'user@example.com';
        const user = {
          id: `user_${Math.random().toString(36).slice(2, 10)}`,
          email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: { name: email.split('@')[0] },
        };
        return HttpResponse.json(
          {
            access_token: 'mock_access',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock_refresh',
            user,
          },
          { status: 200 },
        );
      }
      return HttpResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    } catch (e) {
      return HttpResponse.json({ error: 'invalid_request' }, { status: 400 });
    }
  }),

  // Auth: signup
  http.post(/.*\/auth\/v1\/signup.*/, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const email = body.email || 'user@example.com';
    const user = {
      id: `user_${Date.now()}`,
      email,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: { name: body.data?.display_name ?? email.split('@')[0] },
    };
    return HttpResponse.json({ user }, { status: 200 });
  }),

  // Auth: user
  http.get(/.*\/auth\/v1\/user.*/, async () => {
    const user = {
      id: 'user_mock',
      email: 'dev@quizmentor.local',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: { name: 'Dev User' },
    };
    return HttpResponse.json({ user }, { status: 200 });
  }),

  // Auth: logout
  http.post(/.*\/auth\/v1\/logout.*/, async () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  // Question categories with counts
  http.get(/.*\/rest\/v1\/question_categories.*/, async ({ request }) => {
    const rows = allCategories.map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      description: (cat as any).description ?? null,
      order_index: idx,
      questions: [{ count: cat.questions?.length ?? 0 }],
    }));
    return HttpResponse.json(rows, { status: 200 });
  }),

  // Questions lookup (by category, optional range/random ignored for simplicity)
  http.get(/.*\/rest\/v1\/questions.*/, async ({ request }) => {
    const url = new URL(request.url);
    const catId = parseCategoryId(url);

    let questions: any[] = [];
    if (catId && categoryMap.has(catId)) {
      const cat = categoryMap.get(catId);
      questions =
        cat.questions?.map((q: any, index: number) => ({
          id: q.id ?? `${catId}_${index}`,
          category_id: catId,
          text: q.question ?? q.text ?? 'Question',
          options: q.options ?? q.answers ?? [],
          correct_answer: typeof q.correct === 'number' ? q.correct : q.correct_answer,
          difficulty: q.difficulty ?? 'easy',
          explanation: q.explanation ?? '',
          points: q.points ?? 10,
          order_index: index,
          metadata: q.metadata ?? {},
        })) ?? [];
    } else {
      // Fallback: take 10 random questions across all
      const all: any[] = allCategories.flatMap((cat) =>
        (cat.questions ?? []).map((q: any, index: number) => ({
          id: q.id ?? `${cat.id}_${index}`,
          category_id: cat.id,
          text: q.question ?? q.text ?? 'Question',
          options: q.options ?? q.answers ?? [],
          correct_answer: typeof q.correct === 'number' ? q.correct : q.correct_answer,
          difficulty: q.difficulty ?? 'easy',
          explanation: q.explanation ?? '',
          points: q.points ?? 10,
          order_index: index,
          metadata: q.metadata ?? {},
        })),
      );
      questions = all.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    return HttpResponse.json(questions, { status: 200 });
  }),

  // Remote config (questions version)
  http.get(/.*\/rest\/v1\/remote_config.*/, async () => {
    return HttpResponse.json({ questions_version: '1.0.0' }, { status: 200 });
  }),

  // Profiles table
  http.get(/.*\/rest\/v1\/profiles.*/, async ({ request }) => {
    const url = new URL(request.url);
    // id=eq.<userId>
    let userId: string | undefined;
    for (const [key, value] of url.searchParams.entries()) {
      if (key === 'id' && value.startsWith('eq.')) userId = value.slice(3);
    }
    const row = {
      id: userId ?? 'user_mock',
      username: 'dev_user',
      display_name: 'Dev User',
      avatar_url: null,
      bio: null,
      level: 5,
      xp: 1250,
      total_points: 5000,
      current_streak: 3,
      longest_streak: 7,
      theme: 'dark',
      language: 'en',
      notifications_enabled: true,
      sound_enabled: true,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(row, { status: 200 });
  }),

  http.post(/.*\/rest\/v1\/profiles.*/, async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const row = {
      id: body.id ?? `user_${Date.now()}`,
      username: body.username ?? 'new_user',
      display_name: body.display_name ?? null,
      avatar_url: body.avatar_url ?? null,
      bio: body.bio ?? null,
      level: body.level ?? 1,
      xp: body.xp ?? 0,
      total_points: body.total_points ?? 0,
      current_streak: body.current_streak ?? 0,
      longest_streak: body.longest_streak ?? 0,
      theme: body.theme ?? 'dark',
      language: body.language ?? 'en',
      notifications_enabled: body.notifications_enabled ?? true,
      sound_enabled: body.sound_enabled ?? true,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(row, { status: 201 });
  }),
];

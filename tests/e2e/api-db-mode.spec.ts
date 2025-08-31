import { test, expect } from '@playwright/test';

// E2E for DB-backed /api/quiz/questions
// Skips if DB mode is not enabled or required env vars are missing

test.describe('DB-backed Questions API', () => {
  test('responds with questions array (DB mode)', async ({ request }) => {
    const useDb = process.env.API_USE_SUPABASE === 'true';
    const url = process.env.SUPABASE_URL;
    const srv = process.env.E2E_BASE_URL || 'http://localhost:8081';

    test.skip(
      !useDb || !url,
      'DB mode not enabled or SUPABASE_URL missing; skipping DB-backed test',
    );

    const category = process.env.DB_TEST_CATEGORY_SLUG || ''; // optional
    const qs = new URLSearchParams();
    qs.set('limit', '5');
    qs.set('random', 'true');
    if (category) qs.set('categoryId', category);

    const res = await request.get(`${srv}/api/quiz/questions?${qs.toString()}`);
    expect(res.ok()).toBeTruthy();

    const json = await res.json();
    expect(json).toHaveProperty('questions');
    expect(Array.isArray(json.questions)).toBeTruthy();
    if (json.questions.length > 0) {
      const q = json.questions[0];
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('text');
      expect(q).toHaveProperty('options');
      expect(Array.isArray(q.options)).toBeTruthy();
      expect(q).toHaveProperty('correct_answer');
    }
  });
});

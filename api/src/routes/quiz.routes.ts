import { Router } from 'express';
import { supabase as db } from '../lib/supabaseClient';

const router = Router();

// POST /api/quiz/session - create quiz session
router.post('/session', async (req, res) => {
  try {
    const { userId, categoryId, difficulty } = req.body || {};
    // TODO: validate inputs, create session in DB
    return res.json({
      sessionId: `sess_${Date.now()}`,
      categoryId,
      difficulty: difficulty || 'medium',
      createdAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create session' });
  }
});

// GET /api/quiz/questions - fetch questions (paginated)
router.get('/questions', async (req, res) => {
  try {
    const {
      categoryId,
      difficulty,
      limit = '10',
      offset = '0',
      random = 'false',
    } = req.query as any;

    const useDb = String(process.env.API_USE_SUPABASE).toLowerCase() === 'true';
    const lim = Math.max(1, Math.min(200, Number(limit) || 10));
    const off = Math.max(0, Number(offset) || 0);
    const isRandom = String(random) === 'true';

    let questions: any[] = [];

    if (useDb) {
      // Resolve category filter (supports UUID or slug/name)
      let catIds: string[] | null = null;
      if (categoryId) {
        const uuidish = /^[0-9a-fA-F-]{36}$/;
        if (uuidish.test(String(categoryId))) {
          catIds = [String(categoryId)];
        } else {
          const slug = String(categoryId).toLowerCase();
          const catResp = await db
            .from('question_categories')
            .select('id, name, metadata')
            .or(`metadata->>slug.eq.${slug},name.eq.${slug}`)
            .limit(25);
          if (catResp.error) throw catResp.error;
          catIds = (catResp.data || []).map((c: any) => c.id);
        }
      }

      // Base query
      let q = db
        .from('questions')
        .select(
          'id, category_id, text, options, correct_answer, difficulty, explanation, is_active, created_at',
        );

      q = q.eq('is_active', true);
      if (catIds && catIds.length > 0) q = q.in('category_id', catIds);
      if (difficulty) q = q.eq('difficulty', String(difficulty));

      // For random, over-fetch then shuffle in memory
      const fetchLimit = isRandom ? Math.min(200, lim * 5) : lim + off;
      q = q.order('created_at', { ascending: false }).limit(fetchLimit);

      const qr = await q;
      if (qr.error) throw qr.error;
      let rows = qr.data || [];

      if (isRandom) {
        rows = rows.sort(() => Math.random() - 0.5);
      }

      rows = rows.slice(off, off + lim);

      questions = rows.map((r: any, idx: number) => ({
        id: r.id,
        categoryId: r.category_id,
        text: r.text,
        options: r.options,
        correct_answer: r.correct_answer,
        difficulty: r.difficulty,
        explanation: r.explanation,
        points: 10,
        order_index: off + idx,
      }));
    } else {
      // Prefer imported CLI dataset if present (JSON)
      const fs = await import('fs');
      const path = await import('path');
      const DATA_DIR = path.resolve(process.cwd(), 'data', 'cli_import');
      const Q_PATH = path.join(DATA_DIR, 'questions.json');

      if ((fs as any).existsSync(Q_PATH)) {
        const all = JSON.parse((fs as any).readFileSync(Q_PATH, 'utf8')) as any[];
        // Filter
        questions = all.filter((q: any) => {
          if (categoryId && q.category !== categoryId) return false;
          if (difficulty && q.difficulty !== difficulty) return false;
          return true;
        });
        // Randomize order if requested
        if (isRandom) {
          questions = questions.sort(() => Math.random() - 0.5);
        }
        const start = off;
        const end = start + lim;
        questions = questions.slice(start, end).map((q: any, idx: number) => ({
          id: q.id,
          categoryId: q.category,
          text: q.text,
          options: q.options,
          correct_answer: q.correct_answer,
          difficulty: q.difficulty,
          explanation: q.explanation,
          points: 10,
          order_index: start + idx,
        }));
      } else {
        // Fallback stub
        questions = Array.from({ length: lim }).map((_, i) => ({
          id: `q_${off + i}`,
          categoryId,
          text: `Sample question #${off + i + 1}`,
          options: ['A', 'B', 'C', 'D'],
          correct_answer: 0,
          difficulty: (difficulty as any) || 'medium',
          explanation: 'Stub explanation',
          points: 10,
          order_index: off + i,
        }));
      }
    }

    return res.json({ questions });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch questions' });
  }
});

// POST /api/quiz/answer - record answer and return correctness + rewards stub
router.post('/answer', async (req, res) => {
  try {
    const { userId, sessionId, questionId, choiceIndex, correctIndex = 0 } = req.body || {};
    const isCorrect = Number(choiceIndex) === Number(correctIndex);
    // TODO: persist answer; compute XP/streak via service
    return res.json({
      correct: isCorrect,
      xp: isCorrect ? 10 : 0,
      streak: isCorrect ? 1 : 0,
      bonuses: isCorrect ? ['combo_x1.0'] : [],
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to record answer' });
  }
});

// GET /api/quiz/leaderboard - return top users stub
router.get('/leaderboard', async (_req, res) => {
  try {
    const leaders = Array.from({ length: 10 }).map((_, i) => ({
      rank: i + 1,
      userId: `user_${i + 1}`,
      name: `User ${i + 1}`,
      xp: 1000 - i * 37,
      streak: Math.max(0, 20 - i),
      level: 1 + Math.floor((1000 - i * 37) / 100),
    }));
    return res.json({ leaders });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch leaderboard' });
  }
});

export default router;

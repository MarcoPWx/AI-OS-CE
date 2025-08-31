// api/src/routes/quiz.routes.enhanced.ts
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

// Validation schemas
const createSessionSchema = z.object({
  category: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  questionCount: z.number().min(1).max(50),
});

const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerIndex: z.number().min(0),
  timeSpent: z.number().min(0),
});

// Middleware to extract user from JWT
const requireAuth = async (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
  }
};

// POST /api/quiz/session - Create new quiz session
router.post('/session', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = createSessionSchema.parse(req.body);
    const userId = (req as any).user.id;

    // Get category ID
    const { data: category, error: categoryError } = await supabase
      .from('quiz_categories')
      .select('id')
      .eq('slug', validatedData.category.toLowerCase())
      .single();

    if (categoryError || !category) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid category',
      });
    }

    // Create quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        category_id: category.id,
        difficulty: validatedData.difficulty,
        total_questions: validatedData.questionCount,
        status: 'in_progress',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create quiz session',
      });
    }

    res.status(201).json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    console.error('Quiz session creation error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
});

// GET /api/quiz/questions - Get questions for a session
router.get('/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.sessionId as string;
    const userId = (req as any).user.id;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Session ID is required',
      });
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*, quiz_categories(name, slug)')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Quiz session not found',
      });
    }

    // Get questions for the session
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, question, answers, correct_answer, explanation, difficulty, tags')
      .eq('category_id', session.category_id)
      .eq('difficulty', session.difficulty)
      .eq('is_active', true)
      .limit(session.total_questions);

    if (questionsError) {
      console.error('Questions fetch error:', questionsError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch questions',
      });
    }

    // Shuffle questions and remove correct_answer from response
    const shuffledQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, session.total_questions)
      .map((q) => ({
        id: q.id,
        question: q.question,
        answers: q.answers,
        difficulty: q.difficulty,
        tags: q.tags,
        // Don't include correct_answer or explanation in response
      }));

    res.json({
      questions: shuffledQuestions,
      session: {
        id: session.id,
        status: session.status,
        category: (session as any).quiz_categories?.name,
        difficulty: session.difficulty,
        total_questions: session.total_questions,
        current_question: 0,
      },
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
});

// POST /api/quiz/answer - Submit answer for a question
router.post('/answer', requireAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = submitAnswerSchema.parse(req.body);
    const userId = (req as any).user.id;

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('id', validatedData.sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Quiz session not found',
      });
    }

    // Get question details
    const { data: question, error: questionError } = await supabase
      .from('quiz_questions')
      .select('correct_answer, explanation')
      .eq('id', validatedData.questionId)
      .single();

    if (questionError || !question) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Question not found',
      });
    }

    const isCorrect = validatedData.answerIndex === question.correct_answer;

    // Record the answer
    const { error: answerError } = await supabase.from('quiz_answers').insert({
      session_id: validatedData.sessionId,
      question_id: validatedData.questionId,
      answer_selected: validatedData.answerIndex,
      is_correct: isCorrect,
      time_taken: validatedData.timeSpent,
    });

    if (answerError) {
      console.error('Answer recording error:', answerError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to record answer',
      });
    }

    // Update session stats
    const newCorrectAnswers = session.correct_answers + (isCorrect ? 1 : 0);
    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        correct_answers: newCorrectAnswers,
        score: newCorrectAnswers,
      })
      .eq('id', validatedData.sessionId);

    if (updateError) {
      console.error('Session update error:', updateError);
    }

    // Calculate gamification rewards
    const xpGained = isCorrect ? 10 : 0;
    const pointsGained = isCorrect ? 100 : 0;

    // Get current user stats for streak/combo calculation
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak')
      .eq('id', userId)
      .single();

    const streak = profile?.current_streak || 0;
    const combo = 1.0; // Simplified for now

    // Check if this completes the quiz
    const { data: answeredQuestions } = await supabase
      .from('quiz_answers')
      .select('id')
      .eq('session_id', validatedData.sessionId);

    const nextQuestion = (answeredQuestions?.length || 0) < session.total_questions;

    res.json({
      correct: isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      xpGained,
      pointsGained,
      streak,
      combo,
      achievements: [], // TODO: Implement achievement checking
      nextQuestion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    console.error('Answer submission error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
});

// GET /api/quiz/leaderboard - Get leaderboard data
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    // Get leaderboard data
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('profiles')
      .select('id, username, display_name, level, xp, current_streak, avatar_url')
      .order('xp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (leaderboardError) {
      console.error('Leaderboard fetch error:', leaderboardError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch leaderboard',
      });
    }

    // Get total user count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Format leaderboard response
    const leaderboard = leaderboardData.map((user, index) => ({
      rank: offset + index + 1,
      user: {
        id: user.id,
        username: user.username,
        level: user.level,
        xp: user.xp,
        avatar_url: user.avatar_url,
      },
      score: user.xp,
      streak: user.current_streak,
    }));

    res.json({
      leaderboard,
      pagination: {
        page,
        limit,
        total: totalUsers || 0,
        hasNext: offset + limit < (totalUsers || 0),
        hasPrev: page > 1,
      },
      totalUsers: totalUsers || 0,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  }
});

export default router;

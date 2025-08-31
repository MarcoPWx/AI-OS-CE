// src/core/quiz/engine.ts
import type { Difficulty, Question, SessionConfig, SessionSnapshot } from './types';

function id(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createSession(cfg: SessionConfig): SessionSnapshot {
  const startedAt = Date.now();
  return {
    id: id('sess'),
    topic: cfg.topic,
    difficulty: cfg.difficulty,
    startedAt,
    index: 0,
    total: cfg.questions.length,
    streak: 0,
    maxStreak: 0,
    score: 0,
    xp: 0,
    answers: [],
    state: cfg.questions.length > 0 ? 'in_progress' : 'completed',
    current: cfg.questions[0],
  };
}

function xpForAnswer(correct: boolean, streak: number): number {
  if (!correct) return 0;
  const base = 10;
  const multiplier = streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1.0;
  return Math.round(base * multiplier);
}

export function answerCurrent(
  session: SessionSnapshot,
  selectedIndex: number,
  elapsedMs?: number,
): SessionSnapshot {
  if (session.state !== 'in_progress' || !session.current) return session;
  const q = session.current;
  const correct = selectedIndex === q.correctIndex;
  const newStreak = correct ? session.streak + 1 : 0;
  const newMax = Math.max(session.maxStreak, newStreak);
  const deltaXp = xpForAnswer(correct, newStreak);
  const answers = session.answers.concat({ questionId: q.id, selectedIndex, correct, elapsedMs });
  return {
    ...session,
    streak: newStreak,
    maxStreak: newMax,
    score: session.score + (correct ? 1 : 0),
    xp: session.xp + deltaXp,
    answers,
  };
}

export function next(session: SessionSnapshot, questions: Question[]): SessionSnapshot {
  if (session.state !== 'in_progress') return session;
  const nextIndex = session.index + 1;
  if (nextIndex >= session.total) {
    return {
      ...session,
      index: nextIndex,
      state: 'completed',
      completedAt: Date.now(),
      current: undefined,
    };
  }
  return {
    ...session,
    index: nextIndex,
    current: questions[nextIndex],
  };
}

export function getResult(session: SessionSnapshot) {
  const percent = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
  return {
    sessionId: session.id,
    topic: session.topic,
    difficulty: session.difficulty as Difficulty,
    score: session.score,
    total: session.total,
    percent,
    xp: session.xp,
    maxStreak: session.maxStreak,
    answers: session.answers,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
  };
}

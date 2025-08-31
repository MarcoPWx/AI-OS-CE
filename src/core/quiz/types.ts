// src/core/quiz/types.ts
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface AnswerSubmission {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  elapsedMs?: number;
}

export interface SessionConfig {
  topic: string;
  difficulty: Difficulty;
  questions: Question[];
}

export interface SessionSnapshot {
  id: string;
  topic: string;
  difficulty: Difficulty;
  startedAt: number;
  completedAt?: number;
  index: number;
  total: number;
  streak: number;
  maxStreak: number;
  score: number; // number of correct answers
  xp: number;
  answers: AnswerSubmission[];
  state: 'idle' | 'in_progress' | 'completed';
  current?: Question;
}

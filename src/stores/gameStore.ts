// src/stores/gameStore.ts
import { create } from 'zustand';
import type { Difficulty, Question, SessionSnapshot } from '../core/quiz/types';
import { createSession, answerCurrent, next } from '../core/quiz/engine';

function dummyQuestions(topic: string, difficulty: Difficulty): Question[] {
  const base = [
    {
      id: 'q1',
      text: `(${topic}/${difficulty}) What is 2+2?`,
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
    },
    {
      id: 'q2',
      text: `(${topic}/${difficulty}) Select the even number`,
      options: ['1', '2', '3', '5'],
      correctIndex: 1,
    },
    {
      id: 'q3',
      text: `(${topic}/${difficulty}) Which is a vowel?`,
      options: ['b', 'c', 'a', 'g'],
      correctIndex: 2,
    },
  ];
  return base;
}

type State = {
  session: SessionSnapshot | null;
  questions: Question[];
};

type Actions = {
  start: (topic: string, difficulty: Difficulty) => void;
  answer: (selectedIndex: number) => void;
  next: () => void;
  reset: () => void;
};

export const useGameStore = create<State & Actions>((set, get) => ({
  session: null,
  questions: [],
  start: (topic, difficulty) => {
    const questions = dummyQuestions(topic, difficulty);
    const session = createSession({ topic, difficulty, questions });
    set({ session, questions });
  },
  answer: (selectedIndex: number) => {
    const { session } = get();
    if (!session) return;
    set({ session: answerCurrent(session, selectedIndex) });
  },
  next: () => {
    const { session, questions } = get();
    if (!session) return;
    set({ session: next(session, questions) });
  },
  reset: () => set({ session: null, questions: [] }),
}));

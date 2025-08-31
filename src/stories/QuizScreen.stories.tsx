// src/stories/QuizScreen.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { QuizScreen } from '@/ui/quiz/QuizScreen';
import { createSession, answerCurrent, next } from '@/core/quiz/engine';
import type { SessionSnapshot, Question, Difficulty } from '@/core/quiz/types';

function useMockSession(topic: string, difficulty: Difficulty) {
  const questions: Question[] = [
    { id: 'q1', text: 'What is 2+2?', options: ['1', '2', '4', '5'], correctIndex: 2 },
    { id: 'q2', text: 'Select the even number', options: ['1', '2', '3', '5'], correctIndex: 1 },
  ];
  const [session, setSession] = React.useState<SessionSnapshot>(() =>
    createSession({ topic, difficulty, questions }),
  );
  return {
    session,
    select: (i: number) => setSession((s) => answerCurrent(s, i)),
    next: () => setSession((s) => next(s, questions)),
  };
}

function Demo() {
  const { session, select, next } = useMockSession('math', 'easy');
  const [locked, setLocked] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(10);
  React.useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 500);
    return () => clearInterval(t);
  }, []);
  function handleSelect(i: number) {
    select(i);
    setLocked(true);
    setReveal(true);
  }
  function handleNext() {
    setLocked(false);
    setReveal(false);
    setSecondsLeft(10);
    next();
  }
  return (
    <QuizScreen
      session={session}
      onSelect={handleSelect}
      onNext={handleNext}
      reveal={reveal}
      locked={locked}
      secondsLeft={secondsLeft}
      totalSeconds={10}
    />
  );
}

const meta = {
  title: 'UI/Quiz/QuizScreen',
  component: Demo,
  parameters: {
    docs: {
      description: {
        component:
          'Composite quiz screen (HUD + Question + Next). Story uses an internal mock engine to TDD the UI.',
      },
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Answer the first question with the correct option (index 2)
    await userEvent.click(c.getByTestId('question-option-2'));
    // Ensure selection is reflected (aria-pressed or data-selected)
    await expect(c.getByTestId('question-option-2')).toHaveAttribute('data-selected', 'true');
    // Next to proceed
    await userEvent.click(c.getByTestId('next-button'));
    // HUD should reflect updated score
    await expect(c.getByTestId('hud-score')).toHaveText(/Score:\s+1/);
  },
};

export const Completed: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Answer first and next
    await userEvent.click(c.getByTestId('question-option-2'));
    await userEvent.click(c.getByTestId('next-button'));
    // Answer second and next to complete
    await userEvent.click(c.getByTestId('question-option-1'));
    await userEvent.click(c.getByTestId('next-button'));
    await expect(c.getByTestId('result-summary')).toBeInTheDocument();
  },
};

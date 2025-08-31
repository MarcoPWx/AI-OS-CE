// src/stories/QuizFlowDemo.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

function QuizFlowDemo() {
  const [step, setStep] = useState<'intro' | 'question' | 'result'>('intro');
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const start = () => setStep('question');
  const submit = () => {
    const isCorrect = selected === 1; // option B is correct
    setCorrect(isCorrect);
    setStep('result');
  };

  return (
    <div style={{ maxWidth: 420 }}>
      {step === 'intro' && (
        <div>
          <h3>Quiz Flow Demo</h3>
          <button type="button" aria-label="start-quiz" onClick={start}>
            Start Quiz
          </button>
        </div>
      )}
      {step === 'question' && (
        <div>
          <div role="heading" aria-level={4}>
            What is closure in JavaScript?
          </div>
          <ul>
            <li>
              <label>
                <input type="radio" name="opt" onChange={() => setSelected(0)} /> Block scope
              </label>
            </li>
            <li>
              <label>
                <input type="radio" name="opt" onChange={() => setSelected(1)} /> Function +
                environment
              </label>
            </li>
            <li>
              <label>
                <input type="radio" name="opt" onChange={() => setSelected(2)} /> Module pattern
              </label>
            </li>
          </ul>
          <button
            type="button"
            aria-label="submit-answer"
            disabled={selected === null}
            onClick={submit}
          >
            Submit
          </button>
        </div>
      )}
      {step === 'result' && (
        <div>
          <div aria-label="result-text">{correct ? 'Correct!' : 'Try again'}</div>
          <button
            type="button"
            aria-label="back-home"
            onClick={() => {
              setStep('intro');
              setSelected(null);
              setCorrect(null);
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Flows/QuizFlowDemo',
  component: QuizFlowDemo,
  parameters: {
    docs: {
      description: {
        component:
          'A tiny quiz flow demo used to validate play() interactions without relying on app screens.',
      },
    },
    chromatic: {
      viewports: [375, 768],
    },
  },
} satisfies Meta<typeof QuizFlowDemo>;

export default meta;

export const HappyPath: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole('button', { name: /start quiz/i }));
    await userEvent.click(c.getByRole('radio', { name: /function \/\+ environment/i }));
    await userEvent.click(c.getByRole('button', { name: /submit/i }));
    await expect(c.getByLabelText(/result-text/i)).toHaveTextContent('Correct!');
  },
};

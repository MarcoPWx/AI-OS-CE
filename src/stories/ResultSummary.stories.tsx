// src/stories/ResultSummary.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { ResultSummary } from '@/ui/quiz/ResultSummary';

const meta = {
  title: 'UI/Quiz/ResultSummary',
  component: ResultSummary,
  args: {
    score: 8,
    total: 10,
    percent: 80,
    xp: 120,
    maxStreak: 4,
  },
  parameters: {
    docs: {
      description: { component: 'Shows summary of results — score, percent, XP, max streak.' },
    },
  },
} satisfies Meta<typeof ResultSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByTestId('result-summary')).toBeInTheDocument();
    await expect(c.getByTestId('result-score')).toHaveTextContent('8/10 (80%)');
  },
};

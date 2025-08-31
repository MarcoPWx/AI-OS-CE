// src/stories/QuizQuestion.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';
import { QuizQuestion } from '@/ui/quiz/QuizQuestion';

const meta = {
  title: 'UI/Quiz/QuizQuestion',
  component: QuizQuestion,
  args: {
    question: 'What is 2+2?',
    options: ['1', '2', '4', '5'],
    correctIndex: 2,
  },
  parameters: {
    docs: {
      description: {
        component: 'Presentational question with options. Stateless, tested in Storybook first.',
      },
    },
  },
} satisfies Meta<typeof QuizQuestion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Click option index 2
    await userEvent.click(c.getByTestId('question-option-2'));
    // No visual state assertion beyond click (stateless). Just ensure the button is in the document.
    await expect(c.getByTestId('question-option-2')).toBeInTheDocument();
  },
};

function Controlled() {
  const [sel, setSel] = React.useState<number | null>(null);
  return (
    <QuizQuestion
      question="Pick the even number"
      options={['1', '2', '3', '5']}
      selectedIndex={sel}
      onSelect={(i) => setSel(i)}
      correctIndex={1}
    />
  );
}

export const Keyboard: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    // Focus listbox and arrow down into second option
    await userEvent.click(c.getByRole('listbox'));
    await userEvent.keyboard('{ArrowDown}');
    await expect(c.getByTestId('question-option-1')).toHaveAttribute('data-selected', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(c.getByTestId('question-option-1')).toHaveAttribute('data-selected', 'true');
  },
};

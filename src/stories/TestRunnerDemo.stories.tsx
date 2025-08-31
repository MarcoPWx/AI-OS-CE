// src/stories/TestRunnerDemo.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 16 }}>
      <div aria-label="count">Count: {count}</div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  );
}

const meta = {
  title: 'Testing/Counter',
  component: Counter,
  parameters: {
    docs: {
      description: {
        component: 'Simple Counter to verify Storybook Test Runner (play functions) works in CI.',
      },
    },
  },
} satisfies Meta<typeof Counter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/count/i)).toHaveTextContent('Count: 0');
    await userEvent.click(canvas.getByRole('button', { name: /increment/i }));
    await expect(canvas.getByLabelText(/count/i)).toHaveTextContent('Count: 1');
  },
};

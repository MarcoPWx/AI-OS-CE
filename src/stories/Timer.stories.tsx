// src/stories/Timer.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { Timer } from '@/ui/designSystem/components/Timer';

function Demo() {
  const [left, setLeft] = React.useState(5);
  React.useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 300);
    return () => clearInterval(t);
  }, []);
  return <Timer secondsLeft={left} totalSeconds={5} />;
}

const meta = {
  title: 'UI/Design/Timer',
  component: Demo,
  parameters: { docs: { description: { component: 'Countdown display demo' } } },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const el = c.getByTestId('timer-text');
    await expect(el).toBeInTheDocument();
    // a11y: role and live region
    await expect(c.getByRole('status', { name: 'timer' })).toBeInTheDocument();
    await expect(el).toHaveAttribute('aria-live', 'polite');
    await expect(el).toHaveAttribute('aria-atomic', 'true');
  },
};

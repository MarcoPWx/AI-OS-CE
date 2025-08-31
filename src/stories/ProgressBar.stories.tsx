// src/stories/ProgressBar.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, expect } from '@storybook/test';
import { ProgressBar } from '@/ui/designSystem/components/ProgressBar';

const meta = {
  title: 'UI/Design/ProgressBar',
  component: ProgressBar,
  args: { percent: 50 },
  parameters: { docs: { description: { component: 'Simple progress bar' } } },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const bar = c.getByLabelText('progress');
    await expect(bar).toBeInTheDocument();
    await expect(bar).toHaveAttribute('role', 'progressbar');
    await expect(bar).toHaveAttribute('aria-valuemin', '0');
    await expect(bar).toHaveAttribute('aria-valuemax', '100');
    // default args percent: 50
    await expect(bar).toHaveAttribute('aria-valuenow', '50');
    await expect(bar).toHaveAttribute('aria-valuetext', '50%');
  },
};

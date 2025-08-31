import type { Meta, StoryObj } from '@storybook/react';
import AIPairProgramming from './AIPairProgramming';

const meta: Meta<typeof AIPairProgramming> = {
  title: 'Labs/AI Pair Programming',
  component: AIPairProgramming,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Hands-on exercises to practice AI-assisted development with progressive difficulty levels.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof AIPairProgramming> = {};

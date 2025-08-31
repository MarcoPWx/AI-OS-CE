import type { Meta, StoryObj } from '@storybook/react';
import AICollaborationGuide from './AICollaborationGuide';

const meta: Meta<typeof AICollaborationGuide> = {
  title: 'AI Guide/Collaboration Guide',
  component: AICollaborationGuide,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive guide for developers on how to effectively collaborate with AI assistants for faster, better development.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof AICollaborationGuide> = {};

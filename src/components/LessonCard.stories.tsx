// src/components/LessonCard.stories.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import LessonCard from './LessonCard';
import { userEvent, within, expect } from '@storybook/test';

const meta = {
  title: 'Components/LessonCard',
  component: LessonCard,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#0d1117', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    icon: { control: 'text' },
    color: { control: 'color' },
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    locked: { control: 'boolean' },
    completed: { control: 'boolean' },
    xpReward: { control: 'number' },
    difficulty: {
      control: 'select',
      options: ['easy', 'medium', 'hard'],
    },
    onPress: { action: 'pressed' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'LessonCard is used to present a course or topic entry with progress, difficulty, and rewards. Use the states below to showcase outcomes (default, in progress, completed, locked).',
      },
    },
  },
} satisfies Meta<typeof LessonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state
export const Default: Story = {
  args: {
    title: 'JavaScript Basics',
    description: 'Learn the fundamentals of JavaScript',
    icon: '📚',
    color: '#f1e05a',
    progress: 0,
    xpReward: 100,
    difficulty: 'easy',
  },
};

// In progress state
export const InProgress: Story = {
  args: {
    title: 'React Components',
    description: 'Master React component patterns',
    icon: '⚛️',
    color: '#61dafb',
    progress: 0.6,
    xpReward: 150,
    difficulty: 'medium',
  },
};

// Completed state
export const Completed: Story = {
  args: {
    title: 'TypeScript Advanced',
    description: 'Advanced TypeScript concepts',
    icon: '🔷',
    color: '#3178c6',
    progress: 1,
    completed: true,
    xpReward: 200,
    difficulty: 'hard',
  },
};

// Locked state
export const Locked: Story = {
  args: {
    title: 'GraphQL Mastery',
    description: 'Deep dive into GraphQL',
    icon: '🔒',
    color: '#e10098',
    progress: 0,
    locked: true,
    xpReward: 250,
    difficulty: 'hard',
  },
};

// Premium-required state (alias for locked with different messaging)
export const Premium: Story = {
  args: {
    title: 'Premium Deep Dives',
    description: 'Unlock premium to access advanced content',
    icon: '⭐',
    color: '#fbbf24',
    progress: 0,
    locked: true,
    xpReward: 400,
    difficulty: 'hard',
  },
};

// Loading placeholder state (simulate)
export const Loading: Story = {
  args: {
    title: 'Loading…',
    description: 'Fetching lesson details…',
    icon: '⏳',
    color: '#9ca3af',
    progress: 0,
    xpReward: 0,
    difficulty: 'easy',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Simulated loading placeholder. Replace with a skeleton state when available in the component.',
      },
    },
    chromatic: { pauseAnimationAtEnd: true },
  },
};

// Error/disabled state (simulate)
export const ErrorState: Story = {
  args: {
    title: 'Failed to load',
    description: 'Please try again later',
    icon: '⚠️',
    color: '#ef4444',
    progress: 0,
    xpReward: 0,
    difficulty: 'easy',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Simulated error placeholder. Use per-story MSW overrides on fetching components to trigger real 500/timeout states.',
      },
    },
  },
};

// Interactive story with a play() test
export const Interactive: Story = {
  render: (args) => {
    const [pressed, setPressed] = useState(0);
    return (
      <View style={{ gap: 12 }}>
        <Text accessibilityRole="text" accessibilityLabel="pressed-count">
          Pressed: {pressed}
        </Text>
        {/* Helper trigger for deterministic testing */}
        <button
          aria-label="trigger"
          onClick={() => setPressed((x) => x + 1)}
          style={{ padding: 8 }}
        >
          Trigger click
        </button>
        <LessonCard {...args} onPress={() => setPressed((x) => x + 1)} />
      </View>
    );
  },
  args: {
    title: 'Click Me Lesson',
    description: 'Play test will click and assert counter',
    icon: '🧪',
    color: '#10b981',
    progress: 0.2,
    xpReward: 50,
    difficulty: 'easy',
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText(/pressed-count/i)).toHaveTextContent('Pressed: 0');
    await userEvent.click(c.getByRole('button', { name: /trigger/i }));
    await expect(c.getByLabelText(/pressed-count/i)).toHaveTextContent('Pressed: 1');
  },
};

// Different difficulty levels
export const EasyLevel: Story = {
  args: {
    title: 'HTML Basics',
    description: 'Introduction to HTML',
    icon: '🌐',
    color: '#e34c26',
    progress: 0.3,
    xpReward: 50,
    difficulty: 'easy',
  },
};

export const MediumLevel: Story = {
  args: {
    title: 'CSS Grid & Flexbox',
    description: 'Layout techniques in CSS',
    icon: '🎨',
    color: '#1572b6',
    progress: 0.5,
    xpReward: 100,
    difficulty: 'medium',
  },
};

export const HardLevel: Story = {
  args: {
    title: 'System Design',
    description: 'Architecture patterns and best practices',
    icon: '🏗️',
    color: '#ff6b6b',
    progress: 0.2,
    xpReward: 300,
    difficulty: 'hard',
  },
};

// Various icons and colors
export const PythonLesson: Story = {
  args: {
    title: 'Python Data Structures',
    description: 'Lists, dictionaries, and more',
    icon: '🐍',
    color: '#3776ab',
    progress: 0.75,
    xpReward: 120,
    difficulty: 'medium',
  },
};

export const GitLesson: Story = {
  args: {
    title: 'Git Version Control',
    description: 'Master Git commands',
    icon: '🔀',
    color: '#f05032',
    progress: 0.9,
    xpReward: 80,
    difficulty: 'easy',
  },
};

export const DockerLesson: Story = {
  args: {
    title: 'Docker Containers',
    description: 'Containerization with Docker',
    icon: '🐳',
    color: '#2496ed',
    progress: 0.4,
    xpReward: 180,
    difficulty: 'medium',
  },
};

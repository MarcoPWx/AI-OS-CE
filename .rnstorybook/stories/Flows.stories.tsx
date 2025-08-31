// .rnstorybook/stories/Flows.stories.tsx
import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';

import AuthChoiceEpic from '../../src/screens/AuthChoiceEpic';
import HomeScreenEpic from '../../src/screens/HomeScreenEpic';
import QuizScreenEpic from '../../src/screens/QuizScreenEpic';
import ResultsScreenEpic from '../../src/screens/ResultsScreenEpic';

const meta = {
  title: 'Flows',
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'High-level screen flows. These stories render end-to-end screens to showcase user journeys (auth choice, home, quiz, results).',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AuthChoice: Story = {
  render: () => (
    <AuthChoiceEpic
      onEmailLogin={() => {}}
      onGoogleLogin={() => {}}
      onGitHubLogin={() => {}}
      onDemoLogin={() => {}}
      onSignup={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'AuthChoiceEpic presents authentication options (email, social, demo). In mock mode, GitHub login short-circuits to a mock session.',
      },
    },
  },
};

export const Home: Story = {
  render: () => (
    <HomeScreenEpic
      user={{
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@quizmentor.app',
        level: 5,
        xp: 1200,
        streak: 3,
        interests: ['javascript', 'react'],
        skillLevel: 'intermediate',
      }}
      onCategorySelect={() => {}}
      onStartLearning={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'HomeScreenEpic shows categories, stats, and quick actions. Use this to validate layout, animations, and category cards.',
      },
    },
  },
};

export const Quiz: Story = {
  render: () => (
    <QuizScreenEpic
      category="javascript"
      questions={[
        {
          id: 1,
          question: 'What is closure in JavaScript?',
          options: ['Block scope', 'Function + environment', 'Module pattern', 'Global scope'],
          correct: 1,
          explanation:
            'A closure is the combination of a function and the lexical environment within which that function was declared.',
        },
        {
          id: 2,
          question: 'Which hook handles side effects?',
          options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
          correct: 1,
          explanation:
            'useEffect is used for side effects such as data fetching and subscriptions.',
        },
      ]}
      onComplete={() => {}}
      onBack={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'QuizScreenEpic renders the quiz interaction loop with animations. Provide a small set of questions for snapshot testing and copy review.',
      },
    },
  },
};

export const Results: Story = {
  render: () => (
    <ResultsScreenEpic
      score={80}
      totalQuestions={10}
      category="javascript"
      onGoHome={() => {}}
      onRetry={() => {}}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'ResultsScreenEpic shows the final grade, accuracy, and call-to-actions. Use different scores to validate grade thresholds (A/B/C/etc.).',
      },
    },
  },
};

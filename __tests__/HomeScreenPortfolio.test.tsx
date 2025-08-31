import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreenPortfolio from '../src/screens/HomeScreenPortfolio';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn(() => ({ value: 1 })),
  withSpring: jest.fn(() => ({ value: 1 })),
}));

describe('HomeScreenPortfolio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeTruthy();
    });
  });

  test('displays user name', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeTruthy();
    });
  });

  test('shows main heading', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('Level Up Your Skills')).toBeTruthy();
    });
  });

  test('displays subtitle', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(
        screen.getByText('Master programming with interactive quizzes and challenges'),
      ).toBeTruthy();
    });
  });

  test('shows start learning button', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('Start Learning')).toBeTruthy();
    });
  });

  test('displays all learning categories', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeTruthy();
      expect(screen.getByText('React')).toBeTruthy();
      expect(screen.getByText('TypeScript')).toBeTruthy();
      expect(screen.getByText('Node.js')).toBeTruthy();
    });
  });

  test('shows category question counts', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('150 questions')).toBeTruthy();
      expect(screen.getByText('200 questions')).toBeTruthy();
      expect(screen.getByText('180 questions')).toBeTruthy();
      expect(screen.getByText('120 questions')).toBeTruthy();
    });
  });

  test('displays difficulty levels', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('Beginner')).toBeTruthy();
      expect(screen.getByText('Intermediate')).toBeTruthy();
      expect(screen.getByText('Advanced')).toBeTruthy();
    });
  });

  test('shows quick actions section', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeTruthy();
      expect(screen.getByText('Leaderboard')).toBeTruthy();
      expect(screen.getByText('Achievements')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
    });
  });

  test('renders category cards', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      const javascriptCard = screen.getByText('JavaScript');
      expect(javascriptCard).toBeTruthy();
    });
  });

  test('renders start learning button', async () => {
    render(<HomeScreenPortfolio />);

    await waitFor(() => {
      const startButton = screen.getByText('Start Learning');
      expect(startButton).toBeTruthy();
    });
  });
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import AppModernComplete from '../AppModernComplete';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
    },
  },
}));

describe('AppModernComplete', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    render(<AppModernComplete />);

    // Wait for the app to load
    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeTruthy();
    });
  });

  test('shows demo user information', async () => {
    render(<AppModernComplete />);

    await waitFor(() => {
      expect(screen.getByText('Demo User')).toBeTruthy();
    });
  });

  test('displays learning categories', async () => {
    render(<AppModernComplete />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeTruthy();
      expect(screen.getByText('React')).toBeTruthy();
      expect(screen.getByText('TypeScript')).toBeTruthy();
      expect(screen.getByText('Node.js')).toBeTruthy();
    });
  });

  test('shows quick action buttons', async () => {
    render(<AppModernComplete />);

    await waitFor(() => {
      expect(screen.getByText('Leaderboard')).toBeTruthy();
      expect(screen.getByText('Achievements')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
    });
  });

  test('displays start learning button', async () => {
    render(<AppModernComplete />);

    await waitFor(() => {
      expect(screen.getByText('Start Learning')).toBeTruthy();
    });
  });
});

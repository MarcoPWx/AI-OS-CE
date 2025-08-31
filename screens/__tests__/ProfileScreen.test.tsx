import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import ProfileScreen from '../ProfileScreen';
import authService from '../../services/authService';
import { gamificationService } from '../../services/gamification';
import { supabase } from '../../lib/supabase';

// Mock dependencies
jest.mock('../../services/authService');
jest.mock('../../services/gamification');
jest.mock('../../lib/supabase');
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  bio: 'Test bio',
  location: 'Test City',
};

const mockUserState = {
  xp: 2500,
  level: 8,
  stars: 150,
  rank: 42,
  dailyStreak: {
    current: 7,
    longest: 15,
  },
  quizHistory: [{ score: 85 }, { score: 92 }, { score: 78 }, { score: 45 }, { score: 88 }],
  questsCompleted: 12,
  unlockedCategories: ['javascript', 'react', 'nodejs'],
};

const mockAchievements = [
  { id: '1', unlockedAt: new Date() },
  { id: '2', unlockedAt: new Date() },
  { id: '3', unlockedAt: null },
  { id: '4', unlockedAt: new Date() },
];

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    (gamificationService.getUserState as jest.Mock).mockResolvedValue(mockUserState);
    (gamificationService.getAchievements as jest.Mock).mockResolvedValue(mockAchievements);

    // Mock Supabase query
    const mockSelect = {
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue(mockSelect),
    });
  });

  const renderScreen = () => {
    return render(
      <NavigationContainer>
        <ProfileScreen />
      </NavigationContainer>,
    );
  };

  describe('Loading State', () => {
    it('should show loading indicator initially', () => {
      const { getByText } = renderScreen();
      expect(getByText('Loading profile...')).toBeTruthy();
    });

    it('should hide loading indicator after data loads', async () => {
      const { queryByText } = renderScreen();

      await waitFor(() => {
        expect(queryByText('Loading profile...')).toBeNull();
      });
    });
  });

  describe('Profile Display', () => {
    it('should display user profile information', async () => {
      const { getByTestId } = renderScreen();

      await waitFor(() => {
        expect(getByTestId('profile-username')).toBeTruthy();
        expect(getByTestId('profile-email')).toBeTruthy();
        expect(getByTestId('profile-avatar')).toBeTruthy();
      });
    });

    it('should display user stats correctly', async () => {
      const { getByTestId, getByText } = renderScreen();

      await waitFor(() => {
        expect(getByTestId('stats-grid')).toBeTruthy();
        expect(getByText('Day Streak')).toBeTruthy();
        expect(getByText('Stars')).toBeTruthy();
        expect(getByText('Achievements')).toBeTruthy();
        expect(getByText('Global Rank')).toBeTruthy();
      });
    });

    it('should calculate accuracy correctly', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        // 4 out of 5 quizzes scored > 70, so 80% accuracy
        expect(getByText('80%')).toBeTruthy();
      });
    });

    it('should display performance metrics', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText('Total Quizzes')).toBeTruthy();
        expect(getByText('5')).toBeTruthy(); // Total quizzes
        expect(getByText('Accuracy')).toBeTruthy();
        expect(getByText('Categories Unlocked')).toBeTruthy();
        expect(getByText('3 / 20')).toBeTruthy(); // Categories
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to achievements screen', async () => {
      const { getByTestId } = renderScreen();
      const navigate = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate,
        goBack: jest.fn(),
      });

      await waitFor(() => {
        const button = getByTestId('view-achievements-button');
        fireEvent.press(button);
      });

      expect(navigate).toHaveBeenCalledWith('Achievements');
    });

    it('should navigate to leaderboard screen', async () => {
      const { getByTestId } = renderScreen();
      const navigate = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate,
        goBack: jest.fn(),
      });

      await waitFor(() => {
        const button = getByTestId('view-leaderboard-button');
        fireEvent.press(button);
      });

      expect(navigate).toHaveBeenCalledWith('Leaderboard');
    });

    it('should navigate to settings screen', async () => {
      const { getByTestId } = renderScreen();
      const navigate = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate,
        goBack: jest.fn(),
      });

      await waitFor(() => {
        const button = getByTestId('settings-button');
        fireEvent.press(button);
      });

      expect(navigate).toHaveBeenCalledWith('Settings');
    });

    it('should go back when back button pressed', async () => {
      const { getByTestId } = renderScreen();
      const goBack = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate: jest.fn(),
        goBack,
      });

      await waitFor(() => {
        const button = getByTestId('back-button');
        fireEvent.press(button);
      });

      expect(goBack).toHaveBeenCalled();
    });
  });

  describe('User Actions', () => {
    it('should handle logout correctly', async () => {
      const { getByTestId } = renderScreen();
      const navigate = jest.fn();

      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate,
        goBack: jest.fn(),
      });

      await waitFor(() => {
        const button = getByTestId('logout-button');
        fireEvent.press(button);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.any(Array),
      );

      // Simulate logout confirmation
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Logout');

      await act(async () => {
        await confirmButton.onPress();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith('Login');
    });

    it('should handle data export request', async () => {
      const { getByTestId } = renderScreen();

      await waitFor(() => {
        const button = getByTestId('export-data-button');
        fireEvent.press(button);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Export Data',
        'Your data export has been requested',
      );
    });

    it('should handle account deletion request', async () => {
      const { getByTestId } = renderScreen();

      await waitFor(() => {
        const button = getByTestId('delete-account-button');
        fireEvent.press(button);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Account',
        'This action cannot be undone. All your data will be permanently deleted.',
        expect.any(Array),
      );
    });

    it('should cancel account deletion when cancel pressed', async () => {
      const { getByTestId } = renderScreen();

      await waitFor(() => {
        const button = getByTestId('delete-account-button');
        fireEvent.press(button);
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const cancelButton = alertCall[2].find((btn: any) => btn.text === 'Cancel');

      cancelButton.onPress();

      // Profile should still be visible
      expect(getByTestId('profile-avatar')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle profile loading error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      });

      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to load profile');
      });
    });

    it('should redirect to login if not authenticated', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const navigate = jest.fn();
      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate,
        goBack: jest.fn(),
      });

      renderScreen();

      await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('Login');
      });
    });

    it('should create default profile if none exists', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found error
          }),
        }),
      });

      const { getByTestId } = renderScreen();

      await waitFor(() => {
        expect(getByTestId('profile-username')).toBeTruthy();
      });
    });
  });

  describe('Refresh Control', () => {
    it('should refresh data on pull to refresh', async () => {
      const { getByTestId } = renderScreen();

      await waitFor(() => {
        expect(getByTestId('profile-scroll-view')).toBeTruthy();
      });

      // Clear mock calls
      jest.clearAllMocks();

      // Trigger refresh
      const scrollView = getByTestId('profile-scroll-view');
      const { refreshControl } = scrollView.props;

      act(() => {
        refreshControl.props.onRefresh();
      });

      await waitFor(() => {
        expect(authService.getCurrentUser).toHaveBeenCalled();
        expect(gamificationService.getUserState).toHaveBeenCalled();
      });
    });
  });

  describe('Level Progress', () => {
    it('should display correct XP progress to next level', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        // XP is 2500, so 500 XP to next level (assuming 1000 XP per level)
        expect(getByText(/500 \/ 1000 XP to Level 9/)).toBeTruthy();
      });
    });

    it('should display level badge', async () => {
      const { getByText } = renderScreen();

      (gamificationService.getUserState as jest.Mock).mockResolvedValue({
        ...mockUserState,
        level: 15,
      });

      const { rerender } = renderScreen();

      await waitFor(() => {
        // Level badge should show level 15
        expect(getByText(/Level 15/)).toBeTruthy();
      });
    });
  });

  describe('Member Since', () => {
    it('should display member since date', async () => {
      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText(/Member since/)).toBeTruthy();
        expect(getByText(/1\/1\/2024/)).toBeTruthy();
      });
    });

    it('should handle missing created_at date', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { ...mockProfile, created_at: null },
            error: null,
          }),
        }),
      });

      const { getByText } = renderScreen();

      await waitFor(() => {
        expect(getByText(/Member since —/)).toBeTruthy();
      });
    });
  });
});

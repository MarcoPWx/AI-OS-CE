// __tests__/screens/QuizScreenFrictionless.test.tsx
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import QuizScreenFrictionless from '../../src/screens/QuizScreenFrictionless';
import questionDelivery from '../../src/services/questionDelivery';
import GamificationService from '../../src/services/gamification';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock route
const mockRoute = {
  params: {
    category: 'JavaScript',
  },
};

// Mock question delivery service
jest.mock('../../src/services/questionDelivery', () => ({
  getQuestions: jest.fn(),
}));

// Mock gamification service
jest.mock('../../src/services/gamification', () => ({
  getInstance: jest.fn(() => ({
    awardXP: jest.fn().mockResolvedValue({
      xpGained: 10,
      levelUp: false,
      bonuses: [],
    }),
    incrementCombo: jest.fn().mockReturnValue(1.5),
    breakCombo: jest.fn(),
    checkAchievements: jest.fn().mockReturnValue([]),
    updateQuestProgress: jest.fn(),
  })),
}));

// Mock components
jest.mock('../../src/components/GamificationComponents', () => ({
  AchievementPopup: ({ visible, onClose }: any) =>
    visible ? <div testID="achievement-popup" onPress={onClose} /> : null,
  ComboMultiplier: ({ show }: any) => (show ? <div testID="combo-multiplier" /> : null),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({ setValue: jest.fn() })),
      })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
  };
});

describe('QuizScreenFrictionless', () => {
  const mockQuestions = [
    {
      id: '1',
      question: 'What is JavaScript?',
      answers: ['A programming language', 'A coffee type', 'A car brand', 'A book'],
      correctAnswer: 0,
      explanation: 'JavaScript is a programming language.',
      difficulty: 'easy',
      category: 'JavaScript',
    },
    {
      id: '2',
      question: 'What is React?',
      answers: ['A library', 'A framework', 'A language', 'A database'],
      correctAnswer: 0,
      explanation: 'React is a JavaScript library.',
      difficulty: 'medium',
      category: 'JavaScript',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (questionDelivery.getQuestions as jest.Mock).mockResolvedValue(mockQuestions);
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      expect(getByText('Loading questions...')).toBeTruthy();
    });

    it('should render quiz questions after loading', async () => {
      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });
    });

    it('should render answer options', async () => {
      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('A programming language')).toBeTruthy();
        expect(getByText('A coffee type')).toBeTruthy();
        expect(getByText('A car brand')).toBeTruthy();
        expect(getByText('A book')).toBeTruthy();
      });
    });

    it('should show progress indicator', async () => {
      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('1 / 2')).toBeTruthy();
      });
    });
  });

  describe('Quiz Interaction', () => {
    it('should handle answer selection', async () => {
      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      await waitFor(() => {
        expect(getByText('🎉 Correct!')).toBeTruthy();
      });
    });

    it('should show explanation after answer selection', async () => {
      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      await waitFor(() => {
        expect(getByText('JavaScript is a programming language.')).toBeTruthy();
      });
    });

    it('should advance to next question automatically', async () => {
      jest.useFakeTimers();

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(getByText('What is React?')).toBeTruthy();
      });

      jest.useRealTimers();
    });
  });

  describe('Gamification Integration', () => {
    it('should award XP for correct answers', async () => {
      const mockGamificationService = GamificationService.getInstance();

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      await waitFor(() => {
        expect(mockGamificationService.awardXP).toHaveBeenCalledWith(10, 'quiz_answer_correct');
      });
    });

    it('should increment combo for correct answers', async () => {
      const mockGamificationService = GamificationService.getInstance();

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      await waitFor(() => {
        expect(mockGamificationService.incrementCombo).toHaveBeenCalled();
      });
    });

    it('should break combo for wrong answers', async () => {
      const mockGamificationService = GamificationService.getInstance();

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const wrongAnswer = getByText('A coffee type');
      fireEvent.press(wrongAnswer);

      await waitFor(() => {
        expect(mockGamificationService.breakCombo).toHaveBeenCalled();
      });
    });

    it('should show combo multiplier when combo > 1', async () => {
      const mockGamificationService = GamificationService.getInstance();
      (mockGamificationService.incrementCombo as jest.Mock).mockReturnValue(2.0);

      const { getByText, getByTestId } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      await waitFor(() => {
        expect(getByTestId('combo-multiplier')).toBeTruthy();
      });
    });

    it('should show achievement popup when achievement is unlocked', async () => {
      const mockGamificationService = GamificationService.getInstance();
      const mockAchievement = {
        id: 'first_quiz',
        name: 'Welcome!',
        description: 'Complete your first quiz',
        icon: '🎯',
        xp: 25,
      };
      (mockGamificationService.checkAchievements as jest.Mock).mockReturnValue([mockAchievement]);

      const { getByText, getByTestId } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');
      fireEvent.press(correctAnswer);

      await waitFor(() => {
        expect(getByTestId('achievement-popup')).toBeTruthy();
      });
    });
  });

  describe('Quiz Completion', () => {
    it('should show results screen after all questions', async () => {
      jest.useFakeTimers();

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      // Answer first question
      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      fireEvent.press(getByText('A programming language'));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Answer second question
      await waitFor(() => {
        expect(getByText('What is React?')).toBeTruthy();
      });

      fireEvent.press(getByText('A library'));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Should show results
      await waitFor(() => {
        expect(getByText('🎉 Quiz Complete!')).toBeTruthy();
      });

      jest.useRealTimers();
    });

    it('should display correct score', async () => {
      jest.useFakeTimers();

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      // Answer both questions correctly
      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      fireEvent.press(getByText('A programming language'));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(getByText('What is React?')).toBeTruthy();
      });

      fireEvent.press(getByText('A library'));

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(getByText('2/2')).toBeTruthy();
        expect(getByText('100%')).toBeTruthy();
      });

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle question loading errors', async () => {
      (questionDelivery.getQuestions as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('Loading questions...')).toBeTruthy();
      });

      // Should still show loading or error state, not crash
    });

    it('should handle gamification service errors', async () => {
      const mockGamificationService = GamificationService.getInstance();
      (mockGamificationService.awardXP as jest.Mock).mockRejectedValue(new Error('XP error'));

      const { getByText } = render(
        <QuizScreenFrictionless navigation={mockNavigation} route={mockRoute} />,
      );

      await waitFor(() => {
        expect(getByText('What is JavaScript?')).toBeTruthy();
      });

      const correctAnswer = getByText('A programming language');

      // Should not crash when XP awarding fails
      expect(() => {
        fireEvent.press(correctAnswer);
      }).not.toThrow();
    });
  });
});

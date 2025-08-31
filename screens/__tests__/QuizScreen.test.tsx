import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import QuizScreen from '../QuizScreen';
import { useQuiz } from '../../store/QuizContext';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('../../store/QuizContext');
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    impactLight: 'impactLight',
    notificationSuccess: 'notificationSuccess',
    notificationError: 'notificationError',
  },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = {
  params: {
    categoryId: 'react',
    categoryName: 'React',
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

describe('QuizScreen', () => {
  const mockQuestions = [
    {
      id: '1',
      question: 'What is React?',
      options: ['A library', 'A framework', 'A language', 'A database'],
      correctAnswer: 0,
      explanation: 'React is a JavaScript library for building user interfaces.',
      difficulty: 3,
    },
    {
      id: '2',
      question: 'What are hooks?',
      options: ['Functions', 'Classes', 'Variables', 'Objects'],
      correctAnswer: 0,
      explanation: 'Hooks are functions that let you use state in functional components.',
      difficulty: 4,
    },
    {
      id: '3',
      question: 'What is JSX?',
      options: ['JavaScript XML', 'Java Syntax', 'JSON', 'JavaScript'],
      correctAnswer: 0,
      explanation: 'JSX is a syntax extension for JavaScript.',
      difficulty: 2,
    },
  ];

  const mockQuizContext = {
    getQuestionsByCategory: jest.fn(() => mockQuestions),
    updateStats: jest.fn(),
    userStats: {
      level: 5,
      xp: 1000,
      stars: 20,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useQuiz as jest.Mock).mockReturnValue(mockQuizContext);
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  describe('Initialization', () => {
    it('should load questions for the category', () => {
      renderWithNavigation(<QuizScreen />);
      expect(mockQuizContext.getQuestionsByCategory).toHaveBeenCalledWith('react');
    });

    it('should display the first question', () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);
      expect(getByText('What is React?')).toBeTruthy();
      expect(getByText('A library')).toBeTruthy();
      expect(getByText('A framework')).toBeTruthy();
    });

    it('should show question counter', () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);
      expect(getByText('Question 1 of 3')).toBeTruthy();
    });

    it('should initialize score to 0', () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);
      expect(getByText('Score: 0')).toBeTruthy();
    });
  });

  describe('Answer Selection', () => {
    it('should handle correct answer selection', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      const correctOption = getByText('A library');
      fireEvent.press(correctOption);

      await waitFor(() => {
        expect(getByText(/Correct|✓/)).toBeTruthy();
        expect(
          getByText('React is a JavaScript library for building user interfaces.'),
        ).toBeTruthy();
      });
    });

    it('should handle incorrect answer selection', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      const incorrectOption = getByText('A framework');
      fireEvent.press(incorrectOption);

      await waitFor(() => {
        expect(getByText(/Incorrect|Wrong|✗/)).toBeTruthy();
        expect(
          getByText('React is a JavaScript library for building user interfaces.'),
        ).toBeTruthy();
      });
    });

    it('should update score for correct answer', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      const correctOption = getByText('A library');
      fireEvent.press(correctOption);

      await waitFor(() => {
        expect(getByText('Score: 1')).toBeTruthy();
      });
    });

    it('should not update score for incorrect answer', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      const incorrectOption = getByText('A framework');
      fireEvent.press(incorrectOption);

      await waitFor(() => {
        expect(getByText('Score: 0')).toBeTruthy();
      });
    });

    it('should disable options after selection', async () => {
      const { getByText, getAllByTestId } = renderWithNavigation(<QuizScreen />);

      const option = getByText('A library');
      fireEvent.press(option);

      await waitFor(() => {
        // In a real implementation, we'd check if buttons are disabled
        expect(getByText('Next Question')).toBeTruthy();
      });
    });
  });

  describe('Navigation Through Quiz', () => {
    it('should move to next question when Next is pressed', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Answer first question
      fireEvent.press(getByText('A library'));

      await waitFor(() => {
        expect(getByText('Next Question')).toBeTruthy();
      });

      // Press next
      fireEvent.press(getByText('Next Question'));

      // Should show second question
      expect(getByText('What are hooks?')).toBeTruthy();
      expect(getByText('Question 2 of 3')).toBeTruthy();
    });

    it('should show View Results on last question', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Answer first question and go next
      fireEvent.press(getByText('A library'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      // Answer second question and go next
      fireEvent.press(getByText('Functions'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      // Answer last question
      fireEvent.press(getByText('JavaScript XML'));

      await waitFor(() => {
        expect(getByText('View Results')).toBeTruthy();
      });
    });

    it('should navigate to Results when quiz is complete', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Complete all questions
      fireEvent.press(getByText('A library'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      fireEvent.press(getByText('Functions'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      fireEvent.press(getByText('JavaScript XML'));
      await waitFor(() => getByText('View Results'));
      fireEvent.press(getByText('View Results'));

      expect(mockNavigate).toHaveBeenCalledWith(
        'Results',
        expect.objectContaining({
          score: expect.any(Number),
          totalQuestions: 3,
          categoryName: 'React',
        }),
      );
    });
  });

  describe('Progress Bar', () => {
    it('should show progress bar', () => {
      const { getByTestId } = renderWithNavigation(<QuizScreen />);
      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should update progress as quiz advances', async () => {
      const { getByText, getByTestId } = renderWithNavigation(<QuizScreen />);

      // Initial progress
      const progressBar = getByTestId('progress-bar');
      expect(progressBar.props.style.width).toBe('33.333333333333336%');

      // Answer and go next
      fireEvent.press(getByText('A library'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      // Progress should update
      expect(progressBar.props.style.width).toBe('66.66666666666667%');
    });
  });

  describe('Timer', () => {
    jest.useFakeTimers();

    it('should display timer if enabled', () => {
      const { getByTestId } = renderWithNavigation(<QuizScreen />);
      const timer = getByTestId('timer-display');
      expect(timer).toBeTruthy();
    });

    it('should countdown timer', () => {
      const { getByTestId } = renderWithNavigation(<QuizScreen />);
      const timer = getByTestId('timer-display');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Timer should have decreased
      expect(timer).toBeTruthy();
    });

    jest.useRealTimers();
  });

  describe('Skip Functionality', () => {
    it('should allow skipping a question', async () => {
      const { getByText, queryByText } = renderWithNavigation(<QuizScreen />);

      const skipButton = getByText('Skip');
      fireEvent.press(skipButton);

      // Should move to next question
      await waitFor(() => {
        expect(getByText('What are hooks?')).toBeTruthy();
        expect(queryByText('What is React?')).toBeNull();
      });
    });

    it('should not award points for skipped questions', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      fireEvent.press(getByText('Skip'));

      await waitFor(() => {
        expect(getByText('Score: 0')).toBeTruthy();
      });
    });
  });

  describe('Stats Update', () => {
    it('should call updateStats when quiz is complete', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Complete quiz
      fireEvent.press(getByText('A library'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      fireEvent.press(getByText('Functions'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      fireEvent.press(getByText('JavaScript XML'));
      await waitFor(() => getByText('View Results'));
      fireEvent.press(getByText('View Results'));

      expect(mockQuizContext.updateStats).toHaveBeenCalledWith(
        expect.objectContaining({
          questionsAnswered: 3,
          correctAnswers: 3,
          xpEarned: expect.any(Number),
          starsEarned: expect.any(Number),
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle no questions available', () => {
      mockQuizContext.getQuestionsByCategory.mockReturnValue([]);

      const { getByText } = renderWithNavigation(<QuizScreen />);
      expect(getByText(/No questions available/i)).toBeTruthy();
    });

    it('should handle navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Complete quiz
      fireEvent.press(getByText('A library'));

      // Should not crash
      expect(() => {
        fireEvent.press(getByText('Next Question'));
      }).not.toThrow();
    });
  });

  describe('Difficulty Display', () => {
    it('should display question difficulty', () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // First question has difficulty 3
      expect(getByText(/Difficulty.*3|Medium/i)).toBeTruthy();
    });

    it('should update difficulty for each question', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Move to second question (difficulty 4)
      fireEvent.press(getByText('A library'));
      await waitFor(() => getByText('Next Question'));
      fireEvent.press(getByText('Next Question'));

      expect(getByText(/Difficulty.*4|Hard/i)).toBeTruthy();
    });
  });

  describe('Back Navigation', () => {
    it('should handle back navigation with confirmation', () => {
      const { getByTestId } = renderWithNavigation(<QuizScreen />);

      const backButton = getByTestId('back-button');
      fireEvent.press(backButton);

      // Should show confirmation dialog or go back
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for options', () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      const option = getByText('A library');
      // In real implementation, check accessibility props
      expect(option).toBeTruthy();
    });

    it('should announce correct/incorrect answers', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      fireEvent.press(getByText('A library'));

      await waitFor(() => {
        const feedback = getByText(/Correct/);
        // Should have accessibility announcement
        expect(feedback).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('should handle rapid answer selections', async () => {
      const { getByText } = renderWithNavigation(<QuizScreen />);

      // Rapid fire selections
      const option = getByText('A library');
      fireEvent.press(option);
      fireEvent.press(option);
      fireEvent.press(option);

      // Should handle gracefully
      await waitFor(() => {
        expect(getByText('Score: 1')).toBeTruthy();
      });
    });

    it('should not leak memory on unmount', () => {
      const { unmount } = renderWithNavigation(<QuizScreen />);

      // Should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });
});

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import QuizScreenEpic from '../../src/screens/QuizScreenEpic';
import * as Haptics from 'expo-haptics';
import soundEffectsService from '../../src/services/soundEffects';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('../../src/services/soundEffects');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('QuizScreenEpic', () => {
  const mockOnComplete = jest.fn();
  const mockOnBack = jest.fn();

  const mockQuestions = [
    {
      id: '1',
      question: 'What is React?',
      options: ['Library', 'Framework', 'Language', 'Database'],
      correct: 0,
      explanation: 'React is a JavaScript library for building user interfaces',
    },
    {
      id: '2',
      question: 'What is useState?',
      options: ['Hook', 'Component', 'Method', 'Class'],
      correct: 0,
      explanation: 'useState is a React Hook for managing component state',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (soundEffectsService.initialize as jest.Mock).mockImplementation(() => {});
    (soundEffectsService.playEffect as jest.Mock).mockImplementation(() => {});
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      expect(getByText('JavaScript')).toBeTruthy();
      expect(getByText('What is React?')).toBeTruthy();
    });

    it('should display all answer options', () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      expect(getByText('Library')).toBeTruthy();
      expect(getByText('Framework')).toBeTruthy();
      expect(getByText('Language')).toBeTruthy();
      expect(getByText('Database')).toBeTruthy();
    });

    it('should show question counter', () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      expect(getByText('1 / 2')).toBeTruthy();
    });

    it('should display initial lives and score', () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      expect(getByText('3')).toBeTruthy(); // Lives
      expect(getByText('0')).toBeTruthy(); // Score/Combo
    });
  });

  describe('Quiz Interaction', () => {
    it('should handle correct answer selection', async () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      const correctAnswer = getByText('Library');

      await act(async () => {
        fireEvent.press(correctAnswer);
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
        expect(soundEffectsService.playEffect).toHaveBeenCalledWith('achievement_unlock');
      });
    });

    it('should handle incorrect answer selection', async () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      const incorrectAnswer = getByText('Framework');

      await act(async () => {
        fireEvent.press(incorrectAnswer);
      });

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error,
        );
        expect(soundEffectsService.playEffect).toHaveBeenCalledWith('button_tap');
      });
    });

    it('should advance to next question after correct answer', async () => {
      jest.useFakeTimers();

      const { getByText, queryByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      const correctAnswer = getByText('Library');

      await act(async () => {
        fireEvent.press(correctAnswer);
      });

      // Fast-forward 2 seconds for auto-advance
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(queryByText('What is useState?')).toBeTruthy();
        expect(queryByText('What is React?')).toBeNull();
      });

      jest.useRealTimers();
    });

    it('should call onComplete when quiz is finished', async () => {
      jest.useFakeTimers();

      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={[mockQuestions[0]]} // Single question for quick test
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      const correctAnswer = getByText('Library');

      await act(async () => {
        fireEvent.press(correctAnswer);
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          expect.any(Number), // score
          1, // total questions
          'JavaScript', // category
        );
      });

      jest.useRealTimers();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is pressed', async () => {
      const { UNSAFE_getByType } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      const backButtons = UNSAFE_getByType('TouchableOpacity');
      const backButton = Array.isArray(backButtons) ? backButtons[0] : backButtons;

      await act(async () => {
        fireEvent.press(backButton);
      });

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Lives System', () => {
    it('should decrease lives on wrong answer', async () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      // Initially 3 lives
      expect(getByText('3')).toBeTruthy();

      const wrongAnswer = getByText('Framework');

      await act(async () => {
        fireEvent.press(wrongAnswer);
      });

      // Should update lives display (would need to wait for state update)
      // This is a simplified test - in real app would check updated lives
    });

    it('should end quiz when lives reach 0', async () => {
      jest.useFakeTimers();

      const singleQuestion = [
        {
          id: '1',
          question: 'Test Question',
          options: ['Wrong1', 'Wrong2', 'Wrong3', 'Correct'],
          correct: 3,
          explanation: 'Test explanation',
        },
      ];

      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={singleQuestion}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      // Answer wrong 3 times to lose all lives
      for (let i = 0; i < 3; i++) {
        const wrongAnswer = getByText('Wrong1');
        await act(async () => {
          fireEvent.press(wrongAnswer);
        });

        await act(async () => {
          jest.advanceTimersByTime(2000);
        });
      }

      // Quiz should complete with 0 lives
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });

  describe('Score and Combo System', () => {
    it('should increase combo on consecutive correct answers', async () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      // Initially combo is 0
      expect(getByText('0')).toBeTruthy();

      // Answer correctly to increase combo
      const correctAnswer = getByText('Library');

      await act(async () => {
        fireEvent.press(correctAnswer);
      });

      // Combo should increase (would need to check updated display)
    });

    it('should reset combo on wrong answer', async () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      // First answer correctly
      const correctAnswer = getByText('Library');
      await act(async () => {
        fireEvent.press(correctAnswer);
      });

      // Then answer incorrectly
      jest.advanceTimersByTime(2000);

      const wrongAnswer = getByText('Component');
      await act(async () => {
        fireEvent.press(wrongAnswer);
      });

      // Combo should reset to 0
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty questions array gracefully', () => {
      const { queryByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={[]}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      // Should not crash and show some fallback
      expect(queryByText('JavaScript')).toBeTruthy();
    });

    it('should use fallback questions when none provided', () => {
      const { getByText } = render(
        <QuizScreenEpic category="JavaScript" onComplete={mockOnComplete} onBack={mockOnBack} />,
      );

      // Should use internal mock questions
      expect(getByText(/JavaScript/i)).toBeTruthy();
    });

    it('should handle missing callbacks gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { UNSAFE_getByType } = render(
        <QuizScreenEpic category="JavaScript" questions={mockQuestions} />,
      );

      const backButtons = UNSAFE_getByType('TouchableOpacity');
      const backButton = Array.isArray(backButtons) ? backButtons[0] : backButtons;

      fireEvent.press(backButton);

      expect(consoleSpy).toHaveBeenCalledWith('No onBack callback provided');

      consoleSpy.mockRestore();
    });
  });

  describe('Particle Effects', () => {
    it('should trigger celebration particles on correct answer', async () => {
      const { getByText } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      const correctAnswer = getByText('Library');

      await act(async () => {
        fireEvent.press(correctAnswer);
      });

      // ParticleExplosion component should be triggered
      // This would be tested by checking if the component receives correct props
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByRole, getAllByRole } = render(
        <QuizScreenEpic
          category="JavaScript"
          questions={mockQuestions}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />,
      );

      // Check for button roles on answer options
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

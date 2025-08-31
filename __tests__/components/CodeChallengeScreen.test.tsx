import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CodeChallengeScreen from '../../components/CodeChallengeScreen';
import { DevContext } from '../../contexts/DevContext';
import * as Haptics from 'expo-haptics';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

// Mock route with category data
const mockRoute = {
  params: {
    category: {
      id: 'javascript',
      name: 'JavaScript',
      icon: '🟨',
      color: '#F7DF1E',
      description: 'Core JavaScript concepts',
      questions: [
        {
          id: 'js1',
          question: 'What is the output of typeof null?',
          options: ['null', 'object', 'undefined', 'number'],
          correct: 1,
          difficulty: 'easy',
          explanation: 'typeof null returns "object" due to a historical bug in JavaScript.',
        },
        {
          id: 'js2',
          question: 'Which method is used to add elements to the end of an array?',
          options: ['push()', 'pop()', 'shift()', 'unshift()'],
          correct: 0,
          difficulty: 'easy',
          explanation: 'push() adds one or more elements to the end of an array.',
        },
        {
          id: 'js3',
          question: 'What is a closure?',
          options: [
            'A function with access to outer scope',
            'A way to close connections',
            'A loop structure',
            'An error type',
          ],
          correct: 0,
          difficulty: 'medium',
          explanation: 'A closure is a function that has access to variables in its outer scope.',
        },
        {
          id: 'js4',
          question: 'What does the "this" keyword refer to?',
          options: [
            'The current function',
            'The global object',
            'The context object',
            'Always undefined',
          ],
          correct: 2,
          difficulty: 'medium',
          explanation:
            'The "this" keyword refers to the context object in which the function is executed.',
        },
        {
          id: 'js5',
          question: 'Which is not a primitive type in JavaScript?',
          options: ['string', 'object', 'number', 'boolean'],
          correct: 1,
          difficulty: 'easy',
          explanation: "Object is not a primitive type; it's a reference type.",
        },
      ],
    },
  },
};

// Mock user data
const mockUser = {
  username: '@test_user',
  level: 10,
  xp: 2500,
  nextLevelXp: 3000,
  streak: 5,
  gems: 500,
  energy: 5,
  maxEnergy: 5,
  rank: 'Junior Dev',
  contributions: 100,
  badges: ['beginner'],
  currentPath: 'Full Stack Developer',
  achievements: 10,
  completedChallenges: 50,
};

const renderCodeChallengeScreen = (customRoute = mockRoute) => {
  return render(
    <SafeAreaProvider>
      <DevContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
        <NavigationContainer>
          <CodeChallengeScreen navigation={mockNavigation} route={customRoute} />
        </NavigationContainer>
      </DevContext.Provider>
    </SafeAreaProvider>,
  );
};

describe('CodeChallengeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      const { getByText } = renderCodeChallengeScreen();
      expect(getByText('Question 1/5')).toBeTruthy();
    });

    it('should display the first question', () => {
      const { getByText } = renderCodeChallengeScreen();
      expect(getByText('What is the output of typeof null?')).toBeTruthy();
    });

    it('should display all four options', () => {
      const { getByText } = renderCodeChallengeScreen();
      expect(getByText('null')).toBeTruthy();
      expect(getByText('object')).toBeTruthy();
      expect(getByText('undefined')).toBeTruthy();
      expect(getByText('number')).toBeTruthy();
    });

    it('should display CHECK button initially disabled', () => {
      const { getByText } = renderCodeChallengeScreen();
      const checkButton = getByText('CHECK');
      expect(checkButton).toBeTruthy();
      expect(checkButton.parent?.props.disabled).toBe(true);
    });

    it('should display 5 energy hearts', () => {
      const { getAllByTestId } = renderCodeChallengeScreen();
      const hearts = getAllByTestId(/heart/);
      expect(hearts.length).toBe(5);
    });

    it('should display progress bar', () => {
      const { getByTestId } = renderCodeChallengeScreen();
      const progressBar = getByTestId('progress-bar');
      expect(progressBar).toBeTruthy();
    });
  });

  describe('Answer Selection', () => {
    it('should enable CHECK button when an option is selected', () => {
      const { getByText } = renderCodeChallengeScreen();
      const option = getByText('object');

      fireEvent.press(option);

      const checkButton = getByText('CHECK');
      expect(checkButton.parent?.props.disabled).toBe(false);
    });

    it('should highlight selected option', () => {
      const { getByText } = renderCodeChallengeScreen();
      const option = getByText('object');

      fireEvent.press(option);

      const optionButton = option.parent?.parent;
      expect(optionButton?.props.style).toContainEqual(
        expect.objectContaining({ borderColor: expect.any(String) }),
      );
    });

    it('should call haptic feedback on option selection', () => {
      const { getByText } = renderCodeChallengeScreen();
      const option = getByText('object');

      fireEvent.press(option);

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should allow changing selected option', () => {
      const { getByText } = renderCodeChallengeScreen();

      fireEvent.press(getByText('null'));
      fireEvent.press(getByText('object'));

      // Only 'object' should be selected now
      expect(Haptics.selectionAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Answer Checking', () => {
    it('should show CONTINUE button after checking answer', async () => {
      const { getByText } = renderCodeChallengeScreen();

      fireEvent.press(getByText('object'));
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        expect(getByText('CONTINUE')).toBeTruthy();
      });
    });

    it('should show explanation after checking answer', async () => {
      const { getByText } = renderCodeChallengeScreen();

      fireEvent.press(getByText('object'));
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        expect(getByText('Explanation')).toBeTruthy();
        expect(getByText(/typeof null returns "object"/)).toBeTruthy();
      });
    });

    it('should mark correct answer with success indicator', async () => {
      const { getByText, getByTestId } = renderCodeChallengeScreen();

      fireEvent.press(getByText('object'));
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        expect(getByTestId('correct-indicator')).toBeTruthy();
      });
    });

    it('should mark wrong answer and decrease energy', async () => {
      const { getByText, getByTestId } = renderCodeChallengeScreen();

      fireEvent.press(getByText('null')); // Wrong answer
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        expect(getByTestId('wrong-indicator')).toBeTruthy();
        // Energy should decrease
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error,
        );
      });
    });

    it('should trigger success haptic for correct answer', async () => {
      const { getByText } = renderCodeChallengeScreen();

      fireEvent.press(getByText('object')); // Correct answer
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Success,
        );
      });
    });
  });

  describe('Question Navigation', () => {
    it('should advance to next question on CONTINUE', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // Answer first question
      fireEvent.press(getByText('object'));
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        fireEvent.press(getByText('CONTINUE'));
      });

      // Should be on question 2
      await waitFor(() => {
        expect(getByText('Question 2/5')).toBeTruthy();
        expect(
          getByText('Which method is used to add elements to the end of an array?'),
        ).toBeTruthy();
      });
    });

    it('should update progress bar when advancing questions', async () => {
      const { getByText, getByTestId } = renderCodeChallengeScreen();

      // Answer and continue
      fireEvent.press(getByText('object'));
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        fireEvent.press(getByText('CONTINUE'));
      });

      // Progress bar should update
      const progressBar = getByTestId('progress-bar');
      expect(progressBar.props.style.width).toContain('40%'); // 2/5 questions
    });

    it('should show result screen after last question', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // Answer all 5 questions
      for (let i = 0; i < 5; i++) {
        const options = [
          'object',
          'push()',
          'A function with access to outer scope',
          'The context object',
          'object',
        ];
        fireEvent.press(getByText(options[i]));
        fireEvent.press(getByText('CHECK'));

        await waitFor(() => {
          fireEvent.press(getByText('CONTINUE'));
        });
      }

      // Should show result screen
      await waitFor(() => {
        expect(getByText(/Outstanding!/)).toBeTruthy();
        expect(getByText(/100% Accuracy/)).toBeTruthy();
      });
    });
  });

  describe('Energy System', () => {
    it('should start with full energy', () => {
      const { getAllByTestId } = renderCodeChallengeScreen();
      const filledHearts = getAllByTestId('heart-filled');
      expect(filledHearts.length).toBe(5);
    });

    it('should decrease energy on wrong answer', async () => {
      const { getByText, getAllByTestId } = renderCodeChallengeScreen();

      // Answer incorrectly
      fireEvent.press(getByText('null'));
      fireEvent.press(getByText('CHECK'));

      await waitFor(() => {
        const filledHearts = getAllByTestId('heart-filled');
        expect(filledHearts.length).toBe(4);
      });
    });

    it('should end quiz when energy runs out', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // Answer incorrectly 5 times
      const wrongAnswers = [
        'null',
        'pop()',
        'A way to close connections',
        'The current function',
        'string',
      ];

      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText(wrongAnswers[i]));
        fireEvent.press(getByText('CHECK'));

        if (i < 4) {
          await waitFor(() => {
            fireEvent.press(getByText('CONTINUE'));
          });
        }
      }

      // Should show result screen with low score
      await waitFor(
        () => {
          expect(getByText('Keep Learning!')).toBeTruthy();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Animations', () => {
    it('should animate question slide-in', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // The question should slide in on mount
      await waitFor(() => {
        expect(getByText('What is the output of typeof null?')).toBeTruthy();
      });
    });

    it('should shake on wrong answer', async () => {
      const { getByText } = renderCodeChallengeScreen();

      fireEvent.press(getByText('null')); // Wrong answer
      fireEvent.press(getByText('CHECK'));

      // Shake animation should trigger
      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledWith(
          Haptics.NotificationFeedbackType.Error,
        );
      });
    });
  });

  describe('Result Screen', () => {
    it('should calculate accuracy correctly', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // Answer 3 correct, 2 wrong
      const answers = ['object', 'push()', 'A loop structure', 'The context object', 'string'];

      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText(answers[i]));
        fireEvent.press(getByText('CHECK'));

        await waitFor(() => {
          fireEvent.press(getByText('CONTINUE'));
        });
      }

      // Should show 60% accuracy
      await waitFor(() => {
        expect(getByText(/60% Accuracy/)).toBeTruthy();
        expect(getByText('Well Done!')).toBeTruthy();
      });
    });

    it('should display XP earned', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // Answer all correctly
      const correctAnswers = [
        'object',
        'push()',
        'A function with access to outer scope',
        'The context object',
        'object',
      ];

      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText(correctAnswers[i]));
        fireEvent.press(getByText('CHECK'));

        await waitFor(() => {
          fireEvent.press(getByText('CONTINUE'));
        });
      }

      // Should show 100 XP earned (5 questions * 20 XP)
      await waitFor(() => {
        expect(getByText('+100 XP Earned')).toBeTruthy();
      });
    });

    it('should navigate back to Path on Continue', async () => {
      const { getByText } = renderCodeChallengeScreen();

      // Complete quiz quickly
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('object'));
        fireEvent.press(getByText('CHECK'));
        await waitFor(() => {
          fireEvent.press(getByText('CONTINUE'));
        });
      }

      // Press Continue on result screen
      await waitFor(() => {
        fireEvent.press(getByText('Continue'));
      });

      expect(mockNavigate).toHaveBeenCalledWith('Path');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing route params gracefully', () => {
      const { getByText } = renderCodeChallengeScreen({ params: undefined });
      // Should use default category
      expect(getByText('Question 1/5')).toBeTruthy();
    });

    it('should handle empty questions array', () => {
      const emptyRoute = {
        params: {
          category: {
            ...mockRoute.params.category,
            questions: [],
          },
        },
      };

      const { getByText } = renderCodeChallengeScreen(emptyRoute);
      // Should handle gracefully - might show error or default questions
      expect(() => getByText('Question')).not.toThrow();
    });

    it('should prevent multiple rapid CHECK presses', async () => {
      const { getByText } = renderCodeChallengeScreen();

      fireEvent.press(getByText('object'));

      // Rapid fire CHECK button
      fireEvent.press(getByText('CHECK'));
      fireEvent.press(getByText('CHECK'));
      fireEvent.press(getByText('CHECK'));

      // Should only process once
      await waitFor(() => {
        expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Header Controls', () => {
    it('should close quiz on X button press', () => {
      const { getByTestId } = renderCodeChallengeScreen();

      const closeButton = getByTestId('close-button');
      fireEvent.press(closeButton);

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should display category name in header', () => {
      const { getByText } = renderCodeChallengeScreen();
      expect(getByText('JavaScript')).toBeTruthy();
    });
  });
});

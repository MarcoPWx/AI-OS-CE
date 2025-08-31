import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native'; // Removed - using callback props instead
import * as Haptics from 'expo-haptics';
import soundEffectsService from '../services/soundEffects';
import { ParticleExplosion, useParticleExplosion } from '../components/ParticleExplosion';
import { colors as themeColors } from '../design/theme';

const { width, height } = Dimensions.get('window');

interface QuizScreenEpicProps {
  route?: any;
  category?: string;
  questions?: any[];
  timerSeconds?: number;
  onComplete?: (score: number, totalQuestions: number, category: string) => void;
  onBack?: () => void;
}

export default function QuizScreenEpic({
  route,
  category: categoryProp,
  questions: questionsProp,
  timerSeconds,
  onComplete,
  onBack,
}: QuizScreenEpicProps) {
  // const navigation = useNavigation(); // Removed - using callback props
  const category = categoryProp || route?.params?.category || 'General';
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const { explosion, triggerExplosion, hideExplosion } = useParticleExplosion();

  // Timer state (optional)
  const [timeLeft, setTimeLeft] = useState<number | null>(
    typeof timerSeconds === 'number' && timerSeconds > 0 ? timerSeconds : null,
  );
  useEffect(() => {
    if (typeof timerSeconds === 'number' && timerSeconds > 0) setTimeLeft(timerSeconds);
  }, [timerSeconds]);
  useEffect(() => {
    if (timeLeft == null) return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => (s != null ? Math.max(0, s - 1) : s)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Animation values
  const questionAnim = useRef(new Animated.Value(0)).current;
  const optionsAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const livesAnim = useRef(new Animated.Value(1)).current;
  const comboAnim = useRef(new Animated.Value(0)).current;
  const cardElevation = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Use provided questions or fallback to mock questions
  const questions =
    questionsProp && questionsProp.length > 0
      ? questionsProp
      : [
          {
            id: 1,
            question: 'What is the correct way to declare a variable in JavaScript?',
            options: [
              'var myVariable = value;',
              'let myVariable = value;',
              'const myVariable = value;',
              'All of the above',
            ],
            correct: 3,
            explanation:
              'All three are valid ways to declare variables in JavaScript, each with different scoping rules.',
          },
          {
            id: 2,
            question: 'Which React hook is used for side effects?',
            options: ['useState', 'useEffect', 'useContext', 'useReducer'],
            correct: 1,
            explanation:
              'useEffect is specifically designed for handling side effects in functional components.',
          },
          {
            id: 3,
            question: 'What does TypeScript add to JavaScript?',
            options: [
              'Static typing',
              'Object-oriented features',
              'Better performance',
              'All of the above',
            ],
            correct: 0,
            explanation:
              'TypeScript primarily adds static typing to JavaScript, making code more reliable and maintainable.',
          },
        ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions && questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;

  useEffect(() => {
    // Initialize sound effects (safe)
    try {
      soundEffectsService.initialize();
    } catch (e) {
      console.warn('Sound effects init failed:', e);
    }

    // Start entrance animations
    Animated.stagger(200, [
      Animated.spring(questionAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(optionsAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Animate score
    Animated.spring(scoreAnim, {
      toValue: score,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, progress, score]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    const isCorrect = answerIndex === currentQuestion.correct;

    if (isCorrect) {
      // Correct answer animations
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      soundEffectsService.playEffect('achievement_unlock');

      setScore((prev) => prev + 10 + combo * 5);
      setCombo((prev) => prev + 1);

      // Trigger celebration particles
      triggerExplosion(width / 2, height / 2, 'celebration');

      // Glow animation
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Wrong answer animations
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      soundEffectsService.playEffect('button_tap');

      setLives((prev) => prev - 1);
      setCombo(0);

      // Shake animation
      Animated.sequence([
        Animated.timing(cardElevation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(cardElevation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1 && lives > 0) {
        nextQuestion();
      } else {
        // Quiz complete - use callback if provided
        if (onComplete) {
          onComplete(score, questions.length, category);
        } else {
          console.warn('Quiz completed but no onComplete callback provided');
        }
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const renderOption = (option: string, index: number) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = currentQuestion.correct === index;
    const showResult = isAnswered;

    let backgroundColor = 'rgba(255, 255, 255, 0.1)';
    let borderColor = 'rgba(255, 255, 255, 0.2)';

    if (showResult) {
      if (isCorrect) {
        backgroundColor = 'rgba(34, 197, 94, 0.2)';
        borderColor = '#22C55E';
      } else if (isSelected && !isCorrect) {
        backgroundColor = 'rgba(239, 68, 68, 0.2)';
        borderColor = '#EF4444';
      }
    } else if (isSelected) {
      backgroundColor = 'rgba(14, 165, 233, 0.2)';
      borderColor = themeColors.primary[500];
    }

    return (
      <TouchableOpacity
        testID={`answer-option-${index}`}
        accessibilityRole="button"
        accessibilityLabel={`Answer option ${index + 1}: ${option}`}
        focusable
        key={index}
        style={[
          styles.optionButton,
          {
            backgroundColor,
            borderColor,
            transform: [
              {
                translateY: optionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
        onPress={() => handleAnswerSelect(index)}
        disabled={isAnswered}
        activeOpacity={0.8}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionText}>{option}</Text>
          {showResult && isCorrect && (
            <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          )}
          {showResult && isSelected && !isCorrect && (
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Guard: if no questions available even after fallback
  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={themeColors.gradients.dark} style={StyleSheet.absoluteFillObject} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#E5E7EB', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
            No questions available for this category right now.
          </Text>
          <TouchableOpacity
            onPress={() => (onBack ? onBack() : console.warn('No onBack callback provided'))}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="quiz-screen" style={styles.container}>
      <LinearGradient colors={themeColors.gradients.dark} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="back-button"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
          onPress={() => (onBack ? onBack() : console.warn('No onBack callback provided'))}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.categoryText}>{category}</Text>
          <Text testID="question-counter" style={styles.questionCounter}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>

        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={20} color="#EF4444" />
            <Text style={styles.statText}>{lives}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={styles.statText}>{combo}</Text>
          </View>
          {typeof timeLeft === 'number' && (
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text testID="timer-remaining" style={styles.statText}>
                {timeLeft}s
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Score Display */}
      <Animated.View
        style={[
          styles.scoreContainer,
          {
            transform: [
              {
                scale: scoreAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.scoreLabel}>POINTS</Text>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <Animated.View
          testID="question-card"
          style={[
            styles.questionCard,
            {
              opacity: questionAnim,
              transform: [
                {
                  translateY: questionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: questionAnim,
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(14, 165, 233, 0.1)', 'rgba(14, 165, 233, 0.1)']}
            style={styles.questionGradient}
          >
            <Text testID="question-text" style={styles.questionText}>
              {currentQuestion.question}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => renderOption(option, index))}
        </View>

        {/* Explanation */}
        {isAnswered && (
          <Animated.View
            testID="explanation-card"
            style={[
              styles.explanationCard,
              {
                opacity: questionAnim,
                transform: [
                  {
                    translateY: questionAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.explanationTitle}>Explanation</Text>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Particle Explosion Effects */}
      <ParticleExplosion
        visible={explosion.visible}
        centerX={explosion.centerX}
        centerY={explosion.centerY}
        type={explosion.type}
        onComplete={hideExplosion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerInfo: {
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionCounter: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: themeColors.primary[500],
    borderRadius: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: themeColors.primary[500],
  },
  scoreLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  questionCard: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  questionGradient: {
    padding: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 22,
  },
  explanationCard: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
});

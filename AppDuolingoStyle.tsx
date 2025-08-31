import React, { useState, useContext, createContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  Vibration,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import {
  quizData,
  getRandomQuestions,
  getDailyChallenge,
  Category,
  Question,
} from './services/quizData';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// DevMentor-inspired color palette with Duolingo vibrancy
const colors = {
  // Primary colors - DevMentor blue theme
  primary: '#2563eb', // Bright blue
  primaryLight: '#60a5fa',
  primaryDark: '#1e40af',

  // Accent colors
  accent: '#10b981', // Success green (Duolingo-like)
  accentLight: '#34d399',
  accentDark: '#059669',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Grays
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',

  // Special
  gold: '#fbbf24',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Progress Ring Component (Duolingo-style)
const ProgressRing = ({ progress, size = 60, strokeWidth = 8, color = colors.accent }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: progress,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: size * 0.3, fontWeight: 'bold', color: colors.text }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
};

// Simplified SVG components for web compatibility
const Svg = ({ children, ...props }: any) => <View {...props}>{children}</View>;
const Circle = (props: any) => null;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// XP Animation Component
const XPAnimation = ({ xp, isVisible }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isVisible]);

  return (
    <Animated.View
      style={[
        styles.xpAnimation,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.xpAnimationText}>+{xp} XP</Text>
    </Animated.View>
  );
};

// Heart Beat Animation
const HeartIcon = ({ isFilled, isBeating }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isBeating) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.3,
          useNativeDriver: true,
          tension: 100,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
        }),
      ]).start();
    }
  }, [isBeating]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Text style={styles.heartIcon}>{isFilled ? '❤️' : '💔'}</Text>
    </Animated.View>
  );
};

// Streak Fire Animation
const StreakFire = ({ streak }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: 5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: -5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  const getStreakColor = () => {
    if (streak >= 30) return { fire: '🔥', color: colors.gold };
    if (streak >= 7) return { fire: '🔥', color: colors.warning };
    return { fire: '🔥', color: colors.textMuted };
  };

  const { fire, color } = getStreakColor();

  return (
    <Animated.View
      style={[
        styles.streakContainer,
        {
          transform: [
            { scale },
            {
              rotate: rotate.interpolate({
                inputRange: [-5, 5],
                outputRange: ['-5deg', '5deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.streakFire, { fontSize: 32 }]}>{fire}</Text>
      <View style={[styles.streakBadge, { backgroundColor: color }]}>
        <Text style={styles.streakNumber}>{streak}</Text>
      </View>
    </Animated.View>
  );
};

// Quiz Context
const QuizContext = createContext<any>({});

function QuizProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({
    name: 'Learner',
    level: 5,
    xp: 850,
    nextLevelXp: 1000,
    hearts: 5,
    maxHearts: 5,
    streak: 7,
    gems: 120,
    leagues: 'Silver',
  });

  return <QuizContext.Provider value={{ user, setUser }}>{children}</QuizContext.Provider>;
}

// Path Screen (Duolingo-style lesson path)
function PathScreen({ navigation }: any) {
  const { user } = useContext(QuizContext);
  const scrollY = useRef(new Animated.Value(0)).current;

  const lessons = quizData.map((category, index) => ({
    ...category,
    isCompleted: index < 2,
    isCurrent: index === 2,
    isLocked: index > 5,
    progress: index < 2 ? 1 : index === 2 ? 0.6 : 0,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <StreakFire streak={user.streak} />
        </View>

        <View style={styles.headerCenter}>
          <TouchableOpacity style={styles.languageSelector}>
            <Text style={styles.languageText}>General Knowledge</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Text style={styles.gemCount}>💎 {user.gems}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <View style={styles.heartsDisplay}>
              <Text style={styles.heartIcon}>❤️</Text>
              <Text style={styles.heartCount}>{user.hearts}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.xpProgressContainer}>
        <View style={styles.xpProgressBar}>
          <Animated.View
            style={[
              styles.xpProgressFill,
              {
                width: `${(user.xp / user.nextLevelXp) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.xpProgressText}>
          Level {user.level} • {user.xp}/{user.nextLevelXp} XP
        </Text>
      </View>

      {/* Lesson Path */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        <View style={styles.pathContainer}>
          {lessons.map((lesson, index) => {
            const inputRange = [(index - 1) * 150, index * 150, (index + 1) * 150];
            const scale = scrollY.interpolate({
              inputRange,
              outputRange: [0.95, 1, 0.95],
              extrapolate: 'clamp',
            });

            // Zigzag pattern for path
            const isLeft = index % 4 === 0 || index % 4 === 3;
            const isCenter = index % 4 === 1 || index % 4 === 2;

            return (
              <Animated.View
                key={lesson.id}
                style={[
                  styles.lessonWrapper,
                  {
                    alignSelf: isLeft ? 'flex-start' : isCenter ? 'center' : 'flex-end',
                    marginLeft: isLeft ? 20 : 0,
                    marginRight: !isLeft && !isCenter ? 20 : 0,
                    transform: [{ scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.lessonButton,
                    lesson.isCurrent && styles.lessonButtonCurrent,
                    lesson.isCompleted && styles.lessonButtonCompleted,
                    lesson.isLocked && styles.lessonButtonLocked,
                  ]}
                  onPress={() => {
                    if (!lesson.isLocked) {
                      navigation.navigate('Lesson', { category: lesson });
                      if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  disabled={lesson.isLocked}
                >
                  {/* Progress Ring */}
                  {lesson.isCurrent && (
                    <View style={styles.progressRingContainer}>
                      <View style={styles.progressRing}>
                        <View
                          style={[styles.progressRingFill, { height: `${lesson.progress * 100}%` }]}
                        />
                      </View>
                    </View>
                  )}

                  {/* Lesson Icon */}
                  <Text style={[styles.lessonIcon, lesson.isLocked && styles.lessonIconLocked]}>
                    {lesson.isLocked ? '🔒' : lesson.icon}
                  </Text>

                  {/* Lesson Title */}
                  <Text style={[styles.lessonTitle, lesson.isLocked && styles.lessonTitleLocked]}>
                    {lesson.name}
                  </Text>

                  {/* Stars for completed lessons */}
                  {lesson.isCompleted && (
                    <View style={styles.starsContainer}>
                      <Text style={styles.star}>⭐</Text>
                      <Text style={styles.star}>⭐</Text>
                      <Text style={styles.star}>⭐</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Path connector */}
                {index < lessons.length - 1 && (
                  <View
                    style={[
                      styles.pathConnector,
                      lesson.isCompleted && styles.pathConnectorCompleted,
                    ]}
                  />
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Daily Quest Card */}
        <TouchableOpacity
          style={styles.dailyQuestCard}
          onPress={() => navigation.navigate('DailyChallenge')}
        >
          <View style={styles.dailyQuestContent}>
            <Text style={styles.dailyQuestIcon}>🎯</Text>
            <View style={styles.dailyQuestText}>
              <Text style={styles.dailyQuestTitle}>Daily Challenge</Text>
              <Text style={styles.dailyQuestSubtitle}>Complete for bonus XP!</Text>
            </View>
            <View style={styles.dailyQuestReward}>
              <Text style={styles.dailyQuestXP}>+50 XP</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            const currentLesson = lessons.find((l) => l.isCurrent);
            if (currentLesson) {
              navigation.navigate('Lesson', { category: currentLesson });
              if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }}
        >
          <Text style={styles.startButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Lesson Screen (Quiz with Duolingo animations)
function LessonScreen({ navigation, route }: any) {
  const category: Category = route.params?.category || quizData[0];
  const [questions] = useState<Question[]>(() => getRandomQuestions(category.id, 5));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const { user, setUser } = useContext(QuizContext);

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation for new question
    Animated.sequence([
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnimation, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestion]);

  useEffect(() => {
    // Progress bar animation
    Animated.spring(progressAnimation, {
      toValue: (currentQuestion + (isAnswerSubmitted ? 1 : 0)) / questions.length,
      tension: 50,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion, isAnswerSubmitted]);

  const question = questions[currentQuestion];

  const handleAnswer = (answerIndex: number) => {
    if (isAnswerSubmitted) return;

    setSelectedAnswer(answerIndex);
    if (!isWeb) Haptics.selectionAsync();
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedAnswer === question.correct;

    if (isCorrect) {
      setScore(score + 1);
      const xp = question.difficulty === 'hard' ? 15 : question.difficulty === 'medium' ? 10 : 5;
      setXpEarned(xp);
      setShowXP(true);

      // Success feedback
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.spring(feedbackAnimation, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      setHearts(hearts - 1);

      // Error feedback
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      if (hearts <= 1) {
        setTimeout(() => setShowResult(true), 1000);
        return;
      }
    }

    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowFeedback(false);
      setShowXP(false);
      feedbackAnimation.setValue(0);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    const totalXP = score * 10;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Animated.View
            style={[
              styles.resultCard,
              {
                transform: [
                  {
                    scale: feedbackAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.resultEmoji}>
              {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎉' : '💪'}
            </Text>
            <Text style={styles.resultTitle}>
              {accuracy >= 80 ? 'Amazing!' : accuracy >= 60 ? 'Great job!' : 'Keep going!'}
            </Text>

            <View style={styles.resultStats}>
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatValue}>
                  {score}/{questions.length}
                </Text>
                <Text style={styles.resultStatLabel}>Correct</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatValue}>{accuracy}%</Text>
                <Text style={styles.resultStatLabel}>Accuracy</Text>
              </View>
              <View style={styles.resultStatDivider} />
              <View style={styles.resultStatItem}>
                <Text style={styles.resultStatValue}>+{totalXP}</Text>
                <Text style={styles.resultStatLabel}>XP Earned</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Path')}
            >
              <Text style={styles.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.lessonContainer}>
      {/* Header */}
      <View style={styles.lessonHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.textLight} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.lessonProgressContainer}>
          <Animated.View
            style={[
              styles.lessonProgressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Hearts */}
        <View style={styles.lessonHearts}>
          {Array.from({ length: 5 }).map((_, i) => (
            <HeartIcon key={i} isFilled={i < hearts} isBeating={false} />
          ))}
        </View>
      </View>

      {/* Question */}
      <Animated.View
        style={[
          styles.questionContainer,
          {
            transform: [
              { translateX: shakeAnimation },
              {
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 50],
                }),
              },
            ],
            opacity: slideAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>Choose the correct answer</Text>
          {question.difficulty && (
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    question.difficulty === 'easy'
                      ? colors.success + '20'
                      : question.difficulty === 'medium'
                        ? colors.warning + '20'
                        : colors.danger + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color:
                      question.difficulty === 'easy'
                        ? colors.success
                        : question.difficulty === 'medium'
                          ? colors.warning
                          : colors.danger,
                  },
                ]}
              >
                {question.difficulty.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        {/* Answer Options */}
        <View style={styles.answersGrid}>
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct;
            const isSelected = index === selectedAnswer;
            const showCorrect = isAnswerSubmitted && isCorrect;
            const showWrong = isAnswerSubmitted && isSelected && !isCorrect;

            return (
              <AnimatedPressable
                key={index}
                style={[
                  styles.answerOption,
                  isSelected && !isAnswerSubmitted && styles.answerOptionSelected,
                  showCorrect && styles.answerOptionCorrect,
                  showWrong && styles.answerOptionWrong,
                ]}
                onPress={() => handleAnswer(index)}
                disabled={isAnswerSubmitted}
              >
                <Text
                  style={[
                    styles.answerOptionText,
                    isSelected && !isAnswerSubmitted && styles.answerOptionTextSelected,
                    showCorrect && styles.answerOptionTextCorrect,
                    showWrong && styles.answerOptionTextWrong,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                )}
                {showWrong && <Ionicons name="close-circle" size={24} color={colors.danger} />}
              </AnimatedPressable>
            );
          })}
        </View>

        {/* XP Animation */}
        {showXP && <XPAnimation xp={xpEarned} isVisible={showXP} />}
      </Animated.View>

      {/* Feedback Section */}
      {showFeedback && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackAnimation,
              transform: [
                {
                  translateY: feedbackAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.feedbackCard,
              selectedAnswer === question.correct
                ? styles.feedbackCardSuccess
                : styles.feedbackCardError,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {selectedAnswer === question.correct ? '🎉 Correct!' : '💡 Not quite!'}
            </Text>
            {question.explanation && (
              <Text style={styles.feedbackText}>{question.explanation}</Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* Bottom Action */}
      <View style={styles.lessonBottom}>
        {!isAnswerSubmitted ? (
          <TouchableOpacity
            style={[styles.checkButton, selectedAnswer === null && styles.checkButtonDisabled]}
            onPress={checkAnswer}
            disabled={selectedAnswer === null}
          >
            <Text
              style={[
                styles.checkButtonText,
                selectedAnswer === null && styles.checkButtonTextDisabled,
              ]}
            >
              CHECK
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.checkButton,
              selectedAnswer === question.correct
                ? styles.checkButtonSuccess
                : styles.checkButtonError,
            ]}
            onPress={nextQuestion}
          >
            <Text style={styles.checkButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// Profile Screen
function ProfileScreen() {
  const { user } = useContext(QuizContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarEmoji}>🧑‍🎓</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{user.leagues} League</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{user.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statValue}>{user.xp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{user.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {[
              { icon: '🌟', name: 'Perfectionist', desc: '100% accuracy' },
              { icon: '📚', name: 'Scholar', desc: '50 lessons completed' },
              { icon: '⚡', name: 'Speed Demon', desc: 'Quick answers' },
              { icon: '🎯', name: 'Sharpshooter', desc: '10 perfect scores' },
            ].map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDesc}>{achievement.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Shop Screen
function ShopScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.shopHeader}>
          <Text style={styles.shopTitle}>Shop</Text>
          <View style={styles.shopGems}>
            <Text style={styles.shopGemsText}>💎 120</Text>
          </View>
        </View>

        <View style={styles.shopSection}>
          <Text style={styles.sectionTitle}>Power-ups</Text>
          <View style={styles.shopGrid}>
            <TouchableOpacity style={styles.shopItem}>
              <Text style={styles.shopItemIcon}>❤️</Text>
              <Text style={styles.shopItemName}>Refill Hearts</Text>
              <View style={styles.shopItemPrice}>
                <Text style={styles.shopItemPriceText}>💎 50</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shopItem}>
              <Text style={styles.shopItemIcon}>🛡️</Text>
              <Text style={styles.shopItemName}>Streak Freeze</Text>
              <View style={styles.shopItemPrice}>
                <Text style={styles.shopItemPriceText}>💎 100</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shopItem}>
              <Text style={styles.shopItemIcon}>⚡</Text>
              <Text style={styles.shopItemName}>2X XP Boost</Text>
              <View style={styles.shopItemPrice}>
                <Text style={styles.shopItemPriceText}>💎 75</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.premiumCard}>
          <View style={styles.premiumCardContent}>
            <Text style={styles.premiumCardIcon}>👑</Text>
            <View style={styles.premiumCardText}>
              <Text style={styles.premiumCardTitle}>Go Premium</Text>
              <Text style={styles.premiumCardSubtitle}>No ads, unlimited hearts & more!</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Navigation
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Path"
        component={PathScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              <Ionicons name="home" size={24} color={color} />
            </View>
          ),
          tabBarLabel: 'Learn',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              <Ionicons name="person" size={24} color={color} />
            </View>
          ),
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              <Ionicons name="cart" size={24} color={color} />
            </View>
          ),
          tabBarLabel: 'Shop',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QuizProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="DailyChallenge" component={LessonScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QuizProvider>
    </SafeAreaProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  gemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  heartsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartIcon: {
    fontSize: 20,
  },
  heartCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // XP Progress
  xpProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  xpProgressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  xpProgressText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // Streak
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakFire: {
    fontSize: 24,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: colors.warning,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  streakNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.surface,
  },

  // Path
  pathContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  lessonWrapper: {
    marginVertical: 15,
  },
  lessonButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonButtonCurrent: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '10',
  },
  lessonButtonCompleted: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '10',
  },
  lessonButtonLocked: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  lessonIcon: {
    fontSize: 36,
  },
  lessonIconLocked: {
    fontSize: 32,
  },
  lessonTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  lessonTitleLocked: {
    color: colors.textMuted,
  },
  progressRingContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressRingFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.accent,
  },
  starsContainer: {
    position: 'absolute',
    bottom: -10,
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
  },
  pathConnector: {
    position: 'absolute',
    bottom: -30,
    left: '50%',
    width: 2,
    height: 30,
    backgroundColor: colors.border,
    marginLeft: -1,
  },
  pathConnectorCompleted: {
    backgroundColor: colors.gold,
  },

  // Daily Quest
  dailyQuestCard: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dailyQuestContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyQuestIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  dailyQuestText: {
    flex: 1,
  },
  dailyQuestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.surface,
  },
  dailyQuestSubtitle: {
    fontSize: 14,
    color: colors.surface + 'CC',
    marginTop: 2,
  },
  dailyQuestReward: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dailyQuestXP: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Bottom Action
  bottomAction: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  startButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Lesson Screen
  lessonContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: 4,
  },
  lessonProgressContainer: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  lessonProgressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  lessonHearts: {
    flexDirection: 'row',
    gap: 4,
  },

  // Question
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 32,
    lineHeight: 30,
  },
  answersGrid: {
    gap: 12,
  },
  answerOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  answerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  answerOptionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  answerOptionWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  answerOptionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  answerOptionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  answerOptionTextCorrect: {
    color: colors.success,
    fontWeight: '500',
  },
  answerOptionTextWrong: {
    color: colors.danger,
    fontWeight: '500',
  },

  // Feedback
  feedbackContainer: {
    paddingHorizontal: 20,
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  feedbackCardSuccess: {
    backgroundColor: colors.success + '10',
  },
  feedbackCardError: {
    backgroundColor: colors.warning + '10',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },

  // XP Animation
  xpAnimation: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  xpAnimationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
  },

  // Lesson Bottom
  lessonBottom: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: colors.border,
  },
  checkButtonSuccess: {
    backgroundColor: colors.success,
  },
  checkButtonError: {
    backgroundColor: colors.warning,
  },
  checkButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  checkButtonTextDisabled: {
    color: colors.textMuted,
  },

  // Result
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  resultStatItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  resultStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  resultStatLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  resultStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  continueButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  continueButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Profile
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarEmoji: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  profileBadge: {
    backgroundColor: colors.gold + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  profileBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },

  // Stats
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Achievements
  achievementsSection: {
    padding: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (screenWidth - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Shop
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  shopGems: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shopGemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  shopSection: {
    padding: 20,
  },
  shopGrid: {
    gap: 12,
  },
  shopItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shopItemIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  shopItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  shopItemPrice: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shopItemPriceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  premiumCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.purple,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumCardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  premiumCardText: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.surface,
  },
  premiumCardSubtitle: {
    fontSize: 14,
    color: colors.surface + 'CC',
    marginTop: 2,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    padding: 4,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
});

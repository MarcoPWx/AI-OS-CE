import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import { localProgress } from '../services/localProgress';
import questionDelivery from '../services/questionDelivery';
import GamificationService from '../services/gamification';
import AnalyticsService from '../services/analyticsService';
import { AchievementPopup, ComboMultiplier } from '../components/GamificationComponents';

const { width, height } = Dimensions.get('window');

interface QuizScreenProps {
  navigation: any;
  route?: {
    params?: {
      category?: string;
      challengeLink?: string;
    };
  };
}

const QuizScreenFrictionless: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const category = route?.params?.category || 'JavaScript'; // Default to popular category
  const [questions, setQuestions] = useState<any[]>([]);
  const [categoryIdState, setCategoryIdState] = useState<string | null>(null);
  const [achievementToShow, setAchievementToShow] = useState<any>(null);
  const [showCombo, setShowCombo] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [quizSessionId] = useState(
    () => `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);

  // Enhanced Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressPulse = useRef(new Animated.Value(1)).current;
  const cardElevation = useRef(new Animated.Value(0)).current;
  const answerGlow = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Timer
  const timerRef = useRef<NodeJS.Timeout>();
  const questionStartTime = useRef<number>(Date.now());

  // Community stats (mocked for now, will be from backend later)
  const [communityStats] = useState({
    percentCorrect: Math.floor(Math.random() * 40) + 30, // 30-70%
    totalAttempts: Math.floor(Math.random() * 1000) + 500,
    trending: ['San Francisco', 'New York', 'London'][Math.floor(Math.random() * 3)],
  });

  useEffect(() => {
    loadQuestions();
    animateIn();
    startEnhancedAnimations();
    // Track quiz start
    AnalyticsService.trackScreenView('QuizScreen', { category });
    AnalyticsService.trackQuizEvent('quiz_started', {
      quiz_session_id: quizSessionId,
      category,
      difficulty: 'mixed', // Could be dynamic based on questions
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startEnhancedAnimations = () => {
    // Breathing animation for focus
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Shimmer effect for progress
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();

    // Card elevation animation
    Animated.timing(cardElevation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Progress pulse for engagement
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressPulse, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(progressPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    // Start timer for current question
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  const loadQuestions = async () => {
    try {
      // Resolve category ID via delivery service (by name), fallback to name
      const categories = await questionDelivery.getCategories();
      const match = categories.find((c: any) => c.name?.toLowerCase() === category.toLowerCase());
      const resolvedCategoryId = match?.id || category;
      setCategoryIdState(resolvedCategoryId);

      const fetched = await questionDelivery.getQuestions(resolvedCategoryId, {
        limit: 10,
        random: true,
      });
      if (Array.isArray(fetched) && fetched.length > 0) {
        // Normalize fields expected by UI
        const normalized = fetched.map((q: any) => ({
          id: q.id,
          question: q.text || q.question,
          options: q.options || [],
          correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer : q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          codeSnippet: q.codeSnippet,
        }));
        setQuestions(normalized);
        return;
      }
    } catch (e) {
      console.log('Question delivery failed, falling back to local data', e);
    }

    // Fallback: local data via progress (kept minimal)
    try {
      const { devQuizData } = await import('../services/devQuizData');
      const cat =
        devQuizData.find((c: any) => c.name?.toLowerCase() === category.toLowerCase()) ||
        devQuizData[0];
      const shuffled = [...cat.questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 10));
    } catch {
      setQuestions([]);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleAnswer = async (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    const currentQuestion = questions[currentIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeForQuestion = Math.floor((Date.now() - questionStartTime.current) / 1000);

    // Update local progress
    localProgress.recordAnswer(currentQuestion.id, category, isCorrect, timeForQuestion);

    // Update session stats
    setSessionStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      setScore(score + 1);
      // Gamification: award XP and increment combo
      const newCombo = GamificationService.incrementCombo();
      try {
        await GamificationService.awardXP(10, 'quiz_answer_correct');

        // Show combo multiplier if > 1
        if (newCombo > 1) {
          setComboMultiplier(newCombo);
          setShowCombo(true);
        }

        // Check for achievements
        const newAchievements = GamificationService.checkAchievements();
        if (newAchievements.length > 0) {
          setAchievementToShow(newAchievements[0]); // Show first new achievement
        }

        // Track quiz answer
        await AnalyticsService.trackQuizEvent('answer_submitted', {
          quiz_session_id: quizSessionId,
          category,
          question_id: currentQuestion.id,
          answer_selected: selectedAnswer,
          is_correct: true,
          time_taken: timeForQuestion,
          hints_used: 0,
          power_ups_used: [],
        });
      } catch {}
      animateCorrect();
      // Enhanced success feedback
      Animated.sequence([
        Animated.timing(answerGlow, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(cardElevation, {
          toValue: 1.05,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(cardElevation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Break combo on wrong answer
      GamificationService.breakCombo();
      setShowCombo(false);

      // Track incorrect answer
      await AnalyticsService.trackQuizEvent('answer_submitted', {
        quiz_session_id: quizSessionId,
        category,
        question_id: currentQuestion.id,
        answer_selected: selectedAnswer,
        is_correct: false,
        time_taken: timeForQuestion,
        hints_used: 0,
        power_ups_used: [],
      });

      animateIncorrect();
      // Enhanced error feedback with shake
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    setShowFeedback(true);
    animateProgress();

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        nextQuestion();
      } else {
        showResults();
      }
    }, 2000);
  };

  const animateCorrect = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateIncorrect = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextQuestion = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    animateIn();
  };

  const showResults = () => {
    setShowResult(true);
    localProgress.endSession();
    // Gamification: mark daily quest progress
    try {
      GamificationService.updateQuestProgress('quiz_complete', 1);
    } catch {}
  };

  const shareResults = async () => {
    const stats = localProgress.getShareableStats();
    const message = `🎯 QuizMentor Challenge!\n\nI scored ${score}/${questions.length} in ${category}!\n📊 Level ${stats.level} | 🔥 ${stats.streak} day streak\n\nThink you can beat me? Try now!`;

    try {
      if (Platform.OS === 'web') {
        await navigator.share({
          title: 'QuizMentor Challenge',
          text: message,
          url: window.location.href,
        });
      } else {
        await Share.share({
          message,
          title: 'QuizMentor Challenge',
        });
      }
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  const playAgain = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowResult(false);
    setSessionStats({ correct: 0, total: 0 });
    loadQuestions();
    animateIn();
  };

  if (showResult) {
    const progress = localProgress.getProgress();
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContainer}>
        <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
          <Text style={styles.resultTitle}>🎉 Quiz Complete!</Text>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>
              {score}/{questions.length}
            </Text>
            <Text style={styles.accuracyText}>{accuracy}%</Text>
          </View>

          <Text style={styles.categoryLabel}>{category} Quiz</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Level {progress.level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.xp} XP</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>🔥 {progress.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progress.achievements.length}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>

          <View style={styles.communitySection}>
            <Text style={styles.communityTitle}>Community Stats</Text>
            <Text style={styles.communityText}>
              You scored better than{' '}
              {accuracy > communityStats.percentCorrect
                ? `${100 - communityStats.percentCorrect}%`
                : `${Math.round((accuracy / communityStats.percentCorrect) * 30)}%`}{' '}
              of players
            </Text>
            <Text style={styles.communityText}>{communityStats.totalAttempts} attempts today</Text>
            <Text style={styles.trendingText}>📍 Trending in {communityStats.trending}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
              <Text style={styles.shareButtonText}>🔗 Challenge Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playAgainButton} onPress={playAgain}>
              <Text style={styles.playAgainButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeButtonText}>Explore More Categories</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
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
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>🔥 {localProgress.getProgress().currentStreak}</Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>
            ⭐ {score}/{sessionStats.total}
          </Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>📊 Level {localProgress.getProgress().level}</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: slideAnim,
              },
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.categoryTag}>{category}</Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.codeSnippet && (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{currentQuestion.codeSnippet}</Text>
          </View>
        )}

        <View style={styles.communityHint}>
          <Text style={styles.hintText}>💡 {communityStats.percentCorrect}% got this right</Text>
        </View>
      </Animated.View>

      <View style={styles.answersContainer}>
        {currentQuestion.options.map((option: string, index: number) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          const showCorrect = showFeedback && isCorrect;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <Animated.View
              key={index}
              style={[{ transform: [{ scale: isSelected ? scaleAnim : 1 }] }]}
            >
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  showCorrect && styles.correctAnswer,
                  showIncorrect && styles.incorrectAnswer,
                ]}
                onPress={() => handleAnswer(index)}
                disabled={showFeedback}
              >
                <Text
                  style={[
                    styles.answerText,
                    (showCorrect || showIncorrect) && styles.answerTextHighlight,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && <Text style={styles.emoji}>✅</Text>}
                {showIncorrect && <Text style={styles.emoji}>❌</Text>}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {showFeedback && (
        <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
          <Text style={styles.explanationTitle}>
            {selectedAnswer === currentQuestion.correctAnswer ? '🎉 Correct!' : '💡 Explanation'}
          </Text>
          <Text style={styles.explanation}>{currentQuestion.explanation}</Text>
        </Animated.View>
      )}

      {/* Combo Multiplier Overlay */}
      <ComboMultiplier multiplier={comboMultiplier} show={showCombo} />

      {/* Achievement Popup */}
      <AchievementPopup
        achievement={achievementToShow}
        visible={!!achievementToShow}
        onClose={() => setAchievementToShow(null)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  resultContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height - 100,
  },
  header: {
    marginBottom: 16,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e1e4e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0969da',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#586069',
    textAlign: 'center',
    marginTop: 8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTag: {
    fontSize: 12,
    color: '#0969da',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292e',
    lineHeight: 26,
    marginBottom: 16,
  },
  codeBlock: {
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: '#24292e',
  },
  communityHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: '#586069',
    fontStyle: 'italic',
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e1e4e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  correctAnswer: {
    borderColor: '#28a745',
    backgroundColor: '#f0fff4',
  },
  incorrectAnswer: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  answerText: {
    fontSize: 16,
    color: '#24292e',
    flex: 1,
  },
  answerTextHighlight: {
    fontWeight: '600',
  },
  emoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  feedbackContainer: {
    backgroundColor: '#f0f6fc',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    color: '#586069',
    lineHeight: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#24292e',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0969da',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  accuracyText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#586069',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#586069',
  },
  communitySection: {
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  communityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 8,
  },
  communityText: {
    fontSize: 14,
    color: '#586069',
    marginBottom: 4,
  },
  trendingText: {
    fontSize: 14,
    color: '#0969da',
    fontWeight: '600',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#0969da',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#0969da',
    fontSize: 16,
    fontWeight: '600',
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: '#0969da',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#f6f8fa',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#586069',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#586069',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default QuizScreenFrictionless;

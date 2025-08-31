/**
 * QuizMentor - Full Mobile Experience
 * Single-screen quiz app with animations, gamification, and dopamine mechanics
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  ScrollView,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

// Services
import { unifiedQuizData } from './services/unifiedQuizData';
import { localProgress } from './src/services/localProgress';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animation values
const CELEBRATION_DURATION = 2000;
const COMBO_ANIMATION_DURATION = 600;
const LEVEL_UP_DURATION = 1500;

export default function AppMobileExperience() {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'levelup' | 'results'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);

  // User progress
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const comboScale = useRef(new Animated.Value(1)).current;
  const streakFlame = useRef(new Animated.Value(1)).current;
  const heartBeat = useRef(new Animated.Value(1)).current;
  const questionSlide = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const levelUpScale = useRef(new Animated.Value(0)).current;
  const xpBarWidth = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Particle animations for celebrations
  const particles = useRef(
    Array(20)
      .fill(0)
      .map(() => ({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0),
      })),
  ).current;

  useEffect(() => {
    // Load user progress
    const progress = localProgress.getProgress();
    setUserLevel(progress.level || 1);
    setUserXP(progress.totalXP || 0);
    setUserStreak(progress.currentStreak || 0);
    setXpForNextLevel(calculateXPForLevel(progress.level || 1));

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Start glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Animate streak flame
    if (progress.currentStreak > 0) {
      animateStreakFlame();
    }
  }, []);

  const calculateXPForLevel = (level: number) => {
    return Math.floor(100 * Math.pow(level, 1.5));
  };

  const animateStreakFlame = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(streakFlame, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(streakFlame, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startGame = () => {
    // Load adaptive questions
    const adaptiveQuestions = unifiedQuizData.getAdaptiveQuestions(userLevel, null, 10);
    setQuestions(adaptiveQuestions);
    setCurrentQuestion(adaptiveQuestions[0]);
    setQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setLives(3);
    setSelectedAnswer(null);
    setGameState('playing');

    // Animate transition
    Animated.spring(questionSlide, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correct;

    if (isCorrect) {
      // Correct answer
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore(score + 10 * (1 + newCombo * 0.5));

      // Award XP with combo multiplier
      const xpGained = Math.floor(10 * (1 + newCombo * 0.5));
      const newXP = userXP + xpGained;
      setUserXP(newXP);

      // Check level up
      if (newXP >= xpForNextLevel) {
        triggerLevelUp();
      }

      // Animate combo
      Animated.sequence([
        Animated.timing(comboScale, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(comboScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Update XP bar
      Animated.timing(xpBarWidth, {
        toValue: (newXP % xpForNextLevel) / xpForNextLevel,
        duration: 500,
        useNativeDriver: false,
      }).start();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Trigger celebration for high combos
      if (newCombo >= 3) {
        triggerCelebration();
      }
    } else {
      // Wrong answer
      setCombo(0);
      setLives(lives - 1);

      // Heart break animation
      Animated.sequence([
        Animated.timing(heartBeat, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        heartBeat.setValue(1);
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Vibration.vibrate(200);

      if (lives <= 1) {
        // Game over
        setTimeout(() => endGame(), 1000);
        return;
      }
    }

    // Progress to next question
    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    if (questionIndex >= questions.length - 1) {
      endGame();
      return;
    }

    // Slide out current question
    Animated.timing(questionSlide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(questions[questionIndex + 1]);
      setSelectedAnswer(null);

      // Slide in new question
      Animated.spring(questionSlide, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });
  };

  const triggerCelebration = () => {
    Animated.timing(celebrationOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Animate particles
    particles.forEach((particle, i) => {
      const delay = i * 50;
      const endX = (Math.random() - 0.5) * SCREEN_WIDTH;
      const endY = -Math.random() * SCREEN_HEIGHT;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(particle.scale, {
            toValue: 1,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: endX,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        particle.x.setValue(0);
        particle.y.setValue(0);
        particle.scale.setValue(0);
      });
    });

    setTimeout(() => {
      Animated.timing(celebrationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, CELEBRATION_DURATION);
  };

  const triggerLevelUp = () => {
    setShowLevelUp(true);
    const newLevel = userLevel + 1;
    setUserLevel(newLevel);
    setXpForNextLevel(calculateXPForLevel(newLevel));

    // Epic level up animation
    Animated.sequence([
      Animated.timing(levelUpScale, {
        toValue: 1.5,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(levelUpScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      setShowLevelUp(false);
      levelUpScale.setValue(0);
    }, LEVEL_UP_DURATION);
  };

  const endGame = () => {
    setGameState('results');

    // Save progress
    localProgress.endSession();

    // Animate results
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const renderMenu = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Background */}
      <Animated.View
        style={[
          styles.glowOrb,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
          },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>LEVEL {userLevel}</Text>
        </View>

        {/* XP Bar */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <Animated.View
              style={[
                styles.xpFill,
                {
                  width: xpBarWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.xpText}>
            {userXP % xpForNextLevel} / {xpForNextLevel} XP
          </Text>
        </View>

        {/* Streak */}
        {userStreak > 0 && (
          <Animated.View
            style={[
              styles.streakContainer,
              {
                transform: [{ scale: streakFlame }],
              },
            ]}
          >
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakText}>{userStreak}</Text>
          </Animated.View>
        )}
      </View>

      {/* Main Menu */}
      <View style={styles.menuContent}>
        <Text style={styles.logoText}>QuizMentor</Text>
        <Text style={styles.tagline}>Level up your knowledge</Text>

        {/* Play Button */}
        <TouchableOpacity onPress={startGame} activeOpacity={0.8}>
          <LinearGradient
            colors={['#ff006e', '#8338ec', '#3a86ff']}
            style={styles.playButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.playButtonText}>START QUIZ</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Preview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.floor(score)}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderGame = () => {
    if (!currentQuestion) return null;

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Game Header */}
        <SafeAreaView style={styles.gameHeader}>
          {/* Lives */}
          <View style={styles.livesContainer}>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Animated.Text
                  key={i}
                  style={[
                    styles.heart,
                    i >= lives && styles.lostHeart,
                    i === lives - 1 && {
                      transform: [{ scale: heartBeat }],
                    },
                  ]}
                >
                  {i < lives ? '❤️' : '💔'}
                </Animated.Text>
              ))}
          </View>

          {/* Score & Combo */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{Math.floor(score)}</Text>
            {combo > 0 && (
              <Animated.View
                style={[
                  styles.comboContainer,
                  {
                    transform: [{ scale: comboScale }],
                  },
                ]}
              >
                <Text style={styles.comboText}>×{(1 + combo * 0.5).toFixed(1)}</Text>
              </Animated.View>
            )}
          </View>
        </SafeAreaView>

        {/* Question */}
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: questionSlide,
              transform: [
                {
                  translateX: questionSlide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_WIDTH, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.questionNumber}>
            Question {questionIndex + 1}/{questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Code snippet if present */}
          {currentQuestion.codeSnippet && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{currentQuestion.codeSnippet}</Text>
            </View>
          )}
        </Animated.View>

        {/* Answer Options */}
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct;
            const showResult = selectedAnswer !== null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerButton,
                  isSelected && styles.selectedAnswer,
                  showResult && isCorrect && styles.correctAnswer,
                  showResult && isSelected && !isCorrect && styles.wrongAnswer,
                ]}
                onPress={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.answerText,
                    showResult && isCorrect && styles.correctAnswerText,
                    showResult && isSelected && !isCorrect && styles.wrongAnswerText,
                  ]}
                >
                  {option}
                </Text>
                {showResult && isCorrect && <Text style={styles.checkmark}>✓</Text>}
                {showResult && isSelected && !isCorrect && <Text style={styles.cross}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Celebration Particles */}
        <Animated.View
          style={[
            styles.celebrationContainer,
            {
              opacity: celebrationOpacity,
            },
          ]}
          pointerEvents="none"
        >
          {particles.map((particle, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  transform: [
                    { translateX: particle.x },
                    { translateY: particle.y },
                    { scale: particle.scale },
                  ],
                  opacity: particle.opacity,
                  backgroundColor: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5'][i % 4],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Level Up Overlay */}
        {showLevelUp && (
          <Animated.View
            style={[
              styles.levelUpOverlay,
              {
                transform: [{ scale: levelUpScale }],
              },
            ]}
          >
            <Text style={styles.levelUpText}>LEVEL UP!</Text>
            <Text style={styles.newLevelText}>Level {userLevel}</Text>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderResults = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.resultsContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.resultsTitle}>Quiz Complete!</Text>

        <View style={styles.scoreCircle}>
          <Text style={styles.finalScore}>{Math.floor(score)}</Text>
          <Text style={styles.scoreLabel}>POINTS</Text>
        </View>

        <View style={styles.resultsStats}>
          <View style={styles.resultStat}>
            <Text style={styles.resultValue}>+{Math.floor(score / 10)}</Text>
            <Text style={styles.resultLabel}>XP Earned</Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={styles.resultValue}>{Math.max(combo, 1)}x</Text>
            <Text style={styles.resultLabel}>Best Combo</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.playAgainButton} onPress={() => setGameState('menu')}>
          <Text style={styles.playAgainText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'results' && renderResults()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#8338ec',
    top: SCREEN_HEIGHT * 0.2,
    left: SCREEN_WIDTH / 2 - 150,
    opacity: 0.3,
  },

  // Menu Styles
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#8338ec',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  xpContainer: {
    width: '80%',
    marginTop: 10,
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#06ffa5',
    borderRadius: 3,
  },
  xpText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  streakContainer: {
    position: 'absolute',
    right: 20,
    top: 60,
    alignItems: 'center',
  },
  streakFlame: {
    fontSize: 30,
  },
  streakText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  menuContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 50,
  },
  playButton: {
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 30,
    marginBottom: 40,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 5,
  },

  // Game Styles
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  heart: {
    fontSize: 24,
  },
  lostHeart: {
    opacity: 0.5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  comboContainer: {
    backgroundColor: '#ff006e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  comboText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  questionContainer: {
    padding: 20,
    marginTop: 40,
  },
  questionNumber: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 10,
  },
  questionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  codeText: {
    color: '#06ffa5',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 14,
  },
  answersContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  answerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedAnswer: {
    borderColor: '#8338ec',
    backgroundColor: 'rgba(131,56,236,0.2)',
  },
  correctAnswer: {
    borderColor: '#06ffa5',
    backgroundColor: 'rgba(6,255,165,0.2)',
  },
  wrongAnswer: {
    borderColor: '#ff006e',
    backgroundColor: 'rgba(255,0,110,0.2)',
  },
  answerText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  correctAnswerText: {
    color: '#06ffa5',
    fontWeight: '600',
  },
  wrongAnswerText: {
    color: '#ff006e',
    fontWeight: '600',
  },
  checkmark: {
    color: '#06ffa5',
    fontSize: 24,
    fontWeight: '800',
  },
  cross: {
    color: '#ff006e',
    fontSize: 24,
    fontWeight: '800',
  },

  // Celebration
  celebrationContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Level Up
  levelUpOverlay: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 100,
    left: SCREEN_WIDTH / 2 - 100,
    width: 200,
    height: 200,
    backgroundColor: '#8338ec',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8338ec',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  levelUpText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 10,
  },
  newLevelText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  // Results
  resultsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(131,56,236,0.2)',
    borderWidth: 4,
    borderColor: '#8338ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  finalScore: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    letterSpacing: 1,
  },
  resultsStats: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 40,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultValue: {
    color: '#06ffa5',
    fontSize: 24,
    fontWeight: '800',
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 5,
  },
  playAgainButton: {
    backgroundColor: '#8338ec',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

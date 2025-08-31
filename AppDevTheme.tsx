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
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  devQuizData,
  getRandomQuestions,
  getDailyChallenge,
  Category,
  Question,
} from './services/devQuizData';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Developer-themed color palette (GitHub + VS Code inspired)
const colors = {
  // Main theme colors
  background: '#0d1117', // GitHub dark background
  surface: '#161b22', // Slightly lighter surface
  surfaceLight: '#21262d', // Card backgrounds

  // Primary colors (VS Code blue theme)
  primary: '#58a6ff', // GitHub blue
  primaryDark: '#1f6feb',
  primaryLight: '#79c0ff',

  // Accent colors (Terminal green)
  accent: '#3fb950', // GitHub green
  accentDark: '#238636',
  accentLight: '#56d364',

  // Syntax highlighting colors
  keyword: '#ff7b72', // Red/pink for keywords
  string: '#a5d6ff', // Light blue for strings
  comment: '#8b949e', // Gray for comments
  function: '#d2a8ff', // Purple for functions
  variable: '#ffa657', // Orange for variables

  // Status colors
  success: '#3fb950',
  warning: '#d29922',
  danger: '#f85149',
  info: '#58a6ff',

  // Text colors
  text: '#f0f6fc', // Primary text
  textMuted: '#8b949e', // Muted text
  textDim: '#484f58', // Very dim text

  // Special colors
  gold: '#ffd700',
  purple: '#8957e5',
  pink: '#f778ba',

  // Border colors
  border: '#30363d',
  borderLight: '#484f58',
};

// Terminal-style fonts
const fonts = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Consolas, Monaco, monospace',
  }),
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui, -apple-system, sans-serif',
  }),
};

// Quiz Context
const DevContext = createContext<any>({});

function DevProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({
    username: 'dev_ninja',
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    commits: 7, // Instead of streak
    pullRequests: 5, // Instead of hearts
    contributions: 847, // Total contributions
    badges: ['git-master', 'react-hero', 'bug-hunter'],
    languages: {
      javascript: 85,
      react: 72,
      typescript: 65,
      git: 90,
    },
  });

  return <DevContext.Provider value={{ user, setUser }}>{children}</DevContext.Provider>;
}

// Terminal-style button
const TerminalButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  style = {},
}: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    if (disabled) return styles.terminalButtonDisabled;
    switch (variant) {
      case 'success':
        return styles.terminalButtonSuccess;
      case 'danger':
        return styles.terminalButtonDanger;
      case 'warning':
        return styles.terminalButtonWarning;
      default:
        return styles.terminalButton;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={getButtonStyle()}
      >
        <Text style={styles.terminalButtonText}>
          {icon && <Text style={styles.terminalButtonIcon}>{icon} </Text>}$ {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Code Lesson Button
const CodeLessonButton = ({ lesson, onPress, index }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const getButtonStyle = () => {
    if (lesson.isLocked) return styles.lessonLocked;
    if (lesson.isCompleted) return styles.lessonCompleted;
    if (lesson.isCurrent) return styles.lessonCurrent;
    return styles.lessonDefault;
  };

  return (
    <Animated.View
      style={[
        styles.lessonContainer,
        {
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => !lesson.isLocked && onPress(lesson)}
        disabled={lesson.isLocked}
        style={getButtonStyle()}
      >
        {lesson.isCompleted && (
          <View style={styles.lessonBadge}>
            <Text style={styles.lessonBadgeText}>✓</Text>
          </View>
        )}

        <Text style={[styles.lessonIcon, { fontSize: 36 }]}>
          {lesson.isLocked ? '🔒' : lesson.icon}
        </Text>

        <Text style={styles.lessonTitle}>{lesson.name}</Text>

        {lesson.isCurrent && (
          <View style={styles.lessonProgressBar}>
            <View style={[styles.lessonProgressFill, { width: `${lesson.progress * 100}%` }]} />
          </View>
        )}

        {!lesson.isLocked && (
          <Text style={styles.lessonLanguage}>&lt;/{lesson.name.toLowerCase()}&gt;</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Path Screen (Developer Journey)
function PathScreen({ navigation }: any) {
  const { user } = useContext(DevContext);
  const scrollRef = useRef<ScrollView>(null);

  const lessons = devQuizData.map((category, index) => ({
    ...category,
    isCompleted: index < 2,
    isCurrent: index === 2,
    isLocked: index > 5,
    progress: index < 2 ? 1 : index === 2 ? 0.6 : 0,
  }));

  const handleLessonPress = (lesson: any) => {
    navigation.navigate('CodeChallenge', { category: lesson });
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Terminal Header */}
      <View style={styles.terminalHeader}>
        <View style={styles.terminalTitleBar}>
          <View style={styles.terminalButtons}>
            <View style={[styles.terminalButton, { backgroundColor: '#ff5f56' }]} />
            <View style={[styles.terminalButton, { backgroundColor: '#ffbd2e' }]} />
            <View style={[styles.terminalButton, { backgroundColor: '#27c93f' }]} />
          </View>
          <Text style={styles.terminalTitle}>dev@quizmentor:~</Text>
        </View>

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{user.commits}</Text>
            <Text style={styles.statLabel}>commits</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statValue}>{user.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{user.pullRequests}</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{user.contributions}</Text>
            <Text style={styles.statLabel}>contrib</Text>
          </View>
        </View>
      </View>

      {/* XP Progress Bar */}
      <View style={styles.xpContainer}>
        <Text style={styles.xpLabel}>
          <Text style={styles.xpCommand}>$ git status</Text>
        </Text>
        <View style={styles.xpBar}>
          <Animated.View
            style={[styles.xpFill, { width: `${(user.xp / user.nextLevelXp) * 100}%` }]}
          />
        </View>
        <Text style={styles.xpText}>
          Level {user.level} • {user.xp}/{user.nextLevelXp} XP
        </Text>
      </View>

      {/* Code Path */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pathContent}
      >
        <Text style={styles.pathTitle}>// Your Learning Path</Text>

        <View style={styles.lessonGrid}>
          {lessons.map((lesson, index) => (
            <CodeLessonButton
              key={lesson.id}
              lesson={lesson}
              onPress={handleLessonPress}
              index={index}
            />
          ))}
        </View>

        {/* Daily Challenge Card */}
        <TouchableOpacity
          style={styles.dailyCard}
          onPress={() => navigation.navigate('DailyChallenge')}
        >
          <View style={styles.dailyCardHeader}>
            <Text style={styles.dailyCardTitle}>🚀 Daily Algorithm Challenge</Text>
            <Text style={styles.dailyCardReward}>+100 XP</Text>
          </View>
          <Text style={styles.dailyCardDescription}>
            Complete today's coding challenge to maintain your commit streak!
          </Text>
          <View style={styles.dailyCardCommand}>
            <Text style={styles.commandText}>$ npm run daily-challenge</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TerminalButton
          title="continue"
          icon="▶"
          variant="success"
          onPress={() => {
            const currentLesson = lessons.find((l) => l.isCurrent);
            if (currentLesson) {
              handleLessonPress(currentLesson);
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

// Code Challenge Screen (Quiz)
function CodeChallengeScreen({ navigation, route }: any) {
  const category: Category = route.params?.category || devQuizData[0];
  const [questions] = useState<Question[]>(() => getRandomQuestions(category.id, 5));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [pullRequests, setPullRequests] = useState(5);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: (currentQuestion / questions.length) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  const question = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
    if (!isWeb) Haptics.selectionAsync();
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedAnswer === question.correct;

    if (isCorrect) {
      setScore(score + 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setPullRequests(pullRequests - 1);
      if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();

      if (pullRequests <= 1) {
        setTimeout(() => setShowResult(true), 1500);
        return;
      }
    }

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);

      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const accuracy = Math.round((score / questions.length) * 100);
    const xpEarned = score * 20;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={styles.resultTerminal}>
            <View style={styles.terminalTitleBar}>
              <View style={styles.terminalButtons}>
                <View style={[styles.terminalButton, { backgroundColor: '#ff5f56' }]} />
                <View style={[styles.terminalButton, { backgroundColor: '#ffbd2e' }]} />
                <View style={[styles.terminalButton, { backgroundColor: '#27c93f' }]} />
              </View>
              <Text style={styles.terminalTitle}>test-results.log</Text>
            </View>

            <View style={styles.resultContent}>
              <Text style={styles.resultLog}>
                {`> Running test suite...
> ${score} tests passed, ${questions.length - score} failed

${accuracy >= 80 ? '✅ BUILD SUCCESSFUL' : accuracy >= 60 ? '⚠️ BUILD UNSTABLE' : '❌ BUILD FAILED'}

Test Results:
━━━━━━━━━━━━━━━━━━━━━
Passed:     ${score}/${questions.length}
Coverage:   ${accuracy}%
XP Earned:  +${xpEarned}
━━━━━━━━━━━━━━━━━━━━━

${
  accuracy >= 80
    ? '🏆 Achievement Unlocked: Code Master!'
    : accuracy >= 60
      ? '💪 Good effort! Keep coding!'
      : '📚 Time to review the documentation!'
}`}
              </Text>

              <View style={styles.resultActions}>
                <TerminalButton
                  title="git commit -m 'Complete challenge'"
                  variant="success"
                  onPress={() => navigation.navigate('Path')}
                />

                <TerminalButton
                  title="git reset --hard"
                  variant="warning"
                  onPress={() => {
                    navigation.replace('CodeChallenge', { category });
                  }}
                  style={{ marginTop: 12 }}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.challengeContainer}>
      {/* Header */}
      <View style={styles.challengeHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.challengeProgressBar}>
          <Animated.View
            style={[
              styles.challengeProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: category.color,
              },
            ]}
          />
        </View>

        <View style={styles.pullRequestsContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={styles.pullRequestIcon}>
              {i < pullRequests ? '✅' : '❌'}
            </Text>
          ))}
        </View>
      </View>

      {/* Question Content */}
      <Animated.View
        style={[
          styles.questionContainer,
          {
            transform: [{ translateX: shakeAnim }, { translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.codeCard}>
          <View style={styles.codeHeader}>
            <Text style={styles.codeFileName}>
              question_{currentQuestion + 1}.{category.id}
            </Text>
            <Text
              style={[
                styles.difficultyBadge,
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

          {question.codeSnippet && (
            <View style={styles.codeSnippet}>
              <Text style={styles.codeText}>{question.codeSnippet}</Text>
            </View>
          )}

          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.answersContainer}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const showCorrect = isAnswerSubmitted && isCorrect;
            const showWrong = isAnswerSubmitted && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleAnswer(index)}
                disabled={isAnswerSubmitted}
                style={[
                  styles.answerOption,
                  isSelected && !isAnswerSubmitted && styles.answerOptionSelected,
                  showCorrect && styles.answerOptionCorrect,
                  showWrong && styles.answerOptionWrong,
                ]}
              >
                <Text style={styles.answerIndex}>[{index}]</Text>
                <Text
                  style={[
                    styles.answerText,
                    isSelected && !isAnswerSubmitted && styles.answerTextSelected,
                    showCorrect && styles.answerTextCorrect,
                    showWrong && styles.answerTextWrong,
                  ]}
                >
                  {option}
                </Text>
                {showCorrect && <Text style={styles.answerIcon}>✓</Text>}
                {showWrong && <Text style={styles.answerIcon}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && question.explanation && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>// Explanation</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}
      </Animated.View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        {!isAnswerSubmitted ? (
          <TerminalButton
            title="test"
            icon="▶"
            variant={selectedAnswer !== null ? 'success' : 'primary'}
            disabled={selectedAnswer === null}
            onPress={checkAnswer}
          />
        ) : (
          <TerminalButton
            title="next"
            icon="→"
            variant={selectedAnswer === question.correct ? 'success' : 'warning'}
            onPress={nextQuestion}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Profile Screen
function ProfileScreen() {
  const { user } = useContext(DevContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileTerminal}>
          <Text style={styles.profileCommand}>$ whoami</Text>
          <Text style={styles.profileOutput}>{user.username}</Text>

          <Text style={styles.profileCommand}>$ git log --author={user.username} --oneline</Text>
          <Text style={styles.profileOutput}>
            {`Level ${user.level} Developer
${user.xp} XP earned
${user.contributions} contributions
${user.commits} day streak`}
          </Text>

          <Text style={styles.profileCommand}>$ ls badges/</Text>
          <View style={styles.badgesGrid}>
            {user.badges.map((badge: string, i: number) => (
              <View key={i} style={styles.badge}>
                <Text style={styles.badgeIcon}>🏅</Text>
                <Text style={styles.badgeName}>{badge}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.profileCommand}>$ cat skills.json</Text>
          <View style={styles.skillsContainer}>
            {Object.entries(user.languages).map(([lang, level]) => (
              <View key={lang} style={styles.skillRow}>
                <Text style={styles.skillName}>{lang}:</Text>
                <View style={styles.skillBar}>
                  <View style={[styles.skillFill, { width: `${level}%` }]} />
                </View>
                <Text style={styles.skillLevel}>{level}%</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Leaderboard Screen
function LeaderboardScreen() {
  const leaderboard = [
    { rank: 1, username: 'code_wizard', xp: 9450, commits: 365 },
    { rank: 2, username: 'dev_ninja', xp: 8200, commits: 280 },
    { rank: 3, username: 'bug_hunter', xp: 7800, commits: 245 },
    { rank: 4, username: 'algo_master', xp: 6500, commits: 198 },
    { rank: 5, username: 'react_hero', xp: 5200, commits: 156 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.leaderboardTerminal}>
          <Text style={styles.leaderboardTitle}>$ git shortlog -sn | head -5</Text>

          {leaderboard.map((user, index) => (
            <View
              key={index}
              style={[styles.leaderboardRow, index === 1 && styles.leaderboardRowHighlight]}
            >
              <Text style={styles.leaderboardRank}>
                {user.rank === 1
                  ? '🥇'
                  : user.rank === 2
                    ? '🥈'
                    : user.rank === 3
                      ? '🥉'
                      : `#${user.rank}`}
              </Text>
              <Text style={styles.leaderboardUsername}>{user.username}</Text>
              <View style={styles.leaderboardStats}>
                <Text style={styles.leaderboardXP}>{user.xp} XP</Text>
                <Text style={styles.leaderboardCommits}>🔥 {user.commits}</Text>
              </View>
            </View>
          ))}
        </View>
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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Path"
        component={PathScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20, fontFamily: fonts.mono }}>{'</>'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Rank',
          tabBarIcon: ({ color }) => <Ionicons name="trophy" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DevProvider>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CodeChallenge" component={CodeChallengeScreen} />
            <Stack.Screen name="DailyChallenge" component={CodeChallengeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DevProvider>
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

  // Terminal Header
  terminalHeader: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  terminalTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceLight,
  },
  terminalButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  terminalButton: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  terminalTitle: {
    marginLeft: 16,
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.text,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    fontFamily: fonts.mono,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fonts.mono,
  },

  // XP Bar
  xpContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  xpLabel: {
    marginBottom: 8,
  },
  xpCommand: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.comment,
  },
  xpBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fonts.mono,
    marginTop: 6,
  },

  // Path
  pathContent: {
    paddingTop: 20,
  },
  pathTitle: {
    fontSize: 16,
    fontFamily: fonts.mono,
    color: colors.comment,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  lessonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  lessonContainer: {
    width: (screenWidth - 48) / 3,
    marginBottom: 24,
  },
  lessonDefault: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  lessonCurrent: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lessonCompleted: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  lessonLocked: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    opacity: 0.5,
  },
  lessonBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonBadgeText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  lessonIcon: {
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    fontFamily: fonts.mono,
  },
  lessonLanguage: {
    fontSize: 9,
    color: colors.comment,
    fontFamily: fonts.mono,
    marginTop: 4,
  },
  lessonProgressBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  // Daily Card
  dailyCard: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 20,
  },
  dailyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dailyCardReward: {
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.accent,
  },
  dailyCardDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  dailyCardCommand: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
  },
  commandText: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.string,
  },

  // Terminal Button
  terminalButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  terminalButtonSuccess: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  terminalButtonDanger: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  terminalButtonWarning: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  terminalButtonDisabled: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    opacity: 0.5,
  },
  terminalButtonText: {
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.text,
    fontWeight: '600',
  },
  terminalButtonIcon: {
    fontSize: 16,
  },

  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Challenge Screen
  challengeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  challengeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pullRequestsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  pullRequestIcon: {
    fontSize: 16,
  },

  // Question
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  codeFileName: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  difficultyBadge: {
    fontSize: 11,
    fontFamily: fonts.mono,
    fontWeight: 'bold',
  },
  codeSnippet: {
    backgroundColor: colors.background,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  codeText: {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: colors.string,
    lineHeight: 20,
  },
  questionText: {
    fontSize: 16,
    color: colors.text,
    padding: 16,
    lineHeight: 24,
  },
  answersContainer: {
    gap: 12,
  },
  answerOption: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  answerOptionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.surface,
  },
  answerOptionWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  answerIndex: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.comment,
    marginRight: 12,
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  answerTextSelected: {
    color: colors.primary,
  },
  answerTextCorrect: {
    color: colors.success,
  },
  answerTextWrong: {
    color: colors.danger,
  },
  answerIcon: {
    fontSize: 18,
    marginLeft: 8,
  },

  // Explanation
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 20,
  },
  explanationTitle: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.comment,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  // Result
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultTerminal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultContent: {
    padding: 20,
  },
  resultLog: {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: colors.text,
    lineHeight: 22,
  },
  resultActions: {
    marginTop: 24,
  },

  // Profile
  profileTerminal: {
    padding: 20,
  },
  profileCommand: {
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.comment,
    marginTop: 20,
    marginBottom: 8,
  },
  profileOutput: {
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.text,
    lineHeight: 22,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 12,
  },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeName: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  skillsContainer: {
    marginTop: 12,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: colors.text,
    width: 100,
  },
  skillBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  skillFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  skillLevel: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.textMuted,
    width: 40,
    textAlign: 'right',
  },

  // Leaderboard
  leaderboardTerminal: {
    padding: 20,
  },
  leaderboardTitle: {
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.comment,
    marginBottom: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
  },
  leaderboardRowHighlight: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  leaderboardRank: {
    fontSize: 16,
    width: 40,
  },
  leaderboardUsername: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.mono,
    color: colors.text,
  },
  leaderboardStats: {
    flexDirection: 'row',
    gap: 12,
  },
  leaderboardXP: {
    fontSize: 13,
    fontFamily: fonts.mono,
    color: colors.accent,
  },
  leaderboardCommits: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Tab Bar
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
});

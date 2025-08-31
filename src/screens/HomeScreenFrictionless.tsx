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
} from 'react-native';
import { localProgress } from '../services/localProgress';
import { unifiedQuizData } from '../../services/unifiedQuizData';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

// Mock trending data (will be from backend later)
const TRENDING_TOPICS = [
  { category: 'React', icon: '⚛️', hot: true, difficulty: 'Intermediate' },
  { category: 'JavaScript', icon: '🟨', hot: false, difficulty: 'All Levels' },
  { category: 'TypeScript', icon: '🔷', hot: true, difficulty: 'Advanced' },
  { category: 'Node.js', icon: '🟢', hot: false, difficulty: 'Intermediate' },
  { category: 'Python', icon: '🐍', hot: true, difficulty: 'Beginner' },
  { category: 'System Design', icon: '🏗️', hot: true, difficulty: 'Senior' },
];

const DAILY_CHALLENGE = {
  title: 'Master React Hooks',
  questions: 15,
  timeLimit: '10 min',
  xpBonus: 100,
  participants: 1234,
};

const HomeScreenFrictionless: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [progress] = useState(localProgress.getProgress());
  const [featuredCategory] = useState('React'); // Today's featured category
  const [timeUntilReset, setTimeUntilReset] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnimArray = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    // Animate in
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(
        100,
        slideAnimArray.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 20,
            friction: 7,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();

    // Pulse animation for CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Update countdown timer
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const startInstantQuiz = (category: string) => {
    navigation.navigate('Quiz', { category });
  };

  const renderHeroSection = () => (
    <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
      <Text style={styles.welcomeText}>
        {progress.totalQuestions > 0
          ? `Welcome back! 🔥 ${progress.currentStreak} day streak`
          : 'Test your dev knowledge in 30 seconds'}
      </Text>

      <Text style={styles.heroTitle}>
        Today's Challenge:{'\n'}
        <Text style={styles.heroCategory}>{featuredCategory} Mastery</Text>
      </Text>

      <View style={styles.heroStats}>
        <Text style={styles.heroStat}>⚡ 2 min</Text>
        <Text style={styles.heroStat}>🎯 10 questions</Text>
        <Text style={styles.heroStat}>🏆 +50 XP</Text>
      </View>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={styles.instantPlayButton}
          onPress={() => startInstantQuiz(featuredCategory)}
        >
          <Text style={styles.instantPlayText}>Start Quiz Now</Text>
          <Text style={styles.instantPlaySubtext}>No signup required</Text>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.socialProof}>
        👥 {Math.floor(Math.random() * 500) + 200} developers playing now
      </Text>
    </Animated.View>
  );

  const renderProgressWidget = () => {
    if (progress.totalQuestions === 0) return null;

    const accuracy = Math.round((progress.correctAnswers / progress.totalQuestions) * 100);

    return (
      <View style={styles.progressWidget}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <View style={styles.progressGrid}>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{progress.level}</Text>
            <Text style={styles.progressLabel}>Level</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{accuracy}%</Text>
            <Text style={styles.progressLabel}>Accuracy</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{progress.currentStreak}</Text>
            <Text style={styles.progressLabel}>Streak</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{progress.xp}</Text>
            <Text style={styles.progressLabel}>XP</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDailyChallenge = () => (
    <View style={styles.dailyChallenge}>
      <View style={styles.dailyHeader}>
        <View>
          <Text style={styles.dailyTitle}>🎯 Daily Challenge</Text>
          <Text style={styles.dailySubtitle}>{DAILY_CHALLENGE.title}</Text>
        </View>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{timeUntilReset}</Text>
        </View>
      </View>

      <View style={styles.dailyStats}>
        <Text style={styles.dailyStat}>📝 {DAILY_CHALLENGE.questions} questions</Text>
        <Text style={styles.dailyStat}>⏱️ {DAILY_CHALLENGE.timeLimit}</Text>
        <Text style={styles.dailyStat}>🎁 +{DAILY_CHALLENGE.xpBonus} XP</Text>
      </View>

      <TouchableOpacity style={styles.dailyButton} onPress={() => startInstantQuiz('React')}>
        <Text style={styles.dailyButtonText}>Take Challenge</Text>
      </TouchableOpacity>

      <Text style={styles.participantCount}>
        {DAILY_CHALLENGE.participants} developers completed today
      </Text>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Popular Categories</Text>
      <View style={styles.categoriesGrid}>
        {TRENDING_TOPICS.map((topic, index) => (
          <Animated.View
            key={topic.category}
            style={[
              styles.categoryCardWrapper,
              {
                opacity: slideAnimArray[index],
                transform: [
                  {
                    translateY: slideAnimArray[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() => startInstantQuiz(topic.category)}
            >
              {topic.hot && (
                <View style={styles.hotBadge}>
                  <Text style={styles.hotText}>🔥 HOT</Text>
                </View>
              )}
              <Text style={styles.categoryIcon}>{topic.icon}</Text>
              <Text style={styles.categoryName}>{topic.category}</Text>
              <Text style={styles.categoryDifficulty}>{topic.difficulty}</Text>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryStat}>
                  {unifiedQuizData.getQuestionsByCategory(topic.category).length} questions
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <Text style={styles.sectionTitle}>Community Activity</Text>
      <View style={styles.statCards}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🌍</Text>
          <Text style={styles.statNumber}>{Math.floor(Math.random() * 5000) + 1000}</Text>
          <Text style={styles.statDesc}>Active Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📚</Text>
          <Text style={styles.statNumber}>{Math.floor(Math.random() * 50000) + 10000}</Text>
          <Text style={styles.statDesc}>Quizzes Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏆</Text>
          <Text style={styles.statNumber}>{Math.floor(Math.random() * 100) + 50}</Text>
          <Text style={styles.statDesc}>Perfect Scores</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeroSection()}
      {renderProgressWidget()}
      {renderDailyChallenge()}
      {renderCategories()}
      {renderQuickStats()}

      <View style={styles.footer}>
        <Text style={styles.footerText}>No account needed • Progress saved locally</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.footerLink}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heroSection: {
    backgroundColor: '#0969da',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  heroCategory: {
    fontSize: 32,
    color: '#ffffff',
  },
  heroStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  heroStat: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginRight: 20,
  },
  instantPlayButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  instantPlayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0969da',
  },
  instantPlaySubtext: {
    fontSize: 12,
    color: '#586069',
    marginTop: 4,
  },
  socialProof: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.9,
  },
  progressWidget: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 12,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0969da',
  },
  progressLabel: {
    fontSize: 12,
    color: '#586069',
    marginTop: 4,
  },
  dailyChallenge: {
    backgroundColor: '#fff4e6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffb700',
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#24292e',
  },
  dailySubtitle: {
    fontSize: 14,
    color: '#586069',
    marginTop: 4,
  },
  timerBadge: {
    backgroundColor: '#ffb700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  dailyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dailyStat: {
    fontSize: 13,
    color: '#586069',
  },
  dailyButton: {
    backgroundColor: '#ffb700',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  participantCount: {
    fontSize: 12,
    color: '#586069',
    textAlign: 'center',
  },
  categoriesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#24292e',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  hotBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  hotText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292e',
    marginBottom: 4,
  },
  categoryDifficulty: {
    fontSize: 12,
    color: '#586069',
    marginBottom: 8,
  },
  categoryStats: {
    marginTop: 8,
  },
  categoryStat: {
    fontSize: 11,
    color: '#0969da',
  },
  quickStats: {
    padding: 16,
    paddingTop: 0,
  },
  statCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#24292e',
  },
  statDesc: {
    fontSize: 11,
    color: '#586069',
    marginTop: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#586069',
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 12,
    color: '#0969da',
    textDecorationLine: 'underline',
  },
});

export default HomeScreenFrictionless;

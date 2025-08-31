import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { useQuiz } from '../store/QuizContext';
import { StreakDisplay } from '../components/StreakDisplay';
import { HeartsDisplay } from '../components/HeartsDisplay';
import { DailyChallengeCard } from '../components/DailyChallengeCard';
import { useHeartsStore } from '../store/heartsStore';
import { useStreakStore } from '../store/streakStore';
import { useSubscriptionStore } from '../services/subscriptionServiceMock';
import { initializeDailyChallenge } from '../store/dailyChallengeStore';
import * as Notifications from 'expo-notifications';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { userStats, categories } = useQuiz();
  const { canPlayQuiz, hearts } = useHeartsStore();
  const { currentStreak } = useStreakStore();
  const { isPremium, initialize: initSubscriptions } = useSubscriptionStore();

  useEffect(() => {
    // Initialize subscriptions
    initSubscriptions();

    // Initialize daily challenge system
    initializeDailyChallenge();

    // Schedule manipulative notifications
    scheduleNotifications();
  }, []);

  const scheduleNotifications = async () => {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Schedule streak reminder at 8 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Your ' + currentStreak + '-day streak is in danger!',
        body: 'Complete a quiz now or lose everything!',
        data: { type: 'streak_danger' },
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      },
    });
  };

  const handleStartQuiz = () => {
    if (!canPlayQuiz()) {
      // Show hearts modal
      return;
    }
    navigation.navigate('Categories');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Premium User Banner */}
      {isPremium && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumBannerText}>👑 Premium Member</Text>
        </View>
      )}

      {/* Critical Engagement Components */}
      <StreakDisplay onPress={handleStartQuiz} />
      <HeartsDisplay />

      {/* Daily Challenge - Most Prominent Feature */}
      <DailyChallengeCard />

      {/* Premium Upsell Banner */}
      {!isPremium && (
        <TouchableOpacity
          style={styles.premiumUpsellBanner}
          onPress={() => navigation.navigate('Paywall' as any, { source: 'home_banner' })}
        >
          <Text style={styles.premiumUpsellTitle}>🎁 Limited Time: 50% OFF Premium!</Text>
          <Text style={styles.premiumUpsellSubtitle}>
            Unlock unlimited hearts & exclusive challenges
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {userStats.stars}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.questionsAnswered}</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Quiz Statistics</Text>
        <Text style={styles.infoText}>📚 {categories.length} Categories Available</Text>
        <Text style={styles.infoText}>❓ 513+ Questions</Text>
        <Text style={styles.infoText}>🎯 Multiple Difficulty Levels</Text>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Categories')}
      >
        <Text style={styles.startButtonText}>Start Quiz</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features</Text>
        <Text style={styles.featureItem}>✅ Real-time scoring</Text>
        <Text style={styles.featureItem}>✅ Detailed explanations</Text>
        <Text style={styles.featureItem}>✅ Progress tracking</Text>
        <Text style={styles.featureItem}>✅ Gamification system</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  featureItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  premiumBanner: {
    backgroundColor: '#fbbf24',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  premiumBannerText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  premiumUpsellBanner: {
    backgroundColor: '#8b5cf6',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumUpsellTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  premiumUpsellSubtitle: {
    color: '#e9d5ff',
    fontSize: 14,
  },
});

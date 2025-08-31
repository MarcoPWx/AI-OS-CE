import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { localProgress } from '../services/localProgress';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  questionsAnswered: number;
  accuracy: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardScreen() {
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'weekly' | 'allTime'>('weekly');

  // Get current user's progress
  const userProgress = localProgress.getProgress();
  const userScore = userProgress.totalScore;
  const userAccuracy =
    userProgress.totalQuestions > 0
      ? Math.round((userProgress.correctAnswers / userProgress.totalQuestions) * 100)
      : 0;

  // Mock leaderboard data - in production, this would come from a backend
  const mockLeaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: 'DevMaster', score: 15420, questionsAnswered: 342, accuracy: 95 },
    { rank: 2, name: 'CodeNinja', score: 14850, questionsAnswered: 330, accuracy: 93 },
    { rank: 3, name: 'TechGuru', score: 13200, questionsAnswered: 301, accuracy: 91 },
    {
      rank: 4,
      name: 'You',
      score: userScore,
      questionsAnswered: userProgress.totalQuestions,
      accuracy: userAccuracy,
      isCurrentUser: true,
    },
    { rank: 5, name: 'ReactRanger', score: 11800, questionsAnswered: 278, accuracy: 88 },
    { rank: 6, name: 'JSWizard', score: 10500, questionsAnswered: 250, accuracy: 86 },
    { rank: 7, name: 'NodeNinja', score: 9800, questionsAnswered: 230, accuracy: 85 },
    { rank: 8, name: 'TypeScriptPro', score: 9200, questionsAnswered: 215, accuracy: 84 },
    { rank: 9, name: 'FullStackHero', score: 8600, questionsAnswered: 198, accuracy: 82 },
    { rank: 10, name: 'CloudExpert', score: 8000, questionsAnswered: 185, accuracy: 80 },
  ];

  // Sort by score and update ranks
  const sortedData = [...mockLeaderboardData].sort((a, b) => b.score - a.score);
  sortedData.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  const renderLeaderboardEntry = (entry: LeaderboardEntry) => (
    <View
      key={entry.rank}
      style={[
        styles.leaderboardEntry,
        entry.isCurrentUser && styles.currentUserEntry,
        entry.rank <= 3 && styles.topThreeEntry,
      ]}
    >
      <View style={styles.rankContainer}>
        <Text
          style={[
            styles.rank,
            entry.rank <= 3 && styles.topThreeRank,
            entry.isCurrentUser && styles.currentUserRank,
          ]}
        >
          {entry.rank}
        </Text>
        {entry.rank === 1 && <Text style={styles.medal}>🥇</Text>}
        {entry.rank === 2 && <Text style={styles.medal}>🥈</Text>}
        {entry.rank === 3 && <Text style={styles.medal}>🥉</Text>}
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.userName, entry.isCurrentUser && styles.currentUserName]}>
          {entry.name}
        </Text>
        <Text style={styles.userStats}>
          {entry.questionsAnswered} questions • {entry.accuracy}% accuracy
        </Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={[styles.score, entry.isCurrentUser && styles.currentUserScore]}>
          {entry.score.toLocaleString()}
        </Text>
        <Text style={styles.scoreLabel}>points</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'allTime' && styles.activeTab]}
          onPress={() => setActiveTab('allTime')}
        >
          <Text style={[styles.tabText, activeTab === 'allTime' && styles.activeTabText]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Your Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Position</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              #{sortedData.find((e) => e.isCurrentUser)?.rank || '-'}
            </Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userAccuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </View>

      {/* Leaderboard List */}
      <ScrollView style={styles.leaderboardContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#0969da" style={styles.loader} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            {sortedData.map(renderLeaderboardEntry)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#0969da',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0969da',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  currentUserEntry: {
    backgroundColor: '#e3f2ff',
    borderWidth: 2,
    borderColor: '#0969da',
  },
  topThreeEntry: {
    backgroundColor: '#fffef5',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    position: 'relative',
  },
  rank: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  topThreeRank: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f59e0b',
  },
  currentUserRank: {
    color: '#0969da',
  },
  medal: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  currentUserName: {
    color: '#0969da',
    fontWeight: '600',
  },
  userStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  currentUserScore: {
    color: '#0969da',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  loader: {
    marginTop: 50,
  },
});

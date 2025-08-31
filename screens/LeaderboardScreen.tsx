import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLeaderboardStore, LeaderboardUser } from '../store/leaderboardStore';
import { useSubscriptionStore } from '../services/subscriptionServiceMock';
import { notificationService } from '../services/notificationService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

type LeaderboardTab = 'global' | 'weekly' | 'friends';

export default function LeaderboardScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [refreshing, setRefreshing] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState<{ userId: string; message: string } | null>(null);

  const {
    globalLeaderboard,
    weeklyLeaderboard,
    friendsLeaderboard,
    nearbyCompetitors,
    userRank,
    updateLeaderboards,
    generateFakeActivity,
    getFakeProgressUpdate,
  } = useLeaderboardStore();

  const { isPremium } = useSubscriptionStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial load
    updateLeaderboards();

    // Simulate live updates every 5 seconds
    const liveInterval = setInterval(() => {
      const update = getFakeProgressUpdate();
      showLiveUpdate(update.user.name, update.action);
      generateFakeActivity();
    }, 5000);

    // Pulse animation for user's position
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

    return () => clearInterval(liveInterval);
  }, []);

  const showLiveUpdate = (userName: string, action: string) => {
    setLiveUpdate({ userId: userName, message: `${userName} ${action}` });

    // Slide in animation
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setLiveUpdate(null));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    updateLeaderboards();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getLeaderboardData = () => {
    switch (activeTab) {
      case 'weekly':
        return weeklyLeaderboard;
      case 'friends':
        return friendsLeaderboard;
      default:
        return globalLeaderboard;
    }
  };

  const renderUserRow = (user: LeaderboardUser, index: number) => {
    const isCurrentUser = user.id === 'real_user';
    const rankChange = user.rank - user.previousRank;
    const isRising = rankChange < 0;
    const isFalling = rankChange > 0;

    return (
      <Animated.View
        key={user.id}
        style={[
          styles.userRow,
          isCurrentUser && {
            transform: [{ scale: pulseAnim }],
            borderColor: '#f59e0b',
            borderWidth: 2,
            backgroundColor: '#fef3c7',
          },
        ]}
      >
        {/* Rank */}
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, user.rank <= 3 && styles.topRank]}>{user.rank}</Text>
          {rankChange !== 0 && (
            <View style={styles.rankChange}>
              <Text
                style={[
                  styles.rankChangeText,
                  isRising && styles.rankUp,
                  isFalling && styles.rankDown,
                ]}
              >
                {isRising ? `↑${Math.abs(rankChange)}` : isFalling ? `↓${rankChange}` : '-'}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.avatar}>{user.avatar}</Text>
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
                  {user.name}
                </Text>
                {user.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                )}
                {user.isOnline && <View style={styles.onlineIndicator} />}
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.country}>{user.country}</Text>
                <Text style={styles.streak}>🔥 {user.streak}</Text>
                <Text style={styles.level}>Lvl {user.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* XP */}
        <View style={styles.xpContainer}>
          <Text style={styles.xpValue}>{user.xp.toLocaleString()}</Text>
          <Text style={styles.xpLabel}>XP</Text>
          {activeTab === 'weekly' && <Text style={styles.weeklyGain}>+{user.weeklyXp}</Text>}
        </View>
      </Animated.View>
    );
  };

  const renderNearbySection = () => {
    if (!nearbyCompetitors || nearbyCompetitors.length === 0) return null;

    return (
      <View style={styles.nearbySection}>
        <Text style={styles.nearbySectionTitle}>⚔️ Your Competition</Text>
        <Text style={styles.nearbySectionSubtitle}>Players close to your rank</Text>
        {nearbyCompetitors.map((user, index) => renderUserRow(user, index))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Live Update Banner */}
      {liveUpdate && (
        <Animated.View
          style={[styles.liveUpdateBanner, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.liveUpdateText}>{liveUpdate.message}</Text>
        </Animated.View>
      )}

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {(['global', 'weekly', 'friends'] as LeaderboardTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'global' ? '🌍 Global' : tab === 'weekly' ? '📅 Weekly' : '👥 Friends'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Your Position Card */}
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.positionCard}>
        <Text style={styles.positionTitle}>Your Rank</Text>
        <Text style={styles.positionRank}>#{userRank}</Text>
        <Text style={styles.positionSubtitle}>
          {userRank > 100
            ? 'Keep climbing! 💪'
            : userRank > 50
              ? 'Great progress! 🎯'
              : 'Amazing! 🏆'}
        </Text>
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => navigation.navigate('Paywall', { source: 'leaderboard' })}
          >
            <Text style={styles.premiumButtonText}>💎 Get Premium to climb faster!</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.leaderboardContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top 3 Podium */}
        {activeTab === 'global' && (
          <View style={styles.podium}>
            {getLeaderboardData()
              .slice(0, 3)
              .map((user, index) => (
                <View
                  key={user.id}
                  style={[styles.podiumItem, { order: index === 0 ? 2 : index === 1 ? 1 : 3 }]}
                >
                  <Text style={styles.podiumEmoji}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </Text>
                  <Text style={styles.podiumAvatar}>{user.avatar}</Text>
                  <Text style={styles.podiumName}>{user.name}</Text>
                  <Text style={styles.podiumXp}>{user.xp.toLocaleString()}</Text>
                  {user.isPremium && <Text style={styles.podiumPremium}>PRO</Text>}
                </View>
              ))}
          </View>
        )}

        {/* Main Leaderboard */}
        <View style={styles.listContainer}>
          {activeTab === 'global'
            ? renderNearbySection()
            : getLeaderboardData().map((user, index) => renderUserRow(user, index))}
        </View>

        {/* Bottom CTA */}
        {!isPremium && (
          <View style={styles.bottomCTA}>
            <Text style={styles.ctaTitle}>🚀 Climb Faster with Premium!</Text>
            <Text style={styles.ctaSubtitle}>
              • 2x XP on all quizzes • Unlimited hearts • Exclusive challenges
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Paywall', { source: 'leaderboard_bottom' })}
            >
              <Text style={styles.ctaButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  liveUpdateBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveUpdateText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  positionCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  positionTitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  positionRank: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  positionSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  premiumButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    flex: 1,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumAvatar: {
    fontSize: 40,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  podiumXp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  podiumPremium: {
    fontSize: 10,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    fontWeight: 'bold',
  },
  nearbySection: {
    marginBottom: 20,
  },
  nearbySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  nearbySectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 100,
  },
  userRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  topRank: {
    color: '#f59e0b',
  },
  rankChange: {
    marginTop: 2,
  },
  rankChangeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  rankUp: {
    color: '#10b981',
  },
  rankDown: {
    color: '#ef4444',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 32,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  currentUserName: {
    color: '#f59e0b',
  },
  premiumBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  country: {
    fontSize: 12,
    marginRight: 8,
  },
  streak: {
    fontSize: 12,
    color: '#f59e0b',
    marginRight: 8,
  },
  level: {
    fontSize: 12,
    color: '#6b7280',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xpValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  xpLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  weeklyGain: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  bottomCTA: {
    backgroundColor: '#8b5cf6',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: '#e9d5ff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

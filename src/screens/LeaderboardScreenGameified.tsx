// src/screens/LeaderboardScreenGameified.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface LeaderboardPlayer {
  id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  avatar: string;
  rank: number;
  weeklyXP: number;
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardPlayer[] = [
  {
    id: '1',
    name: 'CodeMaster',
    level: 15,
    xp: 12450,
    streak: 28,
    avatar: '👑',
    rank: 1,
    weeklyXP: 2100,
  },
  {
    id: '2',
    name: 'ReactNinja',
    level: 12,
    xp: 9800,
    streak: 15,
    avatar: '🥷',
    rank: 2,
    weeklyXP: 1850,
  },
  {
    id: '3',
    name: 'JSWizard',
    level: 11,
    xp: 8900,
    streak: 22,
    avatar: '🧙‍♂️',
    rank: 3,
    weeklyXP: 1650,
  },
  {
    id: '4',
    name: 'TypeScriptPro',
    level: 10,
    xp: 7500,
    streak: 12,
    avatar: '🛡️',
    rank: 4,
    weeklyXP: 1400,
  },
  {
    id: '5',
    name: 'PythonGuru',
    level: 9,
    xp: 6800,
    streak: 8,
    avatar: '🐍',
    rank: 5,
    weeklyXP: 1200,
  },
  {
    id: '6',
    name: 'CSSArtist',
    level: 8,
    xp: 5900,
    streak: 18,
    avatar: '🎨',
    rank: 6,
    weeklyXP: 1100,
  },
  {
    id: '7',
    name: 'NodeHero',
    level: 7,
    xp: 5200,
    streak: 5,
    avatar: '🚀',
    rank: 7,
    weeklyXP: 950,
  },
  {
    id: '8',
    name: 'DevMentor',
    level: 6,
    xp: 4500,
    streak: 3,
    avatar: '👨‍💻',
    rank: 8,
    weeklyXP: 800,
  },
];

const FloatingTrophies: React.FC = () => {
  const trophies = useRef([
    ...Array(8)
      .fill(0)
      .map((_, i) => ({
        id: `trophy-${i}`,
        emoji: ['🏆', '🥇', '🥈', '🥉', '🎖️', '⭐', '💎', '👑'][i],
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(0.5 + Math.random() * 0.3),
        rotate: new Animated.Value(0),
      })),
  ]).current;

  useEffect(() => {
    trophies.forEach((trophy, index) => {
      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophy.y, {
            toValue: Math.random() * height,
            duration: 10000 + index * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(trophy.y, {
            toValue: Math.random() * height,
            duration: 10000 + index * 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Rotation
      Animated.loop(
        Animated.timing(trophy.rotate, {
          toValue: 1,
          duration: 5000 + index * 500,
          useNativeDriver: true,
        }),
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {trophies.map((trophy, index) => {
        const rotation = trophy.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={trophy.id}
            style={[
              styles.floatingTrophy,
              {
                transform: [
                  { translateX: trophy.x },
                  { translateY: trophy.y },
                  { scale: trophy.scale },
                  { rotate: rotation },
                ],
              },
            ]}
          >
            <Text style={styles.trophyEmoji}>{trophy.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const LeaderboardCard: React.FC<{
  player: LeaderboardPlayer;
  index: number;
  isCurrentUser?: boolean;
}> = ({ player, index, isCurrentUser = false }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation for top 3
    if (player.rank <= 3) {
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
    }
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return ['#FFD700', '#FFA500']; // Gold
      case 2:
        return ['#C0C0C0', '#A8A8A8']; // Silver
      case 3:
        return ['#CD7F32', '#B8860B']; // Bronze
      default:
        return ['#667eea', '#764ba2']; // Default
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.leaderboardCard,
        isCurrentUser && styles.currentUserCard,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Glow effect for top 3 */}
      {player.rank <= 3 && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.cardGlow, { opacity: glowOpacity }]}>
          <LinearGradient
            colors={[getRankColor(player.rank)[0] + '40', getRankColor(player.rank)[1] + '40']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <LinearGradient colors={getRankColor(player.rank)} style={styles.cardGradient}>
        <View style={styles.cardContent}>
          {/* Rank */}
          <View style={styles.rankSection}>
            <Text style={styles.rankEmoji}>
              {typeof getRankEmoji(player.rank) === 'string' &&
              getRankEmoji(player.rank).startsWith('#')
                ? getRankEmoji(player.rank)
                : getRankEmoji(player.rank)}
            </Text>
            {player.rank <= 3 && (
              <View style={styles.crownContainer}>
                <Text style={styles.crown}>✨</Text>
              </View>
            )}
          </View>

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerAvatar}>{player.avatar}</Text>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.playerStats}>
                  <Text style={styles.playerLevel}>Level {player.level}</Text>
                  <Text style={styles.playerStreak}>🔥 {player.streak}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* XP Info */}
          <View style={styles.xpSection}>
            <Text style={styles.totalXP}>{player.xp.toLocaleString()}</Text>
            <Text style={styles.xpLabel}>Total XP</Text>
            <Text style={styles.weeklyXP}>+{player.weeklyXP} this week</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function LeaderboardScreenGameified() {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState<'global' | 'friends' | 'weekly'>('global');
  const [currentUserRank] = useState(42); // Mock current user rank

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <FloatingTrophies />

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <LinearGradient
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitle}>
              <Text style={styles.title}>🏆 LEADERBOARD</Text>
              <Text style={styles.subtitle}>Battle for the crown!</Text>
            </View>

            <View style={styles.userRank}>
              <Text style={styles.userRankText}>#{currentUserRank}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        {[
          { id: 'global', label: '🌍 Global', icon: '🌍' },
          { id: 'friends', label: '👥 Friends', icon: '👥' },
          { id: 'weekly', label: '📅 Weekly', icon: '📅' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, selectedTab === tab.id && styles.activeTabLabel]}>
              {tab.label.split(' ')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.leaderboardContent}>
          {/* Top 3 Podium */}
          <View style={styles.podium}>
            <Text style={styles.podiumTitle}>🏆 HALL OF FAME 🏆</Text>
            <View style={styles.podiumPlayers}>
              {/* 2nd Place */}
              <View style={styles.podiumPosition}>
                <View style={[styles.podiumStep, styles.secondPlace]}>
                  <Text style={styles.podiumAvatar}>{mockLeaderboard[1].avatar}</Text>
                  <Text style={styles.podiumName}>{mockLeaderboard[1].name}</Text>
                  <Text style={styles.podiumXP}>{mockLeaderboard[1].xp.toLocaleString()}</Text>
                </View>
                <Text style={styles.podiumRank}>🥈</Text>
              </View>

              {/* 1st Place */}
              <View style={styles.podiumPosition}>
                <View style={[styles.podiumStep, styles.firstPlace]}>
                  <Text style={styles.podiumAvatar}>{mockLeaderboard[0].avatar}</Text>
                  <Text style={styles.podiumName}>{mockLeaderboard[0].name}</Text>
                  <Text style={styles.podiumXP}>{mockLeaderboard[0].xp.toLocaleString()}</Text>
                </View>
                <Text style={styles.podiumRank}>👑</Text>
              </View>

              {/* 3rd Place */}
              <View style={styles.podiumPosition}>
                <View style={[styles.podiumStep, styles.thirdPlace]}>
                  <Text style={styles.podiumAvatar}>{mockLeaderboard[2].avatar}</Text>
                  <Text style={styles.podiumName}>{mockLeaderboard[2].name}</Text>
                  <Text style={styles.podiumXP}>{mockLeaderboard[2].xp.toLocaleString()}</Text>
                </View>
                <Text style={styles.podiumRank}>🥉</Text>
              </View>
            </View>
          </View>

          {/* Rest of leaderboard */}
          <View style={styles.leaderboardList}>
            {mockLeaderboard.slice(3).map((player, index) => (
              <LeaderboardCard
                key={player.id}
                player={player}
                index={index + 3}
                isCurrentUser={player.name === 'DevMentor'}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    margin: 16,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  userRank: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  userRankText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  leaderboardContent: {
    padding: 16,
  },
  podium: {
    marginBottom: 30,
  },
  podiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  podiumPlayers: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 10,
  },
  podiumPosition: {
    alignItems: 'center',
  },
  podiumStep: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    minWidth: 100,
    marginBottom: 10,
  },
  firstPlace: {
    backgroundColor: '#FFD700',
    height: 120,
    justifyContent: 'center',
  },
  secondPlace: {
    backgroundColor: '#C0C0C0',
    height: 100,
    justifyContent: 'center',
  },
  thirdPlace: {
    backgroundColor: '#CD7F32',
    height: 80,
    justifyContent: 'center',
  },
  podiumAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  podiumXP: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  podiumRank: {
    fontSize: 24,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  currentUserCard: {
    elevation: 12,
    shadowOpacity: 0.5,
  },
  cardGlow: {
    borderRadius: 20,
  },
  cardGradient: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankSection: {
    width: 60,
    alignItems: 'center',
    position: 'relative',
  },
  rankEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  crownContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  crown: {
    fontSize: 16,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playerStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  playerLevel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  playerStreak: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  xpSection: {
    alignItems: 'flex-end',
  },
  totalXP: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  xpLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  weeklyXP: {
    fontSize: 11,
    color: '#4ade80',
    fontWeight: '600',
    marginTop: 2,
  },
  floatingTrophy: {
    position: 'absolute',
  },
  trophyEmoji: {
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

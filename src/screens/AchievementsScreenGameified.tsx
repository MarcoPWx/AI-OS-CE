// src/screens/AchievementsScreenGameified.tsx
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

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'streak' | 'xp' | 'quiz' | 'special';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Mock achievements data
const mockAchievements: Achievement[] = [
  {
    id: 'first-quiz',
    title: 'First Steps',
    description: 'Complete your first quiz',
    emoji: '🎯',
    category: 'quiz',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    xpReward: 50,
    rarity: 'common',
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    emoji: '🔥',
    category: 'streak',
    unlocked: true,
    progress: 7,
    maxProgress: 7,
    xpReward: 200,
    rarity: 'rare',
    unlockedAt: new Date('2024-01-22'),
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Get 100% on a quiz',
    emoji: '💯',
    category: 'quiz',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    xpReward: 150,
    rarity: 'rare',
    unlockedAt: new Date('2024-01-18'),
  },
  {
    id: 'xp-1000',
    title: 'XP Collector',
    description: 'Earn 1,000 total XP',
    emoji: '⭐',
    category: 'xp',
    unlocked: true,
    progress: 1000,
    maxProgress: 1000,
    xpReward: 100,
    rarity: 'common',
    unlockedAt: new Date('2024-01-20'),
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Answer 10 questions in under 30 seconds',
    emoji: '⚡',
    category: 'special',
    unlocked: false,
    progress: 7,
    maxProgress: 10,
    xpReward: 300,
    rarity: 'epic',
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a quiz after midnight',
    emoji: '🦉',
    category: 'special',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpReward: 100,
    rarity: 'rare',
  },
  {
    id: 'combo-master',
    title: 'Combo Master',
    description: 'Get a 20x combo multiplier',
    emoji: '🎮',
    category: 'quiz',
    unlocked: false,
    progress: 15,
    maxProgress: 20,
    xpReward: 500,
    rarity: 'epic',
  },
  {
    id: 'legendary-coder',
    title: 'Legendary Coder',
    description: 'Reach level 50',
    emoji: '👑',
    category: 'xp',
    unlocked: false,
    progress: 12,
    maxProgress: 50,
    xpReward: 1000,
    rarity: 'legendary',
  },
];

const FloatingBadges: React.FC = () => {
  const badges = useRef([
    ...Array(10)
      .fill(0)
      .map((_, i) => ({
        id: `badge-${i}`,
        emoji: ['🏆', '🎖️', '🥇', '⭐', '💎', '🔥', '⚡', '🎯', '💯', '👑'][i],
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(0.3 + Math.random() * 0.4),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0.6 + Math.random() * 0.4),
      })),
  ]).current;

  useEffect(() => {
    badges.forEach((badge, index) => {
      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(badge.y, {
            toValue: Math.random() * height,
            duration: 12000 + index * 800,
            useNativeDriver: true,
          }),
          Animated.timing(badge.y, {
            toValue: Math.random() * height,
            duration: 12000 + index * 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Rotation
      Animated.loop(
        Animated.timing(badge.rotate, {
          toValue: 1,
          duration: 6000 + index * 400,
          useNativeDriver: true,
        }),
      ).start();

      // Scale pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(badge.scale, {
            toValue: 0.5 + Math.random() * 0.3,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(badge.scale, {
            toValue: 0.3 + Math.random() * 0.4,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {badges.map((badge, index) => {
        const rotation = badge.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={badge.id}
            style={[
              styles.floatingBadge,
              {
                transform: [
                  { translateX: badge.x },
                  { translateY: badge.y },
                  { scale: badge.scale },
                  { rotate: rotation },
                ],
                opacity: badge.opacity,
              },
            ]}
          >
            <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const AchievementCard: React.FC<{
  achievement: Achievement;
  index: number;
}> = ({ achievement, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: achievement.progress / achievement.maxProgress,
      duration: 1000,
      delay: index * 150 + 500,
      useNativeDriver: false,
    }).start();

    // Glow animation for unlocked achievements
    if (achievement.unlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, []);

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return ['#FFD700', '#FFA500', '#FF8C00'];
      case 'epic':
        return ['#9B59B6', '#8E44AD', '#7D3C98'];
      case 'rare':
        return ['#3498DB', '#2980B9', '#1F618D'];
      default:
        return ['#95A5A6', '#7F8C8D', '#5D6D7E'];
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '👑 LEGENDARY';
      case 'epic':
        return '💜 EPIC';
      case 'rare':
        return '💙 RARE';
      default:
        return '⚪ COMMON';
    }
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.6],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        !achievement.unlocked && styles.lockedCard,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Glow effect for unlocked */}
      {achievement.unlocked && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.cardGlow, { opacity: glowOpacity }]}>
          <LinearGradient
            colors={[
              getRarityColors(achievement.rarity)[0] + '40',
              getRarityColors(achievement.rarity)[1] + '40',
            ]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}

      <LinearGradient
        colors={achievement.unlocked ? getRarityColors(achievement.rarity) : ['#2C3E50', '#34495E']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          {/* Achievement Icon */}
          <View style={styles.iconSection}>
            <View style={[styles.iconContainer, !achievement.unlocked && styles.lockedIcon]}>
              <Text style={[styles.achievementEmoji, !achievement.unlocked && styles.lockedEmoji]}>
                {achievement.unlocked ? achievement.emoji : '🔒'}
              </Text>
            </View>

            {achievement.unlocked && (
              <View style={styles.unlockedBadge}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </View>

          {/* Achievement Info */}
          <View style={styles.achievementInfo}>
            <View style={styles.achievementHeader}>
              <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
                {achievement.title}
              </Text>
              <Text style={styles.rarityLabel}>{getRarityLabel(achievement.rarity)}</Text>
            </View>

            <Text
              style={[styles.achievementDescription, !achievement.unlocked && styles.lockedText]}
            >
              {achievement.description}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth,
                      backgroundColor: achievement.unlocked ? '#4ade80' : 'rgba(255,255,255,0.3)',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, !achievement.unlocked && styles.lockedText]}>
                {achievement.progress}/{achievement.maxProgress}
              </Text>
            </View>

            {/* Reward */}
            <View style={styles.rewardSection}>
              <Text style={styles.xpReward}>+{achievement.xpReward} XP</Text>
              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.unlockedDate}>
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default function AchievementsScreenGameified() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'streak' | 'xp' | 'quiz' | 'special'
  >('all');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Stats animation
    Animated.timing(statsAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredAchievements =
    selectedCategory === 'all'
      ? mockAchievements
      : mockAchievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = mockAchievements.filter((a) => a.unlocked).length;
  const totalXP = mockAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const statsTranslateY = statsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <FloatingBadges />

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <LinearGradient
          colors={['#9B59B6', '#8E44AD', '#7D3C98']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitle}>
              <Text style={styles.title}>🏆 ACHIEVEMENTS</Text>
              <Text style={styles.subtitle}>Unlock your potential!</Text>
            </View>

            <View style={styles.headerStats}>
              <Text style={styles.headerStatsText}>
                {unlockedCount}/{mockAchievements.length}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Stats Section */}
      <Animated.View
        style={[styles.statsSection, { transform: [{ translateY: statsTranslateY }] }]}
      >
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#4ade80', '#22c55e']} style={styles.statGradient}>
              <Text style={styles.statValue}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.statGradient}>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Bonus XP</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.statGradient}>
              <Text style={styles.statValue}>
                {Math.round((unlockedCount / mockAchievements.length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </LinearGradient>
          </View>
        </View>
      </Animated.View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        {[
          { id: 'all', label: '🌟 All', icon: '🌟' },
          { id: 'streak', label: '🔥 Streak', icon: '🔥' },
          { id: 'xp', label: '⭐ XP', icon: '⭐' },
          { id: 'quiz', label: '🎯 Quiz', icon: '🎯' },
          { id: 'special', label: '✨ Special', icon: '✨' },
        ].map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.activeCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.id as any)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.activeCategoryLabel,
              ]}
            >
              {category.label.split(' ')[1]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Achievements List */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.achievementsList}>
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={index} />
          ))}
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
    shadowColor: '#9B59B6',
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
  headerStats: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerStatsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsSection: {
    margin: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '600',
  },
  categoryFilter: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryLabel: {
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  achievementsList: {
    gap: 16,
  },
  achievementCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardGlow: {
    borderRadius: 20,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconSection: {
    marginRight: 16,
    position: 'relative',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  achievementEmoji: {
    fontSize: 28,
  },
  lockedEmoji: {
    fontSize: 24,
    opacity: 0.5,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lockedText: {
    color: 'rgba(255,255,255,0.5)',
  },
  rarityLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpReward: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  unlockedDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  floatingBadge: {
    position: 'absolute',
  },
  badgeEmoji: {
    fontSize: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

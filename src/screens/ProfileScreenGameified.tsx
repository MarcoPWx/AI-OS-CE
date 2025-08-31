// src/screens/ProfileScreenGameified.tsx
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

// Mock user stats
const mockUserStats = {
  totalQuizzes: 47,
  correctAnswers: 312,
  totalAnswers: 398,
  averageScore: 78.4,
  bestStreak: 28,
  currentStreak: 15,
  totalStudyTime: 1247, // minutes
  favoriteCategory: 'JavaScript',
  weeklyGoal: 5,
  weeklyProgress: 3,
  achievements: 12,
  totalAchievements: 25,
  rank: 42,
  joinedDate: new Date('2024-01-10'),
};

const FloatingStats: React.FC = () => {
  const stats = useRef([
    ...Array(12)
      .fill(0)
      .map((_, i) => ({
        id: `stat-${i}`,
        emoji: ['📊', '🎯', '⚡', '🔥', '💯', '🏆', '⭐', '📈', '🎮', '💎', '🚀', '👑'][i],
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(0.4 + Math.random() * 0.3),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0.3 + Math.random() * 0.4),
      })),
  ]).current;

  useEffect(() => {
    stats.forEach((stat, index) => {
      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(stat.y, {
            toValue: Math.random() * height,
            duration: 15000 + index * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(stat.y, {
            toValue: Math.random() * height,
            duration: 15000 + index * 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Rotation
      Animated.loop(
        Animated.timing(stat.rotate, {
          toValue: 1,
          duration: 8000 + index * 500,
          useNativeDriver: true,
        }),
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stats.map((stat, index) => {
        const rotation = stat.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={stat.id}
            style={[
              styles.floatingStat,
              {
                transform: [
                  { translateX: stat.x },
                  { translateY: stat.y },
                  { scale: stat.scale },
                  { rotate: rotation },
                ],
                opacity: stat.opacity,
              },
            ]}
          >
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  gradient: string[];
  index: number;
}> = ({ title, value, subtitle, icon, gradient, index }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000 + index * 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000 + index * 200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <LinearGradient colors={gradient} style={styles.statGradient}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Animated.View>
  );
};

const ProgressRing: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  children?: React.ReactNode;
}> = ({ progress, size, strokeWidth, color, children }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef<any>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Animated.circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [circumference, 0],
          })}
          strokeLinecap="round"
        />
      </svg>
      <View style={styles.progressRingContent}>{children}</View>
    </View>
  );
};

export default function ProfileScreenGameified() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const profileAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header animation
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Profile animation
    Animated.timing(profileAnim, {
      toValue: 1,
      duration: 1000,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.signOut();
          } catch {}
        },
      },
    ]);
  };

  const accuracy = Math.round((mockUserStats.correctAnswers / mockUserStats.totalAnswers) * 100);
  const weeklyProgress = mockUserStats.weeklyProgress / mockUserStats.weeklyGoal;
  const achievementProgress = mockUserStats.achievements / mockUserStats.totalAchievements;

  const headerScale = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const profileTranslateY = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <FloatingStats />

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitle}>
              <Text style={styles.title}>👤 PROFILE</Text>
              <Text style={styles.subtitle}>Your coding journey</Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettings(!showSettings)}
            >
              <MaterialCommunityIcons name="cog" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Profile Section */}
        <Animated.View
          style={[styles.profileSection, { transform: [{ translateY: profileTranslateY }] }]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.profileCard}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>
                    {(auth.user?.name || auth.user?.email || 'P').charAt(0)}
                  </Text>
                </LinearGradient>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Lv. 12</Text>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {auth.user?.name || auth.user?.email || 'Player'}
                </Text>
                <Text style={styles.userEmail}>{auth.user?.email || 'player@example.com'}</Text>
                <View style={styles.userStats}>
                  <Text style={styles.userRank}>Rank #{mockUserStats.rank}</Text>
                  <Text style={styles.joinDate}>
                    Joined {mockUserStats.joinedDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Rings */}
            <View style={styles.progressSection}>
              <View style={styles.progressItem}>
                <ProgressRing progress={accuracy / 100} size={80} strokeWidth={6} color="#4ade80">
                  <Text style={styles.progressValue}>{accuracy}%</Text>
                  <Text style={styles.progressLabel}>Accuracy</Text>
                </ProgressRing>
              </View>

              <View style={styles.progressItem}>
                <ProgressRing progress={weeklyProgress} size={80} strokeWidth={6} color="#f59e0b">
                  <Text style={styles.progressValue}>{mockUserStats.weeklyProgress}</Text>
                  <Text style={styles.progressLabel}>Weekly</Text>
                </ProgressRing>
              </View>

              <View style={styles.progressItem}>
                <ProgressRing
                  progress={achievementProgress}
                  size={80}
                  strokeWidth={6}
                  color="#8b5cf6"
                >
                  <Text style={styles.progressValue}>{mockUserStats.achievements}</Text>
                  <Text style={styles.progressLabel}>Badges</Text>
                </ProgressRing>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Quizzes"
            value={mockUserStats.totalQuizzes}
            icon="🎯"
            gradient={['#3b82f6', '#1d4ed8']}
            index={0}
          />
          <StatCard
            title="Best Streak"
            value={mockUserStats.bestStreak}
            subtitle="days"
            icon="🔥"
            gradient={['#ef4444', '#dc2626']}
            index={1}
          />
          <StatCard
            title="Study Time"
            value={`${Math.floor(mockUserStats.totalStudyTime / 60)}h`}
            subtitle={`${mockUserStats.totalStudyTime % 60}m`}
            icon="⏱️"
            gradient={['#10b981', '#059669']}
            index={2}
          />
          <StatCard
            title="Avg Score"
            value={`${mockUserStats.averageScore}%`}
            icon="📊"
            gradient={['#8b5cf6', '#7c3aed']}
            index={3}
          />
          <StatCard
            title="Favorite"
            value={mockUserStats.favoriteCategory}
            icon="⭐"
            gradient={['#f59e0b', '#d97706']}
            index={4}
          />
          <StatCard
            title="Achievements"
            value={`${mockUserStats.achievements}/${mockUserStats.totalAchievements}`}
            icon="🏆"
            gradient={['#ec4899', '#db2777']}
            index={5}
          />
        </View>

        {/* Settings Panel */}
        {showSettings && (
          <Animated.View style={styles.settingsPanel}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.settingsCard}
            >
              <Text style={styles.settingsTitle}>⚙️ Settings</Text>

              <TouchableOpacity style={styles.settingItem}>
                <MaterialCommunityIcons name="bell" size={24} color="#fff" />
                <Text style={styles.settingText}>Notifications</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <MaterialCommunityIcons name="palette" size={24} color="#fff" />
                <Text style={styles.settingText}>Theme</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <MaterialCommunityIcons name="help-circle" size={24} color="#fff" />
                <Text style={styles.settingText}>Help & Support</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <MaterialCommunityIcons name="information" size={24} color="#fff" />
                <Text style={styles.settingText}>About</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}
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
    shadowColor: '#667eea',
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4ade80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  userRank: {
    fontSize: 12,
    color: '#fbbf24',
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressRing: {
    position: 'relative',
  },
  progressRingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
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
    minHeight: 100,
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  settingsPanel: {
    marginTop: 16,
  },
  settingsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  logoutText: {
    color: '#ef4444',
  },
  floatingStat: {
    position: 'absolute',
  },
  statEmoji: {
    fontSize: 18,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

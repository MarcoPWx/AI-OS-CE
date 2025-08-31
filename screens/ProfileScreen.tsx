import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import { supabase } from '../lib/supabase';
import { gamificationService } from '../services/gamification';
import {
  AnimatedNumber,
  AnimatedProgressBar,
  LevelBadge,
} from '../components/GamificationComponents';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  bio?: string;
  location?: string;
  github_username?: string;
}

interface UserStats {
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalQuizzes: number;
  totalCorrect: number;
  accuracy: number;
  achievements: number;
  rank: number;
  stars: number;
  questsCompleted: number;
  categoriesUnlocked: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        navigation.navigate('Login' as never);
        return;
      }

      // Load profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Create default profile if doesn't exist
      const userProfile = profileData || {
        id: user.id,
        email: user.email || '',
        username: user.email?.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
      };

      setProfile(userProfile);

      // Load user stats
      const userState = await gamificationService.getUserState(user.id);
      const achievements = await gamificationService.getAchievements(user.id);

      // Calculate stats
      const stats: UserStats = {
        totalXP: userState.xp,
        currentLevel: userState.level,
        currentStreak: userState.dailyStreak.current,
        longestStreak: userState.dailyStreak.longest,
        totalQuizzes: userState.quizHistory.length,
        totalCorrect: userState.quizHistory.filter((q) => q.score > 70).length,
        accuracy:
          userState.quizHistory.length > 0
            ? Math.round(
                (userState.quizHistory.filter((q) => q.score > 70).length /
                  userState.quizHistory.length) *
                  100,
              )
            : 0,
        achievements: achievements.filter((a) => a.unlockedAt).length,
        rank: userState.rank || 9999,
        stars: userState.stars,
        questsCompleted: userState.questsCompleted || 0,
        categoriesUnlocked: userState.unlockedCategories.length,
      };

      setStats(stats);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.navigate('Login' as never);
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implement GDPR-compliant account deletion
            Alert.alert('Info', 'Account deletion request submitted');
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadProfile} />}
        testID="profile-scroll-view"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            testID="back-button"
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings' as never)}
            style={styles.settingsButton}
            testID="settings-button"
          >
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  profile?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${profile?.username}&background=007AFF&color=fff`,
              }}
              style={styles.avatar}
              testID="profile-avatar"
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.username} testID="profile-username">
            {profile?.username}
          </Text>
          <Text style={styles.email} testID="profile-email">
            {profile?.email}
          </Text>

          {stats && (
            <View style={styles.levelContainer}>
              <LevelBadge level={stats.currentLevel} size="large" />
              <AnimatedProgressBar
                progress={(stats.totalXP % 1000) / 1000}
                color="#007AFF"
                style={styles.xpBar}
              />
              <Text style={styles.xpText}>
                {stats.totalXP % 1000} / 1000 XP to Level {stats.currentLevel + 1}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid} testID="stats-grid">
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <AnimatedNumber value={stats?.currentStreak || 0} style={styles.statValue} />
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color="#FFD93D" />
            <AnimatedNumber value={stats?.stars || 0} style={styles.statValue} />
            <Text style={styles.statLabel}>Stars</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#6BCF7F" />
            <AnimatedNumber value={stats?.achievements || 0} style={styles.statValue} />
            <Text style={styles.statLabel}>Achievements</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="podium" size={24} color="#A78BFA" />
            <Text style={styles.statValue}>#{stats?.rank || '—'}</Text>
            <Text style={styles.statLabel}>Global Rank</Text>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Performance</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Quizzes</Text>
            <Text style={styles.detailValue}>{stats?.totalQuizzes || 0}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Accuracy</Text>
            <Text style={styles.detailValue}>{stats?.accuracy || 0}%</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Categories Unlocked</Text>
            <Text style={styles.detailValue}>{stats?.categoriesUnlocked || 0} / 20</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quests Completed</Text>
            <Text style={styles.detailValue}>{stats?.questsCompleted || 0}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Longest Streak</Text>
            <Text style={styles.detailValue}>{stats?.longestStreak || 0} days</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Achievements' as never)}
            testID="view-achievements-button"
          >
            <Ionicons name="medal-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>View Achievements</Text>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard' as never)}
            testID="view-leaderboard-button"
          >
            <Ionicons name="podium-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Leaderboard</Text>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Export Data', 'Your data export has been requested')}
            testID="export-data-button"
          >
            <Ionicons name="download-outline" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Export My Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            testID="logout-button"
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            testID="delete-account-button"
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.memberSince}>
          Member since{' '}
          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  levelContainer: {
    alignItems: 'center',
    width: '80%',
  },
  xpBar: {
    marginVertical: 12,
  },
  xpText: {
    fontSize: 12,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statCard: {
    width: '50%',
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  dangerZone: {
    padding: 20,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  memberSince: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    paddingVertical: 20,
  },
});

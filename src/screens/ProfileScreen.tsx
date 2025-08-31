// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our services
import GamificationService from '../services/gamification';
import { XPBar, StreakCounter } from '../components/GamificationComponents';

// Supabase client
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  // Gamification stats
  level: number;
  xp: number;
  total_xp: number;
  streak: number;
  longest_streak: number;
  achievements: string[];
  badges: any[];
  total_quizzes: number;
  perfect_scores: number;
  rank?: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    loadGamificationStats();
  }, []);

  const loadProfile = async () => {
    try {
      // Get current user from Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        // Not authenticated, redirect to login
        navigation.navigate('Login' as never);
        return;
      }

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile load error:', profileError);
        // Create profile if doesn't exist
        await createProfile(user);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Load profile error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (user: any) => {
    try {
      const newProfile = {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.user_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        level: 1,
        xp: 0,
        total_xp: 0,
        streak: 0,
        longest_streak: 0,
        achievements: [],
        badges: [],
        total_quizzes: 0,
        perfect_scores: 0,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (!error) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Create profile error:', error);
    }
  };

  const loadGamificationStats = async () => {
    try {
      const stats = GamificationService.getUserStats();
      setStats(stats);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProfile(), loadGamificationStats()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            navigation.navigate('Login' as never);
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            // Show confirmation input
            Alert.prompt(
              'Confirm Deletion',
              'Type DELETE to confirm account deletion',
              async (text) => {
                if (text === 'DELETE') {
                  try {
                    // Call Supabase function to delete user data
                    const { error } = await supabase.rpc('delete_user_account');
                    if (!error) {
                      await supabase.auth.signOut();
                      navigation.navigate('Goodbye' as never);
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Failed to delete account');
                  }
                } else {
                  Alert.alert('Cancelled', 'Account deletion cancelled');
                }
              },
            );
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: profile.avatar_url || 'https://github.com/ghost.png' }}
              style={styles.avatar}
            />
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.email}>{profile.email}</Text>

            {/* Level and XP */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {stats?.level || 1}</Text>
              {profile.rank && <Text style={styles.rankText}>Rank #{profile.rank}</Text>}
            </View>
          </View>
        </LinearGradient>

        {/* XP Bar */}
        {stats && (
          <View style={styles.xpSection}>
            <XPBar
              currentXP={stats.xp % GamificationService.getXPForNextLevel(stats.level - 1)}
              levelXP={GamificationService.getXPForNextLevel(stats.level)}
              level={stats.level}
            />
          </View>
        )}

        {/* Streak */}
        {stats && (
          <View style={styles.streakSection}>
            <StreakCounter streak={stats.streak} showWarning={false} />
            <Text style={styles.streakRecord}>
              Longest Streak:{' '}
              {stats.streak > profile.longest_streak ? stats.streak : profile.longest_streak} days
            </Text>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.total_quizzes}</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.perfect_scores}</Text>
            <Text style={styles.statLabel}>Perfect</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.achievements?.length || 0}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.badges?.length || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Achievements' as never)}
          >
            <Ionicons name="trophy" size={24} color="#ffd700" />
            <Text style={styles.menuText}>Achievements</Text>
            <Ionicons name="chevron-forward" size={24} color="#8b949e" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Leaderboard' as never)}
          >
            <Ionicons name="podium" size={24} color="#58a6ff" />
            <Text style={styles.menuText}>Leaderboard</Text>
            <Ionicons name="chevron-forward" size={24} color="#8b949e" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings' as never)}
          >
            <Ionicons name="settings" size={24} color="#8b949e" />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={24} color="#8b949e" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Privacy' as never)}
          >
            <Ionicons name="shield-checkmark" size={24} color="#2ea043" />
            <Text style={styles.menuText}>Privacy & Data</Text>
            <Ionicons name="chevron-forward" size={24} color="#8b949e" />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  errorText: {
    color: '#f85149',
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#58a6ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  rankText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  xpSection: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  streakSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  streakRecord: {
    color: '#8b949e',
    fontSize: 14,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '50%',
    padding: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#58a6ff',
  },
  statLabel: {
    fontSize: 14,
    color: '#8b949e',
    marginTop: 4,
  },
  menu: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#c9d1d9',
    marginLeft: 16,
  },
  actions: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: '#30363d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: {
    color: '#f85149',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 16,
    alignItems: 'center',
  },
  deleteText: {
    color: '#f85149',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#8b949e',
    fontSize: 12,
  },
});

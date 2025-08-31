// src/screens/ProfileScreenNew.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import auth hook and services
import { useAuth } from '../contexts/AuthContext';
import GamificationService from '../services/gamification';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, [auth.user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const stats = await GamificationService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await auth.signOut();
            navigation.navigate('Login' as never);
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (!auth.user) {
    return (
      <View style={styles.container}>
        <Text style={styles.notAuthenticatedText}>Please sign in to view your profile</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const user = auth.user;
  const profile = {
    display_name: user?.name || user?.email?.split('@')[0],
    avatar_url: user?.avatar_url || null,
  } as any;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.displayName}>
              {profile?.display_name || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {/* Level & XP */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={styles.statTitle}>Level & XP</Text>
              </View>
              <Text style={styles.statValue}>Level {userStats?.level || 1}</Text>
              <Text style={styles.statSubtext}>{userStats?.xp || 0} XP</Text>
              <View style={styles.xpBar}>
                <View
                  style={[
                    styles.xpBarFill,
                    {
                      width: `${(userStats?.xp || 0) % 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Streak */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.fireEmoji}>🔥</Text>
                <Text style={styles.statTitle}>Streak</Text>
              </View>
              <Text style={styles.statValue}>{userStats?.streak || 0} days</Text>
              <Text style={styles.statSubtext}>Best: {userStats?.longestStreak || 0} days</Text>
            </View>

            {/* Quiz Stats */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="school" size={24} color="#4ECDC4" />
                <Text style={styles.statTitle}>Quizzes</Text>
              </View>
              <Text style={styles.statValue}>{userStats?.quizzesCompleted || 0}</Text>
              <Text style={styles.statSubtext}>{userStats?.averageAccuracy || 0}% accuracy</Text>
            </View>

            {/* Achievements */}
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="medal" size={24} color="#FF6B6B" />
                <Text style={styles.statTitle}>Achievements</Text>
              </View>
              <Text style={styles.statValue}>{userStats?.achievements?.length || 0}</Text>
              <Text style={styles.statSubtext}>unlocked</Text>
            </View>
          </View>

          {/* Recent Achievements */}
          {userStats?.achievements && userStats.achievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userStats.achievements.slice(-5).map((achievement: any, index: number) => (
                  <View key={index} style={styles.achievementCard}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <Text style={styles.settingText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="moon-outline" size={24} color="#fff" />
              <Text style={styles.settingText}>Dark Mode</Text>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="language-outline" size={24} color="#fff" />
              <Text style={styles.settingText}>Language</Text>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="help-circle-outline" size={24} color="#fff" />
              <Text style={styles.settingText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={auth.loading}
          >
            <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
            <Text style={styles.signOutText}>Sign Out</Text>
            {auth.loading && (
              <ActivityIndicator size="small" color="#ff6b6b" style={styles.buttonLoader} />
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#667eea',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  fireEmoji: {
    fontSize: 24,
  },
  xpBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  achievementsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  achievementCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 80,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  achievementXP: {
    color: '#FFD700',
    fontSize: 10,
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  signOutText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonLoader: {
    marginLeft: 12,
  },
});

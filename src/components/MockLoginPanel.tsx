// src/components/MockLoginPanel.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MockAuthService, { MockUser } from '../services/mockAuth';

interface MockLoginPanelProps {
  onClose: () => void;
}

export const MockLoginPanel: React.FC<MockLoginPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const mockUsers = MockAuthService.getMockUsers();

  const handleLogin = async (user: MockUser, index: number) => {
    setLoading(user.id);

    try {
      const { error } = await MockAuthService.quickLogin(index);

      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        Alert.alert('Mock Login Successful! 🎭', `Logged in as ${user.displayName}`, [
          { text: 'OK', onPress: onClose },
        ]);
      }
    } catch (error) {
      Alert.alert('Login Error', 'Failed to login');
    } finally {
      setLoading(null);
    }
  };

  const handleRandomLogin = async () => {
    setLoading('random');

    try {
      const { error } = await MockAuthService.loginAsRandom();

      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        const currentUser = MockAuthService.getCurrentUser();
        Alert.alert('Random Mock Login! 🎲', `Logged in as ${currentUser?.displayName}`, [
          { text: 'OK', onPress: onClose },
        ]);
      }
    } catch (error) {
      Alert.alert('Login Error', 'Failed to login');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>🎭 Mock Login</Text>
              <Text style={styles.headerSubtitle}>Development Mode</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Random Login Button */}
          <TouchableOpacity
            style={styles.randomButton}
            onPress={handleRandomLogin}
            disabled={loading === 'random'}
          >
            <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.randomGradient}>
              <Text style={styles.randomIcon}>🎲</Text>
              <View style={styles.randomText}>
                <Text style={styles.randomTitle}>Random Login</Text>
                <Text style={styles.randomSubtitle}>Login as a random user</Text>
              </View>
              {loading === 'random' && <Ionicons name="refresh" size={20} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          {/* User List */}
          <Text style={styles.sectionTitle}>Choose a User</Text>

          {mockUsers.map((user, index) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() => handleLogin(user, index)}
              disabled={loading === user.id}
            >
              <View style={styles.userInfo}>
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                <View style={styles.userDetails}>
                  <View style={styles.userHeader}>
                    <Text style={styles.displayName}>{user.displayName}</Text>
                    {user.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.premiumText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.username}>@{user.username}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                  <View style={styles.stats}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>Lv.{user.level}</Text>
                      <Text style={styles.statLabel}>Level</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{user.xp.toLocaleString()}</Text>
                      <Text style={styles.statLabel}>XP</Text>
                    </View>
                  </View>
                </View>
              </View>

              {loading === user.id ? (
                <Ionicons name="refresh" size={20} color="#667eea" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              )}
            </TouchableOpacity>
          ))}

          {/* Development Info */}
          <View style={styles.devInfo}>
            <Text style={styles.devTitle}>🛠️ Development Mode</Text>
            <Text style={styles.devText}>
              This mock login panel is only available in development mode. It allows you to quickly
              switch between different user accounts for testing purposes.
            </Text>
            <Text style={styles.devText}>• All users have different levels and XP</Text>
            <Text style={styles.devText}>• Some users have premium status</Text>
            <Text style={styles.devText}>• Perfect for testing multiplayer features</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  randomButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  randomGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  randomIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  randomText: {
    flex: 1,
  },
  randomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  randomSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 2,
  },
  username: {
    fontSize: 14,
    color: '#667eea',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    marginRight: 16,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  devInfo: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e6f3ff',
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  devText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 4,
  },
});

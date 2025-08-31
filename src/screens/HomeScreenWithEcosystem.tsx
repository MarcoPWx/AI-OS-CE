// src/screens/HomeScreenWithEcosystem.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { EcosystemWidget } from '../components/EcosystemWidget';
import { MockLoginPanel } from '../components/MockLoginPanel';
import MockAuthService from '../services/mockAuth';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'javascript', name: 'JavaScript', icon: '🟨', color: '#F7DF1E', questions: 150 },
  { id: 'react', name: 'React', icon: '⚛️', color: '#61DAFB', questions: 120 },
  { id: 'nodejs', name: 'Node.js', icon: '🟢', color: '#339933', questions: 90 },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', color: '#3178C6', questions: 80 },
  { id: 'python', name: 'Python', icon: '🐍', color: '#3776AB', questions: 110 },
  { id: 'css', name: 'CSS', icon: '🎨', color: '#1572B6', questions: 75 },
];

export default function HomeScreenWithEcosystem() {
  const navigation = useNavigation();
  const auth = useAuth();
  const [showMockLogin, setShowMockLogin] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCategoryPress = (category: any) => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      return;
    }
    navigation.navigate('Quiz' as never, { category: category.name } as never);
  };

  const handleMultiplayerPress = () => {
    if (!auth.isAuthenticated) {
      setShowMockLogin(true);
      return;
    }
    navigation.navigate('MultiplayerLobby' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>QuizMentor</Text>
              <Text style={styles.headerSubtitle}>
                {auth.isAuthenticated
                  ? `Welcome back, ${auth.user?.profile?.display_name || 'Developer'}!`
                  : 'Master Programming Skills'}
              </Text>
            </View>
            {auth.isAuthenticated ? (
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile' as never)}
              >
                <Text style={styles.profileInitial}>
                  {auth.user?.profile?.display_name?.charAt(0) || 'U'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={() => setShowMockLogin(true)}>
                <Text style={styles.loginText}>🎭 Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Start</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickAction, styles.multiplayerAction]}
                onPress={handleMultiplayerPress}
              >
                <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.quickActionGradient}>
                  <MaterialCommunityIcons name="account-multiple" size={32} color="#fff" />
                  <Text style={styles.quickActionTitle}>Multiplayer</Text>
                  <Text style={styles.quickActionSubtitle}>Compete in real-time</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAction, styles.practiceAction]}
                onPress={() => handleCategoryPress(categories[0])}
              >
                <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.quickActionGradient}>
                  <MaterialCommunityIcons name="brain" size={32} color="#fff" />
                  <Text style={styles.quickActionTitle}>Practice</Text>
                  <Text style={styles.quickActionSubtitle}>Solo learning</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryQuestions}>{category.questions} questions</Text>
                  <View style={[styles.categoryAccent, { backgroundColor: category.color }]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              <View style={styles.featureCard}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFD700" />
                <Text style={styles.featureTitle}>Adaptive Learning</Text>
                <Text style={styles.featureDescription}>
                  AI-powered questions that adapt to your skill level
                </Text>
              </View>

              <View style={styles.featureCard}>
                <MaterialCommunityIcons name="trophy" size={24} color="#FF6B6B" />
                <Text style={styles.featureTitle}>Gamification</Text>
                <Text style={styles.featureDescription}>
                  XP, levels, streaks, and achievements to keep you motivated
                </Text>
              </View>

              <View style={styles.featureCard}>
                <MaterialCommunityIcons name="chart-line" size={24} color="#4ECDC4" />
                <Text style={styles.featureTitle}>Progress Tracking</Text>
                <Text style={styles.featureDescription}>
                  Detailed analytics to track your learning journey
                </Text>
              </View>
            </View>
          </View>

          {/* Ecosystem Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Ecosystem</Text>
            <View style={styles.ecosystemInfo}>
              <Text style={styles.ecosystemTitle}>🚀 Discover Our Suite</Text>
              <Text style={styles.ecosystemDescription}>
                QuizMentor is part of a comprehensive developer toolkit. Check out our other
                products using the ecosystem widget!
              </Text>
              <View style={styles.ecosystemHint}>
                <MaterialCommunityIcons name="arrow-bottom-right" size={20} color="#667eea" />
                <Text style={styles.ecosystemHintText}>Look for the widget in the corner →</Text>
              </View>
            </View>
          </View>

          {/* Spacer for ecosystem widget */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Ecosystem Widget */}
      <EcosystemWidget currentProduct="quizmentor" position="bottom-right" theme="dark" />

      {/* Mock Login Panel */}
      {showMockLogin && <MockLoginPanel onClose={() => setShowMockLogin(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryQuestions: {
    fontSize: 12,
    color: '#666',
  },
  categoryAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  featuresContainer: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  ecosystemInfo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ecosystemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ecosystemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  ecosystemHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ecosystemHintText: {
    fontSize: 12,
    color: '#667eea',
    marginLeft: 4,
    fontWeight: '500',
  },
});

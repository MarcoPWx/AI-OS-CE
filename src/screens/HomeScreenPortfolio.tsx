import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreenPortfolio() {
  // Check if running in Safari
  const isSafari =
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Animation values - start visible to ensure content shows
  const fadeAnim = useRef(new Animated.Value(isSafari ? 1 : 0.8)).current;
  const slideAnim = useRef(new Animated.Value(isSafari ? 0 : 5)).current;
  const scaleAnim = useRef(new Animated.Value(isSafari ? 1 : 0.99)).current;

  // Categories with enhanced design
  const categories = [
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: 'logo-javascript',
      color: '#F7DF1E',
      gradient: ['#F7DF1E', '#F0DB4F'] as const,
      questions: 150,
      difficulty: 'Beginner',
    },
    {
      id: 'react',
      name: 'React',
      icon: 'logo-react',
      color: '#61DAFB',
      gradient: ['#61DAFB', '#21D4FD'],
      questions: 200,
      difficulty: 'Intermediate',
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: 'code',
      color: '#3178C6',
      gradient: ['#3178C6', '#4B9CD3'],
      questions: 180,
      difficulty: 'Advanced',
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: 'server',
      color: '#339933',
      gradient: ['#339933', '#4CAF50'],
      questions: 120,
      difficulty: 'Intermediate',
    },
  ];

  useEffect(() => {
    // Force animations to run immediately with shorter delay
    const timer = setTimeout(() => {
      console.log('Starting animations...');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        console.log('Animations finished:', finished);
      });
    }, 10); // Much shorter delay

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460'] as const}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
          // Safari fallback - ensure content is always visible
          isSafari && {
            opacity: 1,
            transform: [{ translateY: 0 }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>Demo User</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={40} color="#667eea" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
          // Safari fallback - ensure content is always visible
          isSafari && {
            opacity: 1,
            transform: [{ translateY: 0 }, { scale: 1 }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Level Up Your Skills</Text>
            <Text style={styles.heroSubtitle}>
              Master programming with interactive quizzes and challenges
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>Start Learning</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Choose Your Path</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <Animated.View
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <TouchableOpacity style={styles.categoryButton}>
                    <LinearGradient
                      colors={category.gradient as readonly [string, string, ...string[]]}
                      style={styles.categoryGradient}
                    >
                      <Ionicons name={category.icon as any} size={32} color="#fff" />
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryQuestions}>{category.questions} questions</Text>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyText}>{category.difficulty}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="trophy" size={24} color="#fbbf24" />
                <Text style={styles.quickActionText}>Leaderboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="star" size={24} color="#f59e0b" />
                <Text style={styles.quickActionText}>Achievements</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Ionicons name="settings" size={24} color="#6b7280" />
                <Text style={styles.quickActionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    // Safari-specific styles
    ...(Platform.OS === 'web' && {
      minHeight: '100vh' as any,
      display: 'flex' as any,
      flexDirection: 'column' as any,
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  categoriesSection: {
    marginTop: 40,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryButton: {
    height: 120,
  },
  categoryGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  categoryQuestions: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginTop: 40,
    marginBottom: 40,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '30%',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

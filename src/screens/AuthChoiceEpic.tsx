import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors as themeColors } from '../design/theme';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_WIDTH = 768;

interface AuthChoiceEpicProps {
  onEmailLogin?: () => void;
  onGoogleLogin?: () => void;
  onGitHubLogin?: () => void;
  onDemoLogin?: () => void;
  onSignup?: () => void;
}

export default function AuthChoiceEpic({
  onEmailLogin,
  onGoogleLogin,
  onGitHubLogin,
  onDemoLogin,
  onSignup,
}: AuthChoiceEpicProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  // Interactive state
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Start animations
  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();

    // Start particle animation
    Animated.loop(
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      }),
    ).start();

    // Start sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Start floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleButtonPress = (type: string, callback?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setButtonPressed(type);

    // Add a small delay for the press effect
    setTimeout(() => {
      setButtonPressed(null);
      callback?.();
    }, 200);
  };

  const authButtons = [
    {
      id: 'email',
      title: 'Continue with Email',
      icon: 'email',
      gradient: [themeColors.primary[500], themeColors.primary[700]], // Unified brand gradient
      onPress: onEmailLogin,
      color: '#FFFFFF',
    },
    {
      id: 'google',
      title: 'Continue with Google',
      icon: 'google',
      gradient: ['#dc2626', '#b91c1c'], // Professional red gradient
      onPress: onGoogleLogin,
      color: '#FFFFFF',
    },
    {
      id: 'github',
      title: 'Continue with GitHub',
      icon: 'github',
      gradient: ['#475569', '#334155'], // Professional slate gradient
      onPress: onGitHubLogin,
      color: '#FFFFFF',
    },
    {
      id: 'demo',
      title: '🚀 Quick Start Demo',
      icon: 'rocket-launch',
      gradient: ['#059669', '#047857'], // Professional emerald gradient
      onPress: onDemoLogin,
      color: '#FFFFFF',
      special: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Professional Animated Background */}
      <LinearGradient
        colors={themeColors.gradients.dark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Particles */}
      <Animated.View style={[styles.particlesContainer, { opacity: particleAnim }]}>
        {[...Array(40)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                backgroundColor: [
                  '#ffffff40',
                  '#4f46e530',
                  '#7c3aed30',
                  '#1d4ed830',
                  '#0d948830',
                  '#47556930',
                  '#dc262630',
                  '#05966930',
                ][i % 8], // Professional subtle particles
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                borderRadius: (Math.random() * 8 + 4) / 2,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Sparkle Effects */}
      <Animated.View style={[styles.sparkleContainer, { opacity: sparkleAnim }]}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                // fontSize: Math.random() * 15 + 10,
              },
            ]}
          >
            {['✨', '⭐', '💫', '🌟', '⚡', '🔥', '💎', '🎯'][i % 8]}
          </Animated.View>
        ))}
      </Animated.View>

      {/* Glow Effect */}
      <Animated.View style={[styles.glowContainer, { opacity: glowAnim }]}>
        <View style={styles.glowEffect} />
        <View style={[styles.glowEffect, { top: '60%', left: '60%' }]} />
      </Animated.View>

      {/* Floating Elements */}
      <Animated.View style={[styles.floatingContainer, { opacity: floatingAnim }]}>
        {[...Array(8)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.floatingElement,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                transform: [
                  {
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              },
            ]}
          >
            {['🎮', '🏆', '🚀', '💡', '🎯', '🔥', '⭐', '💎'][i % 8]}
          </Animated.View>
        ))}
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoAnim },
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[themeColors.primary[600], themeColors.primary[700]]}
                style={styles.logo}
              >
                <MaterialCommunityIcons name="brain" size={80} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.logoGlow} />
            </Animated.View>
            <Text style={styles.appTitle}>QuizMentor</Text>
            <Text style={styles.appSubtitle}>Level up your knowledge</Text>
            <Text style={styles.appTagline}>Epic Gaming Experience for Developers</Text>
          </Animated.View>

          {/* Auth Buttons */}
          <Animated.View
            style={[
              styles.authSection,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.authTitle}>Choose Your Adventure</Text>
            <Text style={styles.authSubtitle}>Pick your preferred way to start learning</Text>

            <View style={styles.authButtons}>
              {authButtons.map((button, index) => (
                <TouchableOpacity
                  key={button.id}
                  onPress={() => handleButtonPress(button.id, button.onPress)}
                  activeOpacity={0.8}
                  style={[
                    styles.authButton,
                    buttonPressed === button.id && styles.authButtonPressed,
                    button.special && styles.specialButton,
                  ]}
                >
                  <LinearGradient colors={button.gradient} style={styles.authButtonGradient}>
                    <MaterialCommunityIcons
                      name={button.icon as any}
                      size={24}
                      color={button.color}
                    />
                    <Text style={styles.authButtonText}>{button.title}</Text>
                    {button.special && (
                      <Animated.View style={styles.specialGlow}>
                        <Text style={styles.specialGlowText}>⚡</Text>
                      </Animated.View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity style={styles.signupLink} onPress={onSignup} activeOpacity={0.8}>
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupHighlight}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: isWeb ? Math.max(20, (width - MAX_WIDTH) / 2) : 20,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    opacity: 0.8,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    opacity: 0.9,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  glowEffect: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 200,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 120,
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingElement: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.8,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  authSection: {
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButtons: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginBottom: 30,
  },
  authButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  authButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  specialButton: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  authButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    position: 'relative',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  specialGlow: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialGlowText: {
    fontSize: 16,
  },
  signupLink: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signupText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  signupHighlight: {
    color: themeColors.primary[500], // Professional blue
    fontWeight: 'bold',
  },
});

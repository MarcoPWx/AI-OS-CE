import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);

  // Enhanced animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoRotationY = useSharedValue(0);
  const logoRotationX = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const particlesOpacity = useSharedValue(0);
  const particlesScale = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const backgroundScale = useSharedValue(0.8);
  const glowIntensity = useSharedValue(0);
  const pulseAnim = useSharedValue(1);
  const sparkleAnim = useSharedValue(0);

  // Logo animation with 3D effects
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
      { rotateY: `${logoRotationY.value}deg` },
      { rotateX: `${logoRotationX.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  // Glow effect
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
    transform: [{ scale: interpolate(glowIntensity.value, [0, 1], [0.8, 1.2]) }],
  }));

  // Text animation
  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Particles animation
  const particlesAnimatedStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
    transform: [{ scale: particlesScale.value }],
  }));

  // Background animation
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
    transform: [{ scale: backgroundScale.value }],
  }));

  // Sparkle animation
  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleAnim.value,
    transform: [{ scale: interpolate(sparkleAnim.value, [0, 1], [0, 1]) }],
  }));

  const startAnimation = () => {
    // Phase 1: Background fade in with epic scale
    backgroundOpacity.value = withTiming(1, { duration: 1000 });
    backgroundScale.value = withSpring(1, { damping: 20, stiffness: 80 });

    // Phase 2: Logo entrance with 3D rotation
    setTimeout(() => {
      logoOpacity.value = withTiming(1, { duration: 800 });
      logoScale.value = withSpring(1.3, { damping: 15, stiffness: 100 });
      logoRotation.value = withSequence(
        withTiming(720, { duration: 1200 }),
        withSpring(0, { damping: 20, stiffness: 100 }),
      );
      logoRotationY.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withSpring(0, { damping: 15, stiffness: 100 }),
      );
      logoRotationX.value = withSequence(
        withTiming(180, { duration: 800 }),
        withSpring(0, { damping: 15, stiffness: 100 }),
      );
    }, 500);

    // Phase 3: Glow effect and particles
    setTimeout(() => {
      logoScale.value = withSpring(1, { damping: 20, stiffness: 100 });
      glowIntensity.value = withTiming(1, { duration: 600 });
      particlesOpacity.value = withTiming(1, { duration: 800 });
      particlesScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, 1800);

    // Phase 4: Sparkle effects
    setTimeout(() => {
      sparkleAnim.value = withRepeat(
        withSequence(withTiming(1, { duration: 500 }), withTiming(0, { duration: 500 })),
        -1,
        true,
      );
    }, 2200);

    // Phase 5: Text entrance with staggered effect
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 1000 });
      textTranslateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    }, 2500);

    // Phase 6: Continuous pulse effect
    setTimeout(() => {
      pulseAnim.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 1500 }), withTiming(1, { duration: 1500 })),
        -1,
        true,
      );
    }, 3000);

    // Phase 7: Complete and transition
    setTimeout(() => {
      // Epic fade out with glow
      glowIntensity.value = withTiming(0, { duration: 800 });
      logoOpacity.value = withTiming(0, { duration: 600 });
      textOpacity.value = withTiming(0, { duration: 600 });
      particlesOpacity.value = withTiming(0, { duration: 600 });
      sparkleAnim.value = withTiming(0, { duration: 400 });
      backgroundOpacity.value = withTiming(0, { duration: 1000 });

      // Call completion after fade out
      setTimeout(() => {
        if (onComplete) {
          console.log('IntroAnimation calling onComplete');
          onComplete();
        }
      }, 1000);
    }, 4500);
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />

        {/* Animated Particles */}
        <Animated.View style={[styles.particlesContainer, particlesAnimatedStyle]}>
          {[...Array(30)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  animationDelay: `${Math.random() * 3}s`,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Sparkle Effects */}
        <Animated.View style={[styles.sparkleContainer, sparkleAnimatedStyle]}>
          {[...Array(15)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.sparkle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  animationDelay: `${Math.random() * 2}s`,
                },
              ]}
            />
          ))}
        </Animated.View>
      </Animated.View>

      {/* Glow Effect */}
      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <View style={styles.glowEffect} />
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Animated.View style={[styles.logoBackground, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialCommunityIcons name="brain" size={80} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.title}>QuizMentor</Text>
        <Text style={styles.subtitle}>Level Up Your Skills</Text>
        <Text style={styles.tagline}>Epic Gaming Experience for Developers</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDots}>
          {[...Array(3)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.loadingDot,
                {
                  animationDelay: `${i * 0.2}s`,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    flex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 15,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(79, 70, 229, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F46E5',
    marginHorizontal: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
});

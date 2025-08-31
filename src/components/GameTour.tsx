// src/components/GameTour.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface GameTourProps {
  visible: boolean;
  onComplete: () => void;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  emoji: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  gradient: string[];
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome, Player! 🎮',
    description: "Ready to level up your coding skills? Let's start your epic journey!",
    emoji: '🚀',
    position: { x: width * 0.1, y: height * 0.2 },
    size: { width: width * 0.8, height: 200 },
    gradient: ['#FF6B6B', '#FF8E53'],
  },
  {
    id: 'categories',
    title: 'Choose Your Quest! ⚔️',
    description:
      'Pick a programming language and start your adventure. Each has unique challenges!',
    emoji: '🗺️',
    position: { x: width * 0.1, y: height * 0.4 },
    size: { width: width * 0.8, height: 180 },
    gradient: ['#4ECDC4', '#44A08D'],
  },
  {
    id: 'xp',
    title: 'Gain XP & Level Up! ⭐',
    description: 'Answer correctly to gain XP, unlock achievements, and climb the leaderboards!',
    emoji: '💎',
    position: { x: width * 0.1, y: height * 0.3 },
    size: { width: width * 0.8, height: 180 },
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 'multiplayer',
    title: 'Battle Other Devs! ⚔️',
    description: 'Challenge developers worldwide in real-time multiplayer battles!',
    emoji: '👥',
    position: { x: width * 0.1, y: height * 0.35 },
    size: { width: width * 0.8, height: 180 },
    gradient: ['#FF416C', '#FF4B2B'],
  },
  {
    id: 'ready',
    title: 'Ready to Code? 💻',
    description: 'Your adventure begins now! May the code be with you, young padawan!',
    emoji: '🎯',
    position: { x: width * 0.1, y: height * 0.25 },
    size: { width: width * 0.8, height: 200 },
    gradient: ['#FFD700', '#FFA500'],
  },
];

// Floating game elements for tour background
const TourGameElements: React.FC = () => {
  const elements = useRef([
    ...Array(12)
      .fill(0)
      .map((_, i) => ({
        id: `element-${i}`,
        emoji: ['⭐', '💫', '✨', '🌟', '💎', '🔥'][i % 6],
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        rotate: new Animated.Value(0),
      })),
  ]).current;

  useEffect(() => {
    elements.forEach((element, index) => {
      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(element.y, {
            toValue: Math.random() * height,
            duration: 8000 + index * 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(element.y, {
            toValue: Math.random() * height,
            duration: 8000 + index * 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Rotation
      Animated.loop(
        Animated.timing(element.rotate, {
          toValue: 1,
          duration: 4000 + index * 200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Scale pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(element.scale, {
            toValue: 0.8 + Math.random() * 0.4,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(element.scale, {
            toValue: 0.5 + Math.random() * 0.5,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {elements.map((element, index) => {
        const rotation = element.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.View
            key={element.id}
            style={[
              styles.floatingElement,
              {
                transform: [
                  { translateX: element.x },
                  { translateY: element.y },
                  { scale: element.scale },
                  { rotate: rotation },
                ],
              },
            ]}
          >
            <Text style={styles.floatingEmoji}>{element.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

// Individual tour step component
const TourStepCard: React.FC<{
  step: TourStep;
  isActive: boolean;
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  showSkip?: boolean;
}> = ({ step, isActive, onNext, onSkip, currentStep, totalSteps, showSkip = true }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Epic entrance animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        // Bounce effect
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.tourCard,
        {
          left: step.position.x,
          top: step.position.y,
          width: step.size.width,
          height: step.size.height,
          transform: [{ scale: scaleAnim }, { translateY: bounceTranslate }],
        },
      ]}
    >
      {/* Glow effect */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.cardGlow, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={[step.gradient[0] + '40', step.gradient[1] + '40']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <LinearGradient colors={step.gradient} style={styles.cardGradient}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.stepInfo}>
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
            <View style={styles.stepCounter}>
              <Text style={styles.stepNumber}>
                {currentStep + 1}/{totalSteps}
              </Text>
            </View>
          </View>
          {showSkip && (
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <View style={styles.progressDots}>
            {tourSteps.map((_, index) => (
              <View
                key={index}
                style={[styles.progressDot, index === currentStep && styles.progressDotActive]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={onNext} style={styles.nextButton}>
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>
                {currentStep === totalSteps - 1 ? 'START CODING!' : 'NEXT'}
              </Text>
              <MaterialCommunityIcons
                name={currentStep === totalSteps - 1 ? 'rocket-launch' : 'chevron-right'}
                size={20}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export const GameTour: React.FC<GameTourProps> = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const isEnforced =
    (typeof process !== 'undefined' &&
      ((process.env.EXPO_PUBLIC_TOUR_ENFORCE === '1') || (process.env.NEXT_PUBLIC_TOUR_ENFORCE === '1'))) ||
    false;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  const handleNext = async () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour complete
      await AsyncStorage.setItem('tour_completed', 'true');
      if (!isEnforced) {
        handleComplete();
      }
    }
  };

  const handleSkip = async () => {
    if (isEnforced) return; // ignore skip when enforced
    await AsyncStorage.setItem('tour_completed', 'true');
    handleComplete();
  };

  const handleComplete = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onComplete();
    });
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        {/* Animated background */}
        <LinearGradient
          colors={['rgba(15, 15, 35, 0.95)', 'rgba(26, 26, 46, 0.95)']}
          style={StyleSheet.absoluteFill}
        />

        <TourGameElements />

        {/* Tour step */}
        <TourStepCard
          step={tourSteps[currentStep]}
          isActive={true}
          onNext={handleNext}
          onSkip={handleSkip}
          currentStep={currentStep}
          totalSteps={tourSteps.length}
          showSkip={!isEnforced}
        />
        {isEnforced && (
          <View style={{ position: 'absolute', left: 8, bottom: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)' }}>
            <Text style={{ color: '#e5e7eb', fontSize: 11, fontWeight: '800' }}>Tour is ON</Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
};

// Hook to check if tour should be shown
export const useTourStatus = () => {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = async () => {
    try {
      const tourCompleted = await AsyncStorage.getItem('tour_completed');
      setShouldShowTour(!tourCompleted);
    } catch (error) {
      console.warn('Failed to check tour status:', error);
      setShouldShowTour(true); // Show tour by default if error
    } finally {
      setIsLoading(false);
    }
  };

  const markTourComplete = async () => {
    try {
      await AsyncStorage.setItem('tour_completed', 'true');
      setShouldShowTour(false);
    } catch (error) {
      console.warn('Failed to mark tour complete:', error);
    }
  };

  return {
    shouldShowTour,
    isLoading,
    markTourComplete,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  tourCard: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  cardGlow: {
    borderRadius: 20,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  stepCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  skipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  cardActions: {
    marginTop: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  floatingElement: {
    position: 'absolute',
  },
  floatingEmoji: {
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default GameTour;

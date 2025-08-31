import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  Extrapolate,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInUp,
  ZoomIn,
  BounceIn,
  useAnimatedScrollHandler,
  interpolateColor,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Haptics from 'react-native-haptic-feedback';
import { PremiumButton, GlassCard } from '../../components/premium/PremiumComponents';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============= SPLASH SCREEN =============
export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo entrance
    logoScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 }),
    );

    logoRotation.value = withTiming(360, { duration: 1000 });
    bgOpacity.value = withTiming(1, { duration: 500 });

    // Auto-transition after 2 seconds
    setTimeout(() => {
      runOnJS(onComplete)();
    }, 2000);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }, { rotate: `${logoRotation.value}deg` }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFillObject, bgStyle]}>
        <LinearGradient
          colors={['#667EEA', '#764BA2', '#F093FB']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={logoStyle}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🧠</Text>
          <Text style={styles.logoText}>QuizMentor</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ============= WELCOME SCREEN =============
export const WelcomeScreen = ({ onNext }: { onNext: () => void }) => {
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);
  const particlePositions = [...Array(20)].map(() => ({
    x: useSharedValue(Math.random() * SCREEN_WIDTH),
    y: useSharedValue(SCREEN_HEIGHT + 100),
  }));

  useEffect(() => {
    // Stagger animations
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    buttonScale.value = withDelay(1000, withSpring(1, { damping: 10 }));

    // Animate floating particles
    particlePositions.forEach((particle, index) => {
      particle.y.value = withDelay(
        index * 100,
        withRepeat(withTiming(-100, { duration: 10000 + Math.random() * 5000 }), -1, false),
      );
    });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      {
        translateY: interpolate(titleOpacity.value, [0, 1], [50, 0], Extrapolate.CLAMP),
      },
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={StyleSheet.absoluteFillObject} />

      {/* Floating particles */}
      {particlePositions.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            useAnimatedStyle(() => ({
              transform: [{ translateX: particle.x.value }, { translateY: particle.y.value }],
            })),
          ]}
        />
      ))}

      <View style={styles.content}>
        <Animated.Text style={[styles.welcomeTitle, titleStyle]}>Master Any Topic</Animated.Text>

        <Animated.Text style={[styles.welcomeSubtitle, subtitleStyle]}>
          In Just 5 Minutes a Day
        </Animated.Text>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <PremiumButton title="Get Started" onPress={onNext} size="large" />
        </Animated.View>
      </View>
    </View>
  );
};

// ============= PERSONALIZATION SCREEN =============
export const PersonalizationScreen = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    goal: '',
    interests: [],
    timeCommitment: '',
  });

  const progress = useSharedValue(0);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring((step + 1) / 3, { damping: 15 });
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 }),
    );
  }, [step]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 2) {
      setStep(step + 1);
    } else {
      onComplete(selections);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <GoalSelection
            onSelect={(goal) => {
              setSelections({ ...selections, goal });
              handleNext();
            }}
          />
        );
      case 1:
        return (
          <InterestSelection
            onSelect={(interests) => {
              setSelections({ ...selections, interests });
              handleNext();
            }}
          />
        );
      case 2:
        return (
          <TimeCommitment
            onSelect={(time) => {
              setSelections({ ...selections, timeCommitment: time });
              handleNext();
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#30CFD0', '#330867']} style={StyleSheet.absoluteFillObject} />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]}>
            <LinearGradient
              colors={['#FA709A', '#FEE140']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>
      </View>

      <Animated.View style={[styles.stepContainer, cardStyle]}>{renderStep()}</Animated.View>
    </View>
  );
};

// ============= GOAL SELECTION COMPONENT =============
const GoalSelection = ({ onSelect }: { onSelect: (goal: string) => void }) => {
  const goals = [
    { id: 'learn', emoji: '📚', title: 'Learn', description: 'Expand knowledge' },
    { id: 'practice', emoji: '🎯', title: 'Practice', description: 'Sharpen skills' },
    { id: 'compete', emoji: '🏆', title: 'Compete', description: 'Beat others' },
    { id: 'interview', emoji: '💼', title: 'Interview Prep', description: 'Land your dream job' },
  ];

  return (
    <View style={styles.selectionContainer}>
      <Text style={styles.questionTitle}>What brings you here?</Text>
      <View style={styles.optionsGrid}>
        {goals.map((goal, index) => (
          <Animated.View key={goal.id} entering={SlideInUp.delay(index * 100).springify()}>
            <TouchableOpacity
              style={styles.goalCard}
              onPress={() => onSelect(goal.id)}
              activeOpacity={0.8}
            >
              <GlassCard>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// ============= INTEREST SELECTION COMPONENT =============
const InterestSelection = ({ onSelect }: { onSelect: (interests: string[]) => void }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const categories = [
    { id: 'tech', emoji: '💻', title: 'Technology' },
    { id: 'science', emoji: '🔬', title: 'Science' },
    { id: 'history', emoji: '📜', title: 'History' },
    { id: 'languages', emoji: '🗣️', title: 'Languages' },
    { id: 'business', emoji: '💼', title: 'Business' },
    { id: 'arts', emoji: '🎨', title: 'Arts' },
    { id: 'math', emoji: '🔢', title: 'Mathematics' },
    { id: 'health', emoji: '🏥', title: 'Health' },
  ];

  const toggleCategory = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <View style={styles.selectionContainer}>
      <Text style={styles.questionTitle}>Pick your interests</Text>
      <Text style={styles.questionSubtitle}>Choose at least 3</Text>

      <ScrollView style={styles.bubbleContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.bubbleGrid}>
          {categories.map((category, index) => (
            <BubbleCategory
              key={category.id}
              category={category}
              isSelected={selected.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
              delay={index * 50}
            />
          ))}
        </View>
      </ScrollView>

      <PremiumButton
        title="Continue"
        onPress={() => onSelect(selected)}
        variant={selected.length >= 3 ? 'primary' : 'ghost'}
      />
    </View>
  );
};

// ============= BUBBLE CATEGORY COMPONENT =============
const BubbleCategory = ({ category, isSelected, onPress, delay }) => {
  const scale = useSharedValue(0);
  const backgroundColor = useSharedValue('#667EEA20');

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
  }, []);

  useEffect(() => {
    backgroundColor.value = withTiming(isSelected ? '#667EEA60' : '#667EEA20', { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.bubble, animatedStyle]}>
        <Text style={styles.bubbleEmoji}>{category.emoji}</Text>
        <Text style={styles.bubbleText}>{category.title}</Text>
        {isSelected && (
          <Animated.View entering={ZoomIn.duration(200)} style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============= TIME COMMITMENT COMPONENT =============
const TimeCommitment = ({ onSelect }: { onSelect: (time: string) => void }) => {
  const [selected, setSelected] = useState('');

  const options = [
    { id: '5', label: '5 minutes', description: 'Quick daily practice' },
    { id: '10', label: '10 minutes', description: 'Balanced learning' },
    { id: '15', label: '15 minutes', description: 'Deeper understanding' },
    { id: 'unlimited', label: 'Unlimited', description: "I'm serious about this" },
  ];

  return (
    <View style={styles.selectionContainer}>
      <Text style={styles.questionTitle}>How much time do you have?</Text>
      <Text style={styles.questionSubtitle}>Daily commitment</Text>

      <View style={styles.timeOptions}>
        {options.map((option, index) => (
          <Animated.View key={option.id} entering={SlideInUp.delay(index * 100).springify()}>
            <TouchableOpacity
              style={[styles.timeCard, selected === option.id && styles.timeCardSelected]}
              onPress={() => {
                setSelected(option.id);
                setTimeout(() => onSelect(option.id), 200);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  selected === option.id ? ['#FA709A', '#FEE140'] : ['transparent', 'transparent']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text style={[styles.timeLabel, selected === option.id && styles.timeLabelSelected]}>
                {option.label}
              </Text>
              <Text
                style={[
                  styles.timeDescription,
                  selected === option.id && styles.timeDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

// ============= STYLES =============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Splash Screen
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },

  // Welcome Screen
  welcomeTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -2,
  },
  welcomeSubtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 60,
  },
  buttonContainer: {
    marginTop: 40,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Progress
  progressContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Personalization
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  selectionContainer: {
    flex: 1,
    paddingTop: 40,
  },
  questionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  questionSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
  },

  // Goal Selection
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  goalCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    marginBottom: 20,
  },
  goalEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  goalDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // Interest Selection
  bubbleContainer: {
    flex: 1,
    marginVertical: 20,
  },
  bubbleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  bubble: {
    margin: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bubbleEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  bubbleText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  checkmark: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#84FAB0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Time Commitment
  timeOptions: {
    flex: 1,
    justifyContent: 'center',
  },
  timeCard: {
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  timeCardSelected: {
    borderColor: 'transparent',
  },
  timeLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  timeLabelSelected: {
    color: '#fff',
  },
  timeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  timeDescriptionSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
});

export default {
  SplashScreen,
  WelcomeScreen,
  PersonalizationScreen,
};

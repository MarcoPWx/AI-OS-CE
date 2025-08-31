# 🎨 QuizMentor Premium Design System

## Brand Identity

### Logo Design Concept

```
Primary Logo: Brain + Lightning Bolt fusion
- Represents: Quick thinking, neural connections, instant learning
- Style: Modern, minimal, geometric
- Colors: Gradient from electric blue to purple
```

### Color Palette

#### Primary Colors

```css
/* Premium Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
--gradient-premium: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
--gradient-dark: linear-gradient(135deg, #30cfd0 0%, #330867 100%);

/* Base Colors */
--electric-blue: #667eea;
--royal-purple: #764ba2;
--mint-green: #84fab0;
--coral-pink: #fa709a;
--sunshine: #fee140;

/* Semantic Colors */
--success: #10b981;
--error: #ef4444;
--warning: #f59e0b;
--info: #3b82f6;

/* Neutrals - Premium Feel */
--black: #0a0a0b;
--gray-900: #18181b;
--gray-800: #27272a;
--gray-700: #3f3f46;
--gray-600: #52525b;
--gray-500: #71717a;
--gray-400: #a1a1aa;
--gray-300: #d4d4d8;
--gray-200: #e4e4e7;
--gray-100: #f4f4f5;
--white: #ffffff;
```

### Typography

```css
/* Font Stack - Premium Feel */
--font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;

/* Type Scale - Musical 1.250 ratio */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.25rem; /* 20px */
--text-xl: 1.563rem; /* 25px */
--text-2xl: 1.953rem; /* 31px */
--text-3xl: 2.441rem; /* 39px */
--text-4xl: 3.052rem; /* 49px */
--text-5xl: 3.815rem; /* 61px */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

## 🎭 Premium Animation System

### Core Animation Principles

```typescript
// Animation configuration
export const animations = {
  // Spring animations for natural feel
  spring: {
    gentle: { damping: 15, stiffness: 150 },
    bouncy: { damping: 10, stiffness: 100 },
    stiff: { damping: 20, stiffness: 200 },
  },

  // Timing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Durations
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
};
```

### Micro-interactions Library

```typescript
// 1. Button Press - Apple-style haptic feedback
export const ButtonPress = {
  scale: 0.98,
  duration: 100,
  haptic: 'light',
  shadow: {
    from: '0 4px 6px rgba(0,0,0,0.1)',
    to: '0 2px 4px rgba(0,0,0,0.05)',
  },
};

// 2. Card Flip - Smooth 3D rotation
export const CardFlip = {
  rotateY: { from: 0, to: 180 },
  duration: 600,
  easing: 'ease-in-out',
  perspective: 1000,
};

// 3. Success Celebration - Confetti + Scale + Glow
export const SuccessCelebration = {
  confetti: {
    particles: 100,
    spread: 70,
    origin: { y: 0.6 },
  },
  scale: [1, 1.2, 1],
  glow: {
    shadowColor: '#84FAB0',
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  duration: 1000,
};

// 4. Loading States - Skeleton with shimmer
export const SkeletonShimmer = {
  gradient: ['#f6f7f8', '#edeef1', '#f6f7f8'],
  duration: 1500,
  loop: true,
};

// 5. Page Transitions - iOS-style push/pop
export const PageTransition = {
  enter: {
    translateX: { from: '100%', to: 0 },
    opacity: { from: 0.3, to: 1 },
    duration: 300,
  },
  exit: {
    translateX: { from: 0, to: '-20%' },
    opacity: { from: 1, to: 0.3 },
    duration: 300,
  },
};
```

## 🎯 Premium User Journey

### 1. Onboarding - First Impression

```typescript
const OnboardingFlow = {
  // Splash Screen (0-2s)
  splash: {
    logo: 'Fade in with scale',
    gradient: 'Animated gradient background',
    duration: 2000,
  },

  // Welcome (2-5s)
  welcome: {
    title: 'Master Any Topic',
    subtitle: 'In Just 5 Minutes a Day',
    animation: 'TypeWriter effect',
    cta: 'Get Started',
  },

  // Personalization (5-30s)
  personalization: [
    {
      question: 'What brings you here?',
      options: ['Learn', 'Practice', 'Compete', 'Interview Prep'],
      animation: 'Cards slide up with stagger',
    },
    {
      question: 'Pick your interests',
      categories: ['Tech', 'Science', 'History', 'Languages'],
      animation: 'Bubble selection with physics',
    },
    {
      question: 'How much time do you have?',
      options: ['5 min', '10 min', '15 min', 'Unlimited'],
      animation: 'Slider with haptic feedback',
    },
  ],

  // First Quiz (30-60s)
  firstQuiz: {
    title: "Let's see what you know!",
    questions: 3, // Quick win
    animation: 'Cards stack with gesture control',
  },
};
```

### 2. Home Screen - Command Center

```typescript
const HomeScreen = {
  layout: 'Modular cards with priority stacking',

  sections: {
    // Hero Card - Daily Challenge
    hero: {
      type: 'GradientCard',
      content: 'Daily Challenge',
      animation: 'Pulse glow when new',
      interaction: 'Press to expand with spring',
    },

    // Progress Ring - Gamification
    progress: {
      type: 'CircularProgress',
      metrics: ['Streak', 'XP', 'Rank'],
      animation: 'Animated fill on load',
    },

    // Quick Actions - Floating buttons
    quickActions: {
      buttons: ['Play', 'Practice', 'Compete'],
      animation: 'Magnetic snap to thumb',
      haptic: 'Medium impact on press',
    },

    // Categories - Horizontal scroll
    categories: {
      layout: 'Netflix-style carousel',
      animation: 'Parallax on scroll',
      interaction: 'Long press to preview',
    },
  },
};
```

### 3. Quiz Experience - Flow State

```typescript
const QuizExperience = {
  // Question Presentation
  questionCard: {
    entrance: 'Slide up with bounce',
    exit: 'Swipe away with physics',
    feedback: {
      correct: 'Green pulse + confetti',
      incorrect: 'Red shake + haptic',
    },
  },

  // Progress Indicator
  progress: {
    type: 'Liquid progress bar',
    animation: 'Smooth fill with glow',
    milestone: 'Burst animation at 50%, 100%',
  },

  // Timer
  timer: {
    style: 'Circular countdown',
    warning: 'Pulse red at 10s',
    expired: 'Shake and fade',
  },

  // Answer Selection
  answers: {
    layout: 'Stacked cards or grid',
    hover: 'Lift with shadow',
    select: 'Scale + color fill',
    reveal: 'Flip animation for explanation',
  },
};
```

### 4. Results Screen - Celebration

```typescript
const ResultsScreen = {
  // Score Reveal
  scoreReveal: {
    animation: 'Count up with ease-out',
    particles: 'Confetti based on score',
    sound: 'Success chime',
  },

  // Stats Dashboard
  stats: {
    layout: 'Card grid',
    animations: 'Stagger fade in',
    charts: 'Animated SVG paths',
  },

  // Social Share
  share: {
    preview: 'Generate beautiful card',
    animation: 'Scale up from button',
    platforms: ['Twitter', 'Instagram', 'LinkedIn'],
  },

  // Next Action
  cta: {
    primary: 'Play Again',
    secondary: 'View Leaderboard',
    animation: 'Pulse glow on primary',
  },
};
```

## 🎪 Premium Components Library

### 1. Buttons

```tsx
// Primary Button - Gradient with glow
export const PrimaryButton = styled.TouchableOpacity`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 32px;
  border-radius: 12px;
  shadow-color: #667eea;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 12px;

  &:active {
    transform: scale(0.98);
    shadow-offset: 0px 2px;
    shadow-radius: 8px;
  }
`;

// Ghost Button - Subtle elegance
export const GhostButton = styled.TouchableOpacity`
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 24px;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

// Floating Action Button - Material inspired
export const FAB = styled.TouchableOpacity`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.3;
  shadow-radius: 16px;
  elevation: 8;
`;
```

### 2. Cards

```tsx
// Glass Card - iOS style
export const GlassCard = styled.View`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.1;
  shadow-radius: 20px;
`;

// Gradient Card - Eye-catching
export const GradientCard = styled.View`
  background: ${(props) => props.gradient || 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'};
  border-radius: 16px;
  padding: 24px;
  shadow-color: #667eea;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.25;
  shadow-radius: 16px;
`;

// Neumorphic Card - Soft UI
export const NeumorphicCard = styled.View`
  background: #f0f0f3;
  border-radius: 20px;
  padding: 20px;
  shadow-color: #aeaec0;
  shadow-offset: 10px 10px;
  shadow-opacity: 0.4;
  shadow-radius: 20px;
  /* Inner shadow */
  box-shadow: inset -10px -10px 20px #ffffff;
`;
```

### 3. Input Fields

```tsx
// Premium Input - Floating label
export const PremiumInput = () => {
  const [focused, setFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.label,
          {
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
            ],
            fontSize: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 12],
            }),
          },
        ]}
      >
        {placeholder}
      </Animated.Text>
      <TextInput
        style={[styles.input, focused && styles.focused]}
        onFocus={() => {
          setFocused(true);
          Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }}
      />
    </View>
  );
};
```

## 🎬 Advanced Animations

### 1. Liquid Swipe Navigation

```typescript
export const LiquidSwipe = {
  // SVG path morphing for liquid effect
  path: {
    from: 'M 0 0 L 100 0 L 100 100 L 0 100 Z',
    to: 'M 0 0 Q 50 50 100 0 L 100 100 Q 50 50 0 100 Z',
  },
  duration: 600,
  easing: 'ease-in-out',
};
```

### 2. Parallax Scrolling

```typescript
export const ParallaxScroll = {
  layers: [
    { speed: 0.5, element: 'background' },
    { speed: 0.7, element: 'midground' },
    { speed: 1.0, element: 'foreground' },
    { speed: 1.2, element: 'ui' },
  ],
  damping: 0.9,
};
```

### 3. Gesture-based Interactions

```typescript
export const GestureInteractions = {
  swipeToDelete: {
    threshold: 100,
    animation: 'slide out + fade',
    haptic: 'medium',
  },

  pullToRefresh: {
    threshold: 80,
    animation: 'elastic bounce',
    indicator: 'custom Lottie animation',
  },

  pinchToZoom: {
    minScale: 0.5,
    maxScale: 3,
    animation: 'smooth scale with momentum',
  },
};
```

## 🎨 Visual Effects

### 1. Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

### 2. Gradient Animations

```css
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
```

### 3. Glow Effects

```css
.glow {
  box-shadow:
    0 0 20px rgba(102, 126, 234, 0.5),
    0 0 40px rgba(102, 126, 234, 0.3),
    0 0 60px rgba(102, 126, 234, 0.1);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

## 🎮 Haptic Feedback Guide

```typescript
export const HapticPatterns = {
  // Selection
  lightTap: 'selection',
  mediumTap: 'impactLight',
  heavyTap: 'impactHeavy',

  // Feedback
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',

  // Custom patterns
  heartbeat: [
    { type: 'impactHeavy', delay: 0 },
    { type: 'impactHeavy', delay: 100 },
    { type: 'wait', delay: 500 },
    { type: 'impactHeavy', delay: 0 },
    { type: 'impactHeavy', delay: 100 },
  ],
};
```

## 🌟 Loading States

```typescript
// Skeleton Loading
export const SkeletonLoader = () => (
  <View style={styles.skeleton}>
    <ShimmerPlaceholder
      shimmerColors={['#f6f7f8', '#edeef1', '#f6f7f8']}
      shimmerStyle={styles.shimmer}
    />
  </View>
);

// Liquid Loader
export const LiquidLoader = () => (
  <LottieView
    source={require('./liquid-loader.json')}
    autoPlay
    loop
    style={styles.loader}
  />
);

// Progress Dots
export const ProgressDots = () => {
  const dots = [0, 1, 2].map(i => (
    <Animated.View
      key={i}
      style={[
        styles.dot,
        {
          opacity: animatedValue.interpolate({
            inputRange: [i - 0.5, i, i + 0.5],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          }),
        },
      ]}
    />
  ));

  return <View style={styles.dots}>{dots}</View>;
};
```

## 📱 Platform-Specific Optimizations

### iOS

```typescript
const iOSOptimizations = {
  // Use native iOS transitions
  navigation: 'UINavigationController style',

  // iOS-specific gestures
  gestures: {
    edgeSwipe: true,
    rubberBanding: true,
    momentum: true,
  },

  // iOS design patterns
  ui: {
    largeTitle: true,
    searchBar: 'iOS 15 style',
    tabBar: 'translucent with blur',
  },
};
```

### Android

```typescript
const androidOptimizations = {
  // Material Design 3
  theme: 'Material You',

  // Android-specific
  gestures: {
    backGesture: true,
    predictiveBack: true,
  },

  // Android patterns
  ui: {
    fab: true,
    bottomSheet: true,
    chipGroup: true,
  },
};
```

## 🚀 Performance Guidelines

1. **60 FPS Always**: Use React Native Reanimated 3 for all animations
2. **Lazy Loading**: Implement virtualization for lists
3. **Image Optimization**: Use WebP format, lazy load with blur-up
4. **Code Splitting**: Dynamic imports for heavy components
5. **Memoization**: Use React.memo and useMemo aggressively

## 🎭 Motion Principles

1. **Natural**: Physics-based animations
2. **Responsive**: Instant feedback on touch
3. **Meaningful**: Every animation has purpose
4. **Delightful**: Surprise with micro-interactions
5. **Accessible**: Respect reduce-motion preferences

---

_This design system creates an app that feels worth $100/month, not $2.99_

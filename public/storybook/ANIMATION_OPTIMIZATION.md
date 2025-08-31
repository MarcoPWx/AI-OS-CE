# QuizMentor Animation & Performance Optimization

## 🎯 Core Principle: "Dopamine-Driven Animations"

### Animation Psychology

```
Free Users: Functional animations (just enough to not feel broken)
Premium Users: Delightful animations (dopamine overload)
```

## ⚡ React Native Animation Strategy

We currently use React Native `Animated` + `expo-haptics` and Lottie for most effects. Reanimated 2 is planned but not yet integrated in the app code. This section reflects what's actually implemented now, with a note on planned upgrades.

### 1. Current Implementation (in code)

- RN Animated timing/spring/sequence/parallel
- Haptics via `expo-haptics` for feedback
- Lottie JSONs for confetti/level/trophy
- Examples: `src/services/animations.ts`, `src/components/GamificationComponents.tsx`, `src/components/BubblesBackground.tsx`

### 2. Planned Upgrade (Reanimated 2)

```typescript
// Example target APIs once Reanimated is introduced (not yet wired)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
```

### 2. **Streak Flame Animation**

```typescript
// components/StreakFlame.tsx
const StreakFlame: React.FC<{ streak: number; isPremium: boolean }> = ({ streak, isPremium }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    // Premium users get more dramatic animation
    const intensity = isPremium ? 1.5 : 1;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.2 * intensity, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 1000 }),
        withTiming(-5, { duration: 1000 })
      ),
      -1,
      true
    );

    // Flicker effect for premium
    if (isPremium) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(1, { duration: 100 })
        ),
        -1
      );
    }
  }, [streak, isPremium]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  // Color based on streak milestones
  const getFlameColor = () => {
    if (streak >= 365) return '#FF00FF'; // Purple flame (legendary)
    if (streak >= 100) return '#FFD700'; // Gold flame
    if (streak >= 30) return '#FF4500';  // Red-orange flame
    if (streak >= 7) return '#FFA500';   // Orange flame
    return '#FF6347'; // Tomato (basic)
  };

  return (
    <Animated.View style={[animatedStyle, styles.flameContainer]}>
      <Text style={[styles.flame, { color: getFlameColor() }]}>🔥</Text>
      <Text style={styles.streakNumber}>{streak}</Text>
    </Animated.View>
  );
};
```

### 3. **Heart Loss Animation (Planned with Reanimated)**

```typescript
const HeartLossAnimation: React.FC = () => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const breakHeart = () => {
    'worklet';
    // Dramatic heart break animation
    scale.value = withSequence(
      withTiming(1.5, { duration: 200 }), // Expand
      withTiming(0.8, { duration: 100 }), // Shrink
      withTiming(0, { duration: 300 })    // Disappear
    );

    translateY.value = withSequence(
      withTiming(-20, { duration: 200 }),
      withTiming(100, { duration: 400, easing: Easing.in(Easing.quad) })
    );

    rotation.value = withTiming(180, { duration: 500 });
    opacity.value = withTiming(0, { duration: 500 });

    // Haptic feedback for extra pain
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Text style={styles.heart}>💔</Text>
    </Animated.View>
  );
};
```

### 4. **Celebration Animations**

Current: Implemented with Animated + Lottie in `animations.ts` and UI components.
Planned: Reanimated particle physics and screen shake enhancements.

```typescript
// Free User Celebration (Basic)
const FreeUserCelebration = () => {
  const confettiPieces = Array(20).fill(0).map((_, i) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    React.useEffect(() => {
      translateX.value = withTiming(
        (Math.random() - 0.5) * 200,
        { duration: 1000 }
      );
      translateY.value = withTiming(
        Math.random() * 300,
        { duration: 1000, easing: Easing.out(Easing.quad) }
      );
      opacity.value = withTiming(0, { duration: 1000 });
    }, []);

    return <Animated.View key={i} style={[animatedStyle, styles.confetti]} />;
  });

  return <>{confettiPieces}</>;
};

// Premium User Celebration (Epic)
const PremiumUserCelebration = () => {
  const screenShake = useSharedValue(0);
  const fireworks = Array(50).fill(0).map((_, i) => {
    // Complex particle system
    const startX = width / 2;
    const startY = height / 2;
    const endX = startX + (Math.random() - 0.5) * width;
    const endY = startY + (Math.random() - 0.5) * height;

    const translateX = useSharedValue(startX);
    const translateY = useSharedValue(startY);
    const scale = useSharedValue(0);
    const rotation = useSharedValue(0);

    React.useEffect(() => {
      // Staggered explosion
      setTimeout(() => {
        translateX.value = withSpring(endX, {
          damping: 8,
          stiffness: 100,
          mass: 0.5,
        });
        translateY.value = withSpring(endY, {
          damping: 8,
          stiffness: 100,
          mass: 0.5,
        });
        scale.value = withSequence(
          withTiming(2, { duration: 300 }),
          withTiming(0, { duration: 700 })
        );
        rotation.value = withTiming(360 * 3, { duration: 1000 });
      }, i * 20);
    }, []);

    return <Animated.View key={i} style={[animatedStyle, styles.firework]} />;
  });

  // Screen shake effect
  React.useEffect(() => {
    screenShake.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // Epic sound effect
    Audio.playSound('epic_victory.mp3', { volume: 1 });

    // Haptic pattern
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <Animated.View style={[{ transform: [{ translateX: screenShake }] }]}>
      {fireworks}
      <LottieView
        source={require('./animations/premium-victory.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
    </Animated.View>
  );
};
```

### 5. **Progress Bar Manipulation**

```typescript
const ProgressBar: React.FC<{ progress: number; isPremium: boolean }> = ({ progress, isPremium }) => {
  const width = useSharedValue(0);
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    // Premium users see faster, smoother progress
    const duration = isPremium ? 300 : 800;
    const easing = isPremium ? Easing.out(Easing.exp) : Easing.out(Easing.quad);

    width.value = withTiming(progress, { duration, easing });

    // Premium shimmer effect
    if (isPremium && progress > 0) {
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
    }
  }, [progress, isPremium]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: isPremium
      ? `rgba(255, 215, 0, ${0.8 + shimmer.value * 0.2})`
      : '#3b82f6',
  }));

  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, animatedStyle]} />
      {isPremium && <View style={styles.shimmerOverlay} />}
    </View>
  );
};
```

### 6. **Loading States (Premium vs Free)**

```typescript
// Free users get basic spinner
const FreeLoader = () => (
  <ActivityIndicator size="large" color="#3b82f6" />
);

// Premium users get custom skeleton loader with shimmer
const PremiumLoader = () => {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmer.value * 0.3,
  }));

  return (
    <Animated.View style={[styles.skeleton, animatedStyle]}>
      <SkeletonPlaceholder
        backgroundColor="#f0f0f0"
        highlightColor="#ffffff"
        speed={1200}
      >
        <View style={styles.skeletonContent} />
      </SkeletonPlaceholder>
    </Animated.View>
  );
};
```

## 🎮 Gesture Animations

### Swipe to Answer (Premium Feature)

```typescript
const SwipeableAnswer = ({ onSwipe, isPremium }) => {
  const translateX = useSharedValue(0);
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (!isPremium) return; // Free users can't swipe
      translateX.value = event.translationX;
    },
    onEnd: () => {
      if (Math.abs(translateX.value) > 100) {
        runOnJS(onSwipe)(translateX.value > 0 ? 'right' : 'left');
      }
      translateX.value = withSpring(0);
    },
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[animatedStyle]} />
    </PanGestureHandler>
  );
};
```

## ⚡ Performance Optimizations

### 1. **Use Native Driver**

```typescript
// Always use native driver when possible
Animated.timing(animatedValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // CRITICAL for performance
}).start();
```

### 2. **Lazy Load Heavy Animations**

```typescript
const PremiumAnimations = lazy(() => import('./PremiumAnimations'));

// Only load premium animations for premium users
{isPremium && (
  <Suspense fallback={<BasicLoader />}>
    <PremiumAnimations />
  </Suspense>
)}
```

### 3. **Animation Frame Budget**

```typescript
// Monitor frame drops
import { enableScreens, shouldUseNativeDriver, setJSExceptionHandler } from 'react-native-screens';

// Enable optimizations
enableScreens();

// Track performance
const PerformanceMonitor = () => {
  const frameTime = useSharedValue(0);

  useFrameCallback(() => {
    const now = Date.now();
    const delta = now - frameTime.value;

    if (delta > 16.67) {
      // Dropped frame (60fps = 16.67ms)
      console.warn(`Frame drop: ${delta}ms`);
      // Downgrade animations for low-end devices
    }

    frameTime.value = now;
  });
};
```

### 4. **Memory Management**

```typescript
// Clean up animations on unmount
useEffect(() => {
  return () => {
    // Cancel all animations
    cancelAnimation(scaleValue);
    cancelAnimation(rotationValue);
    cancelAnimation(opacityValue);
  };
}, []);
```

## 🎨 Animation Presets

### Free User Presets

```typescript
const FREE_USER_ANIMATIONS = {
  duration: {
    fast: 300,
    normal: 500,
    slow: 800,
  },
  easing: Easing.out(Easing.quad),
  springs: {
    damping: 15,
    stiffness: 100,
  },
};
```

### Premium User Presets

```typescript
const PREMIUM_USER_ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: Easing.out(Easing.exp),
  springs: {
    damping: 10,
    stiffness: 150,
    mass: 0.5,
  },
  extras: {
    haptics: true,
    particles: true,
    sounds: true,
    screenShake: true,
  },
};
```

## 📊 Animation Metrics

### Track Animation Performance

```typescript
const AnimationMetrics = {
  averageFrameTime: 0,
  droppedFrames: 0,
  animationCount: 0,

  track: (animationName: string, duration: number) => {
    analytics.track('animation_played', {
      name: animationName,
      duration,
      isPremium: user.isPremium,
      deviceModel: Device.modelName,
      fps: 60 - droppedFrames / animationCount,
    });
  },
};
```

---

## Summary

**Free Users**: Get functional but basic animations that feel "fine"
**Premium Users**: Get buttery smooth, delightful animations that trigger dopamine

The key is making free users FEEL the difference without explicitly telling them. They should subconsciously notice that premium users have a more enjoyable experience.

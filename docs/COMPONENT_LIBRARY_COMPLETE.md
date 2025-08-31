# 🎨 QUIZMENTOR COMPONENT LIBRARY

> **Status**: Complete | Version 2.0  
> **Last Updated**: 2025-08-28  
> **Purpose**: Complete UI component reference for QuizMentor app

## 📋 Table of Contents

1. [Core Components](#core-components)
2. [Screen Components](#screen-components)
3. [Quiz Components](#quiz-components)
4. [Animation Components](#animation-components)
5. [Form Components](#form-components)
6. [Navigation Components](#navigation-components)
7. [Utility Components](#utility-components)
8. [Theme System](#theme-system)

---

## 1. Core Components

### Button Components

#### PrimaryButton

**Location**: `src/components/buttons/PrimaryButton.tsx`

```typescript
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'gradient' | 'solid';
}

// Usage
<PrimaryButton
  title="Start Quiz"
  onPress={handleStartQuiz}
  size="large"
  variant="gradient"
/>
```

#### IconButton

**Location**: `src/components/buttons/IconButton.tsx`

```typescript
<IconButton
  icon="trophy"
  onPress={() => navigation.navigate('Leaderboard')}
  color="#FFD700"
  size={24}
/>
```

### Card Components

#### QuizCard

**Location**: `src/components/cards/QuizCard.tsx`

```typescript
<QuizCard
  category="JavaScript"
  difficulty="Medium"
  questionCount={20}
  bestScore={850}
  onPress={() => startQuiz('javascript')}
  locked={false}
  progress={0.75}
/>
```

#### LessonCard

**Location**: `src/components/cards/LessonCard.tsx`

```typescript
<LessonCard
  title="React Hooks"
  description="Master useState and useEffect"
  duration={15}
  xpReward={100}
  completed={false}
  onPress={() => startLesson('react-hooks')}
/>
```

#### AchievementCard

**Location**: `src/components/cards/AchievementCard.tsx`

```typescript
<AchievementCard
  title="Quiz Master"
  description="Complete 100 quizzes"
  icon="🏆"
  progress={67}
  unlocked={false}
  rarity="epic"
/>
```

---

## 2. Screen Components

### HomeScreenEpic

**Location**: `src/screens/HomeScreenEpic.tsx`

```typescript
interface HomeScreenEpicProps {
  user: User;
  onCategorySelect: (category: string) => void;
  onStartLearning: () => void;
}

// Features:
// - User stats display
// - Category grid
// - Daily challenges
// - Quick actions
// - Animated header
```

### QuizScreenEpic

**Location**: `src/screens/QuizScreenEpic.tsx`

```typescript
interface QuizScreenEpicProps {
  category?: string;
  questions?: Question[];
  onComplete?: (score: number, total: number, category: string) => void;
  onBack?: () => void;
}

// Features:
// - Question display
// - Answer options
// - Timer
// - Lives/Hearts
// - Score tracking
// - Combo system
```

### ResultsScreenEpic

**Location**: `src/screens/ResultsScreenEpic.tsx`

```typescript
interface ResultsScreenEpicProps {
  score?: number;
  totalQuestions?: number;
  category?: string;
  onGoHome?: () => void;
  onRetry?: () => void;
}

// Features:
// - Score animation
// - Grade display
// - Statistics grid
// - Achievement unlocks
// - Share functionality
```

### ProfileScreenGameified

**Location**: `src/screens/ProfileScreenGameified.tsx`

```typescript
// Features:
// - Avatar display
// - Level/XP progress
// - Statistics
// - Achievements grid
// - Settings access
// - Logout option
```

---

## 3. Quiz Components

### QuestionDisplay

**Location**: `src/components/quiz/QuestionDisplay.tsx`

```typescript
<QuestionDisplay
  question="What is React.useState used for?"
  questionNumber={5}
  totalQuestions={10}
  category="React"
  difficulty="Medium"
/>
```

### AnswerOption

**Location**: `src/components/quiz/AnswerOption.tsx`

```typescript
<AnswerOption
  text="Managing component state"
  index={0}
  selected={selectedIndex === 0}
  correct={isAnswered && correctIndex === 0}
  incorrect={isAnswered && selectedIndex === 0 && correctIndex !== 0}
  onPress={() => handleSelectAnswer(0)}
  disabled={isAnswered}
/>
```

### QuizTimer

**Location**: `src/components/quiz/QuizTimer.tsx`

```typescript
<QuizTimer
  duration={60}
  onTimeout={handleTimeout}
  paused={isPaused}
  warning={timeRemaining < 10}
/>
```

### LivesDisplay

**Location**: `src/components/quiz/LivesDisplay.tsx`

```typescript
<LivesDisplay
  lives={3}
  maxLives={3}
  animated={true}
  onLifeLost={() => Haptics.notificationAsync()}
/>
```

### ScoreCounter

**Location**: `src/components/quiz/ScoreCounter.tsx`

```typescript
<ScoreCounter
  score={score}
  combo={combo}
  animated={true}
  showComboEffect={combo > 2}
/>
```

---

## 4. Animation Components

### ParticleExplosion

**Location**: `src/components/ParticleExplosion.tsx`

```typescript
<ParticleExplosion
  visible={showEffect}
  centerX={width / 2}
  centerY={height / 2}
  type="celebration"
  onComplete={() => setShowEffect(false)}
/>

// Types: 'celebration' | 'correct' | 'incorrect' | 'levelUp'
```

### IntroAnimation

**Location**: `src/components/IntroAnimation.tsx`

```typescript
<IntroAnimation
  onComplete={() => setShowIntro(false)}
  duration={5500}
  skipable={true}
/>
```

### ProgressBar

**Location**: `src/components/ProgressBar.tsx`

```typescript
<ProgressBar
  progress={0.75}
  animated={true}
  color="#0EA5E9"
  height={8}
  showPercentage={true}
/>
```

### AnimatedNumber

**Location**: `src/components/AnimatedNumber.tsx`

```typescript
<AnimatedNumber
  value={score}
  duration={1000}
  formatter={(val) => `${val} pts`}
  style={styles.scoreText}
/>
```

---

## 5. Form Components

### CustomInput

**Location**: `src/components/form/CustomInput.tsx`

```typescript
<CustomInput
  placeholder="Enter username"
  value={username}
  onChangeText={setUsername}
  icon="person"
  secureTextEntry={false}
  error={errors.username}
/>
```

### PasswordInput

**Location**: `src/components/form/PasswordInput.tsx`

```typescript
<PasswordInput
  value={password}
  onChangeText={setPassword}
  placeholder="Password"
  showStrength={true}
  minLength={8}
/>
```

### CategoryPicker

**Location**: `src/components/form/CategoryPicker.tsx`

```typescript
<CategoryPicker
  categories={availableCategories}
  selected={selectedCategories}
  onSelect={handleCategorySelect}
  multiple={true}
  columns={3}
/>
```

---

## 6. Navigation Components

### TabBar

**Location**: `src/components/navigation/TabBar.tsx`

```typescript
<TabBar
  tabs={[
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'quiz', icon: 'brain', label: 'Quiz' },
    { id: 'leaderboard', icon: 'trophy', label: 'Rank' },
    { id: 'profile', icon: 'person', label: 'Profile' }
  ]}
  activeTab={currentTab}
  onTabPress={handleTabPress}
/>
```

### HeaderBar

**Location**: `src/components/navigation/HeaderBar.tsx`

```typescript
<HeaderBar
  title="QuizMentor"
  showBack={true}
  onBack={() => navigation.goBack()}
  rightAction={{
    icon: 'settings',
    onPress: () => navigation.navigate('Settings')
  }}
/>
```

---

## 7. Utility Components

### LoadingOverlay

**Location**: `src/components/LoadingOverlay.tsx`

```typescript
<LoadingOverlay
  visible={isLoading}
  message="Loading questions..."
  cancelable={false}
/>
```

### ErrorBoundary

**Location**: `src/components/ErrorBoundary.tsx`

```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>
```

### EmptyState

**Location**: `src/components/EmptyState.tsx`

```typescript
<EmptyState
  icon="📚"
  title="No quizzes yet"
  message="Start your learning journey"
  action={{
    label: "Browse Categories",
    onPress: () => navigation.navigate('Categories')
  }}
/>
```

### Toast

**Location**: `src/components/Toast.tsx`

```typescript
Toast.show({
  type: 'success', // 'success' | 'error' | 'warning' | 'info'
  title: 'Achievement Unlocked!',
  message: 'You earned the Speed Demon badge',
  duration: 3000,
  position: 'top',
});
```

---

## 8. Theme System

### Color Tokens

**Location**: `src/design/theme.ts`

```typescript
export const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    900: '#0c4a6e',
  },
  gradients: {
    primary: ['#4f46e5', '#7c3aed'],
    dark: ['#0f172a', '#1e293b'],
    success: ['#059669', '#047857'],
  },
  semantic: {
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
};
```

### Typography

```typescript
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

### Spacing System

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

### Component Styles

```typescript
// Consistent component styling
const buttonStyles = {
  primary: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  secondary: {
    borderWidth: 2,
    borderColor: colors.primary[500],
    backgroundColor: 'transparent',
  },
};
```

---

## 🎯 Component Best Practices

### Performance

```typescript
// Use memo for expensive components
const MemoizedCard = React.memo(QuizCard);

// Use callbacks for event handlers
const handlePress = useCallback(() => {
  // action
}, [dependencies]);
```

### Accessibility

```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Start JavaScript quiz"
  accessibilityHint="Double tap to begin the quiz"
  accessibilityRole="button"
>
```

### Testing

```typescript
// Add testIDs for e2e testing
<Button
  testID="quiz-start-button"
  onPress={startQuiz}
/>
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
const isTablet = width >= 768;
const isLargeScreen = width >= 1024;

const styles = StyleSheet.create({
  container: {
    padding: isTablet ? 24 : 16,
    flexDirection: isTablet ? 'row' : 'column',
  },
});
```

### Safe Areas

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();
const styles = {
  container: {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  },
};
```

---

## 🔗 Storybook Stories

All components have corresponding Storybook stories in `.rnstorybook/stories/`:

```typescript
// Example: ButtonStories.tsx
export const Primary = () => (
  <PrimaryButton title="Click me" onPress={action('clicked')} />
);

export const Loading = () => (
  <PrimaryButton title="Loading..." loading={true} />
);

export const Disabled = () => (
  <PrimaryButton title="Disabled" disabled={true} />
);
```

---

## 📚 Related Documentation

- [Design System](./DESIGN_SYSTEM_REFINED.md)
- [Animation Guide](./ANIMATION_OPTIMIZATION.md)
- [Storybook Guide](./STORYBOOK_GUIDE.md)
- [Theme Documentation](./PREMIUM_DESIGN_SYSTEM.md)

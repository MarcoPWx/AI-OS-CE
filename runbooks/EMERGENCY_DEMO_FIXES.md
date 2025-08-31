# Emergency Demo Fixes - Make It Run NOW

## 🚨 Goal: Make the app DEMO-ABLE in 4 hours

### Hour 1: Install Missing Dependencies & Create .env

```bash
# 1. Install critical missing packages
npm install --save-dev supertest
npm install socket.io-client

# 2. Create .env file with placeholders
cat > .env << 'EOF'
# QuizMentor Environment Configuration
EXPO_PUBLIC_ENV=development

# Placeholder Supabase (won't connect but won't crash)
EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder-key-for-demo

# Disable features that need backend
EXPO_PUBLIC_ENABLE_AUTH=false
EXPO_PUBLIC_ENABLE_MULTIPLAYER=false
EXPO_PUBLIC_ENABLE_LEADERBOARD=false
EXPO_PUBLIC_ENABLE_CLOUD_SAVE=false

# Enable demo mode
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_OFFLINE_MODE=true
EOF
```

### Hour 2: Create Demo Service for Mock Data

```typescript
// services/demoService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DemoService {
  private static instance: DemoService;

  static getInstance() {
    if (!this.instance) {
      this.instance = new DemoService();
    }
    return this.instance;
  }

  async initializeDemoMode() {
    const demoUser = {
      id: 'demo-user-001',
      name: 'Demo User',
      email: 'demo@quizmentor.local',
      level: 5,
      xp: 1250,
      streak: 7,
      lives: 3,
      interests: ['javascript', 'react', 'typescript'],
      skillLevel: 'intermediate',
    };

    await AsyncStorage.setItem('current_user', JSON.stringify(demoUser));
    await AsyncStorage.setItem('demo_mode', 'true');

    return demoUser;
  }

  async getDemoQuestions(category: string, count: number = 10) {
    // Hardcoded questions that ALWAYS work
    const questions = [
      {
        id: '1',
        question: 'What is React?',
        options: ['A JavaScript library', 'A database', 'A CSS framework', 'An operating system'],
        correct: 0,
        explanation: 'React is a JavaScript library for building user interfaces.',
      },
      {
        id: '2',
        question: 'What does useState return?',
        options: ['A single value', 'An array with two elements', 'An object', 'A function'],
        correct: 1,
        explanation: 'useState returns an array with the current state and a setter function.',
      },
      // Add 8 more questions...
    ];

    return questions.slice(0, count);
  }

  async saveDemoProgress(score: number, questionsAnswered: number) {
    const progress = {
      score,
      questionsAnswered,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem('demo_progress', JSON.stringify(progress));
    return progress;
  }

  async getDemoLeaderboard() {
    // Fake leaderboard data
    return [
      { rank: 1, name: 'Alex Dev', score: 9850, avatar: '👨‍💻' },
      { rank: 2, name: 'Sarah Code', score: 9200, avatar: '👩‍💻' },
      { rank: 3, name: 'Demo User (You)', score: 7500, avatar: '🎮' },
      { rank: 4, name: 'Mike JS', score: 7200, avatar: '🚀' },
      { rank: 5, name: 'Lisa React', score: 6800, avatar: '⚛️' },
    ];
  }
}
```

### Hour 3: Patch Critical Components

```typescript
// AppProfessionalRefined.tsx - Add to top of file
import { DemoService } from './services/demoService';

// In the component, update handleAuth:
const handleAuth = async () => {
  setAuthLoading(true);
  setAuthError('');

  try {
    // Use demo service instead of real auth
    const demoService = DemoService.getInstance();
    const demoUser = await demoService.initializeDemoMode();

    setUser(demoUser);
    setAppState('home');

    Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Success);
  } catch (error) {
    console.error('Demo auth error:', error);
    setAuthError('Demo mode failed to initialize');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setAuthLoading(false);
  }
};

// Update startQuiz to use demo questions:
const startQuiz = async (categoryId: string) => {
  const demoService = DemoService.getInstance();
  const questions = await demoService.getDemoQuestions(categoryId, 10);

  setQuestions(questions);
  setCurrentQuestionIndex(0);
  setScore(0);
  setCombo(0);
  setLives(3);
  setCurrentCategory(categoryId);
  setAppState('quiz-playing');
};
```

### Hour 4: Add Error Boundaries & Fallbacks

```typescript
// components/ErrorBoundary.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            We're running in demo mode. Some features may not work.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

```typescript
// App.tsx - Wrap with ErrorBoundary
import { ErrorBoundary } from './components/ErrorBoundary';
import AppProfessionalRefined from './AppProfessionalRefined';

const SHOW_STORYBOOK = process.env.EXPO_PUBLIC_STORYBOOK === '1';

export default function App() {
  const AppComponent = SHOW_STORYBOOK ? StorybookUIRoot : AppProfessionalRefined;

  return (
    <ErrorBoundary>
      <AppComponent />
    </ErrorBoundary>
  );
}
```

## 🔧 Quick Fixes for Common Crashes

### Fix 1: Supabase Connection Errors

```typescript
// lib/supabase.ts - Add fallback
export const supabase = {
  auth: {
    signInWithPassword: async () => ({
      data: null,
      error: new Error('Demo mode - auth disabled'),
    }),
    signUp: async () => ({
      data: null,
      error: new Error('Demo mode - auth disabled'),
    }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null } }),
  },
  from: () => ({
    select: () => ({
      data: [],
      error: null,
      eq: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
    }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
  }),
};
```

### Fix 2: Disable Multiplayer UI

```typescript
// In screens where multiplayer is shown, add condition:
{!process.env.EXPO_PUBLIC_ENABLE_MULTIPLAYER && (
  <View style={styles.disabledOverlay}>
    <Text>Multiplayer coming soon!</Text>
  </View>
)}
```

### Fix 3: Mock Navigation

```typescript
// Add to problem screens
const navigation = {
  navigate: (screen: string) => console.log(`Navigate to ${screen}`),
  goBack: () => console.log('Go back'),
};
```

## 🚀 Run the Demo

```bash
# Clear cache and start fresh
npx expo start -c

# For iOS
i

# For Android
a

# For Web
w
```

## ✅ Demo Script That Works

1. **App Launch**: Shows intro animation (5.5 seconds)
2. **Welcome Screen**: Tap "Get Started"
3. **Auth Screen**: Tap "Quick Start Demo"
4. **Dashboard**: Shows demo user with stats
5. **Quiz**: Select JavaScript category
6. **Questions**: Answer 5-10 hardcoded questions
7. **Results**: Shows score (not saved)
8. **Back to Home**: Returns to dashboard

## ⚠️ Features to AVOID in Demo

- ❌ Real login/signup
- ❌ Multiplayer anything
- ❌ Real leaderboards
- ❌ Profile editing
- ❌ Settings that need backend
- ❌ Social features
- ❌ Achievements (beyond display)
- ❌ Data persistence claims

## 🎯 What to Say During Demo

### DO Say:

- "This is a working prototype"
- "The UI and user experience are complete"
- "Quiz flow demonstrates the core concept"
- "Design system is fully implemented"
- "Animations and interactions are polished"

### DON'T Say:

- "It's production ready"
- "Multiplayer is working"
- "Data persists to cloud"
- "Authentication is complete"
- "It's been tested thoroughly"

---

## Post-Demo Reality Check

After the demo, you still need:

1. Real backend setup (1 week)
2. Authentication system (3 days)
3. Database design & migration (3 days)
4. API implementation (1 week)
5. Real testing (1 week)
6. Bug fixes (1 week)
7. Performance optimization (3 days)
8. Security audit (2 days)

**Total: 4-6 weeks to actual beta**

---

_Remember: A demo is to show POTENTIAL, not claim COMPLETENESS._

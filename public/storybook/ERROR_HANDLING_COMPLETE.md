# 🚨 COMPLETE ERROR HANDLING & TROUBLESHOOTING GUIDE

> **Status**: Complete | Version 2.0  
> **Last Updated**: 2025-08-28  
> **Critical Document**: First reference for all error scenarios

## 📋 Table of Contents

1. [Error Code Catalog](#error-code-catalog)
2. [Common Issues & Solutions](#common-issues-solutions)
3. [Debug Guide](#debug-guide)
4. [Performance Troubleshooting](#performance-troubleshooting)
5. [Mobile-specific Issues](#mobile-specific-issues)
6. [Network Error Handling](#network-error-handling)
7. [Recovery Procedures](#recovery-procedures)
8. [Monitoring & Alerts](#monitoring-alerts)

---

## 1. Error Code Catalog

### Authentication Errors (AUTH_XXX)

| Code     | Message                  | Cause                    | Solution                           |
| -------- | ------------------------ | ------------------------ | ---------------------------------- |
| AUTH_001 | Invalid credentials      | Wrong email/password     | Verify credentials, reset password |
| AUTH_002 | Token expired            | Session timeout          | Refresh token or re-login          |
| AUTH_003 | Insufficient permissions | Access denied            | Check user role/permissions        |
| AUTH_004 | Account locked           | Too many failed attempts | Wait 30 mins or contact support    |
| AUTH_005 | Email not verified       | Unverified account       | Check email for verification link  |
| AUTH_006 | OAuth provider error     | External auth failed     | Retry or use different method      |

### User Errors (USER_XXX)

| Code     | Message              | Cause                   | Solution                  |
| -------- | -------------------- | ----------------------- | ------------------------- |
| USER_001 | User not found       | Invalid user ID         | Verify user exists        |
| USER_002 | Username taken       | Duplicate username      | Choose different username |
| USER_003 | Profile incomplete   | Missing required fields | Complete profile setup    |
| USER_004 | Avatar upload failed | Invalid image format    | Use JPG/PNG < 5MB         |
| USER_005 | Data sync failed     | Sync error              | Retry sync operation      |

### Quiz Errors (QUIZ_XXX)

| Code     | Message                 | Cause                   | Solution                   |
| -------- | ----------------------- | ----------------------- | -------------------------- |
| QUIZ_001 | Session not found       | Invalid/expired session | Start new quiz             |
| QUIZ_002 | Invalid answer          | Bad format              | Check answer format        |
| QUIZ_003 | Session expired         | Timeout                 | Start new session          |
| QUIZ_004 | Questions unavailable   | No questions loaded     | Check category/difficulty  |
| QUIZ_005 | Score calculation error | Math error              | Report bug, recalculate    |
| QUIZ_006 | White screen on quiz    | Navigation issue        | Fixed in v2.1 - update app |

### Payment Errors (PAY_XXX)

| Code    | Message                   | Cause             | Solution              |
| ------- | ------------------------- | ----------------- | --------------------- |
| PAY_001 | Payment required          | Premium feature   | Upgrade to premium    |
| PAY_002 | Invalid payment method    | Card/method issue | Update payment info   |
| PAY_003 | Transaction failed        | Processing error  | Retry or contact bank |
| PAY_004 | Subscription expired      | Plan ended        | Renew subscription    |
| PAY_005 | Receipt validation failed | Store issue       | Contact support       |

### Network Errors (NET_XXX)

| Code    | Message                | Cause           | Solution                |
| ------- | ---------------------- | --------------- | ----------------------- |
| NET_001 | Connection timeout     | Slow network    | Check connection, retry |
| NET_002 | No internet            | Offline         | Enable WiFi/data        |
| NET_003 | Server unreachable     | Server down     | Check status page       |
| NET_004 | Request failed         | Network issue   | Retry request           |
| NET_005 | WebSocket disconnected | Connection lost | Auto-reconnect enabled  |

### System Errors (SYS_XXX)

| Code    | Message                | Cause              | Solution          |
| ------- | ---------------------- | ------------------ | ----------------- |
| SYS_001 | App crash              | Memory/bug         | Restart app       |
| SYS_002 | Storage full           | Device storage     | Clear cache/data  |
| SYS_003 | Update required        | Old version        | Update from store |
| SYS_004 | Corrupted data         | Bad cache          | Clear app data    |
| SYS_005 | Background sync failed | iOS/Android limits | Open app to sync  |

---

## 2. Common Issues & Solutions

### Issue: Quiz Shows White Screen

**Symptoms:**

- Blank screen after starting quiz
- No content loads
- App doesn't crash

**Root Cause:**
Navigation state mismatch between state machine and React Navigation

**Solution:**

```typescript
// Fixed in AppProfessionalRefined.tsx
<QuizScreenEpic
  category={currentCategory}
  questions={questions}
  onComplete={(score, total, cat) => {
    setScore(score);
    setAppState('quiz-results');
  }}
  onBack={() => setAppState('home')}
/>
```

### Issue: Login Loop

**Symptoms:**

- Successful login but redirects back to login
- Token not persisting
- AsyncStorage issues

**Solution:**

```typescript
// Check AsyncStorage
const debugStorage = async () => {
  const user = await AsyncStorage.getItem('user');
  const token = await AsyncStorage.getItem('token');
  console.log('Storage:', { user, token });
};

// Clear and retry
await AsyncStorage.clear();
await AsyncStorage.setItem('user', JSON.stringify(userData));
```

### Issue: Slow Performance

**Symptoms:**

- Laggy animations
- Slow screen transitions
- High memory usage

**Solution:**

```typescript
// Optimize renders
const MemoizedComponent = React.memo(Component);

// Use callback refs
const handlePress = useCallback(() => {
  // action
}, [dependencies]);

// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Issue: Push Notifications Not Working

**Symptoms:**

- No notifications received
- Permission denied
- Token not generated

**Solution:**

```typescript
// Check permissions
const { status } = await Notifications.getPermissionsAsync();
if (status !== 'granted') {
  await Notifications.requestPermissionsAsync();
}

// Verify token
const token = await Notifications.getExpoPushTokenAsync();
console.log('Push token:', token);
```

---

## 3. Debug Guide

### Enable Debug Mode

```typescript
// config/debug.ts
export const DEBUG_CONFIG = {
  enableLogging: __DEV__,
  logLevel: 'verbose',
  enableReduxDevTools: true,
  mockAPI: false,
  showDebugPanel: true,
  captureErrors: true,
};
```

### Debug Tools Setup

```bash
# Install Flipper
brew install flipper

# React Native Debugger
brew install react-native-debugger

# Enable Chrome DevTools
# Shake device or Cmd+D (iOS) / Cmd+M (Android)
```

### Logging Strategy

```typescript
// utils/logger.ts
class Logger {
  static debug(message: string, data?: any) {
    if (__DEV__) {
      console.log(`🔍 [DEBUG] ${message}`, data);
    }
  }

  static error(message: string, error: Error) {
    console.error(`❌ [ERROR] ${message}`, error);
    // Send to crash reporting
    Sentry.captureException(error);
  }

  static performance(label: string, fn: Function) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⚡ [PERF] ${label}: ${end - start}ms`);
    return result;
  }
}
```

### Network Debugging

```typescript
// Enable network inspector
if (__DEV__) {
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;

  // Log all requests
  axios.interceptors.request.use((request) => {
    console.log('📤 Request:', request.url, request.data);
    return request;
  });

  axios.interceptors.response.use(
    (response) => {
      console.log('📥 Response:', response.status, response.data);
      return response;
    },
    (error) => {
      console.error('📥 Error:', error.response?.status, error.message);
      return Promise.reject(error);
    },
  );
}
```

---

## 4. Performance Troubleshooting

### Memory Leaks Detection

```typescript
// hooks/useMemoryLeak.ts
export const useMemoryLeakDetector = (componentName: string) => {
  useEffect(() => {
    const startMemory = performance.memory?.usedJSHeapSize;
    console.log(`🔍 ${componentName} mounted - Memory: ${startMemory}`);

    return () => {
      const endMemory = performance.memory?.usedJSHeapSize;
      const diff = endMemory - startMemory;
      if (diff > 1000000) {
        // 1MB threshold
        console.warn(`⚠️ Potential memory leak in ${componentName}: ${diff} bytes`);
      }
    };
  }, []);
};
```

### Animation Performance

```typescript
// Use native driver
Animated.timing(animValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // ✅ Always use when possible
});

// Optimize heavy animations
InteractionManager.runAfterInteractions(() => {
  // Heavy operation after animation
});
```

### Bundle Size Analysis

```bash
# Analyze bundle
npx react-native-bundle-visualizer

# Check method count (Android)
cd android && ./gradlew app:dependencies

# iOS size report
xcrun simctl get_app_container booted com.quizmentor
```

---

## 5. Mobile-specific Issues

### iOS Issues

| Issue                   | Solution                                      |
| ----------------------- | --------------------------------------------- |
| App crashes on launch   | Check provisioning profile, clear DerivedData |
| Push notifications fail | Verify APNS certificates                      |
| Keyboard covers input   | Use KeyboardAvoidingView                      |
| Splash screen stuck     | Check LaunchScreen.storyboard                 |

### Android Issues

| Issue                  | Solution                           |
| ---------------------- | ---------------------------------- |
| APK too large          | Enable ProGuard, use AAB format    |
| Slow on older devices  | Reduce animations, optimize images |
| WebView crashes        | Update WebView from Play Store     |
| Deep links not working | Check AndroidManifest intents      |

### Platform-specific Code

```typescript
// Handle platform differences
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 20,
      android: StatusBar.currentHeight,
    }),
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    android: {
      elevation: 5,
    },
  }),
});
```

---

## 6. Network Error Handling

### Retry Logic

```typescript
// services/retryManager.ts
class RetryManager {
  static async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }
}
```

### Offline Mode

```typescript
// services/offlineManager.ts
class OfflineManager {
  private queue: Request[] = [];

  async executeRequest(request: Request) {
    const isOnline = await NetInfo.fetch();

    if (!isOnline.isConnected) {
      this.queue.push(request);
      return this.getCachedResponse(request);
    }

    try {
      const response = await fetch(request);
      this.cacheResponse(request, response);
      return response;
    } catch (error) {
      return this.getCachedResponse(request);
    }
  }

  async syncQueue() {
    const isOnline = await NetInfo.fetch();
    if (!isOnline.isConnected) return;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      await this.executeRequest(request);
    }
  }
}
```

---

## 7. Recovery Procedures

### Crash Recovery

```typescript
// App.tsx
const setupCrashRecovery = () => {
  // Save state before crash
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    const state = store.getState();
    AsyncStorage.setItem('crash_state', JSON.stringify(state));

    if (isFatal) {
      Alert.alert(
        'Unexpected error occurred',
        'The app needs to restart. Your progress has been saved.',
        [{ text: 'Restart', onPress: () => RNRestart.Restart() }],
      );
    }
  });

  // Restore after crash
  const recoverFromCrash = async () => {
    const crashState = await AsyncStorage.getItem('crash_state');
    if (crashState) {
      store.dispatch(restoreState(JSON.parse(crashState)));
      await AsyncStorage.removeItem('crash_state');
    }
  };
};
```

### Data Recovery

```typescript
// services/dataRecovery.ts
class DataRecoveryService {
  static async recoverQuizProgress() {
    const backup = await AsyncStorage.getItem('quiz_backup');
    if (!backup) return null;

    const { questions, answers, score } = JSON.parse(backup);
    return {
      questions,
      answers,
      score,
      canResume: Date.now() - backup.timestamp < 3600000, // 1 hour
    };
  }

  static async backupQuizProgress(state: QuizState) {
    await AsyncStorage.setItem(
      'quiz_backup',
      JSON.stringify({
        ...state,
        timestamp: Date.now(),
      }),
    );
  }
}
```

---

## 8. Monitoring & Alerts

### Error Tracking Setup

```typescript
// services/monitoring.ts
import * as Sentry from '@sentry/react-native';
import Analytics from '@segment/analytics-react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
  beforeSend(event) {
    // Filter sensitive data
    delete event.user?.email;
    return event;
  },
});

// Custom error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: { react: errorInfo },
    });

    Analytics.track('Error Occurred', {
      error: error.message,
      component: errorInfo.componentStack,
    });
  }
}
```

### Performance Monitoring

```typescript
// Monitor key metrics
const monitorPerformance = () => {
  // FPS monitoring
  let lastFrameTime = Date.now();
  const checkFPS = () => {
    const now = Date.now();
    const fps = 1000 / (now - lastFrameTime);
    if (fps < 30) {
      console.warn(`Low FPS detected: ${fps}`);
    }
    lastFrameTime = now;
    requestAnimationFrame(checkFPS);
  };

  // Memory monitoring
  setInterval(() => {
    const memory = performance.memory;
    if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
      console.error('Memory warning: 90% heap used');
    }
  }, 5000);
};
```

---

## 🔧 Quick Fix Reference

### Top 5 Most Common Fixes

1. **Clear Cache**: `npx react-native start --reset-cache`
2. **Clean Build**: `cd ios && pod install && cd .. && npx react-native run-ios`
3. **Reset Metro**: `watchman watch-del-all`
4. **Clear AsyncStorage**: `await AsyncStorage.clear()`
5. **Reinstall node_modules**: `rm -rf node_modules && npm install`

### Emergency Contacts

- **Critical Issues**: engineering@quizmentor.com
- **Status Page**: https://status.quizmentor.com
- **Support**: https://support.quizmentor.com

---

## 🔗 Related Documentation

- [API Error Codes](./API_COMPLETE_REFERENCE.md#error-responses)
- [Testing Guide](./TESTING_STRATEGY.md)
- [Performance Guide](./PERFORMANCE_OPTIMIZATION.md)
- [Security Guide](./SECURITY_GUIDE.md)

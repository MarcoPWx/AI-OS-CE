# QuizMentor Unified Architecture with Expo

## 🚀 One Codebase, All Platforms

### Expo Deployment Strategy

```
┌─────────────────────────────────────────────────────┐
│                  Expo Codebase                       │
│              (React Native + Web)                    │
└─────────┬───────────────┬───────────────┬───────────┘
          │               │               │
          ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │   Web   │    │   iOS   │    │ Android │
    │ (Vercel)│    │(TestFlight)  │  (Play)  │
    └─────────┘    └─────────┘    └─────────┘
```

## Platform Deployment

### 1. Web (Expo Web)

```yaml
Platform: Vercel / Netlify / DigitalOcean
Build: expo export:web
Features:
  - PWA support built-in
  - Offline-first with service workers
  - SEO optimized
  - Same components as mobile
Cost: $0-20/month
```

### 2. iOS & Android (EAS Build)

```yaml
Service: Expo Application Services (EAS)
Build: eas build --platform all
Submit: eas submit
Features:
  - Over-the-air updates
  - Push notifications
  - Native modules support
Cost: $0 (free tier) or $29/month (priority builds)
```

## Unified Project Structure

```
QuizMentor/
├── app/                    # Expo Router (v3)
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home/Quiz screen
│   │   ├── profile.tsx    # User profile
│   │   └── analytics.tsx  # Progress tracking
│   ├── quiz/
│   │   ├── [id].tsx       # Dynamic quiz routes
│   │   └── results.tsx    # Quiz results
│   └── _layout.tsx        # Root layout
├── components/            # Shared components
│   ├── QuizCard.tsx      # Works on all platforms
│   ├── AdaptiveEngine.tsx
│   └── BloomValidator.tsx
├── services/             # Your AI engines
│   ├── quiz-engine.ts
│   ├── adaptive.ts
│   └── orchestrator.ts
├── lib/                  # Utilities
│   ├── supabase.ts
│   └── feature-flags.ts
├── app.json              # Expo config
├── eas.json              # EAS Build config
└── package.json
```

## Expo Configuration

### app.json

```json
{
  "expo": {
    "name": "QuizMentor",
    "slug": "quizmentor",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "platforms": ["ios", "android", "web"],
    "web": {
      "bundler": "metro",
      "output": "single",
      "build": {
        "babel": {
          "include": ["@supabase/supabase-js"]
        }
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true
          },
          "android": {
            "newArchEnabled": true
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### eas.json (for mobile builds)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "buildNumber": "auto"
      },
      "android": {
        "versionCode": "auto"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-store-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production"
      }
    }
  }
}
```

## Complete Deployment Commands

```bash
# 1. Install Expo
npm install expo expo-router

# 2. Web Deployment (Vercel)
npx expo export:web
vercel deploy ./dist

# 3. Mobile Development
npx expo start

# 4. Mobile Builds (EAS)
eas build --platform ios
eas build --platform android

# 5. Submit to Stores
eas submit --platform ios
eas submit --platform android

# 6. Over-the-Air Updates
eas update --branch production --message "Bug fixes"
```

## DigitalOcean Deployment for Web + API

```yaml
# .do/expo-app.yaml
name: quizmentor-expo
region: nyc

# Expo Web App
static_sites:
  - name: expo-web
    github:
      repo: your-username/quizmentor
      branch: main
      deploy_on_push: true
    build_command: npx expo export:web
    output_dir: dist
    routes:
      - path: /

# API Backend (same as before)
services:
  - name: api
    github:
      repo: your-username/quizmentor
      branch: main
    dockerfile_path: api/Dockerfile
    instance_size: basic-s
    instance_count: 2
    routes:
      - path: /api

databases:
  - name: db
    engine: PG
    size: basic-xs

  - name: redis
    engine: REDIS
    size: basic-xs
```

## Unified Component Example

```tsx
// components/QuizCard.tsx
// This component works on Web, iOS, and Android!
import { View, Text, Pressable, Platform } from 'react-native';
import { useQuizEngine } from '@/services/quiz-engine';

export function QuizCard({ question, onAnswer }) {
  const { validateAnswer } = useQuizEngine();

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question.text}</Text>
      {question.options.map((option, index) => (
        <Pressable
          key={index}
          onPress={() => onAnswer(index)}
          style={({ pressed }) => [
            styles.option,
            pressed && styles.pressed,
            Platform.select({
              web: { cursor: 'pointer' },
              default: {},
            }),
          ]}
        >
          <Text>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}
```

## Cost Breakdown with Expo

### Development & Testing: $0/month

- Expo Go app for testing
- Local development
- Web preview

### Production: ~$130/month

```yaml
Infrastructure:
  - DigitalOcean API + DB: $85/month
  - Supabase Auth: $25/month
  - Vercel (Web hosting): $20/month
  - EAS (Mobile builds): $0 (free tier)

Optional:
  - EAS Priority builds: $29/month
  - Push notifications: $0 (Expo's free)
  - Analytics (PostHog): $0 (free tier)
```

## Benefits of Expo Approach

### ✅ Advantages:

1. **Single Codebase** - Maintain one code for all platforms
2. **Instant Updates** - OTA updates without app store review
3. **Native Performance** - New Architecture support
4. **Web SEO** - Full SSG/SSR support with Expo Router
5. **Cost Effective** - Most services free or low-cost

### 📱 Platform Features:

- **Web**: PWA, SEO, fast loading
- **iOS**: Native feel, TestFlight distribution
- **Android**: Material Design, Play Store ready

### 🚀 Development Speed:

- Hot reload on all platforms
- Shared business logic
- Unified testing strategy

## Migration from Next.js to Expo

```bash
# 1. Initialize Expo in existing project
npx create-expo-app --template

# 2. Move components (mostly compatible)
mv components/* expo-app/components/

# 3. Update imports
# Change: import from 'next/link'
# To: import { Link } from 'expo-router'

# 4. Update styling
# CSS Modules → StyleSheet or NativeWind

# 5. Test on all platforms
npx expo start --web
npx expo start --ios
npx expo start --android
```

## Feature Parity Across Platforms

| Feature            | Web         | iOS | Android |
| ------------------ | ----------- | --- | ------- |
| Quiz Engine        | ✅          | ✅  | ✅      |
| Adaptive Learning  | ✅          | ✅  | ✅      |
| Offline Mode       | ✅ PWA      | ✅  | ✅      |
| Push Notifications | ✅ Web Push | ✅  | ✅      |
| Biometric Auth     | ❌          | ✅  | ✅      |
| Deep Linking       | ✅          | ✅  | ✅      |
| A/B Testing        | ✅          | ✅  | ✅      |

**Bottom Line**: With Expo, you get true write-once, deploy-everywhere capability. Your AI engines work identically across all platforms, and you can reach web + mobile users with a single codebase at ~$130/month total.

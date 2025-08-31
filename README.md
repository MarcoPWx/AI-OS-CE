# 🧠 QuizMentor - AI-Powered Developer Learning Platform

<div align="center">
  <img src="assets/logo.png" alt="QuizMentor Logo" width="200"/>
  <p>
    <strong>Gamified learning platform for developers with AI-powered quiz optimization</strong>
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#contributing">Contributing</a>
  </p>
  
  ![React Native](https://img.shields.io/badge/React%20Native-0.79.6-blue)
  ![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020)
  ![React](https://img.shields.io/badge/React-18.3-61DAFB)
  ![Vite](https://img.shields.io/badge/Vite-6.0-646CFF)
  ![Storybook](https://img.shields.io/badge/Storybook-8.6-FF4785)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
  ![MSW](https://img.shields.io/badge/MSW-2.0-FF6A33)
  ![License](https://img.shields.io/badge/License-MIT-green)
  ![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)
</div>

## 🎯 Overview

> Demo mode and Tour are enabled for Vercel deployments. You can toggle them off in development.

- Duo overlay: `/?duo=1` shows iOS and Android side-by-side (app embedded in both frames). Add `&duoMode=sb` to preview Storybook instead, and `&duoStory=<story-id>` to target a specific story.
- Tour: `/?tour=1` starts the tour. `/tour` opens a landing page that redirects to the tour.
- Storybook: available at `/storybook` (built during `postbuild`).
- Env toggles:
  - Enable Tour by default in deploy: `EXPO_PUBLIC_TOUR_DEFAULT=1` (alias: `NEXT_PUBLIC_TOUR_AUTO=1`).
  - Soft Storybook gate (demo-only): `VITE_STORYBOOK_PASSWORD=...`.
  - MSW on web: `EXPO_PUBLIC_USE_MSW=1`.

Branches and CI
- Branches: `master`, `staging`, `dev`.
- CI runs unit, e2e (Playwright), Storybook build + tests on pushes and PRs to these branches. Artifacts include coverage, Playwright report, and Storybook static build.

QuizMentor is a cutting-edge cross-platform learning application designed to help developers master programming concepts through gamified quizzes, intelligent question delivery, and psychological engagement patterns. Built with React Native/Expo for mobile and React/Vite for web, featuring a robust mock-first development approach with MSW (Mock Service Worker) and comprehensive Storybook documentation. Powered by Supabase, it offers a self-hosted, privacy-first alternative to traditional learning apps.

## ✨ Features

### 🎮 Gamification System

- **XP & Leveling**: Exponential progression system with 100 levels
- **Achievements**: 15+ unlockable achievements with tiers
- **Daily Streaks**: Maintain learning momentum with streak bonuses
- **Combo System**: Chain correct answers for multipliers
- **Leaderboards**: Global, friends, and weekly rankings
- **Power-Ups**: Hints, skips, XP boosts, and more
- **Daily Quests**: Dynamic challenges that refresh daily

### 🧪 A/B Testing & Feature Flags

- **Minimal Environment Variables**: Supabase URL/Anon key required; rest via remote control
- **Percentage Rollouts**: Gradual feature deployment
- **Real-time Updates**: WebSocket-based configuration
- **Variant Testing**: Multiple experiment variants
- **User Segmentation**: Target specific user groups

### 📊 Self-Hosted Analytics

- **Privacy-First**: No third-party tracking
- **Real-time Dashboard**: Live metrics visualization
- **Event Tracking**: Custom events with metadata
- **Funnel Analysis**: Conversion tracking
- **Performance Monitoring**: Page load and API metrics

### 🎨 Premium Experience

- **60+ Animations**: Smooth, engaging interactions
- **Haptic Feedback**: Tactile responses for actions
- **Dark Mode**: Eye-friendly interface
- **Offline Support**: Learn without internet
- **Smart Caching**: 7-day question cache

### 🧠 Intelligent Question System

- **Adaptive Difficulty**: Questions adjust to skill level
- **Smart Batching**: Efficient question loading
- **Progress Tracking**: Detailed performance metrics
- **Category Mastery**: Track expertise by topic
- **Custom Quiz Sets**: Create personalized collections

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/QuizMentor.git
cd QuizMentor

# Install dependencies
npm install

# Setup Supabase (see docs/QUICK_START_SUPABASE.md)
# 1. Create a project at https://supabase.com
# 2. Run migrations in order:
cd supabase
supabase db push < migrations/001_analytics_tables.sql
supabase db push < migrations/002_feature_flags_ab_testing.sql
supabase db push < migrations/003_question_delivery.sql

# Update connection strings in services
# Edit src/services/supabase.ts with your project URL and anon key

# Start the development server
npm start
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android

# Web (experimental)
npm run web
```

### Storybook (web)

```bash
npm run storybook
# Open http://localhost:7007
```

## 🏗️ Architecture

### Tech Stack

- **Mobile**: React Native + Expo Router + Expo SDK 51
- **Web**: React 18.3 + Vite 6.0 + React Native Web
- **Documentation**: Storybook 8.6 with MDX3
- **Testing**: Playwright, Jest, React Testing Library
- **Mocking**: MSW 2.0 for API mocking, WebSocket simulation
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Context + Hooks
- **Authentication**: JWT-based with OAuth support

### Project Structure

```
QuizMentor/
├── src/
│   ├── screens/           # App screens (Expo)
│   ├── components/        # Shared components
│   ├── stories/           # Storybook stories & dashboards
│   │   ├── s2s/          # S2S Dashboard
│   │   ├── journeys/     # User Journey Map
│   │   ├── testing/      # E2E Test Dashboard
│   │   └── *.stories.tsx # Component stories
│   ├── services/          # Core services
│   │   ├── gamification.ts    # XP, achievements, quests
│   │   ├── animations.ts      # Animation system
│   │   ├── featureFlags.ts    # A/B testing
│   │   ├── questionDelivery.ts # Question management
│   │   └── supabaseAnalytics.ts # Analytics
│   ├── navigation/        # Navigation setup
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   └── utils/            # Helper functions
├── .storybook/           # Storybook configuration
├── mocks/                # MSW mock handlers
├── supabase/
│   └── migrations/       # Database schemas
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/            # End-to-end tests
└── docs/               # Documentation
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests with coverage
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests with Playwright
npm run test:e2e

# Visual regression testing
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

## 📖 Documentation

- [Beta Readiness Checklist](docs/BETA_READINESS_CHECKLIST.md)

New/updated docs for question ingestion, AI quality, and DB-backed flow (and curation):

- In Storybook:
  - Docs/Question Ingestion & AI Reasoning
  - Docs/AI Quality Pipeline (with examples)
  - Docs/DB-Backed Questions (Supabase)
- Runbook: docs/runbooks/QUESTION_PIPELINE_RUNBOOK.md
- Quality Curation Dashboard (Storybook)
- Curation script: `node scripts/curate-quality.js` → writes curated.json/.csv for editors

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- Setup Guides:
  - [Supabase Quick Start (Next.js)](docs/QUICK_START_SUPABASE.md)
  - [Local Dev & Testing Guide](docs/status/LOCAL_DEV_AND_TESTING_GUIDE.md)
  - [Storybook + MSW Testing](docs/STORYBOOK_TESTING.md)
  - [Tech Stack Cheat Sheet](docs/status/TECH_STACK_CHEAT_SHEET.md)
  - [Mocking & Local Dev (Runbook)](runbooks/DEVELOPER_MOCK_RUNBOOK.md)
- Architecture:
  - [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
  - [Service Mocking Architecture](docs/mocks/SERVICE_MOCKING_ARCHITECTURE.md)
- Realtime & Mocks:
  - [Mocks Overview](docs/MOCKS_OVERVIEW.md)
  - [MSW Setup](docs/MSW_SETUP.md)
  - [WebSocket API](docs/WEBSOCKET_API.md)
  - [WebSocket Mocks](docs/mocks/WEBSOCKET_MOCKS.md)
- Storybook docs pages (inside Storybook):
  - Docs/Mocking & Scenarios
  - Docs/Stories How-To
  - Docs/Tech Stack + API
- [Admin Dashboard](docs/ADMIN_DASHBOARD.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)

## 🎯 Gamification Features

### XP System

- Base XP: 100 per level
- Exponential growth: 1.5x multiplier
- Combo bonuses: Up to 5x multiplier
- Streak bonuses: +10% per day
- Variable rewards: Random 1-3x multipliers

### Achievements

| Achievement      | Description             | XP   | Tier     |
| ---------------- | ----------------------- | ---- | -------- |
| 🔥 On Fire!      | 3-day streak            | 50   | Bronze   |
| ⚔️ Week Warrior  | 7-day streak            | 150  | Silver   |
| 💪 Unstoppable   | 30-day streak           | 500  | Gold     |
| 👑 Legendary     | 100-day streak          | 2000 | Platinum |
| 💯 Perfectionist | Get 100% on a quiz      | 100  | Bronze   |
| ⚡ Speed Demon   | Complete in <30 seconds | 75   | Bronze   |
| 🎓 Quiz Master   | Complete 100 quizzes    | 300  | Gold     |
| 🌟 Polymath      | Master 5 categories     | 1000 | Platinum |

### Dark Patterns (Ethical Implementation)

- **Loss Aversion**: XP decay after 7 days inactive
- **Variable Rewards**: Mystery boxes and random bonuses
- **FOMO Mechanics**: Limited-time challenges
- **Social Proof**: Friend activity notifications
- **Progress Indicators**: Visual progress everywhere

## 🔧 Configuration

### Feature Flags

```json
{
  "new_quiz_ui": true,
  "social_sharing": false,
  "premium_features": true,
  "multiplayer_mode": false
}
```

### Remote Config

All configuration is managed through Supabase:

- No environment variables needed
- Real-time updates
- A/B test variants
- User segmentation

## 📱 Screens

1. **Home**: Category selection, stats overview
2. **Quiz**: Question presentation with timer
3. **Results**: Score breakdown, achievements
4. **Profile**: User stats, badges, history
5. **Leaderboard**: Rankings and competition
6. **Analytics**: Self-hosted metrics dashboard
7. **Admin**: Remote config management

## 🚢 Deployment

### Vercel setup (recommended)

- Build Command: `npm run vercel-build`
- Output Directory: `dist`
- Install Command: `npm ci`
- Environment variables per environment:
  - master (Production):
    - `EXPO_PUBLIC_TOUR_DEFAULT=1` (demo mode on)
    - Optional: `EXPO_PUBLIC_TOUR_ENFORCE=1` (tour cannot be closed; watermark appears)
    - Optional: `EXPO_PUBLIC_USE_MSW=1` (mock APIs)
  - staging/dev (Preview):
    - Leave `EXPO_PUBLIC_TOUR_DEFAULT` unset (tour off by default)
    - You can still start via `/?tour=1`
- Storybook is built into `dist/storybook` and available at `/storybook` on the deployed site.

### Production Build

```bash
# iOS
expo build:ios

# Android
expo build:android

# Web
expo build:web
```

See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📊 Performance

- **App Size**: <50MB
- **Load Time**: <2 seconds
- **Frame Rate**: 60 FPS
- **Memory Usage**: <150MB
- **Battery Impact**: Low
- **Offline Support**: Full

## 🔐 Security

- Row Level Security (RLS) on all tables
- End-to-end encryption for sensitive data
- No PII in analytics
- GDPR compliant
- OAuth 2.0 authentication
- Regular security audits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community
- Expo team
- Supabase team
- All contributors

## 📞 Support

- [Documentation](docs/)
- [Issues](https://github.com/yourusername/QuizMentor/issues)
- [Discussions](https://github.com/yourusername/QuizMentor/discussions)
- Email: support@quizmentor.app

---

<div align="center">
  Made with ❤️ by developers, for developers
  
  ⭐ Star us on GitHub!
</div>

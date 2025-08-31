# QuizMentor Deployment Guide

## Overview

QuizMentor is an Expo React Native application with enhanced UX patterns, trust-first design, and ecosystem integration. This guide covers local development, staging, and production deployment.

## Prerequisites

### System Requirements

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator (macOS) or Android Studio
- Git

### Environment Setup

```bash
# Clone repository
git clone https://github.com/naturequest/quizmentor
cd QuizMentor

# Install dependencies
npm install

# Install Expo dependencies
npx expo install

# Create environment file
cp config/environment.example.env .env
```

## Local Development

### Quick Start

```bash
# Start development server on default port
npm start

# Start on specific port (e.g., 3002)
npm start -- --port 3002

# Start with specific platform
npm run ios
npm run android
npm run web
```

### Development Modes

- **Web**: `http://localhost:3002` - Full web experience
- **iOS Simulator**: Automatic launch with `npm run ios`
- **Android Emulator**: Automatic launch with `npm run android`
- **Physical Device**: Scan QR code with Expo Go app

### Key Features Available in Development

- **Enhanced Home Screen**: Trust-building stats and advanced animations
- **Ecosystem Widget**: Cross-product promotion (bottom-right corner)
- **Multiplayer Lobby**: Real-time WebSocket functionality
- **Mock Authentication**: Easy login for development testing
- **Enhanced Quiz Flow**: Advanced animations and psychological feedback

## Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub OAuth (for authentication)
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Analytics (optional)
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# EAS Project ID
EXPO_PUBLIC_EAS_PROJECT_ID=your_eas_project_id
```

### Configuration Files

- `app.config.js` - Main Expo configuration
- `eas.json` - EAS build configuration
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (not committed)

## Build Configuration

### iOS Configuration

```javascript
ios: {
  deploymentTarget: '15.1', // Minimum iOS version
  bundleIdentifier: 'com.quizmentor.app',
  supportsTablet: true,
  infoPlist: {
    NSLocationWhenInUseUsageDescription: 'Location for quiz content',
    NSCameraUsageDescription: 'Camera for QR code scanning',
    NSMicrophoneUsageDescription: 'Microphone for voice features'
  }
}
```

### Android Configuration

```javascript
android: {
  package: 'com.quizmentor.app',
  compileSdkVersion: 34,
  targetSdkVersion: 34,
  minSdkVersion: 23,
  permissions: ['INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE', 'CAMERA']
}
```

## Production Deployment

### EAS Build Setup

```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Build for production
eas build --platform all --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Build Profiles (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Web Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Build for web
npx expo export:web

# Deploy to Vercel
vercel --prod
```

### Netlify Deployment

```bash
# Build for web
npx expo export:web

# Deploy dist folder to Netlify
# Configure build command: npx expo export:web
# Configure publish directory: dist
```

## Database Setup

### Supabase Configuration

1. Create Supabase project
2. Run migrations: `supabase/migrations/001_initial_schema.sql`
3. Seed data: `supabase/seed.sql`
4. Configure RLS policies
5. Set up GitHub OAuth provider

### Database Schema

- `profiles` - User profiles and preferences
- `quiz_sessions` - Quiz session tracking
- `questions` - Question bank with categories
- `achievements` - User achievements and milestones
- `analytics_events` - Event tracking data

## Monitoring & Analytics

### Performance Monitoring

- **Sentry**: Error tracking and performance monitoring
- **Custom Service**: `src/services/performanceMonitor.ts`
- **Analytics Dashboard**: Real-time performance metrics

### Analytics Integration

- **PostHog**: User behavior analytics
- **Mixpanel**: Event tracking
- **Custom Service**: `src/services/analyticsService.ts`

## Troubleshooting

### Common Issues

#### Expo Location Plugin Error

```bash
# Install missing dependency
npx expo install expo-location

# Ensure iOS deployment target is 15.1+
# Check app.config.js expo-build-properties plugin
```

#### Metro Bundler Issues

```bash
# Clear cache
npx expo start --clear

# Reset Metro cache
npx react-native start --reset-cache
```

#### Build Failures

```bash
# Clean EAS build cache
eas build --clear-cache

# Check app.config.js for plugin conflicts
# Verify all dependencies are Expo SDK compatible
```

### Performance Optimization

- Enable Hermes engine for Android
- Use native driver for animations
- Implement lazy loading for screens
- Optimize image assets
- Use React.memo for expensive components

## Security Considerations

### Data Protection

- All sensitive data encrypted at rest
- JWT tokens for authentication
- Row Level Security (RLS) in Supabase
- No sensitive data in client-side code

### API Security

- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Secure headers implementation

## Maintenance

### Regular Tasks

- Update Expo SDK quarterly
- Security audit dependencies monthly
- Performance monitoring review weekly
- User feedback analysis weekly

### Backup Procedures

- Database backups automated daily
- Code repository mirrored
- Environment variables documented
- Build artifacts archived

## Support & Documentation

### Key Documentation

- `/docs/status/` - Current system status
- `/docs/runbooks/` - Operational procedures
- `/docs/api/` - API documentation
- `/docs/testing/` - Testing strategies

### Getting Help

- Check logs in Expo DevTools
- Review error tracking in Sentry
- Consult Expo documentation
- Check React Native troubleshooting guides

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: QuizMentor Team

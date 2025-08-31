# QuizMentor Documentation

## 📚 Documentation Index

### Getting Started

- [Quick Start Guide](./QUICK_START.md) - Get up and running in 5 minutes
- [Installation Guide](./INSTALLATION.md) - Detailed setup instructions
- [Architecture Overview](./ARCHITECTURE.md) - System design and patterns

### Development

- [Development Guide](./DEVELOPMENT.md) - Local development setup
- [Code Standards](./CODE_STANDARDS.md) - Coding conventions and best practices
- [Platform-Specific Guide](./PLATFORM_SPECIFIC.md) - iOS, Android, and Web differences
- [API Documentation](./API.md) - Backend endpoints and data models

### Testing

- [Testing Strategy](./testing/TESTING_STRATEGY.md) - Complete testing approach
- [Unit Testing Guide](./testing/UNIT_TESTS.md) - Component and service tests
- [E2E Testing Guide](./testing/E2E_TESTS.md) - End-to-end test scenarios
- [Platform Testing](./testing/PLATFORM_TESTS.md) - Platform-specific test cases

### Deployment

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment process
- [CI/CD Pipeline](./CI_CD.md) - Automated build and release
- [Environment Configuration](./ENVIRONMENTS.md) - Dev, staging, production setup
- [Release Process](./RELEASE_PROCESS.md) - Step-by-step release checklist

### Features

- [Authentication](./features/AUTHENTICATION.md) - OAuth and email auth
- [Gamification](./features/GAMIFICATION.md) - XP, achievements, leaderboards
- [Notifications](./features/NOTIFICATIONS.md) - Push and in-app notifications
- [Storage](./features/STORAGE.md) - Cross-platform data persistence
- [Analytics](./features/ANALYTICS.md) - Tracking and metrics
- [AI Integration](./features/AI_INTEGRATION.md) - Question generation and recommendations

### Infrastructure

- [Database Schema](./infrastructure/DATABASE.md) - Supabase tables and relations
- [Security](./infrastructure/SECURITY.md) - Authentication, authorization, data protection
- [Performance](./infrastructure/PERFORMANCE.md) - Optimization strategies
- [Monitoring](./infrastructure/MONITORING.md) - Logging, error tracking, metrics

### Legal & Compliance

- [Privacy Policy](../legal/PRIVACY_POLICY.md) - GDPR compliant privacy policy
- [Terms of Service](../legal/TERMS_OF_SERVICE.md) - User agreements
- [Compliance Guide](./COMPLIANCE.md) - GDPR, CCPA, and other regulations

### Troubleshooting

- [Common Issues](./TROUBLESHOOTING.md) - Frequent problems and solutions
- [FAQ](./FAQ.md) - Frequently asked questions
- [Support Guide](./SUPPORT.md) - How to get help

## 🚀 Quick Links

### For Developers

- Local dev & testing:
  - [Local Development and Testing Guide](./status/LOCAL_DEV_AND_TESTING_GUIDE.md)
  - [Storybook + MSW Testing](./STORYBOOK_TESTING.md)
  - [Testing Guide (Snapshot)](./status/TESTING_GUIDE.md)
- [Run locally](./QUICK_START.md#local-development)
- [Run tests](./testing/TESTING_STRATEGY.md#running-tests)
- [Submit PR](./DEVELOPMENT.md#pull-requests)
- [Debug issues](./TROUBLESHOOTING.md)
- [Tech Stack Cheat Sheet](./status/TECH_STACK_CHEAT_SHEET.md)
- Mocking & Realtime:
  - [Mocks Overview](./MOCKS_OVERVIEW.md)
  - [MSW Setup](./MSW_SETUP.md)
  - [Service Mocking Architecture](./mocks/SERVICE_MOCKING_ARCHITECTURE.md)
  - [WebSocket Mocks](./mocks/WEBSOCKET_MOCKS.md)
  - [WebSocket API](./WEBSOCKET_API.md)
- [Developer Mock Runbook](../runbooks/DEVELOPER_MOCK_RUNBOOK.md)
- Decisions:
  - [Storybook & Docs Decisions](./status/STORYBOOK_AND_DOCS_DECISIONS.md)
- Storybook (web) docs pages (inside Storybook):
  - Docs/Mocking & Scenarios
  - Docs/Stories How-To
  - Docs/Tech Stack + API

### For DevOps

- [Deploy to production](./DEPLOYMENT_GUIDE.md#production)
- [Monitor services](./infrastructure/MONITORING.md)
- [Incident response](./SUPPORT.md#incidents)

### For Product

- [Feature flags](./features/FEATURE_FLAGS.md)
- [A/B testing](./features/AB_TESTING.md)
- [Analytics dashboard](./features/ANALYTICS.md#dashboard)

## 📊 Project Status

### Current Version

- **Version**: 1.0.0
- **Stage**: Pre-launch development
- **Target Release**: Q1 2024

### Key Metrics

- **Test Coverage**: ~5% (target: 80%)
- **Documentation**: 70% complete
- **Features Complete**: 60%
- **Platform Support**: iOS ✅ Android ✅ Web 🚧

### Tech Stack

- **Frontend**: React Native / Expo SDK 51
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand
- **Testing**: Jest, React Native Testing Library, Detox
- **CI/CD**: EAS Build, GitHub Actions
- **Analytics**: Custom implementation
- **Monitoring**: Sentry (planned)

## 🏗 Architecture Highlights

```
┌─────────────────────────────────────────────┐
│                Mobile/Web App               │
├─────────────────────────────────────────────┤
│           React Native (Expo)               │
│  ┌──────────┬──────────┬──────────┐       │
│  │ Screens  │ Services │  Stores  │       │
│  └──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────┤
│            Platform Layer                   │
│  ┌──────────┬──────────┬──────────┐       │
│  │   iOS    │ Android  │   Web    │       │
│  └──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────┤
│              Supabase                       │
│  ┌──────────┬──────────┬──────────┐       │
│  │   Auth   │Database │ Realtime  │       │
│  └──────────┴──────────┴──────────┘       │
└─────────────────────────────────────────────┘
```

## 🔄 Development Workflow

1. **Feature Development**

   ```bash
   git checkout -b feature/your-feature
   npm run dev
   npm test
   git push origin feature/your-feature
   ```

2. **Testing**

   ```bash
   npm run test:unit       # Unit tests
   npm run test:e2e        # E2E tests
   npm run test:coverage   # Coverage report
   ```

3. **Deployment**
   ```bash
   eas build --profile preview  # Preview build
   eas submit --profile preview # Submit to TestFlight/Internal
   ```

## 📱 Platform Support Matrix

| Feature            | iOS | Android | Web |
| ------------------ | --- | ------- | --- |
| Authentication     | ✅  | ✅      | 🚧  |
| Push Notifications | ✅  | ✅      | 🚧  |
| Offline Mode       | ✅  | ✅      | ⚠️  |
| Social Sharing     | ✅  | ✅      | ✅  |
| Camera Access      | ✅  | ✅      | ✅  |
| Biometric Auth     | ✅  | ✅      | ❌  |
| Deep Linking       | ✅  | ✅      | ✅  |
| In-App Purchases   | 🚧  | 🚧      | ❌  |

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

- **Documentation Issues**: Open a GitHub issue
- **Development Help**: Check [FAQ](./FAQ.md) or ask in #dev-help
- **Production Issues**: Follow [Incident Response](./SUPPORT.md#incidents)

## 📄 License

This project is proprietary software. See [LICENSE](../LICENSE) for details.

---

_Last updated: December 2024_

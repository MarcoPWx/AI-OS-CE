# Testing Strategy

Last Updated: August 27, 2025

## Overview

Comprehensive testing strategy for QuizMentor's core gamification and quiz functionality.

## Test Structure

### Unit Tests (`__tests__/services/`)

- **gamification.test.ts**: XP, levels, combos, achievements, error handling
- **animations.test.ts**: Animation performance, caching, cleanup

### Integration Tests (`__tests__/screens/`)

- **QuizScreenFrictionless.test.tsx**: Quiz flow with gamification integration

### E2E Tests (`__tests__/e2e/`)

- **quiz-flow.e2e.test.ts**: Complete user journeys, performance, offline functionality

## Coverage Requirements

- **Minimum**: 70% across branches, functions, lines, statements
- **Critical Components**: 90%+ (GamificationService, QuizScreen, AnimationService)

## Test Scripts

```bash
npm run test:unit          # Unit tests with coverage
npm run test:integration   # Integration tests
npm run test:e2e:detox:ios # iOS E2E tests
npm run test:all          # All test suites
```

## Key Scenarios Covered

✅ XP calculation with bonuses and multipliers  
✅ Achievement detection and UI display  
✅ Combo system mechanics  
✅ Quiz flow with gamification integration  
✅ Animation performance and cleanup  
✅ Offline functionality with cached data  
✅ Error handling and recovery

## Performance Benchmarks

- Quiz load: < 3 seconds
- Answer response: < 500ms
- Smooth 60fps animations
- No memory leaks

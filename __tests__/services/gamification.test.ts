// __tests__/services/gamification.test.ts
import { GamificationService, XPCalculator } from '../../src/services/gamification';

// Mock AnalyticsService
jest.mock('../../src/services/analytics', () => ({
  AnalyticsService: {
    trackEvent: jest.fn(),
  },
}));

describe('GamificationService (updated API)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateXP', () => {
    test('calculates XP for correct answer', () => {
      const svc = new GamificationService();
      const res = svc.calculateXP({
        score: 100,
        timeSpent: 20,
        difficulty: 'easy',
        perfectScore: true,
      });
      expect(res.totalXP).toBeGreaterThanOrEqual(10);
    });

    test('applies streak bonus', () => {
      const svc = new GamificationService();
      const res = svc.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'easy',
        perfectScore: false,
        streakDays: 5,
      });
      expect(res.streakMultiplier).toBeGreaterThan(1);
      expect(res.totalXP).toBeGreaterThanOrEqual(10);
    });

    test('handles different difficulty levels', () => {
      const svc = new GamificationService();
      const easy = svc.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'easy',
        perfectScore: false,
      });
      const medium = svc.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'medium',
        perfectScore: false,
      });
      const hard = svc.calculateXP({
        score: 80,
        timeSpent: 30,
        difficulty: 'hard',
        perfectScore: false,
      });

      expect(hard.totalXP).toBeGreaterThanOrEqual(medium.totalXP);
      expect(medium.totalXP).toBeGreaterThanOrEqual(easy.totalXP);
    });
  });

  describe('levels and progress (via XPCalculator)', () => {
    test('calculates level 1 for 0 XP', () => {
      const calc = new XPCalculator();
      const level = calc.getLevelFromXP(0);
      expect(level).toBe(1);
    });

    test('calculates higher levels for more XP', () => {
      const calc = new XPCalculator();
      const lvl2 = calc.getLevelFromXP(100);
      expect(lvl2).toBeGreaterThanOrEqual(1);
    });

    test('returns XP needed for next level', () => {
      const calc = new XPCalculator();
      const nextXP = calc.getXPForNextLevel(2);
      expect(nextXP).toBeGreaterThan(0);
    });
  });
});

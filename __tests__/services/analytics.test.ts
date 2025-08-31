import { AnalyticsService } from '../../src/services/analytics';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    test('tracks event with basic data', async () => {
      const event = {
        name: 'test_event',
        properties: { category: 'test' },
      };

      await AnalyticsService.trackEvent(event.name, event.properties);

      // Should store event locally
      expect(AnalyticsService.getEvents()).toContainEqual(
        expect.objectContaining({
          name: 'test_event',
          properties: { category: 'test' },
        }),
      );
    });

    test('tracks event with timestamp', async () => {
      const before = Date.now();
      await AnalyticsService.trackEvent('test_event');
      const after = Date.now();

      const events = AnalyticsService.getEvents();
      const event = events.find((e) => e.name === 'test_event');

      expect(event).toBeDefined();
      expect(event!.timestamp).toBeGreaterThanOrEqual(before);
      expect(event!.timestamp).toBeLessThanOrEqual(after);
    });

    test('tracks multiple events', async () => {
      await AnalyticsService.trackEvent('event1');
      await AnalyticsService.trackEvent('event2');
      await AnalyticsService.trackEvent('event3');

      const events = AnalyticsService.getEvents();
      expect(events).toHaveLength(3);
      expect(events.map((e) => e.name)).toEqual(['event1', 'event2', 'event3']);
    });
  });

  describe('trackScreenView', () => {
    test('tracks screen view event', async () => {
      await AnalyticsService.trackScreenView('HomeScreen');

      const events = AnalyticsService.getEvents();
      const screenEvent = events.find((e) => e.name === 'screen_view');

      expect(screenEvent).toBeDefined();
      expect(screenEvent!.properties).toEqual({
        screen_name: 'HomeScreen',
        screen_class: 'HomeScreen',
      });
    });
  });

  describe('trackQuizEvent', () => {
    test('tracks quiz started event', async () => {
      await AnalyticsService.trackQuizEvent('quiz_started', {
        category: 'javascript',
        difficulty: 'easy',
      });

      const events = AnalyticsService.getEvents();
      const quizEvent = events.find((e) => e.name === 'quiz_started');

      expect(quizEvent).toBeDefined();
      expect(quizEvent!.properties).toEqual({
        category: 'javascript',
        difficulty: 'easy',
      });
    });

    test('tracks answer submitted event', async () => {
      await AnalyticsService.trackQuizEvent('answer_submitted', {
        category: 'react',
        difficulty: 'medium',
        correct: true,
        timeSpent: 5000,
      });

      const events = AnalyticsService.getEvents();
      const answerEvent = events.find((e) => e.name === 'answer_submitted');

      expect(answerEvent).toBeDefined();
      expect(answerEvent!.properties).toEqual({
        category: 'react',
        difficulty: 'medium',
        correct: true,
        timeSpent: 5000,
      });
    });
  });

  describe('trackGamificationEvent', () => {
    test('tracks level up event', async () => {
      await AnalyticsService.trackGamificationEvent('level_up', {
        oldLevel: 1,
        newLevel: 2,
        xpGained: 100,
      });

      const events = AnalyticsService.getEvents();
      const levelEvent = events.find((e) => e.name === 'level_up');

      expect(levelEvent).toBeDefined();
      expect(levelEvent!.properties).toEqual({
        oldLevel: 1,
        newLevel: 2,
        xpGained: 100,
      });
    });

    test('tracks achievement unlocked event', async () => {
      await AnalyticsService.trackGamificationEvent('achievement_unlocked', {
        achievementId: 'first_quiz',
        achievementName: 'First Quiz',
      });

      const events = AnalyticsService.getEvents();
      const achievementEvent = events.find((e) => e.name === 'achievement_unlocked');

      expect(achievementEvent).toBeDefined();
      expect(achievementEvent!.properties).toEqual({
        achievementId: 'first_quiz',
        achievementName: 'First Quiz',
      });
    });
  });

  describe('flushEvents', () => {
    test('sends events to backend', async () => {
      // Add some test events
      await AnalyticsService.trackEvent('test1');
      await AnalyticsService.trackEvent('test2');

      const result = await AnalyticsService.flushEvents();

      expect(result.success).toBe(true);
      expect(AnalyticsService.getEvents()).toHaveLength(0); // Events should be cleared
    });

    test('handles network errors gracefully', async () => {
      // Mock network failure
      const mockSupabase = require('@supabase/supabase-js');
      mockSupabase.createClient.mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn().mockRejectedValue(new Error('Network error')),
        })),
      });

      await AnalyticsService.trackEvent('test_event');
      const result = await AnalyticsService.flushEvents();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      // Events should still be in queue
      expect(AnalyticsService.getEvents()).toHaveLength(1);
    });
  });

  describe('getEvents', () => {
    test('returns empty array when no events', () => {
      expect(AnalyticsService.getEvents()).toEqual([]);
    });

    test('returns all tracked events', async () => {
      await AnalyticsService.trackEvent('event1');
      await AnalyticsService.trackEvent('event2');

      const events = AnalyticsService.getEvents();
      expect(events).toHaveLength(2);
      expect(events.map((e) => e.name)).toEqual(['event1', 'event2']);
    });
  });

  describe('clearEvents', () => {
    test('clears all events', async () => {
      await AnalyticsService.trackEvent('event1');
      await AnalyticsService.trackEvent('event2');

      expect(AnalyticsService.getEvents()).toHaveLength(2);

      AnalyticsService.clearEvents();
      expect(AnalyticsService.getEvents()).toHaveLength(0);
    });
  });
});

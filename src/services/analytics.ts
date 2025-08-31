import { createClient } from '@supabase/supabase-js';

// Minimal test-friendly AnalyticsService adapter used by __tests__/services/analytics.test.ts
// Stores events in-memory and simulates flushing via Supabase client (mockable in tests)

type EventRecord = {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
};

const events: EventRecord[] = [];

export const AnalyticsService = {
  async trackEvent(name: string, properties: Record<string, any> = {}) {
    events.push({ name, properties, timestamp: Date.now() });
  },

  async trackScreenView(screenName: string, metadata: Record<string, any> = {}) {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
      ...metadata,
    });
  },

  async trackQuizEvent(
    eventName: string,
    quizData: Record<string, any> = {},
    additional: Record<string, any> = {},
  ) {
    await this.trackEvent(eventName, { ...quizData, ...additional });
  },

  async trackGamificationEvent(
    eventName: string,
    data: Record<string, any> = {},
    additional: Record<string, any> = {},
  ) {
    await this.trackEvent(eventName, { ...data, ...additional });
  },

  getEvents(): EventRecord[] {
    return [...events];
  },

  clearEvents() {
    events.length = 0;
  },

  async flushEvents(): Promise<{ success: boolean; error?: string }> {
    try {
      const payload = [...events];
      // Create client at call time so tests can override createClient behavior
      const client = createClient('http://localhost', 'anon');
      const { error } = await client.from('analytics_events').insert(payload);
      if (error) throw error;
      this.clearEvents();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Unknown error' };
    }
  },
};

// src/services/analytics/supabaseAnalytics.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema for analytics
interface AnalyticsEvent {
  id?: string;
  event_name: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  platform: string;
  app_version: string;
  created_at?: string;
}

interface PerformanceMetric {
  id?: string;
  metric_name: string;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

interface ErrorLog {
  id?: string;
  error_name: string;
  error_message: string;
  error_stack?: string;
  user_id?: string;
  platform: string;
  app_version: string;
  context?: Record<string, any>;
  created_at?: string;
}

interface UserSession {
  id?: string;
  user_id?: string;
  session_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  events_count: number;
  platform: string;
}

class SupabaseAnalytics {
  private sessionId: string;
  private userId: string | null = null;
  private sessionStartTime: number;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline = true;
  private flushInterval: NodeJS.Timeout | null = null;
  private performanceMarks: Map<string, number> = new Map();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeNetworkListener();
    this.startAutoFlush();
    this.loadUserId();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadUserId() {
    try {
      this.userId = await AsyncStorage.getItem('@user_id');
    } catch (error) {
      console.error('Failed to load user ID:', error);
    }
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!state.isConnected;

      if (wasOffline && this.isOnline) {
        // Flush queued events when coming back online
        this.flushEvents();
      }
    });
  }

  private startAutoFlush() {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  // Track events
  async track(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_name: eventName,
      user_id: this.userId,
      session_id: this.sessionId,
      properties: {
        ...properties,
        timestamp: Date.now(),
        session_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      },
      platform: Platform.OS,
      app_version: '1.0.0', // Should come from app config
    };

    // Add to queue
    this.eventQueue.push(event);

    // Store locally for offline support
    await this.storeEventLocally(event);

    // Flush if queue is getting large
    if (this.eventQueue.length >= 20) {
      this.flushEvents();
    }

    // Also send immediately if online and important event
    if (this.isOnline && this.isImportantEvent(eventName)) {
      this.sendEvent(event);
    }
  }

  // Track screen views
  async trackScreen(screenName: string, properties: Record<string, any> = {}) {
    await this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  // Performance tracking
  async trackPerformance(metricName: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      metric_name: metricName,
      value,
      unit,
      metadata: {
        platform: Platform.OS,
        session_id: this.sessionId,
      },
    };

    if (this.isOnline) {
      try {
        await supabase.from('performance_metrics').insert(metric);
      } catch (error) {
        console.error('Failed to track performance:', error);
      }
    }
  }

  // Performance marks (like performance.mark in web)
  startMark(markName: string) {
    this.performanceMarks.set(markName, Date.now());
  }

  async endMark(markName: string, metadata?: Record<string, any>) {
    const startTime = this.performanceMarks.get(markName);
    if (startTime) {
      const duration = Date.now() - startTime;
      await this.trackPerformance(markName, duration, 'ms');
      this.performanceMarks.delete(markName);

      // Track as event too for more detail
      await this.track('performance_mark', {
        mark_name: markName,
        duration,
        ...metadata,
      });
    }
  }

  // Error tracking
  async trackError(error: Error | string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      error_name: error instanceof Error ? error.name : 'Error',
      error_message: error instanceof Error ? error.message : error,
      error_stack: error instanceof Error ? error.stack : undefined,
      user_id: this.userId,
      platform: Platform.OS,
      app_version: '1.0.0',
      context: {
        ...context,
        session_id: this.sessionId,
        timestamp: Date.now(),
      },
    };

    // Send immediately if online
    if (this.isOnline) {
      try {
        await supabase.from('error_logs').insert(errorLog);
      } catch (err) {
        console.error('Failed to log error:', err);
        // Store locally as fallback
        await this.storeErrorLocally(errorLog);
      }
    } else {
      await this.storeErrorLocally(errorLog);
    }
  }

  // User identification
  async identify(userId: string, traits?: Record<string, any>) {
    this.userId = userId;
    await AsyncStorage.setItem('@user_id', userId);

    if (traits) {
      // Update user profile in Supabase
      try {
        await supabase.from('user_profiles').upsert({
          id: userId,
          ...traits,
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to update user profile:', error);
      }
    }

    // Track identification event
    await this.track('user_identified', { traits });
  }

  // Session management
  async startSession() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();

    const session: UserSession = {
      user_id: this.userId,
      session_id: this.sessionId,
      started_at: new Date().toISOString(),
      events_count: 0,
      platform: Platform.OS,
    };

    if (this.isOnline) {
      try {
        await supabase.from('user_sessions').insert(session);
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    }

    await this.track('session_start');
  }

  async endSession() {
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);

    await this.track('session_end', { duration });

    if (this.isOnline) {
      try {
        await supabase
          .from('user_sessions')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
            events_count: this.eventQueue.length,
          })
          .eq('session_id', this.sessionId);
      } catch (error) {
        console.error('Failed to end session:', error);
      }
    }

    // Flush remaining events
    await this.flushEvents();
  }

  // Funnel tracking
  async trackFunnelStep(
    funnelName: string,
    step: number,
    stepName: string,
    properties?: Record<string, any>,
  ) {
    await this.track('funnel_step', {
      funnel_name: funnelName,
      step_number: step,
      step_name: stepName,
      ...properties,
    });
  }

  // Revenue tracking
  async trackRevenue(amount: number, currency: string = 'USD', properties?: Record<string, any>) {
    await this.track('revenue', {
      amount,
      currency,
      ...properties,
    });

    // Also update user's lifetime value
    if (this.userId && this.isOnline) {
      try {
        await supabase.rpc('increment_user_ltv', {
          user_id: this.userId,
          amount: amount,
        });
      } catch (error) {
        console.error('Failed to update LTV:', error);
      }
    }
  }

  // Quiz-specific tracking
  async trackQuizStart(categoryId: string, difficulty: string) {
    await this.track('quiz_start', {
      category_id: categoryId,
      difficulty,
    });
    this.startMark(`quiz_${categoryId}`);
  }

  async trackQuizComplete(categoryId: string, score: number, totalQuestions: number) {
    await this.endMark(`quiz_${categoryId}`, {
      score,
      total_questions: totalQuestions,
      accuracy: (score / totalQuestions) * 100,
    });

    await this.track('quiz_complete', {
      category_id: categoryId,
      score,
      total_questions: totalQuestions,
      accuracy: (score / totalQuestions) * 100,
    });
  }

  // Helper methods
  private isImportantEvent(eventName: string): boolean {
    const importantEvents = [
      'user_signup',
      'user_login',
      'purchase',
      'revenue',
      'quiz_complete',
      'level_up',
      'error',
    ];
    return importantEvents.includes(eventName);
  }

  private async sendEvent(event: AnalyticsEvent) {
    if (!this.isOnline) return;

    try {
      await supabase.from('analytics_events').insert(event);
    } catch (error) {
      console.error('Failed to send event:', error);
      // Keep in queue for retry
      if (!this.eventQueue.includes(event)) {
        this.eventQueue.push(event);
      }
    }
  }

  private async flushEvents() {
    if (!this.isOnline || this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Batch insert events
      await supabase.from('analytics_events').insert(events);

      // Clear local storage
      await AsyncStorage.removeItem('@analytics_queue');
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Put events back in queue
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  private async storeEventLocally(event: AnalyticsEvent) {
    try {
      const stored = await AsyncStorage.getItem('@analytics_queue');
      const queue = stored ? JSON.parse(stored) : [];
      queue.push(event);

      // Keep only last 100 events
      if (queue.length > 100) {
        queue.splice(0, queue.length - 100);
      }

      await AsyncStorage.setItem('@analytics_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to store event locally:', error);
    }
  }

  private async storeErrorLocally(error: ErrorLog) {
    try {
      const stored = await AsyncStorage.getItem('@error_logs');
      const errors = stored ? JSON.parse(stored) : [];
      errors.push(error);

      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }

      await AsyncStorage.setItem('@error_logs', JSON.stringify(errors));
    } catch (err) {
      console.error('Failed to store error locally:', err);
    }
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.endSession();
  }
}

// Export singleton instance
export const analytics = new SupabaseAnalytics();

// Convenience functions
export const track = (name: string, props?: Record<string, any>) => analytics.track(name, props);
export const trackScreen = (name: string, props?: Record<string, any>) =>
  analytics.trackScreen(name, props);
export const trackError = (error: Error | string, context?: Record<string, any>) =>
  analytics.trackError(error, context);
export const identify = (userId: string, traits?: Record<string, any>) =>
  analytics.identify(userId, traits);
export const startMark = (name: string) => analytics.startMark(name);
export const endMark = (name: string, metadata?: Record<string, any>) =>
  analytics.endMark(name, metadata);

export default analytics;

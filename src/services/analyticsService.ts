// src/services/analyticsService.ts
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface AnalyticsEvent {
  id?: string;
  user_id?: string;
  event_name: string;
  event_data: Record<string, any>;
  timestamp: string;
  session_id: string;
  platform: string;
  app_version: string;
  created_at?: string;
}

export interface QuizAnalytics {
  quiz_session_id: string;
  category: string;
  difficulty: string;
  question_id: string;
  answer_selected: number;
  is_correct: boolean;
  time_taken: number;
  hints_used: number;
  power_ups_used: string[];
}

export interface GamificationAnalytics {
  event_type:
    | 'xp_gained'
    | 'level_up'
    | 'achievement_unlocked'
    | 'streak_updated'
    | 'combo_achieved';
  xp_amount?: number;
  level_reached?: number;
  achievement_id?: string;
  streak_count?: number;
  combo_multiplier?: number;
  context: string; // Where the event happened
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline: boolean = true;
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private async initialize() {
    // Load queued events from storage
    await this.loadQueuedEvents();

    // Start periodic flush
    this.startPeriodicFlush();

    // Listen for network changes
    this.setupNetworkListener();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async loadQueuedEvents() {
    try {
      const queuedEvents = await AsyncStorage.getItem('analytics_queue');
      if (queuedEvents) {
        this.eventQueue = JSON.parse(queuedEvents);
      }
    } catch (error) {
      console.warn('Failed to load queued analytics events:', error);
    }
  }

  private async saveQueuedEvents() {
    try {
      await AsyncStorage.setItem('analytics_queue', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.warn('Failed to save queued analytics events:', error);
    }
  }

  private startPeriodicFlush() {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  private setupNetworkListener() {
    // In a real app, you'd use @react-native-community/netinfo
    // For now, we'll assume online and handle errors gracefully
    this.isOnline = true;
  }

  // Track a generic analytics event
  async trackEvent(eventName: string, eventData: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_name: eventName,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      platform: Platform.OS,
      app_version: '1.0.0', // Should come from app config
    };

    // Add user ID if authenticated
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        event.user_id = user.id;
      }
    } catch (error) {
      // User not authenticated, continue without user_id
    }

    this.eventQueue.push(event);
    await this.saveQueuedEvents();

    // Try to flush immediately if online
    if (this.isOnline) {
      this.flushEvents();
    }
  }

  // Track quiz-specific events
  async trackQuizEvent(
    eventName: string,
    quizData: Partial<QuizAnalytics>,
    additionalData: Record<string, any> = {},
  ) {
    await this.trackEvent(`quiz_${eventName}`, {
      ...quizData,
      ...additionalData,
    });
  }

  // Track gamification events
  async trackGamificationEvent(
    eventName: string,
    gamificationData: Partial<GamificationAnalytics>,
    additionalData: Record<string, any> = {},
  ) {
    await this.trackEvent(`gamification_${eventName}`, {
      ...gamificationData,
      ...additionalData,
    });
  }

  // Track user actions
  async trackUserAction(action: string, context: string, metadata: Record<string, any> = {}) {
    await this.trackEvent('user_action', {
      action,
      context,
      ...metadata,
    });
  }

  // Track screen views
  async trackScreenView(screenName: string, metadata: Record<string, any> = {}) {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...metadata,
    });
  }

  // Track performance metrics
  async trackPerformance(metric: string, value: number, context: string) {
    await this.trackEvent('performance_metric', {
      metric,
      value,
      context,
    });
  }

  // Track errors
  async trackError(error: Error, context: string, metadata: Record<string, any> = {}) {
    await this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      ...metadata,
    });
  }

  // Flush events to backend
  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    try {
      // Take a snapshot of current queue
      const eventsToFlush = [...this.eventQueue];

      // Send to Supabase
      const { error } = await supabase.from('analytics_events').insert(eventsToFlush);

      if (error) {
        console.warn('Failed to flush analytics events:', error);
        return;
      }

      // Clear successfully sent events
      this.eventQueue = [];
      await this.saveQueuedEvents();

      console.log(`Flushed ${eventsToFlush.length} analytics events`);
    } catch (error) {
      console.warn('Error flushing analytics events:', error);
    }
  }

  // Force flush events (useful for app backgrounding)
  async forceFlush() {
    await this.flushEvents();
  }

  // Get analytics summary for user
  async getAnalyticsSummary(userId: string, timeRange: 'day' | 'week' | 'month' = 'week') {
    try {
      const startDate = new Date();
      switch (timeRange) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching analytics summary:', error);
        return null;
      }

      // Process and aggregate the data
      const summary = this.processAnalyticsData(data);
      return summary;
    } catch (error) {
      console.warn('Error getting analytics summary:', error);
      return null;
    }
  }

  private processAnalyticsData(events: AnalyticsEvent[]) {
    const summary = {
      totalEvents: events.length,
      screenViews: 0,
      quizEvents: 0,
      gamificationEvents: 0,
      errors: 0,
      sessionCount: new Set<string>(),
      topScreens: {} as Record<string, number>,
      averageSessionDuration: 0,
    };

    events.forEach((event) => {
      summary.sessionCount.add(event.session_id);

      switch (event.event_name) {
        case 'screen_view':
          summary.screenViews++;
          const screenName = event.event_data.screen_name;
          summary.topScreens[screenName] = (summary.topScreens[screenName] || 0) + 1;
          break;
        case 'error':
          summary.errors++;
          break;
        default:
          if (event.event_name.startsWith('quiz_')) {
            summary.quizEvents++;
          } else if (event.event_name.startsWith('gamification_')) {
            summary.gamificationEvents++;
          }
      }
    });

    return {
      ...summary,
      sessionCount: summary.sessionCount.size,
    };
  }

  // Cleanup
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

export default AnalyticsService.getInstance();

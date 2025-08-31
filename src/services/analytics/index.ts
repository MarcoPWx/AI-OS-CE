// src/services/analytics/index.ts
import { Mixpanel } from 'mixpanel-react-native';
import firebaseAnalytics from '@react-native-firebase/analytics';
import perf from '@react-native-firebase/perf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

// User properties interface
export interface UserProperties {
  userId?: string;
  username?: string;
  level?: number;
  totalXp?: number;
  platform?: string;
  appVersion?: string;
  deviceModel?: string;
  osVersion?: string;
  isPremium?: boolean;
  registrationDate?: string;
  lastActiveDate?: string;
}

// Performance metrics interface
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'seconds' | 'bytes' | 'percent' | 'count';
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private mixpanel: Mixpanel | null = null;
  private isInitialized = false;
  private userId: string | null = null;
  private sessionStartTime: number = Date.now();
  private eventQueue: AnalyticsEvent[] = [];
  private performanceTraces: Map<string, any> = new Map();

  // Initialize analytics services
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Mixpanel
      if (process.env.EXPO_PUBLIC_MIXPANEL_TOKEN) {
        this.mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN);
        await this.mixpanel.init();
      }

      // Initialize Firebase Analytics
      await firebaseAnalytics().setAnalyticsCollectionEnabled(true);

      // Set default user properties
      await this.setDefaultUserProperties();

      // Load user ID from storage
      const storedUserId = await AsyncStorage.getItem('@user_id');
      if (storedUserId) {
        await this.setUserId(storedUserId);
      }

      this.isInitialized = true;

      // Process queued events
      await this.processEventQueue();

      // Start session tracking
      this.startSession();

      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  // Set user ID for all analytics services
  async setUserId(userId: string) {
    this.userId = userId;

    try {
      // Store user ID
      await AsyncStorage.setItem('@user_id', userId);

      // Set user ID in all services
      if (this.mixpanel) {
        this.mixpanel.identify(userId);
      }
      await analytics().setUserId(userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  // Set user properties
  async setUserProperties(properties: UserProperties) {
    try {
      // Mixpanel user properties
      if (this.mixpanel) {
        this.mixpanel.getPeople().set(properties);
      }

      // Firebase user properties
      const firebaseProps = {
        level: properties.level?.toString(),
        platform: properties.platform,
        is_premium: properties.isPremium?.toString(),
      };

      for (const [key, value] of Object.entries(firebaseProps)) {
        if (value !== undefined) {
          await analytics().setUserProperty(key, value);
        }
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  // Track events
  async track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        platform: Platform.OS,
        timestamp: Date.now(),
        session_duration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      },
      timestamp: Date.now(),
    };

    // Queue event if not initialized
    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    try {
      // Track in Mixpanel
      if (this.mixpanel) {
        this.mixpanel.track(eventName, event.properties);
      }

      // Track in Firebase Analytics
      await analytics().logEvent(this.formatEventName(eventName), event.properties);

      // Store event locally for offline support
      await this.storeEventLocally(event);
    } catch (error) {
      console.error(`Failed to track event ${eventName}:`, error);
    }
  }

  // Track screen views
  async trackScreen(screenName: string, screenClass?: string) {
    try {
      // Firebase screen tracking
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });

      // Mixpanel screen tracking
      if (this.mixpanel) {
        this.mixpanel.track('Screen View', {
          screen_name: screenName,
          screen_class: screenClass,
        });
      }
    } catch (error) {
      console.error(`Failed to track screen ${screenName}:`, error);
    }
  }

  // Performance monitoring
  async startPerformanceTrace(traceName: string, attributes?: Record<string, string>) {
    try {
      const trace = await perf().startTrace(traceName);

      if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
          trace.putAttribute(key, value);
        }
      }

      this.performanceTraces.set(traceName, trace);
      return trace;
    } catch (error) {
      console.error(`Failed to start performance trace ${traceName}:`, error);
    }
  }

  async stopPerformanceTrace(traceName: string, metrics?: Record<string, number>) {
    try {
      const trace = this.performanceTraces.get(traceName);
      if (trace) {
        if (metrics) {
          for (const [key, value] of Object.entries(metrics)) {
            trace.putMetric(key, value);
          }
        }
        await trace.stop();
        this.performanceTraces.delete(traceName);
      }
    } catch (error) {
      console.error(`Failed to stop performance trace ${traceName}:`, error);
    }
  }

  // Custom performance metrics
  async logPerformanceMetric(metric: PerformanceMetric) {
    try {
      // Log to Firebase Performance
      const trace = await perf().startTrace(`custom_metric_${metric.name}`);
      trace.putMetric('value', metric.value);
      trace.putAttribute('unit', metric.unit);

      if (metric.metadata) {
        for (const [key, value] of Object.entries(metric.metadata)) {
          trace.putAttribute(key, String(value));
        }
      }

      await trace.stop();

      // Also track as regular event
      await this.track('performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_unit: metric.unit,
        ...metric.metadata,
      });
    } catch (error) {
      console.error(`Failed to log performance metric ${metric.name}:`, error);
    }
  }

  // Revenue tracking
  async trackRevenue(amount: number, currency: string = 'USD', productId?: string) {
    try {
      // Firebase revenue event
      await analytics().logPurchase({
        value: amount,
        currency: currency,
        items: productId ? [{ item_id: productId, item_name: productId }] : [],
      });

      // Mixpanel revenue tracking
      if (this.mixpanel) {
        this.mixpanel.getPeople().trackCharge(amount, {
          currency,
          product_id: productId,
        });
      }
    } catch (error) {
      console.error('Failed to track revenue:', error);
    }
  }

  // Session management
  private startSession() {
    this.sessionStartTime = Date.now();
    this.track('session_start', {
      previous_session_duration: 0, // Would be calculated from stored data
    });

    // Set up session end tracking
    if (Platform.OS === 'web') {
      window.addEventListener('beforeunload', () => this.endSession());
    }
  }

  private async endSession() {
    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    await this.track('session_end', {
      session_duration: sessionDuration,
    });
  }

  // Funnel tracking
  async trackFunnelStep(
    funnelName: string,
    step: number,
    stepName: string,
    properties?: Record<string, any>,
  ) {
    await this.track(`funnel_${funnelName}_step_${step}`, {
      funnel_name: funnelName,
      step_number: step,
      step_name: stepName,
      ...properties,
    });
  }

  // A/B testing
  async trackExperiment(experimentName: string, variant: string, properties?: Record<string, any>) {
    await this.track('experiment_exposure', {
      experiment_name: experimentName,
      variant,
      ...properties,
    });

    // Set user property for the experiment
    if (this.mixpanel) {
      this.mixpanel.getPeople().set({
        [`experiment_${experimentName}`]: variant,
      });
    }
  }

  // Error tracking
  async trackError(error: Error, context?: Record<string, any>) {
    await this.track('error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  // Utility methods
  private formatEventName(name: string): string {
    // Firebase Analytics has specific naming requirements
    return name.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
  }

  private async setDefaultUserProperties() {
    const properties: UserProperties = {
      platform: Platform.OS,
      osVersion: Platform.Version?.toString(),
      appVersion: '1.0.0', // Should be from app config
    };

    await this.setUserProperties(properties);
  }

  private async storeEventLocally(event: AnalyticsEvent) {
    try {
      const events = await AsyncStorage.getItem('@analytics_events');
      const allEvents = events ? JSON.parse(events) : [];
      allEvents.push(event);

      // Keep only last 100 events
      if (allEvents.length > 100) {
        allEvents.splice(0, allEvents.length - 100);
      }

      await AsyncStorage.setItem('@analytics_events', JSON.stringify(allEvents));
    } catch (error) {
      console.error('Failed to store event locally:', error);
    }
  }

  private async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    const queue = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of queue) {
      await this.track(event.name, event.properties);
    }
  }

  // Flush pending events
  async flush() {
    try {
      if (this.mixpanel) {
        await this.mixpanel.flush();
      }
      await this.processEventQueue();
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }

  // Reset analytics (e.g., on logout)
  async reset() {
    try {
      if (this.mixpanel) {
        await this.mixpanel.reset();
      }
      await analytics().resetAnalyticsData();
      this.userId = null;
      await AsyncStorage.removeItem('@user_id');
    } catch (error) {
      console.error('Failed to reset analytics:', error);
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) =>
  analytics.track(name, properties);

export const trackScreen = (name: string, className?: string) =>
  analytics.trackScreen(name, className);

export const startTrace = (name: string, attributes?: Record<string, string>) =>
  analytics.startPerformanceTrace(name, attributes);

export const stopTrace = (name: string, metrics?: Record<string, number>) =>
  analytics.stopPerformanceTrace(name, metrics);

export const logMetric = (metric: PerformanceMetric) => analytics.logPerformanceMetric(metric);

export default analytics;

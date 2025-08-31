// src/services/performanceMonitor.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import AnalyticsService from './analyticsService';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  context?: string;
  metadata?: Record<string, any>;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  status: number;
  size: number;
  cached: boolean;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private networkMetrics: NetworkMetric[] = [];
  private isEnabled: boolean = true;
  private maxMetrics: number = 1000;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private async initialize() {
    // Check if performance monitoring is enabled
    try {
      const enabled = await AsyncStorage.getItem('performance_monitoring_enabled');
      this.isEnabled = enabled !== 'false';
    } catch (error) {
      console.warn('Failed to load performance monitoring preference:', error);
    }

    if (!this.isEnabled) return;

    // Setup performance observers for web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.setupWebPerformanceObservers();
    }

    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  private setupWebPerformanceObservers() {
    try {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric({
              name: 'page_load_time',
              value: navEntry.loadEventEnd - navEntry.navigationStart,
              unit: 'ms',
              timestamp: Date.now(),
              context: 'navigation',
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                firstPaint: navEntry.responseEnd - navEntry.navigationStart,
              },
            });
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordNetworkMetric({
              url: resourceEntry.name,
              method: 'GET', // Default for resources
              duration: resourceEntry.responseEnd - resourceEntry.requestStart,
              status: 200, // Assume success for resources
              size: resourceEntry.transferSize || 0,
              cached: resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0,
            });
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric({
            name: 'largest_contentful_paint',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            context: 'web_vitals',
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: 'first_input_delay',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            context: 'web_vitals',
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('Failed to setup web performance observers:', error);
    }
  }

  private startPeriodicMonitoring() {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.measureMemoryUsage();
    }, 30000);

    // Monitor app performance every 60 seconds
    setInterval(() => {
      this.measureAppPerformance();
    }, 60000);

    // Flush metrics every 5 minutes
    setInterval(() => {
      this.flushMetrics();
    }, 300000);
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send critical metrics immediately
    if (this.isCriticalMetric(metric)) {
      this.sendMetricToAnalytics(metric);
    }
  }

  // Record network performance
  recordNetworkMetric(metric: NetworkMetric) {
    if (!this.isEnabled) return;

    this.networkMetrics.push(metric);

    // Convert to performance metric
    this.recordMetric({
      name: 'network_request',
      value: metric.duration,
      unit: 'ms',
      timestamp: Date.now(),
      context: 'network',
      metadata: {
        url: metric.url,
        method: metric.method,
        status: metric.status,
        size: metric.size,
        cached: metric.cached,
      },
    });

    // Track slow requests
    if (metric.duration > 2000) {
      this.recordMetric({
        name: 'slow_network_request',
        value: metric.duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: 'performance_issue',
        metadata: metric,
      });
    }
  }

  // Measure memory usage
  private measureMemoryUsage() {
    try {
      if (Platform.OS === 'web' && (performance as any).memory) {
        const memory = (performance as any).memory as MemoryInfo;

        this.recordMetric({
          name: 'memory_used',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          timestamp: Date.now(),
          context: 'memory',
        });

        this.recordMetric({
          name: 'memory_usage_percentage',
          value: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          unit: 'percentage',
          timestamp: Date.now(),
          context: 'memory',
        });

        // Alert on high memory usage
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
          this.recordMetric({
            name: 'high_memory_usage',
            value: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
            unit: 'percentage',
            timestamp: Date.now(),
            context: 'performance_alert',
          });
        }
      }
    } catch (error) {
      console.warn('Failed to measure memory usage:', error);
    }
  }

  // Measure app performance
  private measureAppPerformance() {
    try {
      // Measure React render performance
      const renderStart = performance.now();

      // Simulate a render measurement
      setTimeout(() => {
        const renderTime = performance.now() - renderStart;
        this.recordMetric({
          name: 'react_render_time',
          value: renderTime,
          unit: 'ms',
          timestamp: Date.now(),
          context: 'react_performance',
        });
      }, 0);

      // Measure storage performance
      this.measureStoragePerformance();
    } catch (error) {
      console.warn('Failed to measure app performance:', error);
    }
  }

  // Measure storage performance
  private async measureStoragePerformance() {
    try {
      const testKey = 'perf_test_key';
      const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });

      // Measure write performance
      const writeStart = performance.now();
      await AsyncStorage.setItem(testKey, testData);
      const writeTime = performance.now() - writeStart;

      this.recordMetric({
        name: 'storage_write_time',
        value: writeTime,
        unit: 'ms',
        timestamp: Date.now(),
        context: 'storage_performance',
      });

      // Measure read performance
      const readStart = performance.now();
      await AsyncStorage.getItem(testKey);
      const readTime = performance.now() - readStart;

      this.recordMetric({
        name: 'storage_read_time',
        value: readTime,
        unit: 'ms',
        timestamp: Date.now(),
        context: 'storage_performance',
      });

      // Clean up test data
      await AsyncStorage.removeItem(testKey);
    } catch (error) {
      console.warn('Failed to measure storage performance:', error);
    }
  }

  // Time a function execution
  async timeFunction<T>(name: string, fn: () => Promise<T> | T, context?: string): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.recordMetric({
        name: `function_${name}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: context || 'function_timing',
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.recordMetric({
        name: `function_${name}_error`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        context: 'function_error',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      throw error;
    }
  }

  // Mark a custom timing
  mark(name: string, context?: string) {
    if (Platform.OS === 'web' && performance.mark) {
      performance.mark(name);
    }

    this.recordMetric({
      name: `mark_${name}`,
      value: performance.now(),
      unit: 'ms',
      timestamp: Date.now(),
      context: context || 'custom_timing',
    });
  }

  // Measure between two marks
  measure(name: string, startMark: string, endMark: string, context?: string) {
    try {
      if (Platform.OS === 'web' && performance.measure) {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];

        if (measure) {
          this.recordMetric({
            name: `measure_${name}`,
            value: measure.duration,
            unit: 'ms',
            timestamp: Date.now(),
            context: context || 'custom_measure',
          });
        }
      }
    } catch (error) {
      console.warn('Failed to measure between marks:', error);
    }
  }

  // Check if metric is critical and needs immediate attention
  private isCriticalMetric(metric: PerformanceMetric): boolean {
    const criticalThresholds = {
      page_load_time: 3000,
      largest_contentful_paint: 2500,
      first_input_delay: 100,
      memory_usage_percentage: 90,
      network_request: 5000,
    };

    const threshold = criticalThresholds[metric.name as keyof typeof criticalThresholds];
    return threshold !== undefined && metric.value > threshold;
  }

  // Send metric to analytics service
  private async sendMetricToAnalytics(metric: PerformanceMetric) {
    try {
      await AnalyticsService.trackPerformance(
        metric.name,
        metric.value,
        metric.context || 'unknown',
      );
    } catch (error) {
      console.warn('Failed to send performance metric to analytics:', error);
    }
  }

  // Flush all metrics to analytics
  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    try {
      // Send metrics in batches
      const batchSize = 50;
      for (let i = 0; i < this.metrics.length; i += batchSize) {
        const batch = this.metrics.slice(i, i + batchSize);

        for (const metric of batch) {
          await this.sendMetricToAnalytics(metric);
        }
      }

      // Clear sent metrics
      this.metrics = [];

      console.log('Performance metrics flushed to analytics');
    } catch (error) {
      console.warn('Failed to flush performance metrics:', error);
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    totalMetrics: number;
    criticalIssues: number;
    averagePageLoad: number;
    memoryUsage: number;
    networkRequests: number;
  } {
    const criticalIssues = this.metrics.filter((m) => this.isCriticalMetric(m)).length;
    const pageLoadMetrics = this.metrics.filter((m) => m.name === 'page_load_time');
    const memoryMetrics = this.metrics.filter((m) => m.name === 'memory_usage_percentage');

    return {
      totalMetrics: this.metrics.length,
      criticalIssues,
      averagePageLoad:
        pageLoadMetrics.length > 0
          ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
          : 0,
      memoryUsage: memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0,
      networkRequests: this.networkMetrics.length,
    };
  }

  // Enable/disable performance monitoring
  async setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    await AsyncStorage.setItem('performance_monitoring_enabled', enabled.toString());

    if (!enabled) {
      // Clean up observers
      this.observers.forEach((observer) => observer.disconnect());
      this.observers = [];
    } else {
      // Reinitialize if enabling
      this.initialize();
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = [];
    this.networkMetrics = [];
  }

  // Cleanup
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.networkMetrics = [];
  }
}

export default PerformanceMonitor.getInstance();

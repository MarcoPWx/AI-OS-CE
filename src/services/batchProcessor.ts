/**
 * Batch Processing Service
 * Efficiently handles bulk operations for questions, analytics, and user data
 * Implements TDD principles with testable, modular design
 */

import { supabase } from './supabase';

// Types
export interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number; // ms
  retryAttempts: number;
  retryDelay: number; // ms
}

export interface BatchItem<T = any> {
  id: string;
  data: T;
  timestamp: number;
  retryCount?: number;
}

export interface BatchResult<T = any> {
  successful: BatchItem<T>[];
  failed: BatchItem<T>[];
  errors: Map<string, Error>;
}

// Default configurations
const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxBatchSize: 100,
  flushInterval: 5000, // 5 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Generic Batch Processor
 * Handles batching, queuing, and error recovery
 */
export class BatchProcessor<T = any> {
  private queue: BatchItem<T>[] = [];
  private config: BatchConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private processing = false;
  private processingPromise: Promise<BatchResult<T>> | null = null;
  private processFunction: (items: BatchItem<T>[]) => Promise<BatchResult<T>>;

  constructor(
    processFunction: (items: BatchItem<T>[]) => Promise<BatchResult<T>>,
    config: Partial<BatchConfig> = {},
  ) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
    this.processFunction = processFunction;
  }

  /**
   * Add item to batch queue
   */
  async add(data: T): Promise<void> {
    const item: BatchItem<T> = {
      id: this.generateId(),
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(item);

    // Auto-flush if batch size reached
    if (this.queue.length >= this.config.maxBatchSize) {
      await this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Add multiple items at once
   */
  async addBatch(items: T[]): Promise<void> {
    for (const item of items) {
      await this.add(item);
    }
  }

  /**
   * Process all queued items immediately
   */
  async flush(): Promise<BatchResult<T>> {
    // If already processing, await the in-flight processing result
    if (this.processing) {
      return (await this.processingPromise) || { successful: [], failed: [], errors: new Map() };
    }

    if (this.queue.length === 0) {
      return { successful: [], failed: [], errors: new Map() };
    }

    this.clearFlushTimer();
    this.processing = true;

    const itemsToProcess = [...this.queue];
    this.queue = [];

    this.processingPromise = (async () => {
      try {
        const result = await this.processFunction(itemsToProcess);

        // Handle retries for failed items
        if (result.failed.length > 0) {
          await this.handleRetries(result.failed);
        }

        return result;
      } finally {
        this.processing = false;
        // Keep last promise resolved value available for any late awaiters, but reset soon
        const last = this.processingPromise;
        // Reset promise on next tick to avoid holding references
        setTimeout(() => {
          if (this.processingPromise === last) this.processingPromise = null;
        }, 0);
      }
    })();

    return this.processingPromise;
  }

  /**
   * Schedule automatic flush
   */
  private scheduleFlush(): void {
    this.clearFlushTimer();
    this.flushTimer = setTimeout(() => {
      this.flush().catch(console.error);
    }, this.config.flushInterval);
  }

  /**
   * Clear flush timer
   */
  private clearFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Handle retry logic for failed items
   */
  private async handleRetries(failedItems: BatchItem<T>[]): Promise<void> {
    for (const item of failedItems) {
      if ((item.retryCount || 0) < this.config.retryAttempts) {
        item.retryCount = (item.retryCount || 0) + 1;

        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, item.retryCount - 1);

        setTimeout(() => {
          this.queue.push(item);
          this.scheduleFlush();
        }, delay);
      }
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear all queued items
   */
  clear(): void {
    this.queue = [];
    this.clearFlushTimer();
  }

  /**
   * Destroy processor and cleanup
   */
  destroy(): void {
    this.clear();
    this.processing = false;
  }
}

/**
 * Question Batch Processor
 * Efficiently fetches and caches questions in batches
 */
export class QuestionBatchProcessor {
  public processor: BatchProcessor<string>;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.processor = new BatchProcessor(this.processQuestions.bind(this), {
      maxBatchSize: 50,
      flushInterval: 2000,
    });
  }

  async fetchQuestion(questionId: string): Promise<any> {
    // Check cache first
    if (this.cache.has(questionId)) {
      return this.cache.get(questionId);
    }

    // Add to batch
    await this.processor.add(questionId);

    // Wait for batch to process
    await this.processor.flush();

    return this.cache.get(questionId);
  }

  private async processQuestions(items: BatchItem<string>[]): Promise<BatchResult<string>> {
    const questionIds = items.map((item) => item.data);

    try {
      const { data, error } = await supabase.from('questions').select('*').in('id', questionIds);

      if (error) throw error;

      // Cache results
      data?.forEach((question) => {
        this.cache.set(question.id, question);
      });

      return {
        successful: items,
        failed: [],
        errors: new Map(),
      };
    } catch (error) {
      return {
        successful: [],
        failed: items,
        errors: new Map(items.map((item) => [item.id, error as Error])),
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Analytics Batch Processor
 * Batches analytics events for efficient transmission
 */
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export class AnalyticsBatchProcessor {
  public processor: BatchProcessor<AnalyticsEvent>;

  constructor() {
    this.processor = new BatchProcessor(
      this.processAnalytics.bind(this),
      { maxBatchSize: 100, flushInterval: 10000 }, // 10 seconds
    );
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    await this.processor.add({
      event,
      properties,
      timestamp: Date.now(),
    });
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    await this.processor.add({
      event: 'identify',
      userId,
      properties,
      timestamp: Date.now(),
    });
  }

  private async processAnalytics(
    items: BatchItem<AnalyticsEvent>[],
  ): Promise<BatchResult<AnalyticsEvent>> {
    const events = items.map((item) => ({
      ...item.data,
      batch_id: item.id,
      batch_timestamp: item.timestamp,
    }));

    try {
      const { error } = await supabase.from('analytics_events').insert(events);

      if (error) throw error;

      return {
        successful: items,
        failed: [],
        errors: new Map(),
      };
    } catch (error) {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Analytics batch failed:', error);
      }

      return {
        successful: [],
        failed: items,
        errors: new Map(items.map((item) => [item.id, error as Error])),
      };
    }
  }

  async flush(): Promise<void> {
    await this.processor.flush();
  }
}

/**
 * User Data Sync Processor
 * Batches user data updates for efficient synchronization
 */
export interface UserDataUpdate {
  userId: string;
  field: string;
  value: any;
  operation?: 'set' | 'increment' | 'append';
}

export class UserDataSyncProcessor {
  public processor: BatchProcessor<UserDataUpdate>;
  private pendingUpdates: Map<string, UserDataUpdate[]> = new Map();

  constructor() {
    this.processor = new BatchProcessor(this.processSyncUpdates.bind(this), {
      maxBatchSize: 50,
      flushInterval: 3000,
    });
  }

  async updateUserData(update: UserDataUpdate): Promise<void> {
    await this.processor.add(update);
  }

  async syncUserProgress(userId: string, xp: number, level: number): Promise<void> {
    await this.processor.addBatch([
      { userId, field: 'xp', value: xp, operation: 'set' },
      { userId, field: 'level', value: level, operation: 'set' },
      { userId, field: 'last_updated', value: new Date().toISOString(), operation: 'set' },
    ]);
  }

  private async processSyncUpdates(
    items: BatchItem<UserDataUpdate>[],
  ): Promise<BatchResult<UserDataUpdate>> {
    // Group updates by user
    const updatesByUser = new Map<string, UserDataUpdate[]>();

    items.forEach((item) => {
      const update = item.data;
      if (!updatesByUser.has(update.userId)) {
        updatesByUser.set(update.userId, []);
      }
      updatesByUser.get(update.userId)!.push(update);
    });

    const successful: BatchItem<UserDataUpdate>[] = [];
    const failed: BatchItem<UserDataUpdate>[] = [];
    const errors = new Map<string, Error>();

    // Process each user's updates
    for (const [userId, updates] of updatesByUser) {
      try {
        // Build update object
        const updateObj: Record<string, any> = {};

        updates.forEach((update) => {
          switch (update.operation) {
            case 'increment':
              // Handle increment separately
              break;
            case 'append':
              // Handle array append
              break;
            default:
              updateObj[update.field] = update.value;
          }
        });

        const { error } = await supabase
          .from('user_profiles')
          .update(updateObj)
          .eq('user_id', userId);

        if (error) throw error;

        // Mark items as successful
        items
          .filter((item) => item.data.userId === userId)
          .forEach((item) => {
            successful.push(item);
          });
      } catch (error) {
        // Mark items as failed
        items
          .filter((item) => item.data.userId === userId)
          .forEach((item) => {
            failed.push(item);
            errors.set(item.id, error as Error);
          });
      }
    }

    return { successful, failed, errors };
  }

  async flush(): Promise<void> {
    await this.processor.flush();
  }
}

// Singleton instances
let questionProcessor: QuestionBatchProcessor | null = null;
let analyticsProcessor: AnalyticsBatchProcessor | null = null;
let userDataProcessor: UserDataSyncProcessor | null = null;

/**
 * Get or create singleton instances
 */
export function getQuestionProcessor(): QuestionBatchProcessor {
  if (!questionProcessor) {
    questionProcessor = new QuestionBatchProcessor();
  }
  return questionProcessor;
}

export function getAnalyticsProcessor(): AnalyticsBatchProcessor {
  if (!analyticsProcessor) {
    analyticsProcessor = new AnalyticsBatchProcessor();
  }
  return analyticsProcessor;
}

export function getUserDataProcessor(): UserDataSyncProcessor {
  if (!userDataProcessor) {
    userDataProcessor = new UserDataSyncProcessor();
  }
  return userDataProcessor;
}

/**
 * Flush all processors (useful for app lifecycle events)
 */
export async function flushAllProcessors(): Promise<void> {
  const promises: Promise<any>[] = [];

  if (questionProcessor) {
    promises.push(questionProcessor.processor.flush());
  }

  if (analyticsProcessor) {
    promises.push(analyticsProcessor.flush());
  }

  if (userDataProcessor) {
    promises.push(userDataProcessor.flush());
  }

  await Promise.all(promises);
}

// Auto-flush on app lifecycle events (React Native)
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  // Web environment
  window.addEventListener('beforeunload', () => {
    flushAllProcessors().catch(console.error);
  });

  // Visibility change (mobile web)
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        flushAllProcessors().catch(console.error);
      }
    });
  }
}

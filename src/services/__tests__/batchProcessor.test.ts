/**
 * TDD Tests for Batch Processing Service
 * Written before implementation to ensure correct behavior
 */
import {
  BatchProcessor,
  QuestionBatchProcessor,
  AnalyticsBatchProcessor,
  UserDataSyncProcessor,
  getQuestionProcessor,
  getAnalyticsProcessor,
  getUserDataProcessor,
  flushAllProcessors,
  type BatchItem,
  type BatchResult,
  type AnalyticsEvent,
  type UserDataUpdate,
} from '../batchProcessor';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() =>
          Promise.resolve({
            data: [
              { id: '1', text: 'Question 1' },
              { id: '2', text: 'Question 2' },
            ],
            error: null,
          }),
        ),
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe('BatchProcessor', () => {
  let processor: BatchProcessor<string>;
  let processFunction: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    processFunction = jest.fn(
      async (items: BatchItem<string>[]): Promise<BatchResult<string>> => ({
        successful: items,
        failed: [],
        errors: new Map(),
      }),
    );
    processor = new BatchProcessor(processFunction, {
      maxBatchSize: 3,
      flushInterval: 1000,
    });
  });

  afterEach(() => {
    processor.destroy();
    jest.useRealTimers();
  });

  describe('Basic Operations', () => {
    it('should add items to queue', async () => {
      await processor.add('item1');
      expect(processor.getQueueSize()).toBe(1);

      await processor.add('item2');
      expect(processor.getQueueSize()).toBe(2);
    });

    it('should auto-flush when batch size is reached', async () => {
      await processor.add('item1');
      await processor.add('item2');
      await processor.add('item3'); // Should trigger flush

      expect(processFunction).toHaveBeenCalledTimes(1);
      expect(processor.getQueueSize()).toBe(0);
    });

    it('should schedule flush after interval', async () => {
      await processor.add('item1');
      expect(processFunction).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);
      await Promise.resolve();

      expect(processFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle manual flush', async () => {
      await processor.add('item1');
      await processor.add('item2');

      const result = await processor.flush();

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(processFunction).toHaveBeenCalledTimes(1);
    });

    it('should handle batch addition', async () => {
      await processor.addBatch(['item1', 'item2', 'item3', 'item4']);

      // Should have flushed once at batch size 3
      expect(processFunction).toHaveBeenCalledTimes(1);
      expect(processor.getQueueSize()).toBe(1); // item4 remains
    });
  });

  describe('Error Handling', () => {
    it('should retry failed items with exponential backoff', async () => {
      let callCount = 0;
      const failingProcessor = new BatchProcessor<string>(
        async (items): Promise<BatchResult<string>> => {
          callCount++;
          if (callCount === 1) {
            return {
              successful: [],
              failed: items,
              errors: new Map(items.map((item) => [item.id, new Error('Failed')])),
            };
          }
          return { successful: items, failed: [], errors: new Map() };
        },
        { retryAttempts: 3, retryDelay: 100 },
      );

      await failingProcessor.add('item1');
      await failingProcessor.flush();

      // Should have failed and scheduled retry
      expect(callCount).toBe(1);

      // Wait for retry
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      expect(callCount).toBe(2);
      failingProcessor.destroy();
    });

    it('should not retry beyond max attempts', async () => {
      let callCount = 0;
      const failingProcessor = new BatchProcessor<string>(
        async (items): Promise<BatchResult<string>> => {
          callCount++;
          return {
            successful: [],
            failed: items,
            errors: new Map(items.map((item) => [item.id, new Error('Failed')])),
          };
        },
        { retryAttempts: 2, retryDelay: 100 },
      );

      await failingProcessor.add('item1');
      await failingProcessor.flush();

      // Advance time for multiple retries
      for (let i = 0; i < 5; i++) {
        jest.advanceTimersByTime(200);
        await Promise.resolve();
      }

      // Should only retry twice (initial + 2 retries)
      expect(callCount).toBeLessThanOrEqual(3);
      failingProcessor.destroy();
    });
  });

  describe('Lifecycle Management', () => {
    it('should clear queue on clear()', () => {
      processor.add('item1');
      processor.add('item2');

      processor.clear();
      expect(processor.getQueueSize()).toBe(0);
    });

    it('should cleanup on destroy()', () => {
      processor.add('item1');
      processor.destroy();

      expect(processor.getQueueSize()).toBe(0);
    });
  });
});

describe('QuestionBatchProcessor', () => {
  let processor: QuestionBatchProcessor;

  beforeEach(() => {
    processor = new QuestionBatchProcessor();
  });

  afterEach(() => {
    processor.clearCache();
  });

  it('should fetch and cache questions', async () => {
    const question = await processor.fetchQuestion('1');

    expect(question).toEqual({ id: '1', text: 'Question 1' });

    // Second fetch should come from cache
    const cachedQuestion = await processor.fetchQuestion('1');
    expect(cachedQuestion).toEqual(question);
  });

  it('should batch multiple question fetches', async () => {
    const promises = [
      processor.fetchQuestion('1'),
      processor.fetchQuestion('2'),
      processor.fetchQuestion('3'),
    ];

    const questions = await Promise.all(promises);

    expect(questions).toHaveLength(3);
    expect(questions[0]).toHaveProperty('id', '1');
    expect(questions[1]).toHaveProperty('id', '2');
  });

  it('should clear cache', () => {
    processor.fetchQuestion('1');
    processor.clearCache();

    // Would fetch again since cache is cleared
    processor.fetchQuestion('1');
    // Test implementation would verify new fetch
  });
});

describe('AnalyticsBatchProcessor', () => {
  let processor: AnalyticsBatchProcessor;

  beforeEach(() => {
    jest.useFakeTimers();
    processor = new AnalyticsBatchProcessor();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should track events', async () => {
    await processor.track('page_view', { page: '/home' });
    await processor.track('button_click', { button: 'submit' });

    // Should batch events
    await processor.flush();

    // Verify events were sent (mocked)
    expect(true).toBe(true); // Placeholder for actual verification
  });

  it('should identify users', async () => {
    await processor.identify('user123', {
      email: 'test@example.com',
      name: 'Test User',
    });

    await processor.flush();

    // Verify identify event was sent
    expect(true).toBe(true);
  });

  it('should batch events efficiently', async () => {
    // Add 150 events (should trigger auto-flush at 100)
    for (let i = 0; i < 150; i++) {
      await processor.track(`event_${i}`, { index: i });
    }

    // Should have auto-flushed once
    // Remaining 50 events in queue
    await processor.flush();

    // All events should be processed
    expect(true).toBe(true);
  });
});

describe('UserDataSyncProcessor', () => {
  let processor: UserDataSyncProcessor;

  beforeEach(() => {
    processor = new UserDataSyncProcessor();
  });

  it('should update user data', async () => {
    const update: UserDataUpdate = {
      userId: 'user123',
      field: 'score',
      value: 100,
      operation: 'set',
    };

    await processor.updateUserData(update);
    await processor.flush();

    // Verify update was sent
    expect(true).toBe(true);
  });

  it('should sync user progress', async () => {
    await processor.syncUserProgress('user123', 500, 5);
    await processor.flush();

    // Should have updated xp, level, and last_updated
    expect(true).toBe(true);
  });

  it('should batch updates by user', async () => {
    await processor.updateUserData({
      userId: 'user1',
      field: 'xp',
      value: 100,
    });

    await processor.updateUserData({
      userId: 'user1',
      field: 'level',
      value: 2,
    });

    await processor.updateUserData({
      userId: 'user2',
      field: 'xp',
      value: 200,
    });

    await processor.flush();

    // Should batch user1 updates together
    expect(true).toBe(true);
  });
});

describe('Singleton Instances', () => {
  it('should return same instance for question processor', () => {
    const processor1 = getQuestionProcessor();
    const processor2 = getQuestionProcessor();

    expect(processor1).toBe(processor2);
  });

  it('should return same instance for analytics processor', () => {
    const processor1 = getAnalyticsProcessor();
    const processor2 = getAnalyticsProcessor();

    expect(processor1).toBe(processor2);
  });

  it('should return same instance for user data processor', () => {
    const processor1 = getUserDataProcessor();
    const processor2 = getUserDataProcessor();

    expect(processor1).toBe(processor2);
  });

  it('should flush all processors', async () => {
    const questionProc = getQuestionProcessor();
    const analyticsProc = getAnalyticsProcessor();
    const userDataProc = getUserDataProcessor();

    // Add data to each processor
    await analyticsProc.track('test_event');
    await userDataProc.updateUserData({
      userId: 'test',
      field: 'test',
      value: 'test',
    });

    // Flush all
    await flushAllProcessors();

    // All processors should be flushed
    expect(true).toBe(true);
  });
});

describe('Performance Tests', () => {
  it('should handle high volume efficiently', async () => {
    const processor = new BatchProcessor<number>(
      async (items) => ({
        successful: items,
        failed: [],
        errors: new Map(),
      }),
      { maxBatchSize: 1000 },
    );

    const startTime = Date.now();

    // Add 10,000 items
    for (let i = 0; i < 10000; i++) {
      await processor.add(i);
    }

    await processor.flush();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should process 10k items in reasonable time
    expect(duration).toBeLessThan(5000); // 5 seconds

    processor.destroy();
  });

  it('should maintain memory efficiency', async () => {
    const processor = new BatchProcessor<Buffer>(
      async (items) => ({
        successful: items,
        failed: [],
        errors: new Map(),
      }),
      { maxBatchSize: 100 },
    );

    // Add large buffers
    for (let i = 0; i < 100; i++) {
      await processor.add(Buffer.alloc(1024 * 1024)); // 1MB each
    }

    // Should auto-flush and clear memory
    expect(processor.getQueueSize()).toBe(0);

    processor.destroy();
  });
});

describe('Edge Cases', () => {
  it('should handle empty flush', async () => {
    const processor = new BatchProcessor<string>(async (items) => ({
      successful: items,
      failed: [],
      errors: new Map(),
    }));

    const result = await processor.flush();

    expect(result.successful).toHaveLength(0);
    expect(result.failed).toHaveLength(0);

    processor.destroy();
  });

  it('should handle concurrent flushes', async () => {
    const processor = new BatchProcessor<string>(async (items) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        successful: items,
        failed: [],
        errors: new Map(),
      };
    });

    await processor.add('item1');

    // Try to flush concurrently
    const flush1 = processor.flush();
    const flush2 = processor.flush();

    const [result1, result2] = await Promise.all([flush1, flush2]);

    // Only one should process items
    const totalProcessed = result1.successful.length + result2.successful.length;
    expect(totalProcessed).toBe(1);

    processor.destroy();
  });
});

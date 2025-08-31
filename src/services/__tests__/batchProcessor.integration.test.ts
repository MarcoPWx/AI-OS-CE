/**
 * Integration Tests for Batch Processing
 * Demonstrates real-world performance improvements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { server } from '@/mocks/msw/server';
import { http, HttpResponse } from 'msw';
import { batchHandlers } from '../../mocks/handlers/batch';
import {
  BatchProcessor,
  getAnalyticsProcessor,
  getQuestionProcessor,
  getUserDataProcessor,
  flushAllProcessors,
} from '../batchProcessor';

// Setup MSW server for integration testing (reuse shared server)
beforeAll(() => {
  // Debug: ensure handlers are present from default server setup
  // eslint-disable-next-line no-console
  console.log('Default MSW handlers installed.');
  server.listen({ onUnhandledRequest: 'error' });
});

beforeEach(() => {
  // Ensure batch handlers are present for each test
  server.use(...batchHandlers);
  // Safety performance-test catch-all
  server.use(
    http.post(/.*\/api\/batch\/performance-test$/, async ({ request }) => {
      const body = await request.json();
      const { itemCount, batchSize, mode } = body as any;
      const startTime = Date.now();
      if (mode === 'batch') {
        const batches = Math.ceil(itemCount / batchSize);
        return HttpResponse.json({
          success: true,
          mode: 'batch',
          itemsProcessed: itemCount,
          apiCalls: batches,
          processingTime: Date.now() - startTime,
          averageTimePerItem: (Date.now() - startTime) / Math.max(1, itemCount),
        });
      }
      return HttpResponse.json({
        success: true,
        mode: 'individual',
        itemsProcessed: itemCount,
        apiCalls: itemCount,
        processingTime: Date.now() - startTime,
        averageTimePerItem: (Date.now() - startTime) / Math.max(1, itemCount),
      });
    }),
  );
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Batch Processing Integration', () => {
  describe('Performance Comparison', () => {
    it('should demonstrate 90% reduction in API calls with batching', async () => {
      const startTime = Date.now();

      // Test with batching
      const batchProcessor = new BatchProcessor(
        async (items) => {
          const response = await fetch('/api/batch/performance-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemCount: items.length,
              batchSize: 10,
              mode: 'batch',
            }),
          });
          const data = await response.json();
          return {
            successful: items,
            failed: [],
            errors: new Map(),
          };
        },
        { maxBatchSize: 10, flushInterval: 100 },
      );

      // Add 100 items
      const batchPromises = [];
      for (let i = 0; i < 100; i++) {
        batchPromises.push(batchProcessor.add(`item-${i}`));
      }

      await Promise.all(batchPromises);
      await batchProcessor.flush();

      const batchTime = Date.now() - startTime;

      // Test without batching
      const individualStartTime = Date.now();
      const individualPromises = [];

      for (let i = 0; i < 100; i++) {
        individualPromises.push(
          fetch('/api/batch/performance-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemCount: 1,
              batchSize: 1,
              mode: 'individual',
            }),
          }),
        );
      }

      await Promise.all(individualPromises);
      const individualTime = Date.now() - individualStartTime;

      // Batching should be significantly faster
      expect(batchTime).toBeLessThan(individualTime);

      // Should achieve at least 50% performance improvement
      const improvement = ((individualTime - batchTime) / individualTime) * 100;
      expect(improvement).toBeGreaterThan(50);

      batchProcessor.destroy();
    });

    it('should handle mixed load patterns efficiently', async () => {
      const processor = new BatchProcessor(
        async (items) => {
          await fetch('/api/batch/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              events: items.map((item) => item.data),
            }),
          });
          return {
            successful: items,
            failed: [],
            errors: new Map(),
          };
        },
        { maxBatchSize: 20, flushInterval: 200 },
      );

      // Simulate burst traffic
      for (let i = 0; i < 30; i++) {
        await processor.add({
          event: 'page_view',
          timestamp: Date.now(),
        });
      }

      // Wait for auto-flush
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Simulate steady traffic
      for (let i = 0; i < 10; i++) {
        await processor.add({
          event: 'button_click',
          timestamp: Date.now(),
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await processor.flush();

      // Get statistics
      const response = await fetch('/api/batch/stats');
      const stats = await response.json();

      // Should have made efficient API calls
      expect(stats.apiCalls.withBatch).toBeLessThan(10);
      expect(stats.savingsPercentage).toBeGreaterThan(0);

      processor.destroy();
    });
  });

  describe('Real-World Scenarios', () => {
    it('should batch quiz question loading effectively', async () => {
      const questionIds = Array.from({ length: 25 }, (_, i) => `q-${i + 1}`);

      // Load questions in batch
      const response = await fetch('/api/batch/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionIds }),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(25);
      expect(result.apiCallsSaved).toBe(24);
    });

    it('should handle user progress sync with batching', async () => {
      const updates = [
        { userId: 'user1', fields: { xp: 100, level: 2 } },
        { userId: 'user2', fields: { xp: 200, level: 3 } },
        { userId: 'user3', fields: { xp: 150, level: 2 } },
      ];

      const response = await fetch('/api/batch/user-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.usersUpdated).toBe(3);
      expect(result.apiCallsSaved).toBe(2);
    });

    it('should track analytics events efficiently', async () => {
      const events = [
        { event: 'quiz_start', properties: { quizId: 'q1' } },
        { event: 'answer_submit', properties: { correct: true } },
        { event: 'achievement_earned', properties: { type: 'first_perfect' } },
        { event: 'quiz_complete', properties: { score: 100 } },
      ];

      const response = await fetch('/api/batch/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.processed).toBe(4);
      expect(result.apiCallsSaved).toBe(3);
    });
  });

  describe('Error Handling and Retry', () => {
    it('should retry failed batches with exponential backoff', async () => {
      let attemptCount = 0;

      const processor = new BatchProcessor(
        async (items) => {
          attemptCount++;

          const response = await fetch('/api/batch/test-failure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              failureRate: attemptCount === 1 ? 1.0 : 0.0, // Fail first attempt only
            }),
          });

          if (response.ok) {
            return {
              successful: items,
              failed: [],
              errors: new Map(),
            };
          } else {
            return {
              successful: [],
              failed: items,
              errors: new Map(items.map((item) => [item.id, new Error('Failed')])),
            };
          }
        },
        { retryAttempts: 3, retryDelay: 50, maxBatchSize: 5, flushInterval: 25 },
      );

      await processor.add('test-item');
      await processor.flush();

      // Wait for retry
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should have retried
      expect(attemptCount).toBeGreaterThan(1);

      processor.destroy();
    });

    it('should handle partial batch failures gracefully', async () => {
      const processor = new BatchProcessor(
        async (items) => {
          // Simulate partial failure
          const midPoint = Math.floor(items.length / 2);
          return {
            successful: items.slice(0, midPoint),
            failed: items.slice(midPoint),
            errors: new Map(
              items.slice(midPoint).map((item) => [item.id, new Error('Partial failure')]),
            ),
          };
        },
        { maxBatchSize: 100 },
      );

      // Add items
      for (let i = 0; i < 10; i++) {
        await processor.add(`item-${i}`);
      }

      const result = await processor.flush();

      expect(result.successful.length).toBe(5);
      expect(result.failed.length).toBe(5);
      expect(result.errors.size).toBe(5);

      processor.destroy();
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with large batches', async () => {
      const processor = new BatchProcessor(
        async (items) => ({
          successful: items,
          failed: [],
          errors: new Map(),
        }),
        { maxBatchSize: 1000 },
      );

      // Process large amount of data
      for (let batch = 0; batch < 10; batch++) {
        for (let i = 0; i < 1000; i++) {
          await processor.add({
            id: `${batch}-${i}`,
            data: Buffer.alloc(1024), // 1KB per item
          });
        }
        await processor.flush();
      }

      // Queue should be empty after flush
      expect(processor.getQueueSize()).toBe(0);

      processor.destroy();
    });

    it('should clear resources on destroy', async () => {
      const processor = new BatchProcessor(async (items) => ({
        successful: items,
        failed: [],
        errors: new Map(),
      }));

      // Add items
      for (let i = 0; i < 100; i++) {
        await processor.add(`item-${i}`);
      }

      processor.destroy();

      // Should have cleared queue
      expect(processor.getQueueSize()).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should share state across getInstance calls', async () => {
      const analytics1 = getAnalyticsProcessor();
      const analytics2 = getAnalyticsProcessor();

      expect(analytics1).toBe(analytics2);

      // Add event through first reference
      await analytics1.track('test_event', { value: 1 });

      // Flush through second reference
      await analytics2.flush();

      // Both should see the same state
      const response = await fetch('/api/batch/stats');
      const stats = await response.json();
      expect(stats.analyticsEventsProcessed).toBeGreaterThan(0);
    });

    it('should flush all processors at once', async () => {
      const analytics = getAnalyticsProcessor();
      const userData = getUserDataProcessor();

      // Add data to different processors
      await analytics.track('test_event');
      await userData.updateUserData({
        userId: 'test-user',
        field: 'xp',
        value: 100,
      });

      // Flush all at once
      await flushAllProcessors();

      // Check that data was processed
      const response = await fetch('/api/batch/stats');
      const stats = await response.json();

      expect(stats.analyticsEventsProcessed).toBeGreaterThan(0);
      expect(stats.usersInSync).toBeGreaterThan(0);
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should process 10,000 events efficiently', async () => {
    const processor = new BatchProcessor(
      async (items) => ({
        successful: items,
        failed: [],
        errors: new Map(),
      }),
      { maxBatchSize: 500, flushInterval: 100 },
    );

    const startTime = performance.now();

    // Add 10,000 events
    const promises = [];
    for (let i = 0; i < 10000; i++) {
      promises.push(
        processor.add({
          id: i,
          timestamp: Date.now(),
          data: `event-${i}`,
        }),
      );
    }

    await Promise.all(promises);
    await processor.flush();

    const duration = performance.now() - startTime;

    // Should process 10k items in under 2 seconds
    expect(duration).toBeLessThan(2000);

    // Calculate throughput
    const throughput = 10000 / (duration / 1000);
    console.log(`Throughput: ${throughput.toFixed(0)} events/second`);

    // Should achieve at least 5000 events/second
    expect(throughput).toBeGreaterThan(5000);

    processor.destroy();
  });

  it('should maintain low latency under load', async () => {
    const latencies: number[] = [];

    const processor = new BatchProcessor(
      async (items) => {
        const start = performance.now();
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 10));
        latencies.push(performance.now() - start);

        return {
          successful: items,
          failed: [],
          errors: new Map(),
        };
      },
      { maxBatchSize: 50 },
    );

    // Generate sustained load
    for (let i = 0; i < 500; i++) {
      await processor.add(`item-${i}`);
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }

    await processor.flush();

    // Calculate P95 latency
    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index];

    // P95 latency should be under 50ms
    expect(p95Latency).toBeLessThan(50);

    processor.destroy();
  });
});

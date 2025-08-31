import { performance } from 'perf_hooks';
import { devQuizData, getRandomQuestions, getDailyChallenge } from '../../services/devQuizData';

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  dataLoading: 50,
  randomQuestionGeneration: 100,
  dailyChallengeRetrieval: 10,
  largeDataProcessing: 500,
  memoryUsage: 50 * 1024 * 1024, // 50MB
};

// Helper to measure execution time
const measureTime = async (fn: () => void | Promise<void>): Promise<number> => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Helper to measure memory usage
const measureMemory = (): number => {
  if (global.gc) {
    global.gc();
  }
  const usage = process.memoryUsage();
  return usage.heapUsed;
};

describe('Performance Benchmarks', () => {
  describe('Data Loading Performance', () => {
    it('should load quiz data within threshold', async () => {
      const time = await measureTime(() => {
        const data = devQuizData;
        expect(data).toBeDefined();
      });

      expect(time).toBeLessThan(THRESHOLDS.dataLoading);
      console.log(`Data loading time: ${time.toFixed(2)}ms`);
    });

    it('should access category data efficiently', async () => {
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const time = await measureTime(() => {
          const category = devQuizData.find((c) => c.id === 'javascript');
          expect(category).toBeDefined();
        });
        times.push(time);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(1); // Should be under 1ms average
      console.log(`Average category access time: ${avgTime.toFixed(4)}ms`);
    });

    it('should iterate through all questions efficiently', async () => {
      const time = await measureTime(() => {
        let questionCount = 0;
        devQuizData.forEach((category) => {
          category.questions.forEach((question) => {
            questionCount++;
          });
        });
        expect(questionCount).toBeGreaterThan(0);
      });

      expect(time).toBeLessThan(10);
      console.log(`Question iteration time: ${time.toFixed(2)}ms`);
    });
  });

  describe('Random Question Generation Performance', () => {
    it('should generate random questions within threshold', async () => {
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const time = await measureTime(() => {
          const questions = getRandomQuestions('javascript', 5);
          expect(questions.length).toBe(5);
        });
        times.push(time);
      }

      const maxTime = Math.max(...times);
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      expect(maxTime).toBeLessThan(THRESHOLDS.randomQuestionGeneration);
      console.log(
        `Random question generation - Avg: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`,
      );
    });

    it('should handle large question requests efficiently', async () => {
      const time = await measureTime(() => {
        const questions = getRandomQuestions('javascript', 1000);
        expect(questions.length).toBeGreaterThan(0);
      });

      expect(time).toBeLessThan(50);
      console.log(`Large question request time: ${time.toFixed(2)}ms`);
    });

    it('should scale linearly with request size', async () => {
      const sizes = [5, 10, 20, 50, 100];
      const times: { size: number; time: number }[] = [];

      for (const size of sizes) {
        const time = await measureTime(() => {
          getRandomQuestions('javascript', size);
        });
        times.push({ size, time });
      }

      // Check that time increases roughly linearly
      const ratios = times.slice(1).map((t, i) => t.time / times[i].time);

      // Ratios should be somewhat consistent (allowing for variance)
      const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
      ratios.forEach((ratio) => {
        expect(Math.abs(ratio - avgRatio)).toBeLessThan(avgRatio * 0.5);
      });

      console.log('Scaling performance:', times);
    });
  });

  describe('Daily Challenge Performance', () => {
    it('should retrieve daily challenge quickly', async () => {
      const times: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const time = await measureTime(() => {
          const challenge = getDailyChallenge();
          expect(challenge).toBeDefined();
        });
        times.push(time);
      }

      const maxTime = Math.max(...times);
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      expect(maxTime).toBeLessThan(THRESHOLDS.dailyChallengeRetrieval);
      console.log(`Daily challenge - Avg: ${avgTime.toFixed(4)}ms, Max: ${maxTime.toFixed(4)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory when loading data repeatedly', async () => {
      const initialMemory = measureMemory();

      // Load data multiple times
      for (let i = 0; i < 1000; i++) {
        const data = devQuizData;
        const questions = getRandomQuestions('javascript', 10);
        const challenge = getDailyChallenge();
      }

      const finalMemory = measureMemory();
      const memoryIncrease = finalMemory - initialMemory;

      expect(memoryIncrease).toBeLessThan(THRESHOLDS.memoryUsage);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });

    it('should handle large data operations without excessive memory', async () => {
      const initialMemory = measureMemory();

      // Create large arrays of questions
      const allQuestions: any[] = [];
      for (let i = 0; i < 100; i++) {
        devQuizData.forEach((category) => {
          allQuestions.push(...category.questions);
        });
      }

      const peakMemory = measureMemory();
      const memoryUsed = peakMemory - initialMemory;

      expect(memoryUsed).toBeLessThan(THRESHOLDS.memoryUsage * 2);
      console.log(`Peak memory usage: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('Search and Filter Performance', () => {
    it('should search questions by keyword efficiently', async () => {
      const time = await measureTime(() => {
        const results: any[] = [];
        const keyword = 'JavaScript';

        devQuizData.forEach((category) => {
          category.questions.forEach((question) => {
            if (
              question.question.toLowerCase().includes(keyword.toLowerCase()) ||
              question.explanation.toLowerCase().includes(keyword.toLowerCase())
            ) {
              results.push(question);
            }
          });
        });

        expect(results.length).toBeGreaterThan(0);
      });

      expect(time).toBeLessThan(50);
      console.log(`Question search time: ${time.toFixed(2)}ms`);
    });

    it('should filter questions by difficulty efficiently', async () => {
      const time = await measureTime(() => {
        const results: any[] = [];

        devQuizData.forEach((category) => {
          const filtered = category.questions.filter((q) => q.difficulty === 'medium');
          results.push(...filtered);
        });

        expect(results.length).toBeGreaterThan(0);
      });

      expect(time).toBeLessThan(20);
      console.log(`Difficulty filter time: ${time.toFixed(2)}ms`);
    });
  });

  describe('Batch Operations Performance', () => {
    it('should process multiple categories concurrently', async () => {
      const sequentialTime = await measureTime(async () => {
        for (const category of devQuizData) {
          await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async work
          getRandomQuestions(category.id, 5);
        }
      });

      const concurrentTime = await measureTime(async () => {
        await Promise.all(
          devQuizData.map(async (category) => {
            await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async work
            return getRandomQuestions(category.id, 5);
          }),
        );
      });

      // Concurrent should be faster
      expect(concurrentTime).toBeLessThan(sequentialTime);
      console.log(
        `Sequential: ${sequentialTime.toFixed(2)}ms, Concurrent: ${concurrentTime.toFixed(2)}ms`,
      );
    });

    it('should batch process questions efficiently', async () => {
      const batchSizes = [10, 50, 100, 500];
      const results: { batchSize: number; timePerItem: number }[] = [];

      for (const batchSize of batchSizes) {
        const time = await measureTime(() => {
          const batch = [];
          for (let i = 0; i < batchSize; i++) {
            batch.push(getRandomQuestions('javascript', 1)[0]);
          }
        });

        results.push({
          batchSize,
          timePerItem: time / batchSize,
        });
      }

      // Time per item should decrease with larger batches (economies of scale)
      const timePerItems = results.map((r) => r.timePerItem);
      for (let i = 1; i < timePerItems.length; i++) {
        expect(timePerItems[i]).toBeLessThanOrEqual(timePerItems[i - 1] * 1.5);
      }

      console.log('Batch processing efficiency:', results);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid successive calls', async () => {
      const time = await measureTime(async () => {
        const promises = [];
        for (let i = 0; i < 1000; i++) {
          promises.push(Promise.resolve(getRandomQuestions('javascript', 5)));
        }
        await Promise.all(promises);
      });

      expect(time).toBeLessThan(THRESHOLDS.largeDataProcessing);
      console.log(`1000 rapid calls completed in: ${time.toFixed(2)}ms`);
    });

    it('should maintain performance under load', async () => {
      const iterations = 100;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const time = await measureTime(() => {
          // Simulate heavy load
          for (let j = 0; j < 10; j++) {
            getRandomQuestions('javascript', 10);
            getDailyChallenge();
          }
        });
        times.push(time);
      }

      // Check that performance doesn't degrade over time
      const firstHalf = times.slice(0, iterations / 2);
      const secondHalf = times.slice(iterations / 2);

      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      // Second half shouldn't be significantly slower (within 20%)
      expect(avgSecond).toBeLessThan(avgFirst * 1.2);
      console.log(
        `Performance stability - First half: ${avgFirst.toFixed(2)}ms, Second half: ${avgSecond.toFixed(2)}ms`,
      );
    });
  });

  describe('Caching Performance', () => {
    it('should benefit from caching on repeated calls', async () => {
      // First call (cold)
      const coldTime = await measureTime(() => {
        getDailyChallenge();
      });

      // Subsequent calls (warm)
      const warmTimes: number[] = [];
      for (let i = 0; i < 100; i++) {
        const time = await measureTime(() => {
          getDailyChallenge();
        });
        warmTimes.push(time);
      }

      const avgWarmTime = warmTimes.reduce((a, b) => a + b, 0) / warmTimes.length;

      // Warm calls should be faster
      expect(avgWarmTime).toBeLessThan(coldTime);
      console.log(`Cold: ${coldTime.toFixed(4)}ms, Warm avg: ${avgWarmTime.toFixed(4)}ms`);
    });
  });
});

// Export performance report generator
export const generatePerformanceReport = async () => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
    },
    benchmarks: {} as any,
  };

  // Run benchmarks and collect results
  const benchmarks = [
    { name: 'dataLoading', fn: () => devQuizData },
    { name: 'randomQuestions', fn: () => getRandomQuestions('javascript', 10) },
    { name: 'dailyChallenge', fn: () => getDailyChallenge() },
  ];

  for (const benchmark of benchmarks) {
    const times: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const time = await measureTime(benchmark.fn);
      times.push(time);
    }

    report.benchmarks[benchmark.name] = {
      min: Math.min(...times),
      max: Math.max(...times),
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
      p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)],
      p99: times.sort((a, b) => a - b)[Math.floor(times.length * 0.99)],
    };
  }

  return report;
};

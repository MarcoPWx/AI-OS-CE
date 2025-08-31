import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

/**
 * Performance Monitoring Test Suite
 * Tests for animations, memory usage, bundle size, and runtime performance
 */

interface PerformanceMetrics {
  fps: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  resourceTimings: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
}

class PerformanceMonitor {
  private page: Page;
  private metrics: PerformanceMetrics[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async startMonitoring() {
    // Inject performance monitoring script
    await this.page.addInitScript(() => {
      // FPS monitoring
      let frameCount = 0;
      let lastTime = performance.now();
      const fpsHistory: number[] = [];

      const measureFPS = () => {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          fpsHistory.push(fps);
          frameCount = 0;
          lastTime = currentTime;

          // Store in window for retrieval
          (window as any).__fpsHistory = fpsHistory;
        }

        requestAnimationFrame(measureFPS);
      };

      requestAnimationFrame(measureFPS);

      // Memory monitoring (if available)
      if ((performance as any).memory) {
        setInterval(() => {
          (window as any).__memoryUsage = (performance as any).memory;
        }, 1000);
      }
    });
  }

  async collectMetrics(): Promise<PerformanceMetrics> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paintTimings = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      // Get LCP
      let largestContentfulPaint = 0;
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        largestContentfulPaint = lcpEntries[lcpEntries.length - 1].startTime;
      }

      // Get CLS
      let cumulativeLayoutShift = 0;
      const layoutShiftEntries = performance.getEntriesByType('layout-shift') as any[];
      layoutShiftEntries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      });

      // Get FID (simulated)
      let firstInputDelay = 0;
      const fidEntries = performance.getEntriesByType('first-input') as any[];
      if (fidEntries.length > 0) {
        firstInputDelay = fidEntries[0].processingStart - fidEntries[0].startTime;
      }

      return {
        fps: (window as any).__fpsHistory
          ? (window as any).__fpsHistory[(window as any).__fpsHistory.length - 1]
          : 0,
        memory: (window as any).__memoryUsage || {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
        },
        timing: {
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paintTimings.find((p) => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint:
            paintTimings.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
          largestContentfulPaint,
          firstInputDelay,
          cumulativeLayoutShift,
        },
        resourceTimings: resources.map((r) => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize,
          type: r.initiatorType,
        })),
      };
    });
  }

  async measureAnimationPerformance(duration: number = 5000): Promise<number[]> {
    const fpsReadings: number[] = [];
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
      const fps = await this.page.evaluate(() => {
        return (window as any).__fpsHistory
          ? (window as any).__fpsHistory[(window as any).__fpsHistory.length - 1]
          : 0;
      });

      fpsReadings.push(fps);
      await this.page.waitForTimeout(100);
    }

    return fpsReadings;
  }

  async checkMemoryLeaks(actions: () => Promise<void>, iterations: number = 5): Promise<boolean> {
    const memoryReadings: number[] = [];

    for (let i = 0; i < iterations; i++) {
      await actions();

      // Force garbage collection if available
      await this.page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      await this.page.waitForTimeout(1000);

      const memory = await this.page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      memoryReadings.push(memory);
    }

    // Check if memory consistently increases (potential leak)
    let increasingTrend = 0;
    for (let i = 1; i < memoryReadings.length; i++) {
      if (memoryReadings[i] > memoryReadings[i - 1]) {
        increasingTrend++;
      }
    }

    // If memory increases in more than 80% of iterations, possible leak
    return increasingTrend / (memoryReadings.length - 1) < 0.8;
  }
}

test.describe('⚡ Performance Monitoring Tests', () => {
  let monitor: PerformanceMonitor;

  test.beforeEach(async ({ page }) => {
    monitor = new PerformanceMonitor(page);
    await monitor.startMonitoring();
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const metrics = await monitor.collectMetrics();

      // LCP should be under 2.5s (good), 4s (needs improvement)
      expect(metrics.timing.largestContentfulPaint).toBeLessThan(2500);

      // FID should be under 100ms (good), 300ms (needs improvement)
      expect(metrics.timing.firstInputDelay).toBeLessThan(100);

      // CLS should be under 0.1 (good), 0.25 (needs improvement)
      expect(metrics.timing.cumulativeLayoutShift).toBeLessThan(0.1);

      // FCP should be under 1.8s
      expect(metrics.timing.firstContentfulPaint).toBeLessThan(1800);
    });

    test('should maintain performance during quiz flow', async ({ page }) => {
      const flowMetrics: PerformanceMetrics[] = [];

      // Home page
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      flowMetrics.push(await monitor.collectMetrics());

      // Categories
      await page.click('[data-testid="quiz-start-button"]');
      await page.waitForSelector('[data-testid="category-card"]');
      flowMetrics.push(await monitor.collectMetrics());

      // Quiz
      await page.click('[data-testid="category-card"]:first-child');
      await page.waitForSelector('[data-testid="question-text"]');
      flowMetrics.push(await monitor.collectMetrics());

      // Verify no significant degradation
      flowMetrics.forEach((metrics) => {
        expect(metrics.timing.firstContentfulPaint).toBeLessThan(2000);
      });
    });
  });

  test.describe('Animation Performance', () => {
    test('should maintain 60 FPS during animations', async ({ page }) => {
      await page.goto('/');

      // Trigger animations
      await page.click('[data-testid="quiz-start-button"]');

      // Measure FPS during transition
      const fpsReadings = await monitor.measureAnimationPerformance(3000);

      // Calculate average FPS
      const avgFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;

      // Should maintain at least 55 FPS average
      expect(avgFPS).toBeGreaterThan(55);

      // Check for frame drops
      const frameDrops = fpsReadings.filter((fps) => fps < 30).length;
      expect(frameDrops).toBeLessThan(2); // Allow max 2 frame drops
    });

    test('should handle complex animations smoothly', async ({ page }) => {
      await page.goto('/');

      // Simulate achievement animation
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('achievement-unlocked'));
      });

      // Measure during animation
      const fpsReadings = await monitor.measureAnimationPerformance(2000);

      // No severe frame drops
      const minFPS = Math.min(...fpsReadings);
      expect(minFPS).toBeGreaterThan(24); // Cinematic minimum
    });

    test('should optimize animations on low-end devices', async ({ page }) => {
      // Simulate low-end device with CPU throttling
      const client = await page.context().newCDPSession(page);
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');

      const fpsReadings = await monitor.measureAnimationPerformance(2000);
      const avgFPS = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;

      // Should still maintain playable framerate
      expect(avgFPS).toBeGreaterThan(30);
    });
  });

  test.describe('Memory Management', () => {
    test('should not have memory leaks during quiz sessions', async ({ page }) => {
      await page.goto('/');

      const noLeak = await monitor.checkMemoryLeaks(async () => {
        // Complete a quiz cycle
        await page.click('[data-testid="quiz-start-button"]');
        await page.click('[data-testid="category-card"]:first-child');

        // Answer questions
        for (let i = 0; i < 5; i++) {
          if ((await page.locator('[data-testid="answer-option"]').count()) > 0) {
            await page.click('[data-testid="answer-option"]:first-child');
            await page.click('[data-testid="next-button"]');
          }
        }

        // Go back to home
        await page.goto('/');
      }, 3);

      expect(noLeak).toBe(true);
    });

    test('should handle large data sets efficiently', async ({ page }) => {
      await page.goto('/');

      // Load categories (potentially large list)
      await page.click('[data-testid="quiz-start-button"]');

      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Scroll through categories
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(1000);

      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Memory increase should be reasonable (< 10MB)
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
      expect(memoryIncrease).toBeLessThan(10);
    });
  });

  test.describe('Bundle Size and Loading', () => {
    test('should have optimized bundle sizes', async ({ page }) => {
      await page.goto('/');

      const metrics = await monitor.collectMetrics();

      // Check JavaScript bundle sizes
      const jsResources = metrics.resourceTimings.filter(
        (r) => r.name.endsWith('.js') || r.type === 'script',
      );

      // Total JS should be under 500KB (gzipped)
      const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
      expect(totalJSSize).toBeLessThan(500 * 1024);

      // Check CSS bundle sizes
      const cssResources = metrics.resourceTimings.filter(
        (r) => r.name.endsWith('.css') || r.type === 'stylesheet',
      );

      // Total CSS should be under 100KB
      const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0);
      expect(totalCSSSize).toBeLessThan(100 * 1024);
    });

    test('should implement code splitting effectively', async ({ page }) => {
      // Load home page
      await page.goto('/');
      const homeMetrics = await monitor.collectMetrics();

      // Navigate to quiz (should load additional chunks)
      await page.click('[data-testid="quiz-start-button"]');
      await page.waitForSelector('[data-testid="category-card"]');

      const quizMetrics = await monitor.collectMetrics();

      // Check that new chunks were loaded
      const homeChunks = homeMetrics.resourceTimings.filter((r) => r.name.includes('chunk'));
      const quizChunks = quizMetrics.resourceTimings.filter((r) => r.name.includes('chunk'));

      // Should have loaded additional chunks
      expect(quizChunks.length).toBeGreaterThan(homeChunks.length);
    });

    test('should cache resources effectively', async ({ page }) => {
      // First load
      await page.goto('/');
      const firstLoadMetrics = await monitor.collectMetrics();

      // Second load (should use cache)
      await page.reload();
      const secondLoadMetrics = await monitor.collectMetrics();

      // Second load should be significantly faster
      expect(secondLoadMetrics.timing.loadComplete).toBeLessThan(
        firstLoadMetrics.timing.loadComplete * 0.5,
      );
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow 3G gracefully', async ({ page, context }) => {
      // Simulate slow 3G
      const client = await context.newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (750 * 1024) / 8, // 750 kbps
        uploadThroughput: (250 * 1024) / 8, // 250 kbps
        latency: 100,
      });

      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      // Should still load within 10 seconds on slow 3G
      expect(loadTime).toBeLessThan(10000);

      // Should show loading indicators
      const hasLoader = await page
        .locator('[data-testid="loading-spinner"], [data-testid="skeleton-loader"]')
        .isVisible();
      expect(hasLoader).toBe(true);
    });

    test('should implement progressive enhancement', async ({ page }) => {
      // Disable JavaScript
      await page.setJavaScriptEnabled(false);
      await page.goto('/');

      // Basic content should still be visible
      const hasContent = await page.locator('h1, h2, p').count();
      expect(hasContent).toBeGreaterThan(0);

      // Re-enable JavaScript
      await page.setJavaScriptEnabled(true);
      await page.reload();

      // Enhanced features should now work
      await expect(page.locator('[data-testid="quiz-start-button"]')).toBeVisible();
    });
  });

  test.describe('Runtime Performance', () => {
    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/');
      await page.click('[data-testid="quiz-start-button"]');
      await page.click('[data-testid="category-card"]:first-child');

      // Rapidly click answers
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        if ((await page.locator('[data-testid="answer-option"]').count()) > 0) {
          await page.click('[data-testid="answer-option"]:first-child');
          // Don't wait for animations
        }
      }
      const interactionTime = Date.now() - startTime;

      // Should handle rapid clicks without crashing
      await expect(
        page.locator('[data-testid="question-text"], [data-testid="results-container"]'),
      ).toBeVisible();

      // Should process quickly
      expect(interactionTime).toBeLessThan(5000);
    });

    test('should optimize React re-renders', async ({ page }) => {
      await page.goto('/');

      // Enable React DevTools Profiler (if available)
      await page.evaluate(() => {
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.forEach((renderer: any) => {
            renderer.startProfiling();
          });
        }
      });

      // Perform actions
      await page.click('[data-testid="quiz-start-button"]');
      await page.waitForSelector('[data-testid="category-card"]');

      // Check render count
      const renderData = await page.evaluate(() => {
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          const data: any[] = [];
          (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.forEach((renderer: any) => {
            const profilingData = renderer.stopProfiling();
            data.push(profilingData);
          });
          return data;
        }
        return null;
      });

      if (renderData) {
        // Analyze render performance
        console.log('React render data:', renderData);
      }
    });
  });

  test.describe('Resource Optimization', () => {
    test('should optimize images', async ({ page }) => {
      await page.goto('/');

      const metrics = await monitor.collectMetrics();
      const imageResources = metrics.resourceTimings.filter(
        (r) => r.type === 'image' || r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i),
      );

      imageResources.forEach((img) => {
        // Images should be reasonably sized
        expect(img.size).toBeLessThan(200 * 1024); // 200KB max per image

        // Should load quickly
        expect(img.duration).toBeLessThan(1000); // 1 second max
      });

      // Check for lazy loading
      const lazyImages = await page.$$eval('img[loading="lazy"]', (imgs) => imgs.length);
      expect(lazyImages).toBeGreaterThan(0);
    });

    test('should use efficient fonts', async ({ page }) => {
      await page.goto('/');

      const metrics = await monitor.collectMetrics();
      const fontResources = metrics.resourceTimings.filter((r) =>
        r.name.match(/\.(woff|woff2|ttf|otf)$/i),
      );

      // Should use modern font formats
      const woff2Fonts = fontResources.filter((f) => f.name.includes('.woff2'));
      expect(woff2Fonts.length).toBeGreaterThan(0);

      // Font files should be reasonable size
      fontResources.forEach((font) => {
        expect(font.size).toBeLessThan(100 * 1024); // 100KB max per font
      });
    });
  });
});

// Performance benchmark generator
export async function generatePerformanceReport(browser: Browser, urls: string[]): Promise<any> {
  const results: any[] = [];

  for (const url of urls) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const monitor = new PerformanceMonitor(page);

    await monitor.startMonitoring();
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const metrics = await monitor.collectMetrics();
    results.push({
      url,
      metrics,
      timestamp: new Date().toISOString(),
    });

    await context.close();
  }

  return {
    results,
    summary: {
      avgLCP:
        results.reduce((sum, r) => sum + r.metrics.timing.largestContentfulPaint, 0) /
        results.length,
      avgFCP:
        results.reduce((sum, r) => sum + r.metrics.timing.firstContentfulPaint, 0) / results.length,
      avgCLS:
        results.reduce((sum, r) => sum + r.metrics.timing.cumulativeLayoutShift, 0) /
        results.length,
    },
  };
}

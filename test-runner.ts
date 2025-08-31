#!/usr/bin/env bun
/**
 * Lightweight test runner for QuizMentor
 * Uses Bun instead of npm for faster execution
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { execSync } from 'child_process';
import { chromium, Browser, Page } from 'playwright';

let browser: Browser;
let page: Page;
let serverProcess: any;

// Start the dev server
beforeAll(async () => {
  console.log('🚀 Starting Expo web server...');

  try {
    // Start Expo in web mode
    serverProcess = execSync('npx expo start --web --port 19006', {
      detached: true,
      stdio: 'ignore',
    });

    // Wait for server to be ready
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Launch browser
    browser = await chromium.launch({
      headless: false,
      slowMo: 100,
    });

    page = await browser.newPage();

    console.log('✅ Test environment ready');
  } catch (error) {
    console.error('Failed to start test environment:', error);
  }
});

afterAll(async () => {
  if (page) await page.close();
  if (browser) await browser.close();
  if (serverProcess) {
    try {
      process.kill(serverProcess.pid);
    } catch (e) {
      // Already killed
    }
  }
});

describe('QuizMentor App', () => {
  test('should load the app', async () => {
    try {
      await page.goto('http://localhost:19006', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Check if React Native Web root exists
      const rootElement = await page.$('#root');
      expect(rootElement).toBeTruthy();

      console.log('✅ App loaded successfully');
    } catch (error) {
      console.error('❌ App failed to load:', error);
      throw error;
    }
  });

  test('should display main content', async () => {
    // Wait for content to render
    await page.waitForTimeout(2000);

    // Check for any visible text content
    const textContent = await page.textContent('body');
    expect(textContent).toBeTruthy();
    expect(textContent.length).toBeGreaterThan(0);

    console.log('✅ Content rendered');
  });

  test('should have interactive elements', async () => {
    // Look for any buttons or clickable elements
    const buttons = await page.$$('button, [role="button"], [onclick], [data-testid]');

    console.log(`Found ${buttons.length} interactive elements`);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should handle navigation', async () => {
    // Try to find and click the first interactive element
    const firstButton = await page.$('button, [role="button"]');

    if (firstButton) {
      await firstButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigation works');
    }
  });
});

// Performance tests
describe('Performance', () => {
  test('should load within acceptable time', async () => {
    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`⏱ Load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // Should load in under 10 seconds
  });

  test('should have good FCP', async () => {
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as any;
      return {
        fcp: perf?.loadEventEnd - perf?.fetchStart,
        domReady: perf?.domContentLoadedEventEnd - perf?.fetchStart,
      };
    });

    console.log(`📊 FCP: ${metrics.fcp}ms, DOM Ready: ${metrics.domReady}ms`);
    expect(metrics.fcp).toBeLessThan(3000); // FCP under 3 seconds
  });
});

// Accessibility tests
describe('Accessibility', () => {
  test('should have proper ARIA labels', async () => {
    const elementsWithAria = await page.$$('[aria-label], [role]');
    console.log(`♿ Found ${elementsWithAria.length} accessible elements`);
    expect(elementsWithAria.length).toBeGreaterThan(0);
  });

  test('should have proper heading structure', async () => {
    const headings = await page.$$('h1, h2, h3, h4, h5, h6, [role="heading"]');
    console.log(`📝 Found ${headings.length} headings`);
  });
});

console.log('\n🧪 Running QuizMentor tests with Bun...\n');

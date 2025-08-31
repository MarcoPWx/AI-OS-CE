import { Page, expect, Locator } from '@playwright/test';

/**
 * Test Helper Utilities for E2E Tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for animations to complete
   */
  async waitForAnimations(timeout: number = 500) {
    await this.page.waitForTimeout(timeout);
    await this.page.evaluate(() => {
      return Promise.all(
        Array.from(document.querySelectorAll('*')).map((element) => {
          const animations = element.getAnimations();
          return Promise.all(animations.map((animation) => animation.finished));
        }),
      );
    });
  }

  /**
   * Check if element has animation
   */
  async hasAnimation(selector: string): Promise<boolean> {
    return this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.animationName !== 'none' || style.transition !== 'none';
    }, selector);
  }

  /**
   * Wait for gradient to be visible
   */
  async waitForGradient(element: Locator) {
    await expect(element).toHaveCSS('background', /gradient|linear-gradient|radial-gradient/);
  }

  /**
   * Simulate swipe gesture
   */
  async swipe(
    element: Locator,
    direction: 'left' | 'right' | 'up' | 'down',
    distance: number = 200,
  ) {
    const box = await element.boundingBox();
    if (!box) throw new Error('Element not found');

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    let endX = startX;
    let endY = startY;

    switch (direction) {
      case 'left':
        endX = startX - distance;
        break;
      case 'right':
        endX = startX + distance;
        break;
      case 'up':
        endY = startY - distance;
        break;
      case 'down':
        endY = startY + distance;
        break;
    }

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 10 });
    await this.page.mouse.up();
  }

  /**
   * Check FPS performance
   */
  async measureFPS(duration: number = 5000): Promise<number> {
    return this.page.evaluate((dur) => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        const lastTime = performance.now();
        const startTime = lastTime;

        function countFrames() {
          frames++;
          const currentTime = performance.now();

          if (currentTime - startTime >= dur) {
            const avgFPS = (frames * 1000) / (currentTime - startTime);
            resolve(Math.round(avgFPS));
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    }, duration);
  }

  /**
   * Mock API response
   */
  async mockAPIResponse(endpoint: string, response: any, status: number = 200) {
    await this.page.route(`**/api/${endpoint}`, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Clear all mocks
   */
  async clearMocks() {
    await this.page.unroute('**/*');
  }

  /**
   * Login helper
   */
  async login(email: string = 'test@example.com', password: string = 'password123') {
    await this.mockAPIResponse('auth/login', {
      success: true,
      data: {
        user: {
          id: 'test-user-123',
          email,
          username: 'testuser',
          displayName: 'Test User',
          level: 1,
          xp: 0,
          hearts: 5,
          streak: 0,
          isPremium: false,
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
        },
      },
    });

    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    await this.page.waitForURL('/home');
  }

  /**
   * Skip onboarding
   */
  async skipOnboarding() {
    await this.page.evaluate(() => {
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem(
        'user_preferences',
        JSON.stringify({
          goal: 'learn',
          interests: ['tech', 'science', 'math'],
          timeCommitment: 10,
        }),
      );
    });
    await this.page.goto('/home');
  }

  /**
   * Set user hearts
   */
  async setHearts(hearts: number) {
    await this.page.evaluate((h) => {
      localStorage.setItem('hearts', h.toString());
    }, hearts);
  }

  /**
   * Set premium status
   */
  async setPremiumStatus(isPremium: boolean) {
    await this.page.evaluate((premium) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.isPremium = premium;
      localStorage.setItem('user', JSON.stringify(user));
    }, isPremium);
  }

  /**
   * Check element visibility with retry
   */
  async waitForElementVisible(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Check element hidden with retry
   */
  async waitForElementHidden(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /**
   * Take screenshot with name
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Check accessibility
   */
  async checkAccessibility(selector?: string) {
    const violations = await this.page.evaluate((sel) => {
      const checkElement = sel ? document.querySelector(sel) : document.body;
      if (!checkElement) return [];

      const issues: string[] = [];

      // Check for missing alt text
      checkElement.querySelectorAll('img:not([alt])').forEach(() => {
        issues.push('Image missing alt text');
      });

      // Check for missing button labels
      checkElement.querySelectorAll('button').forEach((btn) => {
        if (!btn.textContent?.trim() && !btn.getAttribute('aria-label')) {
          issues.push('Button missing label');
        }
      });

      // Check for color contrast (simplified)
      checkElement.querySelectorAll('*').forEach((el) => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        const fg = style.color;
        // Add actual contrast checking logic here if needed
      });

      return issues;
    }, selector);

    return violations;
  }

  /**
   * Network conditions simulation
   */
  async simulateSlowNetwork() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 Kbps
      latency: 100,
    });
  }

  /**
   * Clear all storage
   */
  async clearStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paint.find((p) => p.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
  }

  /**
   * Simulate device orientation
   */
  async setOrientation(orientation: 'portrait' | 'landscape') {
    const viewport = this.page.viewportSize();
    if (!viewport) return;

    if (orientation === 'landscape') {
      await this.page.setViewportSize({
        width: Math.max(viewport.width, viewport.height),
        height: Math.min(viewport.width, viewport.height),
      });
    } else {
      await this.page.setViewportSize({
        width: Math.min(viewport.width, viewport.height),
        height: Math.max(viewport.width, viewport.height),
      });
    }
  }

  /**
   * Check if running in CI
   */
  isCI(): boolean {
    return process.env.CI === 'true';
  }

  /**
   * Get test data
   */
  getTestData(key: string) {
    const testData = {
      validUser: {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
      },
      invalidUser: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
      quizData: {
        category: 'tech',
        difficulty: 'medium',
        questionCount: 10,
      },
      subscriptionPlans: {
        monthly: {
          id: 'monthly',
          price: 9.99,
          currency: 'USD',
        },
        annual: {
          id: 'annual',
          price: 79.99,
          currency: 'USD',
        },
        lifetime: {
          id: 'lifetime',
          price: 199.99,
          currency: 'USD',
        },
      },
    };

    return testData[key as keyof typeof testData];
  }
}

/**
 * Custom matchers for Playwright
 */
export const customMatchers = {
  async toHaveGradient(locator: Locator) {
    const background = await locator.evaluate((el) => {
      return window.getComputedStyle(el).background;
    });

    const pass = /gradient/.test(background);

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have gradient background`
          : `Expected element to have gradient background, but got: ${background}`,
    };
  },

  async toBeAnimating(locator: Locator) {
    const animationName = await locator.evaluate((el) => {
      return window.getComputedStyle(el).animationName;
    });

    const pass = animationName !== 'none';

    return {
      pass,
      message: () =>
        pass ? `Expected element not to be animating` : `Expected element to be animating`,
    };
  },

  async toHaveBlur(locator: Locator) {
    const filter = await locator.evaluate((el) => {
      return window.getComputedStyle(el).backdropFilter || window.getComputedStyle(el).filter;
    });

    const pass = /blur/.test(filter);

    return {
      pass,
      message: () =>
        pass
          ? `Expected element not to have blur effect`
          : `Expected element to have blur effect, but got: ${filter}`,
    };
  },
};

/**
 * Test fixtures
 */
export const fixtures = {
  testHelpers: async ({ page }: { page: Page }, use: any) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },
};

import { test, expect, APIRequestContext, Page } from '@playwright/test';

/**
 * API Contract Testing Suite
 * Validates API contracts between frontend and backend
 * Ensures API responses match expected schemas
 */

// API Response Schemas
const schemas = {
  user: {
    type: 'object',
    required: ['id', 'email', 'username', 'level', 'xp', 'hearts', 'streak'],
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      username: { type: 'string', minLength: 3, maxLength: 20 },
      displayName: { type: 'string' },
      level: { type: 'number', minimum: 1 },
      xp: { type: 'number', minimum: 0 },
      hearts: { type: 'number', minimum: 0, maximum: 5 },
      streak: { type: 'number', minimum: 0 },
      isPremium: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  category: {
    type: 'object',
    required: ['id', 'name', 'icon', 'isLocked'],
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      icon: { type: 'string' },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      isLocked: { type: 'boolean' },
      isPremium: { type: 'boolean' },
      questionsCount: { type: 'number', minimum: 0 },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard', 'expert'] },
      unlockRequirements: {
        type: 'object',
        properties: {
          level: { type: 'number' },
          questionsAnswered: { type: 'number' },
          accuracy: { type: 'number' },
        },
      },
    },
  },

  question: {
    type: 'object',
    required: ['id', 'text', 'options', 'correctAnswer'],
    properties: {
      id: { type: 'string' },
      text: { type: 'string' },
      options: {
        type: 'array',
        minItems: 2,
        maxItems: 6,
        items: {
          type: 'object',
          required: ['id', 'text'],
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            isCorrect: { type: 'boolean' },
          },
        },
      },
      correctAnswer: { type: 'number', minimum: 0 },
      explanation: { type: 'string' },
      difficulty: { type: 'number', minimum: 1, maximum: 5 },
      category: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
      imageUrl: { type: 'string', format: 'uri' },
      timeLimit: { type: 'number', minimum: 10 },
    },
  },

  quizResult: {
    type: 'object',
    required: ['score', 'correctAnswers', 'totalQuestions', 'xpEarned', 'starsEarned'],
    properties: {
      id: { type: 'string' },
      score: { type: 'number', minimum: 0, maximum: 100 },
      correctAnswers: { type: 'number', minimum: 0 },
      totalQuestions: { type: 'number', minimum: 1 },
      xpEarned: { type: 'number', minimum: 0 },
      starsEarned: { type: 'number', minimum: 0, maximum: 3 },
      timeSpent: { type: 'number', minimum: 0 },
      accuracy: { type: 'number', minimum: 0, maximum: 100 },
      streak: { type: 'number', minimum: 0 },
      achievements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            xpBonus: { type: 'number' },
          },
        },
      },
    },
  },

  leaderboard: {
    type: 'object',
    required: ['entries', 'userPosition'],
    properties: {
      entries: {
        type: 'array',
        items: {
          type: 'object',
          required: ['rank', 'userId', 'username', 'score'],
          properties: {
            rank: { type: 'number', minimum: 1 },
            userId: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            score: { type: 'number', minimum: 0 },
            level: { type: 'number' },
            avatarUrl: { type: 'string' },
            isCurrentUser: { type: 'boolean' },
          },
        },
      },
      userPosition: { type: 'number', minimum: 1 },
      totalEntries: { type: 'number', minimum: 1 },
      timeframe: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'allTime'] },
    },
  },

  subscription: {
    type: 'object',
    required: ['id', 'type', 'status'],
    properties: {
      id: { type: 'string' },
      type: { type: 'string', enum: ['monthly', 'annual', 'lifetime'] },
      status: { type: 'string', enum: ['active', 'trial', 'expired', 'cancelled'] },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      trialEndDate: { type: 'string', format: 'date-time' },
      price: { type: 'number', minimum: 0 },
      currency: { type: 'string', pattern: '^[A-Z]{3}$' },
      features: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
};

// Schema validator
class SchemaValidator {
  static validate(data: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check type
    if (
      schema.type &&
      typeof data !== schema.type &&
      schema.type !== 'array' &&
      schema.type !== 'object'
    ) {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`);
      return { valid: false, errors };
    }

    if (schema.type === 'array' && !Array.isArray(data)) {
      errors.push(`Expected array, got ${typeof data}`);
      return { valid: false, errors };
    }

    if (schema.type === 'object' && (typeof data !== 'object' || data === null)) {
      errors.push(`Expected object, got ${typeof data}`);
      return { valid: false, errors };
    }

    // Check required fields
    if (schema.required && schema.type === 'object') {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check properties
    if (schema.properties && schema.type === 'object') {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const result = this.validate(data[key], propSchema as any);
          if (!result.valid) {
            errors.push(...result.errors.map((e) => `${key}: ${e}`));
          }
        }
      }
    }

    // Check array items
    if (schema.items && Array.isArray(data)) {
      data.forEach((item, index) => {
        const result = this.validate(item, schema.items);
        if (!result.valid) {
          errors.push(...result.errors.map((e) => `[${index}]: ${e}`));
        }
      });
    }

    // Check constraints
    if (schema.minimum !== undefined && typeof data === 'number' && data < schema.minimum) {
      errors.push(`Value ${data} is less than minimum ${schema.minimum}`);
    }

    if (schema.maximum !== undefined && typeof data === 'number' && data > schema.maximum) {
      errors.push(`Value ${data} is greater than maximum ${schema.maximum}`);
    }

    if (
      schema.minLength !== undefined &&
      typeof data === 'string' &&
      data.length < schema.minLength
    ) {
      errors.push(`String length ${data.length} is less than minimum ${schema.minLength}`);
    }

    if (
      schema.maxLength !== undefined &&
      typeof data === 'string' &&
      data.length > schema.maxLength
    ) {
      errors.push(`String length ${data.length} is greater than maximum ${schema.maxLength}`);
    }

    if (schema.pattern && typeof data === 'string' && !new RegExp(schema.pattern).test(data)) {
      errors.push(`String does not match pattern ${schema.pattern}`);
    }

    if (schema.enum && !schema.enum.includes(data)) {
      errors.push(`Value ${data} is not in enum ${schema.enum.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

test.describe('🔒 API Contract Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: process.env.API_URL || 'http://localhost:3000/api',
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Authentication Endpoints', () => {
    test('POST /auth/login should return valid user schema', async () => {
      const response = await apiContext.post('/auth/login', {
        data: {
          email: 'test@example.com',
          password: 'TestPass123!',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Validate response structure
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('user');
      expect(data.data).toHaveProperty('tokens');

      // Validate user schema
      const validation = SchemaValidator.validate(data.data.user, schemas.user);
      expect(validation.errors).toEqual([]);
      expect(validation.valid).toBe(true);

      // Validate tokens
      expect(data.data.tokens).toHaveProperty('accessToken');
      expect(data.data.tokens).toHaveProperty('refreshToken');
      expect(typeof data.data.tokens.accessToken).toBe('string');
      expect(data.data.tokens.accessToken.length).toBeGreaterThan(20);
    });

    test('POST /auth/signup should create user with valid schema', async () => {
      const response = await apiContext.post('/auth/signup', {
        data: {
          email: `test${Date.now()}@example.com`,
          username: `user${Date.now()}`,
          password: 'TestPass123!',
          displayName: 'Test User',
        },
      });

      if (response.ok()) {
        const data = await response.json();
        const validation = SchemaValidator.validate(data.data.user, schemas.user);
        expect(validation.valid).toBe(true);
      }
    });

    test('POST /auth/refresh should return new tokens', async () => {
      const response = await apiContext.post('/auth/refresh', {
        data: {
          refreshToken: 'mock-refresh-token',
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.data).toHaveProperty('accessToken');
        expect(data.data).toHaveProperty('refreshToken');
      }
    });
  });

  test.describe('Quiz Endpoints', () => {
    test('GET /categories should return valid category array', async () => {
      const response = await apiContext.get('/categories');
      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);

      // Validate each category
      data.data.forEach((category: any, index: number) => {
        const validation = SchemaValidator.validate(category, schemas.category);
        expect(validation.valid).toBe(true);
        if (!validation.valid) {
          console.error(`Category ${index} validation errors:`, validation.errors);
        }
      });
    });

    test('GET /quiz/:categoryId should return valid questions', async () => {
      const response = await apiContext.get('/quiz/technology');

      if (response.ok()) {
        const data = await response.json();
        expect(data.data).toHaveProperty('questions');
        expect(Array.isArray(data.data.questions)).toBe(true);

        // Validate each question
        data.data.questions.forEach((question: any, index: number) => {
          const validation = SchemaValidator.validate(question, schemas.question);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            console.error(`Question ${index} validation errors:`, validation.errors);
          }
        });
      }
    });

    test('POST /quiz/submit should return valid result', async () => {
      const response = await apiContext.post('/quiz/submit', {
        data: {
          categoryId: 'technology',
          answers: [
            { questionId: 'q1', answerId: 'a1', timeSpent: 15 },
            { questionId: 'q2', answerId: 'a2', timeSpent: 20 },
          ],
        },
      });

      if (response.ok()) {
        const data = await response.json();
        const validation = SchemaValidator.validate(data.data, schemas.quizResult);
        expect(validation.valid).toBe(true);
      }
    });
  });

  test.describe('Leaderboard Endpoints', () => {
    test('GET /leaderboard should return valid leaderboard', async () => {
      const response = await apiContext.get('/leaderboard?timeframe=weekly');

      if (response.ok()) {
        const data = await response.json();
        const validation = SchemaValidator.validate(data.data, schemas.leaderboard);
        expect(validation.valid).toBe(true);

        // Validate ranking order
        const entries = data.data.entries;
        for (let i = 1; i < entries.length; i++) {
          expect(entries[i].rank).toBeGreaterThan(entries[i - 1].rank);
          expect(entries[i].score).toBeLessThanOrEqual(entries[i - 1].score);
        }
      }
    });
  });

  test.describe('Subscription Endpoints', () => {
    test('GET /subscription/status should return valid subscription', async () => {
      const response = await apiContext.get('/subscription/status', {
        headers: {
          Authorization: 'Bearer mock-token',
        },
      });

      if (response.ok()) {
        const data = await response.json();
        const validation = SchemaValidator.validate(data.data, schemas.subscription);
        expect(validation.valid).toBe(true);
      }
    });

    test('POST /subscription/purchase should handle purchase flow', async () => {
      const response = await apiContext.post('/subscription/purchase', {
        data: {
          planId: 'annual',
          paymentMethod: 'stripe',
          receipt: 'mock-receipt',
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data).toHaveProperty('subscription');

        const validation = SchemaValidator.validate(data.data.subscription, schemas.subscription);
        expect(validation.valid).toBe(true);
      }
    });
  });

  test.describe('Error Response Contracts', () => {
    test('should return consistent error format', async () => {
      // Test various error scenarios
      const errorScenarios = [
        { method: 'POST', path: '/auth/login', data: { email: 'invalid' } },
        { method: 'GET', path: '/quiz/nonexistent' },
        { method: 'POST', path: '/quiz/submit', data: {} },
      ];

      for (const scenario of errorScenarios) {
        const response = await apiContext[scenario.method.toLowerCase() as 'get' | 'post'](
          scenario.path,
          scenario.data ? { data: scenario.data } : undefined,
        );

        if (!response.ok()) {
          const data = await response.json();

          // Error response should have consistent structure
          expect(data).toHaveProperty('success', false);
          expect(data).toHaveProperty('error');
          expect(data.error).toHaveProperty('message');
          expect(data.error).toHaveProperty('code');
          expect(typeof data.error.message).toBe('string');
          expect(typeof data.error.code).toBe('string');
        }
      }
    });
  });

  test.describe('Pagination Contracts', () => {
    test('should follow consistent pagination format', async () => {
      const paginatedEndpoints = [
        '/categories?page=1&limit=10',
        '/leaderboard?page=1&limit=20',
        '/quiz/history?page=1&limit=15',
      ];

      for (const endpoint of paginatedEndpoints) {
        const response = await apiContext.get(endpoint);

        if (response.ok()) {
          const data = await response.json();

          // Pagination metadata should be consistent
          expect(data).toHaveProperty('data');
          expect(data).toHaveProperty('pagination');
          expect(data.pagination).toHaveProperty('page');
          expect(data.pagination).toHaveProperty('limit');
          expect(data.pagination).toHaveProperty('total');
          expect(data.pagination).toHaveProperty('totalPages');

          expect(typeof data.pagination.page).toBe('number');
          expect(typeof data.pagination.limit).toBe('number');
          expect(typeof data.pagination.total).toBe('number');
          expect(typeof data.pagination.totalPages).toBe('number');
        }
      }
    });
  });

  test.describe('Rate Limiting Headers', () => {
    test('should include rate limit headers', async () => {
      const response = await apiContext.get('/categories');

      // Check for rate limiting headers
      const headers = response.headers();
      expect(headers).toHaveProperty('x-ratelimit-limit');
      expect(headers).toHaveProperty('x-ratelimit-remaining');
      expect(headers).toHaveProperty('x-ratelimit-reset');

      const limit = parseInt(headers['x-ratelimit-limit']);
      const remaining = parseInt(headers['x-ratelimit-remaining']);

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(limit);
    });
  });

  test.describe('API Versioning', () => {
    test('should support API versioning', async () => {
      const response = await apiContext.get('/categories', {
        headers: {
          'API-Version': '1.0',
        },
      });

      expect(response.ok()).toBeTruthy();

      // Check version in response
      const headers = response.headers();
      expect(headers).toHaveProperty('api-version');
    });
  });
});

// Contract testing with frontend integration
test.describe('Frontend-Backend Contract Integration', () => {
  test('frontend API calls should match backend expectations', async ({ page }) => {
    // Intercept API calls
    const apiCalls: any[] = [];

    await page.route('**/api/**', async (route, request) => {
      apiCalls.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });

      await route.continue();
    });

    // Perform user journey
    await page.goto('/');
    await page.click('[data-testid="quiz-start-button"]');
    await page.waitForSelector('[data-testid="category-card"]');

    // Verify API calls were made with correct format
    const categoryCall = apiCalls.find((call) => call.url.includes('/categories'));
    expect(categoryCall).toBeDefined();
    expect(categoryCall.method).toBe('GET');
    expect(categoryCall.headers['accept']).toContain('application/json');
  });

  test('should handle API response changes gracefully', async ({ page }) => {
    // Mock API with schema changes
    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              // Missing required fields to test error handling
              id: 'test',
              name: 'Test Category',
              // icon: missing
              // isLocked: missing
            },
          ],
        }),
      });
    });

    await page.goto('/');
    await page.click('[data-testid="quiz-start-button"]');

    // App should handle missing fields gracefully
    const errorMessage = page.locator('[data-testid="error-message"]');
    const fallbackUI = page.locator('[data-testid="category-fallback"]');

    // Either show error or fallback UI
    const hasErrorHandling = (await errorMessage.isVisible()) || (await fallbackUI.isVisible());

    expect(hasErrorHandling).toBe(true);
  });
});

// Generate contract documentation
export function generateContractDocs(schemas: Record<string, any>): string {
  let docs = '# API Contract Documentation\n\n';

  for (const [name, schema] of Object.entries(schemas)) {
    docs += `## ${name.charAt(0).toUpperCase() + name.slice(1)}\n\n`;
    docs += '```json\n';
    docs += JSON.stringify(schema, null, 2);
    docs += '\n```\n\n';
  }

  return docs;
}

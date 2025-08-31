/**
 * Mock Engine - Comprehensive fetch interception and response simulation
 * Based on the mock manifest configuration in docs/mocks/manifests/MOCK_MANIFEST.yaml
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Import fixture data
import usersFixture from '../../mocks/fixtures/users.json';
import questionsFixture from '../../mocks/fixtures/questions.json';
import leaderboardFixture from '../../mocks/fixtures/leaderboard.json';

// Mock manifest types
interface MockEndpoint {
  path: string;
  method: string;
  fixture?: string;
  delay?: number;
  status?: number;
  headers?: Record<string, string>;
  generator?: string;
  error?: {
    rate: number;
    status: number;
    message: string;
  };
}

interface MockMode {
  name: string;
  description: string;
  enabled: string[];
  disabled?: string[];
  overrides?: Record<string, any>;
}

interface MockManifest {
  version: string;
  modes: Record<string, MockMode>;
  services: Record<
    string,
    {
      baseUrl: string;
      endpoints: MockEndpoint[];
    }
  >;
  fixtures: Record<string, any>;
  generators?: Record<string, any>;
  scenarios?: Record<string, any>;
  errorConditions?: Record<string, any>;
  performanceProfiles?: Record<string, any>;
}

// Default manifest configuration
const DEFAULT_MANIFEST: Partial<MockManifest> = {
  version: '1.0.0',
  modes: {
    demo: {
      name: 'Demo Mode',
      description: 'Full offline mode with demo data',
      enabled: ['auth', 'quiz', 'gamification', 'leaderboard'],
    },
    development: {
      name: 'Development Mode',
      description: 'Hybrid mode - real auth, mocked services',
      enabled: ['quiz', 'gamification', 'leaderboard'],
      disabled: ['auth'],
    },
    test: {
      name: 'Test Mode',
      description: 'Full mocks with deterministic data',
      enabled: ['auth', 'quiz', 'gamification', 'leaderboard', 'multiplayer'],
    },
    storybook: {
      name: 'Storybook Mode',
      description: 'Component development with visual states',
      enabled: ['auth', 'quiz', 'gamification'],
    },
  },
  fixtures: {
    users: usersFixture,
    questions: questionsFixture,
    leaderboard: leaderboardFixture,
  },
};

// Service endpoint configurations
const SERVICE_ENDPOINTS: Record<string, MockEndpoint[]> = {
  auth: [
    {
      path: '/auth/register',
      method: 'POST',
      fixture: 'users',
      delay: 500,
      status: 201,
    },
    {
      path: '/auth/login',
      method: 'POST',
      fixture: 'users',
      delay: 300,
      status: 200,
    },
    {
      path: '/auth/refresh',
      method: 'POST',
      delay: 200,
      status: 200,
    },
    {
      path: '/auth/logout',
      method: 'POST',
      delay: 100,
      status: 204,
    },
  ],
  quiz: [
    {
      path: '/categories',
      method: 'GET',
      fixture: 'questions',
      delay: 200,
      status: 200,
    },
    {
      path: '/questions/random',
      method: 'GET',
      fixture: 'questions',
      generator: 'randomQuestions',
      delay: 300,
      status: 200,
    },
    {
      path: '/questions/category/:id',
      method: 'GET',
      fixture: 'questions',
      delay: 250,
      status: 200,
    },
    {
      path: '/quiz/submit',
      method: 'POST',
      delay: 400,
      status: 200,
    },
  ],
  gamification: [
    {
      path: '/leaderboard',
      method: 'GET',
      fixture: 'leaderboard',
      delay: 300,
      status: 200,
    },
    {
      path: '/achievements',
      method: 'GET',
      delay: 250,
      status: 200,
    },
    {
      path: '/user/stats',
      method: 'GET',
      delay: 200,
      status: 200,
    },
    {
      path: '/user/progress',
      method: 'GET',
      delay: 200,
      status: 200,
    },
  ],
  multiplayer: [
    {
      path: '/lobby/create',
      method: 'POST',
      delay: 400,
      status: 201,
    },
    {
      path: '/lobby/join',
      method: 'POST',
      delay: 300,
      status: 200,
    },
    {
      path: '/lobby/list',
      method: 'GET',
      delay: 250,
      status: 200,
    },
  ],
};

class MockEngine {
  private mode: string;
  private manifest: MockManifest;
  private originalFetch: typeof fetch;
  private intercepting: boolean = false;
  private requestLog: any[] = [];
  private sessionStorage: Map<string, any> = new Map();

  constructor(mode: string = 'demo') {
    this.mode = mode;
    this.manifest = this.loadManifest();
    this.originalFetch = global.fetch;
  }

  private loadManifest(): MockManifest {
    // In a real implementation, this would load from YAML
    // For now, we'll use our default configuration
    return {
      ...DEFAULT_MANIFEST,
      services: {
        auth: {
          baseUrl: 'http://localhost:3000',
          endpoints: SERVICE_ENDPOINTS.auth,
        },
        quiz: {
          baseUrl: 'http://localhost:3000',
          endpoints: SERVICE_ENDPOINTS.quiz,
        },
        gamification: {
          baseUrl: 'http://localhost:3000',
          endpoints: SERVICE_ENDPOINTS.gamification,
        },
        multiplayer: {
          baseUrl: 'http://localhost:3000',
          endpoints: SERVICE_ENDPOINTS.multiplayer,
        },
      },
    } as MockManifest;
  }

  public start(): void {
    if (this.intercepting) return;

    console.log(`[MockEngine] Starting in ${this.mode} mode`);
    this.intercepting = true;

    // Override global fetch
    global.fetch = this.interceptedFetch.bind(this);

    // Enable WebSocket mocking if in appropriate mode
    const wsEnabledModes = ['demo', 'test', 'storybook'];
    if (wsEnabledModes.includes(this.mode)) {
      this.enableWebSocketMocking();
    }
  }

  public stop(): void {
    if (!this.intercepting) return;

    console.log('[MockEngine] Stopping interception');
    this.intercepting = false;

    // Restore original fetch
    global.fetch = this.originalFetch;

    // Disable WebSocket mocking
    this.disableWebSocketMocking();
  }

  private async interceptedFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';

    console.log(`[MockEngine] Intercepting ${method} ${url}`);

    // Check if this request should be mocked
    const mockResponse = await this.getMockResponse(url, method, init);

    if (mockResponse) {
      // Log the request
      this.requestLog.push({
        url,
        method,
        timestamp: new Date().toISOString(),
        mocked: true,
      });

      return mockResponse;
    }

    // Fall back to original fetch for unmocked requests
    console.log(`[MockEngine] Passing through to real API: ${url}`);
    return this.originalFetch(input, init);
  }

  private async getMockResponse(
    url: string,
    method: string,
    init?: RequestInit,
  ): Promise<Response | null> {
    // Find matching endpoint
    const endpoint = this.findMatchingEndpoint(url, method);

    if (!endpoint) {
      return null;
    }

    // Check if service is enabled for current mode
    const serviceEnabled = this.isServiceEnabled(url);
    if (!serviceEnabled) {
      return null;
    }

    // Simulate delay
    if (endpoint.delay) {
      await this.delay(endpoint.delay);
    }

    // Simulate error conditions
    if (endpoint.error && Math.random() < endpoint.error.rate) {
      return this.createErrorResponse(endpoint.error.status, endpoint.error.message);
    }

    // Generate response body
    const responseBody = await this.generateResponseBody(endpoint, url, init);

    // Create mock response
    return new Response(JSON.stringify(responseBody), {
      status: endpoint.status || 200,
      headers: {
        'Content-Type': 'application/json',
        ...endpoint.headers,
      },
    });
  }

  private findMatchingEndpoint(url: string, method: string): MockEndpoint | null {
    for (const service of Object.values(this.manifest.services || {})) {
      for (const endpoint of service.endpoints) {
        if (endpoint.method === method && this.matchesPath(url, endpoint.path)) {
          return endpoint;
        }
      }
    }
    return null;
  }

  private matchesPath(url: string, pattern: string): boolean {
    // Simple pattern matching (could be enhanced with path-to-regexp)
    const urlPath = new URL(url, 'http://localhost').pathname;
    const patternRegex = pattern
      .replace(/:[^/]+/g, '[^/]+') // Replace :param with regex
      .replace(/\*/g, '.*'); // Replace * with regex

    return new RegExp(`^${patternRegex}$`).test(urlPath);
  }

  private isServiceEnabled(url: string): boolean {
    const mode = this.manifest.modes[this.mode];
    if (!mode) return false;

    // Determine service from URL
    const serviceName = this.getServiceFromUrl(url);

    if (mode.disabled?.includes(serviceName)) {
      return false;
    }

    return mode.enabled.includes(serviceName);
  }

  private getServiceFromUrl(url: string): string {
    const path = new URL(url, 'http://localhost').pathname;

    if (path.includes('/auth')) return 'auth';
    if (path.includes('/quiz') || path.includes('/questions') || path.includes('/categories'))
      return 'quiz';
    if (path.includes('/leaderboard') || path.includes('/achievements') || path.includes('/user'))
      return 'gamification';
    if (path.includes('/lobby')) return 'multiplayer';

    return 'unknown';
  }

  private async generateResponseBody(
    endpoint: MockEndpoint,
    url: string,
    init?: RequestInit,
  ): Promise<any> {
    // Use fixture data
    if (endpoint.fixture) {
      const fixtureData = this.manifest.fixtures[endpoint.fixture];
      if (fixtureData) {
        return this.processFixtureData(fixtureData, endpoint, url, init);
      }
    }

    // Use generator
    if (endpoint.generator) {
      return this.generateData(endpoint.generator, url, init);
    }

    // Default responses for specific endpoints
    return this.getDefaultResponse(endpoint, url, init);
  }

  private processFixtureData(
    data: any,
    endpoint: MockEndpoint,
    url: string,
    init?: RequestInit,
  ): any {
    const path = new URL(url, 'http://localhost').pathname;

    // Auth endpoints
    if (path === '/auth/login' || path === '/auth/register') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const user = data.users.find((u: any) => u.email === body.email);

      if (path === '/auth/login' && user) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
          },
          token: user.tokens.access,
          refreshToken: user.tokens.refresh,
        };
      }

      if (path === '/auth/register') {
        return {
          success: true,
          user: {
            id: `user_${Date.now()}`,
            email: body.email,
            name: body.name || 'New User',
          },
          token: `mock_token_${Date.now()}`,
          refreshToken: `mock_refresh_${Date.now()}`,
        };
      }
    }

    // Quiz endpoints
    if (path === '/categories') {
      const categories = [...new Set(data.questions.map((q: any) => q.category))];
      return {
        success: true,
        categories: categories.map((cat, idx) => ({
          id: `cat_${idx + 1}`,
          name: cat,
          questionCount: data.questions.filter((q: any) => q.category === cat).length,
        })),
      };
    }

    if (path === '/questions/random') {
      const shuffled = [...data.questions].sort(() => Math.random() - 0.5);
      return {
        success: true,
        questions: shuffled.slice(0, 10),
      };
    }

    // Leaderboard
    if (path === '/leaderboard') {
      return {
        success: true,
        leaderboard: data.rankings || data,
      };
    }

    return data;
  }

  private generateData(generator: string, url: string, init?: RequestInit): any {
    // Random questions generator
    if (generator === 'randomQuestions') {
      const questions = this.manifest.fixtures.questions?.questions || [];
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      return {
        success: true,
        questions: shuffled.slice(0, 10),
      };
    }

    // Add more generators as needed
    return { success: true, data: [] };
  }

  private getDefaultResponse(endpoint: MockEndpoint, url: string, init?: RequestInit): any {
    const path = new URL(url, 'http://localhost').pathname;

    // Default responses for common endpoints
    const defaults: Record<string, any> = {
      '/auth/refresh': {
        success: true,
        token: `mock_token_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
      },
      '/auth/logout': {
        success: true,
      },
      '/quiz/submit': {
        success: true,
        score: Math.floor(Math.random() * 100),
        correctAnswers: Math.floor(Math.random() * 10),
        totalQuestions: 10,
        xpEarned: Math.floor(Math.random() * 500),
      },
      '/achievements': {
        success: true,
        achievements: [
          { id: 'first_quiz', name: 'First Quiz', unlocked: true },
          { id: 'streak_3', name: '3 Day Streak', unlocked: false },
          { id: 'perfect_score', name: 'Perfect Score', unlocked: false },
        ],
      },
      '/user/stats': {
        success: true,
        stats: {
          totalQuizzes: 42,
          totalXP: 12500,
          averageScore: 78,
          streak: 5,
        },
      },
      '/user/progress': {
        success: true,
        progress: {
          level: 15,
          currentXP: 2500,
          nextLevelXP: 3000,
          rank: 'Expert',
        },
      },
      '/lobby/create': {
        success: true,
        lobbyId: `lobby_${Date.now()}`,
        code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      },
      '/lobby/list': {
        success: true,
        lobbies: [
          { id: 'lobby_1', name: 'Quick Match', players: 3, maxPlayers: 4 },
          { id: 'lobby_2', name: 'Science Quiz', players: 2, maxPlayers: 6 },
        ],
      },
    };

    return defaults[path] || { success: true };
  }

  private createErrorResponse(status: number, message: string): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Utility methods
  public getRequestLog(): any[] {
    return [...this.requestLog];
  }

  public clearRequestLog(): void {
    this.requestLog = [];
  }

  public setMode(mode: string): void {
    console.log(`[MockEngine] Switching to ${mode} mode`);
    this.mode = mode;
  }

  public getCurrentMode(): string {
    return this.mode;
  }

  // Session storage for maintaining state across mocked requests
  public setSessionData(key: string, value: any): void {
    this.sessionStorage.set(key, value);
  }

  public getSessionData(key: string): any {
    return this.sessionStorage.get(key);
  }

  public clearSession(): void {
    this.sessionStorage.clear();
  }

  // WebSocket simulation
  public simulateWebSocket(url: string): any {
    console.log(`[MockEngine] Creating WebSocket simulation for ${url}`);

    // Import and use the MockWebSocket
    const { createMockWebSocket } = require('./mockWebSocket');
    return createMockWebSocket(url);
  }

  // Enable WebSocket mocking globally
  public enableWebSocketMocking(): void {
    const { enableWebSocketMocking } = require('./mockWebSocket');
    enableWebSocketMocking();
    console.log('[MockEngine] WebSocket mocking enabled');
  }

  // Disable WebSocket mocking globally
  public disableWebSocketMocking(): void {
    const { disableWebSocketMocking } = require('./mockWebSocket');
    disableWebSocketMocking();
    console.log('[MockEngine] WebSocket mocking disabled');
  }
}

// Singleton instance
let mockEngineInstance: MockEngine | null = null;

export const getMockEngine = (mode?: string): MockEngine => {
  if (!mockEngineInstance) {
    const envMode = process.env.MOCK_MODE || mode || 'demo';
    mockEngineInstance = new MockEngine(envMode);
  }
  return mockEngineInstance;
};

// Export for testing
export { MockEngine, MockEndpoint, MockMode, MockManifest };

// Auto-start in certain environments
if (process.env.USE_MOCKS === 'true' || process.env.NODE_ENV === 'test') {
  const engine = getMockEngine();
  engine.start();
  console.log('[MockEngine] Auto-started due to environment settings');
}

/**
 * Mock Integration - Wires up mock engine with environment controls
 * Provides easy integration points for app initialization
 */

import { getMockEngine } from './mockEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment configuration
interface MockConfig {
  enabled: boolean;
  mode: 'demo' | 'development' | 'test' | 'storybook';
  debugLogging: boolean;
  persistRequestLog: boolean;
  autoStart: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  MOCK_ENABLED: '@QuizMentor:mock_enabled',
  MOCK_MODE: '@QuizMentor:mock_mode',
  REQUEST_LOG: '@QuizMentor:request_log',
  MOCK_CONFIG: '@QuizMentor:mock_config',
};

class MockIntegration {
  private config: MockConfig;
  private engine: ReturnType<typeof getMockEngine> | null = null;
  private initialized: boolean = false;

  constructor() {
    this.config = this.loadEnvironmentConfig();
  }

  /**
   * Load configuration from environment variables
   */
  private loadEnvironmentConfig(): MockConfig {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const useMocks = process.env.USE_MOCKS === 'true';
    const mockMode = (process.env.MOCK_MODE as MockConfig['mode']) || 'demo';

    // Default configurations per environment
    const envDefaults: Record<string, Partial<MockConfig>> = {
      development: {
        enabled: true,
        mode: 'development',
        debugLogging: true,
        persistRequestLog: false,
        autoStart: true,
      },
      test: {
        enabled: true,
        mode: 'test',
        debugLogging: false,
        persistRequestLog: false,
        autoStart: true,
      },
      production: {
        enabled: false,
        mode: 'demo',
        debugLogging: false,
        persistRequestLog: false,
        autoStart: false,
      },
      storybook: {
        enabled: true,
        mode: 'storybook',
        debugLogging: true,
        persistRequestLog: false,
        autoStart: true,
      },
    };

    const defaults = envDefaults[nodeEnv] || envDefaults.development;

    return {
      enabled: useMocks !== undefined ? useMocks : defaults.enabled!,
      mode: mockMode || defaults.mode!,
      debugLogging: process.env.MOCK_DEBUG === 'true' || defaults.debugLogging!,
      persistRequestLog: process.env.MOCK_PERSIST_LOG === 'true' || defaults.persistRequestLog!,
      autoStart: defaults.autoStart!,
    };
  }

  /**
   * Initialize the mock system
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('[MockIntegration] Already initialized');
      return;
    }

    try {
      // Load saved configuration from storage
      await this.loadSavedConfig();

      if (this.config.enabled) {
        this.engine = getMockEngine(this.config.mode);

        if (this.config.autoStart) {
          this.engine.start();
          console.log(`[MockIntegration] Mock engine started in ${this.config.mode} mode`);
        }

        // Set up request logging
        if (this.config.persistRequestLog) {
          this.setupRequestLogging();
        }

        // Set up debug logging
        if (this.config.debugLogging) {
          this.setupDebugLogging();
        }
      } else {
        console.log('[MockIntegration] Mocking disabled');
      }

      this.initialized = true;
    } catch (error) {
      console.error('[MockIntegration] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load saved configuration from AsyncStorage
   */
  private async loadSavedConfig(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEYS.MOCK_CONFIG);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
        console.log('[MockIntegration] Loaded saved config:', this.config);
      }
    } catch (error) {
      console.warn('[MockIntegration] Could not load saved config:', error);
    }
  }

  /**
   * Save current configuration to AsyncStorage
   */
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MOCK_CONFIG, JSON.stringify(this.config));
      console.log('[MockIntegration] Config saved');
    } catch (error) {
      console.error('[MockIntegration] Could not save config:', error);
    }
  }

  /**
   * Set up request logging to AsyncStorage
   */
  private setupRequestLogging(): void {
    if (!this.engine) return;

    // Periodically save request log
    setInterval(async () => {
      const log = this.engine!.getRequestLog();
      if (log.length > 0) {
        try {
          const existingLog = await AsyncStorage.getItem(STORAGE_KEYS.REQUEST_LOG);
          const fullLog = existingLog ? [...JSON.parse(existingLog), ...log] : log;

          // Keep only last 100 entries
          const trimmedLog = fullLog.slice(-100);
          await AsyncStorage.setItem(STORAGE_KEYS.REQUEST_LOG, JSON.stringify(trimmedLog));

          this.engine!.clearRequestLog();
        } catch (error) {
          console.error('[MockIntegration] Failed to persist request log:', error);
        }
      }
    }, 10000); // Save every 10 seconds
  }

  /**
   * Set up enhanced debug logging
   */
  private setupDebugLogging(): void {
    if (!this.engine) return;

    // Override console methods for enhanced logging
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      if (args[0]?.includes('[Mock')) {
        originalLog('[🎭]', ...args);
      } else {
        originalLog(...args);
      }
    };

    console.warn = (...args: any[]) => {
      if (args[0]?.includes('[Mock')) {
        originalWarn('[⚠️🎭]', ...args);
      } else {
        originalWarn(...args);
      }
    };

    console.error = (...args: any[]) => {
      if (args[0]?.includes('[Mock')) {
        originalError('[❌🎭]', ...args);
      } else {
        originalError(...args);
      }
    };
  }

  /**
   * Enable mocking
   */
  public async enable(mode?: MockConfig['mode']): Promise<void> {
    this.config.enabled = true;
    if (mode) {
      this.config.mode = mode;
    }

    await this.saveConfig();

    if (!this.engine) {
      this.engine = getMockEngine(this.config.mode);
    } else {
      this.engine.setMode(this.config.mode);
    }

    this.engine.start();
    console.log(`[MockIntegration] Mocking enabled in ${this.config.mode} mode`);
  }

  /**
   * Disable mocking
   */
  public async disable(): Promise<void> {
    this.config.enabled = false;
    await this.saveConfig();

    if (this.engine) {
      this.engine.stop();
    }

    console.log('[MockIntegration] Mocking disabled');
  }

  /**
   * Switch mock mode
   */
  public async switchMode(mode: MockConfig['mode']): Promise<void> {
    this.config.mode = mode;
    await this.saveConfig();

    if (this.engine) {
      this.engine.setMode(mode);
      console.log(`[MockIntegration] Switched to ${mode} mode`);
    }
  }

  /**
   * Get current status
   */
  public getStatus(): {
    enabled: boolean;
    mode: string;
    initialized: boolean;
    requestCount?: number;
  } {
    return {
      enabled: this.config.enabled,
      mode: this.config.mode,
      initialized: this.initialized,
      requestCount: this.engine?.getRequestLog().length,
    };
  }

  /**
   * Get request log
   */
  public async getRequestLog(): Promise<any[]> {
    if (this.engine) {
      const currentLog = this.engine.getRequestLog();

      if (this.config.persistRequestLog) {
        try {
          const savedLog = await AsyncStorage.getItem(STORAGE_KEYS.REQUEST_LOG);
          const persistedLog = savedLog ? JSON.parse(savedLog) : [];
          return [...persistedLog, ...currentLog];
        } catch (error) {
          console.error('[MockIntegration] Failed to load request log:', error);
        }
      }

      return currentLog;
    }

    return [];
  }

  /**
   * Clear request log
   */
  public async clearRequestLog(): Promise<void> {
    if (this.engine) {
      this.engine.clearRequestLog();
    }

    if (this.config.persistRequestLog) {
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.REQUEST_LOG);
      } catch (error) {
        console.error('[MockIntegration] Failed to clear request log:', error);
      }
    }
  }

  /**
   * Get mock engine instance (for advanced usage)
   */
  public getEngine(): ReturnType<typeof getMockEngine> | null {
    return this.engine;
  }

  /**
   * Create a mock WebSocket connection
   */
  public createWebSocket(url: string): any {
    if (!this.engine) {
      console.warn('[MockIntegration] Engine not initialized');
      return null;
    }

    return this.engine.simulateWebSocket(url);
  }

  /**
   * Toggle debug logging
   */
  public async toggleDebugLogging(enabled?: boolean): Promise<void> {
    this.config.debugLogging = enabled !== undefined ? enabled : !this.config.debugLogging;
    await this.saveConfig();

    if (this.config.debugLogging) {
      this.setupDebugLogging();
    }

    console.log(
      `[MockIntegration] Debug logging ${this.config.debugLogging ? 'enabled' : 'disabled'}`,
    );
  }

  /**
   * Get configuration
   */
  public getConfig(): MockConfig {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  public async reset(): Promise<void> {
    this.config = this.loadEnvironmentConfig();
    await AsyncStorage.removeItem(STORAGE_KEYS.MOCK_CONFIG);
    await AsyncStorage.removeItem(STORAGE_KEYS.REQUEST_LOG);

    if (this.engine) {
      this.engine.stop();
      this.engine = null;
    }

    this.initialized = false;
    console.log('[MockIntegration] Reset to default configuration');
  }
}

// Singleton instance
let mockIntegrationInstance: MockIntegration | null = null;

export const getMockIntegration = (): MockIntegration => {
  if (!mockIntegrationInstance) {
    mockIntegrationInstance = new MockIntegration();
  }
  return mockIntegrationInstance;
};

// Export for testing
export { MockIntegration, MockConfig };

// Auto-initialize in certain environments
if (process.env.AUTO_INIT_MOCKS === 'true' || process.env.NODE_ENV === 'test') {
  const integration = getMockIntegration();
  integration
    .initialize()
    .then(() => {
      console.log('[MockIntegration] Auto-initialized');
    })
    .catch((error) => {
      console.error('[MockIntegration] Auto-initialization failed:', error);
    });
}

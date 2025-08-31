import {
  IServiceContainer,
  IAuthService,
  IQuizService,
  ILeaderboardService,
  IAchievementService,
  IBattleService,
  INotificationService,
  IFriendService,
  IStorageService,
  IAnalyticsService,
  IServiceConfig,
} from './interfaces';

// Service names constants
export const ServiceNames = {
  AUTH: 'auth',
  QUIZ: 'quiz',
  LEADERBOARD: 'leaderboard',
  ACHIEVEMENT: 'achievement',
  BATTLE: 'battle',
  NOTIFICATION: 'notification',
  FRIEND: 'friend',
  STORAGE: 'storage',
  ANALYTICS: 'analytics',
} as const;

export type ServiceName = (typeof ServiceNames)[keyof typeof ServiceNames];

/**
 * Service Container for dependency injection
 * Manages all service instances and their lifecycle
 */
export class ServiceContainer implements IServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();
  private config: IServiceConfig;
  private initialized = false;

  private constructor(config?: IServiceConfig) {
    this.config = config || {
      environment: 'development',
      debug: __DEV__,
      cache: {
        enabled: true,
        ttl: 300000, // 5 minutes
      },
      retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: true,
      },
    };
  }

  /**
   * Get singleton instance of ServiceContainer
   */
  static getInstance(config?: IServiceConfig): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer(config);
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize services that require it
    for (const [name, service] of this.services) {
      if (service.initialize && typeof service.initialize === 'function') {
        try {
          await service.initialize();
          if (this.config.debug) {
            console.log(`[ServiceContainer] Initialized ${name} service`);
          }
        } catch (error) {
          console.error(`[ServiceContainer] Failed to initialize ${name} service:`, error);
          throw error;
        }
      }
    }

    this.initialized = true;
  }

  /**
   * Register a service
   */
  register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      console.warn(`[ServiceContainer] Service ${name} is already registered, overwriting...`);
    }
    this.services.set(name, service);

    if (this.config.debug) {
      console.log(`[ServiceContainer] Registered ${name} service`);
    }
  }

  /**
   * Get a service by name
   */
  get<T>(name: string): T {
    if (!this.services.has(name)) {
      throw new Error(`[ServiceContainer] Service ${name} is not registered`);
    }
    return this.services.get(name) as T;
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get Auth Service
   */
  getAuthService(): IAuthService {
    return this.get<IAuthService>(ServiceNames.AUTH);
  }

  /**
   * Get Quiz Service
   */
  getQuizService(): IQuizService {
    return this.get<IQuizService>(ServiceNames.QUIZ);
  }

  /**
   * Get Leaderboard Service
   */
  getLeaderboardService(): ILeaderboardService {
    return this.get<ILeaderboardService>(ServiceNames.LEADERBOARD);
  }

  /**
   * Get Achievement Service
   */
  getAchievementService(): IAchievementService {
    return this.get<IAchievementService>(ServiceNames.ACHIEVEMENT);
  }

  /**
   * Get Battle Service
   */
  getBattleService(): IBattleService {
    return this.get<IBattleService>(ServiceNames.BATTLE);
  }

  /**
   * Get Notification Service
   */
  getNotificationService(): INotificationService {
    return this.get<INotificationService>(ServiceNames.NOTIFICATION);
  }

  /**
   * Get Friend Service
   */
  getFriendService(): IFriendService {
    return this.get<IFriendService>(ServiceNames.FRIEND);
  }

  /**
   * Get Storage Service
   */
  getStorageService(): IStorageService {
    return this.get<IStorageService>(ServiceNames.STORAGE);
  }

  /**
   * Get Analytics Service
   */
  getAnalyticsService(): IAnalyticsService {
    return this.get<IAnalyticsService>(ServiceNames.ANALYTICS);
  }

  /**
   * Get current configuration
   */
  getConfig(): IServiceConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset all services and clear container
   */
  reset(): void {
    // Cleanup services that require it
    for (const [name, service] of this.services) {
      if (service.cleanup && typeof service.cleanup === 'function') {
        try {
          service.cleanup();
          if (this.config.debug) {
            console.log(`[ServiceContainer] Cleaned up ${name} service`);
          }
        } catch (error) {
          console.error(`[ServiceContainer] Failed to cleanup ${name} service:`, error);
        }
      }
    }

    this.services.clear();
    this.initialized = false;

    if (this.config.debug) {
      console.log('[ServiceContainer] Reset complete');
    }
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get service count
   */
  getServiceCount(): number {
    return this.services.size;
  }

  /**
   * Check if container is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance getter
export const getServiceContainer = (config?: IServiceConfig) =>
  ServiceContainer.getInstance(config);

// Export typed service getters for convenience
export const getService = {
  auth: () => getServiceContainer().getAuthService(),
  quiz: () => getServiceContainer().getQuizService(),
  leaderboard: () => getServiceContainer().getLeaderboardService(),
  achievement: () => getServiceContainer().getAchievementService(),
  battle: () => getServiceContainer().getBattleService(),
  notification: () => getServiceContainer().getNotificationService(),
  friend: () => getServiceContainer().getFriendService(),
  storage: () => getServiceContainer().getStorageService(),
  analytics: () => getServiceContainer().getAnalyticsService(),
};

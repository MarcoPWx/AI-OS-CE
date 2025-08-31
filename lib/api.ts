import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { supabase } from './supabase';
import { ApiResponse, ApiError } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.quizmentor.app';
const API_VERSION = 'v1';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  // Use the global axios instance so axios-mock-adapter(axios) in tests can intercept
  const client = axios;
  client.defaults.baseURL = `${API_BASE_URL}/${API_VERSION}`;
  client.defaults.timeout = API_TIMEOUT;
  client.defaults.headers['Content-Type'] = 'application/json';
  client.defaults.headers['X-App-Version'] = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';
  const xPlatform = (Platform as any)?.OS || 'node';
  client.defaults.headers['X-Platform'] = xPlatform;

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Try to refresh token
        const refreshed = await refreshAccessToken();
        if (refreshed && error.config) {
          // Retry original request with new token
          return client.request(error.config);
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const apiClient = createApiClient();

// Refresh access token
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();
    return !error && !!session;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Error handling utilities
export class ApiErrorHandler {
  static handle(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<any>>;

      if (axiosError.response) {
        // Server responded with error
        return {
          code: axiosError.response.data?.error?.code || 'SERVER_ERROR',
          message: axiosError.response.data?.error?.message || 'An error occurred on the server',
          details: axiosError.response.data?.error?.details,
          timestamp: new Date(),
        };
      } else if (axiosError.request) {
        // Request was made but no response
        return {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Please check your internet connection.',
          timestamp: new Date(),
        };
      }
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date(),
    };
  }

  static isNetworkError(error: ApiError): boolean {
    return error.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: ApiError): boolean {
    return error.code === 'UNAUTHORIZED' || error.code === 'AUTH_ERROR';
  }

  static isValidationError(error: ApiError): boolean {
    return error.code === 'VALIDATION_ERROR';
  }
}

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: boolean;
  retryCondition?: (error: any) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoff: true,
  retryCondition: (error) => {
    const apiError = ApiErrorHandler.handle(error);
    return ApiErrorHandler.isNetworkError(apiError);
  },
};

// Retry wrapper for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const { maxAttempts, delay, backoff, retryCondition } = {
    ...defaultRetryConfig,
    ...config,
  };

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || (retryCondition && !retryCondition(error))) {
        throw error;
      }

      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Offline queue for mutations
interface QueuedRequest {
  id: string;
  type: 'mutation';
  endpoint: string;
  method: string;
  data: any;
  timestamp: Date;
  retries: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private readonly STORAGE_KEY = 'offline_queue';

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.processing) {
        this.processQueue();
      }
    });
  }

  async add(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) {
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      retries: 0,
    };

    this.queue.push(queuedRequest);
    await this.saveQueue();

    // Try to process immediately
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];

      try {
        await apiClient.request({
          url: request.endpoint,
          method: request.method as any,
          data: request.data,
        });

        // Success - remove from queue
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        const apiError = ApiErrorHandler.handle(error);

        if (ApiErrorHandler.isNetworkError(apiError)) {
          // Network error - stop processing
          break;
        } else if (request.retries < 3) {
          // Other error - retry later
          request.retries++;
          this.queue.push(this.queue.shift()!);
        } else {
          // Max retries reached - remove from queue
          this.queue.shift();
          console.error('Max retries reached for request:', request);
        }

        await this.saveQueue();
      }
    }

    this.processing = false;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueue();

// Cache utilities
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  key: string;
}

export class CacheManager {
  private static readonly CACHE_PREFIX = 'cache_';

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, expiry } = JSON.parse(cached);

      if (new Date().getTime() > expiry) {
        await this.remove(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  static async set<T>(key: string, data: T, ttl: number = 3600000) {
    try {
      const cacheData = {
        data,
        expiry: new Date().getTime() + ttl,
      };

      await AsyncStorage.setItem(`${this.CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  static async remove(key: string) {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  static async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

// Request deduplication
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Performance monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.recordMetric(name, duration);

      if (duration > 5000) {
        console.warn(`Slow API call detected: ${name} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}_error`, duration);
      throw error;
    }
  }

  private static recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(duration);

    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  static getAverageTime(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const sum = metrics.reduce((a, b) => a + b, 0);
    return sum / metrics.length;
  }

  static getMetrics() {
    const result: Record<string, any> = {};

    this.metrics.forEach((values, key) => {
      result[key] = {
        count: values.length,
        average: this.getAverageTime(key),
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return result;
  }
}

/**
 * Cross-platform storage abstraction
 * Handles differences between AsyncStorage (mobile) and localStorage (web)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  multiGet: (keys: string[]) => Promise<[string, string | null][]>;
  multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
}

class WebStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('WebStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('WebStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('WebStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('WebStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('WebStorage getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return keys.map((key) => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.error('WebStorage multiGet error:', error);
      return keys.map((key) => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.error('WebStorage multiSet error:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('WebStorage multiRemove error:', error);
      throw error;
    }
  }
}

class MobileStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('MobileStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('MobileStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('MobileStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('MobileStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('MobileStorage getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result;
    } catch (error) {
      console.error('MobileStorage multiGet error:', error);
      return keys.map((key) => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('MobileStorage multiSet error:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('MobileStorage multiRemove error:', error);
      throw error;
    }
  }
}

// Storage instance based on platform
const Storage: StorageInterface = Platform.OS === 'web' ? new WebStorage() : new MobileStorage();

// Helper functions for common operations
export const StorageHelper = {
  /**
   * Get and parse JSON data
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await Storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('StorageHelper getJSON error:', error);
      return null;
    }
  },

  /**
   * Set JSON data
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await Storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('StorageHelper setJSON error:', error);
      throw error;
    }
  },

  /**
   * Get secure item (with encryption in future)
   */
  async getSecureItem(key: string): Promise<string | null> {
    // TODO: Add encryption for sensitive data
    return Storage.getItem(key);
  },

  /**
   * Set secure item (with encryption in future)
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    // TODO: Add encryption for sensitive data
    return Storage.setItem(key, value);
  },

  /**
   * Check if key exists
   */
  async hasKey(key: string): Promise<boolean> {
    const value = await Storage.getItem(key);
    return value !== null;
  },

  /**
   * Get multiple JSON items
   */
  async getMultipleJSON<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const results = await Storage.multiGet(keys);
      const parsed: Record<string, T | null> = {};

      results.forEach(([key, value]) => {
        try {
          parsed[key] = value ? JSON.parse(value) : null;
        } catch {
          parsed[key] = null;
        }
      });

      return parsed;
    } catch (error) {
      console.error('StorageHelper getMultipleJSON error:', error);
      return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
    }
  },

  /**
   * Migrate data between storage keys
   */
  async migrateKey(oldKey: string, newKey: string): Promise<void> {
    try {
      const value = await Storage.getItem(oldKey);
      if (value !== null) {
        await Storage.setItem(newKey, value);
        await Storage.removeItem(oldKey);
      }
    } catch (error) {
      console.error('StorageHelper migrateKey error:', error);
      throw error;
    }
  },

  /**
   * Clear all app data except specified keys
   */
  async clearExcept(keysToKeep: string[]): Promise<void> {
    try {
      const allKeys = await Storage.getAllKeys();
      const keysToRemove = allKeys.filter((key) => !keysToKeep.includes(key));
      await Storage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('StorageHelper clearExcept error:', error);
      throw error;
    }
  },
};

// Storage keys constants
export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_PROFILE: '@user_profile',

  // Settings
  THEME: '@theme',
  LANGUAGE: '@language',
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
  SOUND_ENABLED: '@sound_enabled',

  // Game data
  CURRENT_STREAK: '@current_streak',
  HIGH_SCORE: '@high_score',
  ACHIEVEMENTS: '@achievements',
  XP_POINTS: '@xp_points',

  // Cache
  QUESTIONS_CACHE: '@questions_cache',
  LEADERBOARD_CACHE: '@leaderboard_cache',

  // Onboarding
  HAS_SEEN_ONBOARDING: '@has_seen_onboarding',
  ONBOARDING_PROGRESS: '@onboarding_progress',

  // Analytics
  ANALYTICS_USER_ID: '@analytics_user_id',
  ANALYTICS_SESSION: '@analytics_session',

  // Feature flags
  FEATURE_FLAGS: '@feature_flags',
  AB_TEST_VARIANTS: '@ab_test_variants',

  // Push notifications
  PUSH_TOKEN: '@push_token',
  NOTIFICATION_PREFERENCES: '@notification_preferences',
} as const;

export default Storage;

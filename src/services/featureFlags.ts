// src/services/featureFlags.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Initialize Supabase with hardcoded values (no env vars!)
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace in production
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace in production

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Feature flag types
export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  rollout_percentage: number;
  conditions?: Record<string, any>;
  variants?: Variant[];
  metadata?: Record<string, any>;
}

export interface Variant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

export interface Experiment {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  variants: Variant[];
  metrics: string[];
  start_date: string;
  end_date?: string;
}

export interface RemoteConfig {
  app_version: string;
  min_version: string;
  force_update: boolean;
  maintenance_mode: boolean;
  api_endpoints: Record<string, string>;
  feature_flags: Record<string, boolean>;
  experiments: Record<string, string>; // experiment_id: assigned_variant
  ui_config: {
    theme: 'dark' | 'light' | 'auto';
    animations_enabled: boolean;
    haptics_enabled: boolean;
  };
  content: {
    daily_challenge_enabled: boolean;
    categories_order: string[];
    xp_multiplier: number;
    energy_refill_time: number;
  };
}

class FeatureFlagService {
  private userId: string | null = null;
  private deviceId: string | null = null;
  private flags: Map<string, FeatureFlag> = new Map();
  private experiments: Map<string, Experiment> = new Map();
  private remoteConfig: RemoteConfig | null = null;
  private assignedVariants: Map<string, string> = new Map();
  private initialized = false;

  async initialize(userId?: string) {
    if (this.initialized) return;

    // Get or create device ID
    this.deviceId = await this.getDeviceId();
    this.userId = userId || null;

    // Load remote config
    await this.fetchRemoteConfig();

    // Load feature flags
    await this.fetchFeatureFlags();

    // Load active experiments
    await this.fetchExperiments();

    // Restore assigned variants
    await this.restoreAssignedVariants();

    this.initialized = true;

    // Set up real-time subscriptions
    this.setupRealtimeUpdates();
  }

  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      deviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('@device_id', deviceId);
    }
    return deviceId;
  }

  // Fetch remote configuration
  private async fetchRemoteConfig() {
    try {
      const { data, error } = await supabase.from('remote_config').select('*').single();

      if (error) throw error;

      this.remoteConfig = data;

      // Cache for offline use
      await AsyncStorage.setItem('@remote_config', JSON.stringify(data));
    } catch (error) {
      // Fallback to cached config
      const cached = await AsyncStorage.getItem('@remote_config');
      if (cached) {
        this.remoteConfig = JSON.parse(cached);
      } else {
        // Hardcoded fallback config
        this.remoteConfig = this.getDefaultConfig();
      }
    }
  }

  // Fetch feature flags
  private async fetchFeatureFlags() {
    try {
      const { data, error } = await supabase.from('feature_flags').select('*').eq('enabled', true);

      if (error) throw error;

      data?.forEach((flag) => {
        this.flags.set(flag.name, flag);
      });

      // Cache flags
      await AsyncStorage.setItem(
        '@feature_flags',
        JSON.stringify(Array.from(this.flags.entries())),
      );
    } catch (error) {
      // Load from cache
      const cached = await AsyncStorage.getItem('@feature_flags');
      if (cached) {
        const entries = JSON.parse(cached);
        this.flags = new Map(entries);
      }
    }
  }

  // Fetch active experiments
  private async fetchExperiments() {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('status', 'running');

      if (error) throw error;

      data?.forEach((experiment) => {
        this.experiments.set(experiment.id, experiment);
        // Assign variant if not already assigned
        if (!this.assignedVariants.has(experiment.id)) {
          this.assignVariant(experiment);
        }
      });
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    }
  }

  // Assign user to experiment variant
  private assignVariant(experiment: Experiment) {
    const random = this.hashUserId(this.userId || this.deviceId || '');
    let cumulativeWeight = 0;

    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        this.assignedVariants.set(experiment.id, variant.id);
        this.trackExperimentAssignment(experiment.id, variant.id);
        break;
      }
    }

    // Save assignment
    this.saveAssignedVariants();
  }

  // Hash user ID for consistent assignment
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }

  // Check if feature is enabled
  isEnabled(flagName: string, defaultValue: boolean = false): boolean {
    // Check remote config first
    if (this.remoteConfig?.feature_flags?.[flagName] !== undefined) {
      return this.remoteConfig.feature_flags[flagName];
    }

    const flag = this.flags.get(flagName);
    if (!flag) return defaultValue;

    // Check if user is in rollout percentage
    if (flag.rollout_percentage < 100) {
      const hash = this.hashUserId(this.userId || this.deviceId || '');
      return hash < flag.rollout_percentage;
    }

    // Check conditions
    if (flag.conditions) {
      return this.evaluateConditions(flag.conditions);
    }

    return flag.enabled;
  }

  // Get experiment variant
  getVariant(experimentId: string): string | null {
    return this.assignedVariants.get(experimentId) || null;
  }

  // Get variant config
  getVariantConfig(experimentId: string): Record<string, any> | null {
    const variantId = this.getVariant(experimentId);
    if (!variantId) return null;

    const experiment = this.experiments.get(experimentId);
    const variant = experiment?.variants.find((v) => v.id === variantId);
    return variant?.config || null;
  }

  // Get remote config value
  getConfig<T = any>(key: string, defaultValue: T): T {
    if (!this.remoteConfig) return defaultValue;

    const keys = key.split('.');
    let value: any = this.remoteConfig;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return defaultValue;
    }

    return value as T;
  }

  // Track experiment events
  async trackExperimentEvent(
    experimentId: string,
    eventName: string,
    properties?: Record<string, any>,
  ) {
    const variantId = this.getVariant(experimentId);
    if (!variantId) return;

    try {
      await supabase.from('experiment_events').insert({
        experiment_id: experimentId,
        variant_id: variantId,
        user_id: this.userId,
        device_id: this.deviceId,
        event_name: eventName,
        properties,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track experiment event:', error);
    }
  }

  // Track experiment assignment
  private async trackExperimentAssignment(experimentId: string, variantId: string) {
    try {
      await supabase.from('experiment_assignments').insert({
        experiment_id: experimentId,
        variant_id: variantId,
        user_id: this.userId,
        device_id: this.deviceId,
        assigned_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track experiment assignment:', error);
    }
  }

  // Evaluate conditions
  private evaluateConditions(conditions: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'platform':
          if (Platform.OS !== value) return false;
          break;
        case 'version':
          // Version comparison logic
          break;
        case 'user_level':
          // User level check
          break;
        case 'country':
          // Geo-targeting
          break;
        default:
          // Custom conditions
          break;
      }
    }
    return true;
  }

  // Save assigned variants
  private async saveAssignedVariants() {
    await AsyncStorage.setItem(
      '@assigned_variants',
      JSON.stringify(Array.from(this.assignedVariants.entries())),
    );
  }

  // Restore assigned variants
  private async restoreAssignedVariants() {
    const saved = await AsyncStorage.getItem('@assigned_variants');
    if (saved) {
      this.assignedVariants = new Map(JSON.parse(saved));
    }
  }

  // Set up real-time updates
  private setupRealtimeUpdates() {
    // Subscribe to config changes
    supabase
      .channel('config_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remote_config',
        },
        (payload) => {
          console.log('Config updated:', payload);
          this.fetchRemoteConfig();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
        },
        (payload) => {
          console.log('Feature flags updated:', payload);
          this.fetchFeatureFlags();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experiments',
        },
        (payload) => {
          console.log('Experiments updated:', payload);
          this.fetchExperiments();
        },
      )
      .subscribe();
  }

  // Get default config (hardcoded fallback)
  private getDefaultConfig(): RemoteConfig {
    return {
      app_version: '1.0.0',
      min_version: '1.0.0',
      force_update: false,
      maintenance_mode: false,
      api_endpoints: {
        supabase: SUPABASE_URL,
      },
      feature_flags: {
        daily_challenge: true,
        leaderboard: true,
        achievements: true,
        premium_content: false,
        social_sharing: false,
        multiplayer: false,
        ai_hints: false,
        voice_mode: false,
      },
      experiments: {},
      ui_config: {
        theme: 'dark',
        animations_enabled: true,
        haptics_enabled: true,
      },
      content: {
        daily_challenge_enabled: true,
        categories_order: ['javascript', 'react', 'typescript', 'nodejs'],
        xp_multiplier: 1.0,
        energy_refill_time: 300, // 5 minutes
      },
    };
  }

  // Force refresh all configs
  async refresh() {
    await Promise.all([
      this.fetchRemoteConfig(),
      this.fetchFeatureFlags(),
      this.fetchExperiments(),
    ]);
  }

  // Check for app updates
  needsUpdate(): boolean {
    if (!this.remoteConfig) return false;
    // Version comparison logic here
    return this.remoteConfig.force_update;
  }

  // Check maintenance mode
  isMaintenanceMode(): boolean {
    return this.remoteConfig?.maintenance_mode || false;
  }
}

// Export singleton
export const featureFlags = new FeatureFlagService();

// Convenience functions
export const isFeatureEnabled = (flag: string, defaultValue = false) =>
  featureFlags.isEnabled(flag, defaultValue);

export const getExperimentVariant = (experimentId: string) => featureFlags.getVariant(experimentId);

export const getConfig = <T = any>(key: string, defaultValue: T) =>
  featureFlags.getConfig(key, defaultValue);

export default featureFlags;

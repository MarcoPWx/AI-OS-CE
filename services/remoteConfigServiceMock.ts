// Mock Remote Config Service for testing
interface RemoteConfig {
  version: string;
  features: {
    streak_system: boolean;
    hearts_system: boolean;
    leaderboard: boolean;
    daily_challenges: boolean;
    social_features: boolean;
    premium_upsell: boolean;
  };
  manipulation_params: {
    streak_danger_hours: number;
    heart_regen_minutes: number;
    ad_frequency_minutes: number;
    notification_cooldown_minutes: number;
    fake_user_activity_rate: number;
    premium_discount_threshold: number;
  };
  ui_variations: {
    paywall_style: 'aggressive' | 'subtle' | 'balanced';
    streak_animation: boolean;
    social_proof_style: 'numbers' | 'avatars' | 'both';
  };
  experiments: {
    test_group: string;
    premium_price_test: number;
  };
}

class MockRemoteConfigService {
  private config: RemoteConfig = {
    version: '1.0.0-mock',
    features: {
      streak_system: true,
      hearts_system: true,
      leaderboard: true,
      daily_challenges: true,
      social_features: true,
      premium_upsell: true,
    },
    manipulation_params: {
      streak_danger_hours: 20,
      heart_regen_minutes: 30,
      ad_frequency_minutes: 3,
      notification_cooldown_minutes: 60,
      fake_user_activity_rate: 0.8,
      premium_discount_threshold: 3,
    },
    ui_variations: {
      paywall_style: 'aggressive',
      streak_animation: true,
      social_proof_style: 'both',
    },
    experiments: {
      test_group: 'control',
      premium_price_test: 9.99,
    },
  };

  private userId: string | null = null;

  async initialize(userId: string) {
    console.log('🔧 Initializing Mock Remote Config...');
    this.userId = userId;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Randomly assign test group
    const testGroups = ['control', 'variant_a', 'variant_b'];
    this.config.experiments.test_group = testGroups[Math.floor(Math.random() * testGroups.length)];

    console.log('✅ Mock Remote Config initialized');
    console.log('📊 Test group:', this.config.experiments.test_group);
  }

  getConfig(): RemoteConfig {
    return this.config;
  }

  getValue(key: string): any {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      value = value?.[k];
    }

    return value;
  }

  isFeatureEnabled(feature: keyof RemoteConfig['features']): boolean {
    return this.config.features[feature] ?? false;
  }

  getManipulationParam(param: keyof RemoteConfig['manipulation_params']): number {
    return this.config.manipulation_params[param];
  }

  getUIVariation<K extends keyof RemoteConfig['ui_variations']>(
    variation: K,
  ): RemoteConfig['ui_variations'][K] {
    return this.config.ui_variations[variation];
  }

  async forceRefresh() {
    console.log('🔄 Refreshing mock config...');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Randomly change some values to simulate A/B testing
    if (Math.random() > 0.5) {
      this.config.manipulation_params.ad_frequency_minutes = Math.random() > 0.5 ? 2 : 5;
    }

    console.log('✅ Config refreshed');
  }

  // Track config-driven events
  trackConfigEvent(eventName: string, properties?: Record<string, any>) {
    console.log('📊 Config Event:', eventName, properties);
  }
}

export const remoteConfigService = new MockRemoteConfigService();

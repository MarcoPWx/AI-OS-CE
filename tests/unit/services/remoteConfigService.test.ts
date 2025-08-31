import { remoteConfigService } from '../../../services/remoteConfigService';
import { supabase } from '../../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../../../services/analyticsService';

// Mock dependencies
jest.mock('../../../lib/supabase');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/analyticsService');

describe('RemoteConfigService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    (remoteConfigService as any).config = null;
    (remoteConfigService as any).cachedConfig = null;
  });

  afterEach(() => {
    remoteConfigService.cleanup();
  });

  describe('initialization', () => {
    it('should load cached config first then fetch remote', async () => {
      const cachedConfig = {
        features: { streaksEnabled: true },
        version: '1.0.0',
      };

      const remoteConfig = {
        features: { streaksEnabled: false },
        version: '1.0.1',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedConfig));

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: remoteConfig,
              error: null,
            }),
          }),
        }),
      });

      await remoteConfigService.initialize('test-user');

      // Should load cached first
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('remote_config');

      // Then fetch remote
      expect(supabase.from).toHaveBeenCalledWith('remote_configs');

      // Should use remote config
      const config = remoteConfigService.getConfig();
      expect(config?.version).toBe('1.0.1');
    });

    it('should fall back to cached config on fetch error', async () => {
      const cachedConfig = {
        features: { streaksEnabled: true },
        version: '1.0.0',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedConfig));

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Network error'),
            }),
          }),
        }),
      });

      await remoteConfigService.initialize('test-user');

      const config = remoteConfigService.getConfig();
      expect(config?.version).toBe('1.0.0'); // Cached version
    });
  });

  describe('feature flags', () => {
    beforeEach(async () => {
      const mockConfig = {
        features: {
          streaksEnabled: true,
          heartsEnabled: false,
          dailyChallengesEnabled: true,
          rolloutPercentages: {
            dailyChallengesEnabled: 50,
          },
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockConfig));

      await remoteConfigService.initialize('test-user');
    });

    it('should return correct feature flag values', () => {
      expect(remoteConfigService.isFeatureEnabled('streaksEnabled')).toBe(true);
      expect(remoteConfigService.isFeatureEnabled('heartsEnabled')).toBe(false);
    });

    it('should apply rollout percentages', () => {
      // Mock user hash to control rollout
      jest
        .spyOn(remoteConfigService as any, 'hashUser')
        .mockReturnValueOnce(25) // Under 50%
        .mockReturnValueOnce(75); // Over 50%

      // First user gets feature
      expect(remoteConfigService.isFeatureEnabled('dailyChallengesEnabled')).toBe(true);

      // Second user doesn't
      expect(remoteConfigService.isFeatureEnabled('dailyChallengesEnabled')).toBe(false);
    });

    it('should handle nested feature values', () => {
      const defaultValue = { enabled: false };
      const value = remoteConfigService.getFeatureValue('features.streaksEnabled', defaultValue);
      expect(value).toBe(true);
    });
  });

  describe('A/B testing', () => {
    const mockExperiment = {
      id: 'test-exp',
      name: 'Test Experiment',
      status: 'running' as const,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      targetAudience: {
        percentage: 100,
        segments: [],
      },
      variants: [
        { id: 'control', name: 'Control', weight: 50, config: { value: 'A' }, isControl: true },
        { id: 'variant', name: 'Variant', weight: 50, config: { value: 'B' }, isControl: false },
      ],
      metrics: ['conversion'],
      successCriteria: {
        primaryMetric: 'conversion',
        secondaryMetrics: [],
        minimumSampleSize: 1000,
        confidenceLevel: 0.95,
      },
    };

    beforeEach(async () => {
      const mockConfig = {
        experiments: {
          activeExperiments: [mockExperiment],
          userAssignments: new Map(),
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockConfig));

      // Mock current date to be within experiment range
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-06-01').getTime());
    });

    it('should assign users to experiment variants', async () => {
      // Mock hash to control variant assignment
      jest
        .spyOn(remoteConfigService as any, 'hashUser')
        .mockReturnValueOnce(90) // Eligible for experiment
        .mockReturnValueOnce(25); // Gets control variant

      await remoteConfigService.initialize('test-user');

      const variant = remoteConfigService.getExperimentVariant('test-exp');
      expect(variant).toBe('control');

      // Should track exposure
      expect(analyticsService.trackExperiment).toHaveBeenCalledWith(
        'Test Experiment',
        'Control',
        expect.objectContaining({
          experimentId: 'test-exp',
          variantId: 'control',
        }),
      );
    });

    it('should return consistent variant for same user', async () => {
      await remoteConfigService.initialize('same-user');

      const variant1 = remoteConfigService.getExperimentVariant('test-exp');
      const variant2 = remoteConfigService.getExperimentVariant('test-exp');

      expect(variant1).toBe(variant2);
    });

    it('should not assign users outside target percentage', async () => {
      // Mock hash to be outside target percentage
      jest.spyOn(remoteConfigService as any, 'hashUser').mockReturnValueOnce(5); // Not eligible (under 100% but we'll change config)

      const limitedExperiment = { ...mockExperiment };
      limitedExperiment.targetAudience.percentage = 10;

      const mockConfig = {
        experiments: {
          activeExperiments: [limitedExperiment],
          userAssignments: new Map(),
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockConfig));

      // User hash 5 is under 10%, should be included
      jest
        .spyOn(remoteConfigService as any, 'hashUser')
        .mockReturnValueOnce(5) // Eligible
        .mockReturnValueOnce(25); // Variant assignment

      await remoteConfigService.initialize('test-user');

      const variant = remoteConfigService.getExperimentVariant('test-exp');
      expect(variant).toBe('control');
    });

    it('should get experiment config for assigned variant', async () => {
      jest
        .spyOn(remoteConfigService as any, 'hashUser')
        .mockReturnValueOnce(90) // Eligible
        .mockReturnValueOnce(25); // Control variant

      await remoteConfigService.initialize('test-user');

      const config = remoteConfigService.getExperimentConfig('test-exp');
      expect(config).toEqual({ value: 'A' });
    });
  });

  describe('dynamic content', () => {
    beforeEach(() => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: 'q1',
                    category_id: 'tech',
                    question: 'Test Question',
                    options: ['A', 'B', 'C', 'D'],
                    correct_answer: 0,
                    explanation: 'Test explanation',
                    difficulty: 5,
                    xp_reward: 10,
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      });
    });

    it('should fetch dynamic quiz questions', async () => {
      const questions = await remoteConfigService.fetchDynamicQuizzes('tech');

      expect(questions).toHaveLength(1);
      expect(questions[0]).toMatchObject({
        id: 'q1',
        categoryId: 'tech',
        question: 'Test Question',
        correctAnswer: 0,
      });
    });

    it('should handle fetch errors gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
        }),
      });

      const questions = await remoteConfigService.fetchDynamicQuizzes('tech');
      expect(questions).toEqual([]);
    });

    it('should submit user-generated questions', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      const question = {
        question: 'User Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 2,
      };

      const success = await remoteConfigService.submitQuizQuestion(question);
      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('quiz_submissions');
    });
  });

  describe('user segmentation', () => {
    it('should segment users based on behavior', async () => {
      // Mock different user behaviors
      const scenarios = [
        { daysActive: 3, isPremium: false, engagement: 0.5, expected: 'new_users' },
        { daysActive: 30, isPremium: true, engagement: 0.8, expected: 'premium' },
        { daysActive: 20, isPremium: false, engagement: 0.8, expected: 'high_engagement' },
        { daysActive: 20, isPremium: false, engagement: 0.2, expected: 'low_engagement' },
        { daysActive: 20, isPremium: false, engagement: 0.5, expected: 'returning_users' },
      ];

      for (const scenario of scenarios) {
        jest
          .spyOn(remoteConfigService as any, 'getDaysActive')
          .mockResolvedValueOnce(scenario.daysActive);
        jest
          .spyOn(remoteConfigService as any, 'checkPremiumStatus')
          .mockResolvedValueOnce(scenario.isPremium);
        jest
          .spyOn(remoteConfigService as any, 'calculateEngagementScore')
          .mockResolvedValueOnce(scenario.engagement);

        const segment = await (remoteConfigService as any).getUserSegment();
        expect(segment).toBe(scenario.expected);
      }
    });
  });

  describe('dynamic pricing', () => {
    it('should apply engagement-based pricing', async () => {
      const baseConfig = {
        pricing: {
          basePrice: 9.99,
          currency: 'USD',
          countryOverrides: new Map(),
          dynamicPricing: {
            enabled: true,
            factors: [{ type: 'engagement' as const, weight: 1, rules: [] }],
          },
        },
      };

      // High engagement user
      jest.spyOn(remoteConfigService as any, 'calculateEngagementScore').mockResolvedValueOnce(0.8);

      const highEngagementPricing = await (remoteConfigService as any).applyDynamicPricing(
        baseConfig,
      );

      expect(highEngagementPricing.pricing.basePrice).toBeGreaterThan(9.99);

      // Low engagement user
      jest.spyOn(remoteConfigService as any, 'calculateEngagementScore').mockResolvedValueOnce(0.3);

      const lowEngagementPricing = await (remoteConfigService as any).applyDynamicPricing(
        baseConfig,
      );

      expect(lowEngagementPricing.pricing.basePrice).toBeLessThan(9.99);
    });

    it('should apply location-based pricing', async () => {
      const baseConfig = {
        pricing: {
          basePrice: 9.99,
          currency: 'USD',
          countryOverrides: new Map(),
          dynamicPricing: {
            enabled: true,
            factors: [{ type: 'location' as const, weight: 1, rules: [] }],
          },
        },
      };

      // User in India (lower PPP)
      jest.spyOn(remoteConfigService as any, 'getUserCountry').mockResolvedValueOnce('IN');

      const indiaPricing = await (remoteConfigService as any).applyDynamicPricing(baseConfig);

      expect(indiaPricing.pricing.basePrice).toBeLessThan(9.99);

      // User in UK (similar PPP)
      jest.spyOn(remoteConfigService as any, 'getUserCountry').mockResolvedValueOnce('UK');

      const ukPricing = await (remoteConfigService as any).applyDynamicPricing(baseConfig);

      expect(ukPricing.pricing.basePrice).toBeCloseTo(9.99, 1);
    });

    it('should apply frustration-based discounts', async () => {
      const baseConfig = {
        pricing: {
          basePrice: 9.99,
          currency: 'USD',
          countryOverrides: new Map(),
          dynamicPricing: {
            enabled: true,
            factors: [{ type: 'frustration' as const, weight: 1, rules: [] }],
          },
        },
      };

      // High frustration user
      jest.spyOn(remoteConfigService as any, 'getFrustrationLevel').mockResolvedValueOnce(0.8);

      const frustratedPricing = await (remoteConfigService as any).applyDynamicPricing(baseConfig);

      // Should get discount
      expect(frustratedPricing.pricing.basePrice).toBeLessThan(9.99);
    });
  });

  describe('caching and persistence', () => {
    it('should cache config to AsyncStorage', async () => {
      const config = {
        features: { streaksEnabled: true },
        version: '1.0.0',
      };

      await (remoteConfigService as any).cacheConfig(config);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('remote_config', JSON.stringify(config));
    });

    it('should handle cache errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage full'));

      const config = { features: {}, version: '1.0.0' };

      // Should not throw
      await expect((remoteConfigService as any).cacheConfig(config)).resolves.not.toThrow();
    });
  });

  describe('auto-update', () => {
    it('should periodically fetch updates', async () => {
      jest.useFakeTimers();

      await remoteConfigService.initialize('test-user');

      const fetchSpy = jest.spyOn(remoteConfigService as any, 'fetchRemoteConfig');

      // Fast forward 5 minutes
      jest.advanceTimersByTime(5 * 60 * 1000);

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('force refresh', () => {
    it('should allow manual config refresh', async () => {
      const fetchSpy = jest.spyOn(remoteConfigService as any, 'fetchRemoteConfig');

      await remoteConfigService.forceRefresh();

      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});

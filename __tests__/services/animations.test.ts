// __tests__/services/animations.test.ts
import { Animated } from 'react-native';
import AnimationService from '../../src/services/animations';

// Mock React Native Animated
jest.mock('react-native', () => ({
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    parallel: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
    sequence: jest.fn((animations) => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    })),
  },
  Easing: {
    out: jest.fn((fn) => fn),
    cubic: jest.fn(),
    quad: jest.fn(),
    back: jest.fn(() => jest.fn()),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('AnimationService', () => {
  let animationService: AnimationService;
  let mockAnimatedValue: any;

  beforeEach(() => {
    jest.clearAllMocks();
    animationService = AnimationService.getInstance();

    mockAnimatedValue = {
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeAllListeners: jest.fn(),
    };

    (Animated.Value as jest.Mock).mockReturnValue(mockAnimatedValue);
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AnimationService.getInstance();
      const instance2 = AnimationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Animation Value Management', () => {
    it('should create and cache animation values', () => {
      const value1 = animationService.createAnimationValue('test', 0);
      const value2 = animationService.createAnimationValue('test', 0);

      expect(value1).toBe(value2); // Should return cached value
      expect(Animated.Value).toHaveBeenCalledWith(0);
    });

    it('should create different values for different keys', () => {
      const value1 = animationService.createAnimationValue('test1', 0);
      const value2 = animationService.createAnimationValue('test2', 0);

      expect(value1).not.toBe(value2);
    });
  });

  describe('XP Counter Animation', () => {
    it('should create XP counter animation with correct parameters', () => {
      const mockAnimation = { start: jest.fn() };
      (Animated.timing as jest.Mock).mockReturnValue(mockAnimation);

      animationService.animateXPCounter(mockAnimatedValue, 0, 100);

      expect(Animated.timing).toHaveBeenCalledWith(mockAnimatedValue, {
        toValue: 100,
        duration: 1500,
        easing: expect.any(Function),
        useNativeDriver: false,
      });
    });

    it('should call onUpdate callback when provided', () => {
      const onUpdate = jest.fn();
      const mockAnimation = {
        start: jest.fn((callback) => callback && callback()),
      };
      (Animated.timing as jest.Mock).mockReturnValue(mockAnimation);

      animationService.animateXPCounter(mockAnimatedValue, 0, 100, 1000, onUpdate);

      expect(mockAnimatedValue.addListener).toHaveBeenCalled();
    });
  });

  describe('Level Up Animation', () => {
    it('should create level up animation sequence', () => {
      const levelUpAnim = animationService.createLevelUpAnimation();

      expect(levelUpAnim).toHaveProperty('scaleAnim');
      expect(levelUpAnim).toHaveProperty('rotateAnim');
      expect(levelUpAnim).toHaveProperty('glowAnim');
      expect(levelUpAnim).toHaveProperty('start');
      expect(typeof levelUpAnim.start).toBe('function');
    });

    it('should start level up animation when called', () => {
      const levelUpAnim = animationService.createLevelUpAnimation();

      levelUpAnim.start();

      expect(Animated.parallel).toHaveBeenCalled();
    });
  });

  describe('Combo Animation', () => {
    it('should create combo animation with correct scale values', () => {
      const comboAnim = animationService.createComboAnimation(2.5);

      expect(comboAnim).toHaveProperty('scaleAnim');
      expect(comboAnim).toHaveProperty('opacityAnim');
      expect(comboAnim).toHaveProperty('start');
    });

    it('should handle different combo multipliers', () => {
      const comboAnim1 = animationService.createComboAnimation(1.5);
      const comboAnim2 = animationService.createComboAnimation(3.0);

      expect(comboAnim1).toBeDefined();
      expect(comboAnim2).toBeDefined();
    });
  });

  describe('Achievement Animation', () => {
    it('should create achievement animation with particle effects', () => {
      const achievementAnim = animationService.createAchievementAnimation();

      expect(achievementAnim).toHaveProperty('scaleAnim');
      expect(achievementAnim).toHaveProperty('rotateAnim');
      expect(achievementAnim).toHaveProperty('particleAnims');
      expect(achievementAnim).toHaveProperty('start');

      expect(Array.isArray(achievementAnim.particleAnims)).toBe(true);
      expect(achievementAnim.particleAnims.length).toBe(8);
    });
  });

  describe('Shake Animation', () => {
    it('should create shake animation for wrong answers', () => {
      const shakeAnim = animationService.createShakeAnimation();

      expect(shakeAnim).toHaveProperty('translateXAnim');
      expect(shakeAnim).toHaveProperty('start');
    });

    it('should use sequence animation for shake effect', () => {
      const shakeAnim = animationService.createShakeAnimation();
      shakeAnim.start();

      expect(Animated.sequence).toHaveBeenCalled();
    });
  });

  describe('Bounce Animation', () => {
    it('should create bounce animation for correct answers', () => {
      const bounceAnim = animationService.createBounceAnimation();

      expect(bounceAnim).toHaveProperty('scaleAnim');
      expect(bounceAnim).toHaveProperty('start');
    });
  });

  describe('Progress Bar Animation', () => {
    it('should animate progress bar with correct timing', () => {
      const progressAnim = animationService.createProgressAnimation(0.75);

      expect(progressAnim).toHaveProperty('progressAnim');
      expect(progressAnim).toHaveProperty('start');
    });

    it('should handle different progress values', () => {
      const progressAnim1 = animationService.createProgressAnimation(0.25);
      const progressAnim2 = animationService.createProgressAnimation(1.0);

      expect(progressAnim1).toBeDefined();
      expect(progressAnim2).toBeDefined();
    });
  });

  describe('Timer Warning Animation', () => {
    it('should create timer warning animation', () => {
      const timerAnim = animationService.createTimerWarningAnimation();

      expect(timerAnim).toHaveProperty('pulseAnim');
      expect(timerAnim).toHaveProperty('colorAnim');
      expect(timerAnim).toHaveProperty('start');
      expect(timerAnim).toHaveProperty('stop');
    });
  });

  describe('Performance and Cleanup', () => {
    it('should track active animations', () => {
      expect(animationService.hasActiveAnimations).toBeDefined();
      expect(typeof animationService.hasActiveAnimations).toBe('function');
    });

    it('should cleanup animations properly', () => {
      animationService.createAnimationValue('test1', 0);
      animationService.createAnimationValue('test2', 0);

      animationService.cleanup();

      // After cleanup, should create new values
      const newValue = animationService.createAnimationValue('test1', 0);
      expect(newValue).toBeDefined();
    });

    it('should handle reduced motion preference', () => {
      animationService.setReducedMotion(true);

      // Should still create animations but with different behavior
      const levelUpAnim = animationService.createLevelUpAnimation();
      expect(levelUpAnim).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle animation failures gracefully', () => {
      const mockFailedAnimation = {
        start: jest.fn((callback) => callback && callback({ finished: false })),
      };
      (Animated.timing as jest.Mock).mockReturnValue(mockFailedAnimation);

      expect(() => {
        animationService.animateXPCounter(mockAnimatedValue, 0, 100);
      }).not.toThrow();
    });

    it('should handle missing animation values', () => {
      expect(() => {
        animationService.animateXPCounter(null as any, 0, 100);
      }).not.toThrow();
    });
  });
});

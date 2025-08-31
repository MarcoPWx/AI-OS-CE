import { by, device, element, expect, waitFor } from 'detox';

describe('Premium User Journey - React Native', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Onboarding Flow', () => {
    it('should display splash screen with animation', async () => {
      // Wait for splash screen
      await expect(element(by.id('splash-logo'))).toBeVisible();

      // Logo should animate (scale up)
      await waitFor(element(by.id('splash-logo')))
        .toHaveLabel('animated')
        .withTimeout(3000);

      // Auto-transition to welcome screen
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate through welcome screens', async () => {
      // Skip splash
      await waitFor(element(by.id('welcome-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Check welcome text
      await expect(element(by.text('Master Any Topic'))).toBeVisible();
      await expect(element(by.text('In Just 5 Minutes a Day'))).toBeVisible();

      // Check animated particles
      await expect(element(by.id('particle-container'))).toBeVisible();

      // Tap Get Started
      await element(by.id('get-started-btn')).tap();

      // Should trigger haptic feedback and navigate
      await expect(element(by.id('goal-selection'))).toBeVisible();
    });

    it('should handle goal selection', async () => {
      // Navigate to goal selection
      await element(by.id('skip-intro')).tap();

      // Check goal cards animation
      await expect(element(by.id('goal-card-learn'))).toBeVisible();
      await expect(element(by.id('goal-card-compete'))).toBeVisible();
      await expect(element(by.id('goal-card-challenge'))).toBeVisible();
      await expect(element(by.id('goal-card-fun'))).toBeVisible();

      // Select Learn goal
      await element(by.id('goal-card-learn')).tap();

      // Card should show selected state
      await expect(element(by.id('goal-card-learn-selected'))).toBeVisible();

      // Continue button should be enabled
      await element(by.id('continue-btn')).tap();

      // Navigate to interests
      await expect(element(by.id('interests-selection'))).toBeVisible();
    });

    it('should handle interest selection with animations', async () => {
      // Navigate to interests
      await element(by.id('skip-to-interests')).tap();

      // Check bubble grid
      await expect(element(by.text('Pick your interests'))).toBeVisible();
      await expect(element(by.text('Choose at least 3'))).toBeVisible();

      // Select interests with bubble animation
      await element(by.id('interest-bubble-tech')).tap();
      await element(by.id('interest-bubble-science')).tap();
      await element(by.id('interest-bubble-math')).tap();

      // Check selection animations
      await expect(element(by.id('interest-bubble-tech-selected'))).toBeVisible();
      await expect(element(by.id('interest-bubble-science-selected'))).toBeVisible();
      await expect(element(by.id('interest-bubble-math-selected'))).toBeVisible();

      // Continue should be enabled after 3 selections
      await element(by.id('continue-btn')).tap();

      // Navigate to time commitment
      await expect(element(by.id('time-commitment'))).toBeVisible();
    });

    it('should handle time commitment selection', async () => {
      // Navigate to time commitment
      await element(by.id('skip-to-time')).tap();

      // Check time cards
      await expect(element(by.text('How much time do you have?'))).toBeVisible();

      // Select 10 minutes
      await element(by.id('time-card-10')).tap();

      // Card should show gradient animation
      await expect(element(by.id('time-card-10-selected'))).toBeVisible();

      // Should auto-advance after selection
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(2000);
    });
  });

  describe('Premium Components', () => {
    beforeEach(async () => {
      // Skip onboarding
      await element(by.id('skip-onboarding')).tap();
    });

    it('should display glass morphism cards', async () => {
      await expect(element(by.id('glass-card')).atIndex(0)).toBeVisible();

      // Test blur effect by checking accessibility label
      await expect(element(by.id('glass-card')).atIndex(0)).toHaveLabel('glass-effect');
    });

    it('should display gradient buttons with press animation', async () => {
      const button = element(by.id('premium-button')).atIndex(0);
      await expect(button).toBeVisible();

      // Tap and check animation
      await button.tap();

      // Button should have pressed state
      await expect(button).toHaveLabel('pressed');
    });

    it('should display liquid progress bar', async () => {
      const progressBar = element(by.id('liquid-progress'));
      await expect(progressBar).toBeVisible();

      // Check wave animation
      await expect(progressBar).toHaveLabel('animating');

      // Check progress value
      await expect(element(by.id('progress-text'))).toHaveText('45%');
    });

    it('should display and animate FAB', async () => {
      const fab = element(by.id('fab'));
      await expect(fab).toBeVisible();

      // Tap FAB
      await fab.tap();

      // FAB should rotate and show menu
      await expect(element(by.id('fab-menu'))).toBeVisible();

      // Menu items should stagger in
      await expect(element(by.id('fab-item-1'))).toBeVisible();
      await expect(element(by.id('fab-item-2'))).toBeVisible();
      await expect(element(by.id('fab-item-3'))).toBeVisible();
    });
  });

  describe('Quiz Experience', () => {
    beforeEach(async () => {
      await element(by.id('skip-onboarding')).tap();
      await element(by.id('category-tech')).tap();
    });

    it('should display swipeable quiz cards', async () => {
      await expect(element(by.id('quiz-card'))).toBeVisible();

      // Swipe right for correct
      await element(by.id('quiz-card')).swipe('right');

      // Should show feedback
      await expect(element(by.id('answer-feedback-correct'))).toBeVisible();

      // Next card should slide in
      await waitFor(element(by.id('quiz-card')))
        .toBeVisible()
        .withTimeout(1000);
    });

    it('should handle answer selection with animations', async () => {
      // Select an answer
      await element(by.id('answer-option-1')).tap();

      // Option should show selected state
      await expect(element(by.id('answer-option-1-selected'))).toBeVisible();

      // Submit answer
      await element(by.id('submit-answer')).tap();

      // Show feedback animation
      await expect(element(by.id('answer-feedback'))).toBeVisible();
    });

    it('should display timer and hearts', async () => {
      await expect(element(by.id('quiz-timer'))).toBeVisible();
      await expect(element(by.id('hearts-display'))).toBeVisible();

      // Hearts should animate when lost
      await element(by.id('answer-option-wrong')).tap();
      await element(by.id('submit-answer')).tap();

      // Heart should shake and disappear
      await expect(element(by.id('heart-lost-animation'))).toBeVisible();
    });
  });

  describe('Results Screen', () => {
    beforeEach(async () => {
      await element(by.id('skip-to-results')).tap();
    });

    it('should display celebration animations', async () => {
      // Confetti should be visible
      await expect(element(by.id('confetti-animation'))).toBeVisible();

      // Score counter should animate
      await expect(element(by.id('score-counter'))).toBeVisible();
      await waitFor(element(by.text('85%')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should display stats with stagger animation', async () => {
      // Stats cards should appear one by one
      await expect(element(by.id('stat-card-accuracy'))).toBeVisible();
      await expect(element(by.id('stat-card-speed'))).toBeVisible();
      await expect(element(by.id('stat-card-streak'))).toBeVisible();
      await expect(element(by.id('stat-card-rank'))).toBeVisible();
    });

    it('should handle share functionality', async () => {
      await element(by.id('share-button')).tap();

      // Share preview should animate in
      await expect(element(by.id('share-preview'))).toBeVisible();

      // Share options should be available
      await expect(element(by.id('share-instagram'))).toBeVisible();
      await expect(element(by.id('share-twitter'))).toBeVisible();
      await expect(element(by.id('share-facebook'))).toBeVisible();
    });
  });

  describe('Paywall and Subscription', () => {
    beforeEach(async () => {
      // Simulate running out of hearts
      await device.launchApp({
        newInstance: true,
        launchArgs: { hearts: 0 },
      });
    });

    it('should display paywall when hearts run out', async () => {
      await element(by.id('start-quiz')).tap();

      // Paywall should appear
      await expect(element(by.id('paywall'))).toBeVisible();

      // Check gradient background
      await expect(element(by.id('paywall-gradient'))).toBeVisible();
    });

    it('should display urgency timer', async () => {
      await element(by.id('trigger-paywall')).tap();

      const timer = element(by.id('urgency-timer'));
      await expect(timer).toBeVisible();

      // Timer should be counting down
      const initialTime = await timer.getAttributes();
      await waitFor(element(by.id('urgency-timer')))
        .not.toHaveText(initialTime.text)
        .withTimeout(2000);
    });

    it('should display pricing options', async () => {
      await element(by.id('trigger-paywall')).tap();

      // Three pricing cards
      await expect(element(by.id('pricing-monthly'))).toBeVisible();
      await expect(element(by.id('pricing-annual'))).toBeVisible();
      await expect(element(by.id('pricing-lifetime'))).toBeVisible();

      // Annual should be highlighted
      await expect(element(by.id('pricing-annual-badge'))).toHaveText('BEST VALUE');
    });

    it('should handle subscription purchase', async () => {
      await element(by.id('trigger-paywall')).tap();

      // Select annual plan
      await element(by.id('pricing-annual')).tap();

      // Purchase button should update
      await expect(element(by.id('purchase-btn'))).toHaveText('Start 7-Day Free Trial');

      // Tap purchase
      await element(by.id('purchase-btn')).tap();

      // Should show success animation
      await waitFor(element(by.id('success-modal')))
        .toBeVisible()
        .withTimeout(3000);

      // Celebration animation
      await expect(element(by.id('celebration-animation'))).toBeVisible();
    });
  });

  describe('Performance and Animations', () => {
    it('should maintain smooth 60 FPS animations', async () => {
      // Enable performance monitoring
      await device.shake(); // Opens dev menu
      await element(by.text('Show Perf Monitor')).tap();

      // Navigate through screens
      await element(by.id('get-started-btn')).tap();
      await element(by.id('goal-card-learn')).tap();

      // Check FPS indicator
      await expect(element(by.text(/FPS: 5[5-9]|6[0-9]/))).toBeVisible();
    });

    it('should handle reduced motion preference', async () => {
      // Enable reduced motion
      await device.launchApp({
        newInstance: true,
        launchArgs: { reducedMotion: true },
      });

      // Animations should be disabled
      await expect(element(by.id('splash-logo'))).toBeVisible();

      // Should skip directly to main screen
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(1000);
    });
  });

  describe('Network and Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Disable network
      await device.setURLBlacklist(['.*']);

      // Try to load categories
      await element(by.id('categories-tab')).tap();

      // Should show error message
      await expect(element(by.id('error-message'))).toBeVisible();
      await expect(element(by.text(/Network error/))).toBeVisible();

      // Retry button should be visible
      await expect(element(by.id('retry-button'))).toBeVisible();

      // Re-enable network
      await device.clearURLBlacklist();

      // Tap retry
      await element(by.id('retry-button')).tap();

      // Should load successfully
      await expect(element(by.id('category-list'))).toBeVisible();
    });

    it('should work offline with cached data', async () => {
      // Load data first
      await element(by.id('categories-tab')).tap();
      await expect(element(by.id('category-list'))).toBeVisible();

      // Go offline
      await device.setURLBlacklist(['.*']);

      // Reload app
      await device.reloadReactNative();

      // Should show offline indicator
      await expect(element(by.id('offline-indicator'))).toBeVisible();

      // Cached data should be available
      await element(by.id('categories-tab')).tap();
      await expect(element(by.id('category-list'))).toBeVisible();

      // Re-enable network
      await device.clearURLBlacklist();

      // Should sync when online
      await expect(element(by.id('sync-indicator'))).toBeVisible();
      await waitFor(element(by.id('sync-indicator')))
        .not.toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      // All interactive elements should have labels
      await expect(element(by.id('get-started-btn'))).toHaveLabel('Get Started');

      await expect(element(by.id('skip-intro'))).toHaveLabel('Skip Introduction');

      // Navigate to home
      await element(by.id('skip-onboarding')).tap();

      // Check main navigation
      await expect(element(by.id('home-tab'))).toHaveLabel('Home');

      await expect(element(by.id('categories-tab'))).toHaveLabel('Categories');

      await expect(element(by.id('profile-tab'))).toHaveLabel('Profile');
    });

    it('should support screen reader navigation', async () => {
      // Enable screen reader mode
      await device.launchApp({
        newInstance: true,
        launchArgs: { screenReader: true },
      });

      // Elements should be focusable in order
      await expect(element(by.traits(['button']).and(by.id('get-started-btn')))).toBeVisible();

      // Swipe to navigate (screen reader gesture)
      await device.sendUserNotification({
        trigger: {
          type: 'accessibility',
          action: 'swipeRight',
        },
      });

      // Should focus next element
      await expect(element(by.traits(['button']).and(by.id('skip-intro')))).toHaveFocus();
    });
  });

  afterAll(async () => {
    await device.terminateApp();
  });
});

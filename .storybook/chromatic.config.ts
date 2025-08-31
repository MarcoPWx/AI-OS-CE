// .storybook/chromatic.config.ts
export const chromaticConfig = {
  // Project token from Chromatic
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,

  // Build configuration
  buildScriptName: 'build-storybook',

  // Visual testing configuration
  diffThreshold: 0.1, // 10% difference threshold
  delay: 200, // Wait 200ms before taking snapshot

  // Snapshot configuration
  viewports: [
    // Mobile devices
    { width: 375, height: 812 }, // iPhone X/XS/11 Pro
    { width: 414, height: 896 }, // iPhone XR/11/11 Pro Max
    { width: 390, height: 844 }, // iPhone 12/13/14
    { width: 428, height: 926 }, // iPhone 12/13/14 Pro Max
    { width: 360, height: 800 }, // Android medium
    { width: 412, height: 915 }, // Android large

    // Tablets
    { width: 768, height: 1024 }, // iPad
    { width: 834, height: 1194 }, // iPad Pro 11"
    { width: 1024, height: 1366 }, // iPad Pro 12.9"

    // Desktop
    { width: 1280, height: 800 }, // Desktop small
    { width: 1440, height: 900 }, // Desktop medium
    { width: 1920, height: 1080 }, // Desktop large
  ],

  // Ignore stories for visual testing
  skip: ['**/stories/Examples/**', '**/stories/Internal/**'],

  // Only run on specific stories
  onlyStoryNames: [],

  // Auto accept changes for these stories
  autoAcceptChanges: process.env.CI === 'true' ? [] : ['**/stories/Development/**'],

  // Exit once the build is uploaded (for CI)
  exitOnceUploaded: process.env.CI === 'true',

  // Exit with zero code even when changes are found
  exitZeroOnChanges: false,

  // Ignore errors from these stories
  ignoreLastBuildOnBranch: process.env.CI !== 'true',
};

// Helper function to configure Chromatic for specific components
export const configureChromatic = (componentName: string) => ({
  chromatic: {
    delay: 300, // Additional delay for complex components
    diffThreshold: 0.15,
    pauseAnimationAtEnd: true,
    disable: false,
    viewports: chromaticConfig.viewports.filter((v) =>
      // Only test on relevant viewports for the component
      componentName.includes('Mobile')
        ? v.width < 500
        : componentName.includes('Tablet')
          ? v.width >= 500 && v.width < 1024
          : true,
    ),
  },
});

// Visual regression test utilities
export const visualTestUtils = {
  // Wait for animations to complete
  waitForAnimations: () => new Promise((resolve) => setTimeout(resolve, 500)),

  // Mock data for consistent snapshots
  mockDate: new Date('2024-01-01T00:00:00Z'),
  mockUserId: 'test-user-123',
  mockSessionId: 'session-456',

  // Disable animations for consistent snapshots
  disableAnimations: () => ({
    style: {
      animation: 'none',
      transition: 'none',
    },
  }),

  // Force specific states for testing
  forceHover: () => ({ ':hover': true }),
  forceFocus: () => ({ ':focus': true }),
  forceActive: () => ({ ':active': true }),
};

export default chromaticConfig;

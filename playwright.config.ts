import { defineConfig, devices } from '@playwright/test';

const USE_MSW = !!process.env.EXPO_PUBLIC_USE_MSW || !!process.env.EXPO_PUBLIC_USE_ALL_MOCKS;
const EXPO_CMD = 'npx expo start --port 3003 --web --non-interactive';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: EXPO_CMD,
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      EXPO_NO_INTERACTIVE: '1',
      EXPO_PUBLIC_USE_MSW: USE_MSW ? '1' : undefined,
    },
  },
});

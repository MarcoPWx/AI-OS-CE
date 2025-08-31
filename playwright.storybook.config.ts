import { defineConfig, devices } from '@playwright/test';

const SB_PORT = parseInt(process.env.STORYBOOK_PORT || '7007', 10);
const SB_URL = `http://localhost:${SB_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
baseURL: SB_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
command: `storybook dev -p ${SB_PORT} --ci`,
url: SB_URL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});

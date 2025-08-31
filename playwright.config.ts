import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/tests/**'],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:7009',
    headless: true,
  },
  reporter: [['html', { open: 'never' }]],
  timeout: 30000,
})


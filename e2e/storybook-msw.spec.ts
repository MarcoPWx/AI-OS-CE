// e2e/storybook-msw.spec.ts
import { test, expect } from '@playwright/test';

const SB = 'http://localhost:7007';

// Helper to open a story by its id
async function openStory(page, storyId: string, globals?: string) {
  const url = new URL(`${SB}/?path=/story/${storyId}`);
  if (globals) url.searchParams.set('globals', globals);
  await page.goto(url.toString());
}

test.describe('Storybook MSW and Demos', () => {
test('API Playground returns mocked lessons @smoke', async ({ page }) => {
    await openStory(page, 'api-playground--default');

    await page.getByRole('button', { name: 'Call API' }).click();
    await expect(page.getByText(/^Status:/)).toContainText('200');
    await expect(page.getByLabel('response')).toContainText('JavaScript Basics');
  });

  test('API Playground shows 304 for cache when ETag matches', async ({ page }) => {
    await openStory(page, 'api-playground--default');

    await page.getByRole('button', { name: 'Call API' }).click();
    await expect(page.getByText(/^Status:/)).toContainText('200');

    // Call again should go 200 -> 304 because browser will send If-None-Match
    await page.getByRole('combobox', { name: 'endpoint' }).selectOption('GET /api/cache');
    await page.getByRole('button', { name: 'Call API' }).click();
    await expect(page.getByText(/^Status:/)).toContainText('200');
    await page.getByRole('button', { name: 'Call API' }).click();
    await expect(page.getByText(/^Status:/)).toContainText('304');
  });

  test('Rate limit endpoint returns 429 after threshold', async ({ page }) => {
    await openStory(page, 'api-playground--default');

    await page.getByRole('combobox', { name: 'endpoint' }).selectOption('GET /api/ratelimit');
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Call API' }).click();
      await expect(page.getByText(/^Status:/)).toContainText('200');
    }
    await page.getByRole('button', { name: 'Call API' }).click();
    await expect(page.getByText(/^Status:/)).toContainText('429');
  });

  test('Swagger page renders', async ({ page }) => {
    await openStory(page, 'api-swagger--default');
    await expect(page.getByText('QuizMentor API')).toBeVisible();
    await expect(page.getByText('/api/lessons')).toBeVisible();
  });

  test('WS scenario can be set via globals', async ({ page }) => {
    // This test just ensures Storybook loads with a globals setting applied.
    // Actual WS behaviour is covered by unit/integration tests; rendering side seen via stories.
    await openStory(page, 'testing-counter--default', 'wsScenario:matchHappyPath');
    await expect(page.getByText('Count: 0')).toBeVisible();
  });
});

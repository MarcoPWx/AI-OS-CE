import { test, expect } from '@playwright/test';

const SB = 'http://localhost:7007';

async function openStory(page, storyId: string, globals?: string) {
  const url = new URL(`${SB}/?path=/story/${storyId}`);
  if (globals) url.searchParams.set('globals', globals);
  await page.goto(url.toString());
}

test.describe('Journeys — Lowest Valley (Resilience)', () => {
  test('Network Playground scenario shows 304 and 429', async ({ page }) => {
    await openStory(page, 'dev-networkplayground--default');

    await page.getByRole('button', { name: /run scenario/i }).click();

    // Expect some timeline rows
    await expect(page.getByText(/Status/i)).toBeVisible();

    // Look for 304 and 429 notes in the timeline table
    await expect(page.locator('table')).toContainText('304');
    await expect(page.locator('table')).toContainText('429');
  });
  test('S2S orchestration failure at validate shows degraded trace', async ({ page }) => {
    await openStory(page, 'dev-s2s-orchestration--default');
    await page.getByLabel('trace-fail').selectOption('validate');
    await page.getByRole('button', { name: /start orchestration/i }).click();
    await expect(page.getByText(/^Status:/)).not.toContainText('200');
    await expect(page.getByText('Trace')).toBeVisible();
  });

  test('S2S orchestration failure at recommendations shows degraded trace', async ({ page }) => {
    await openStory(page, 'dev-s2s-orchestration--default');
    await page.getByLabel('trace-fail').selectOption('recommendations');
    await page.getByRole('button', { name: /start orchestration/i }).click();
    await expect(page.getByText('Trace')).toBeVisible();
  });

  test('S2S orchestration failure at session shows degraded trace', async ({ page }) => {
    await openStory(page, 'dev-s2s-orchestration--default');
    await page.getByLabel('trace-fail').selectOption('session');
    await page.getByRole('button', { name: /start orchestration/i }).click();
    await expect(page.getByText('Trace')).toBeVisible();
  });
});

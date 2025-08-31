import { test, expect } from '@playwright/test';

const SB = 'http://localhost:7007';

async function openStory(page, storyId: string, globals?: string) {
  const url = new URL(`${SB}/?path=/story/${storyId}`);
  if (globals) url.searchParams.set('globals', globals);
  await page.goto(url.toString());
}

test.describe('Journeys — Highest Mount (Happy)', () => {
  test('S2S orchestration happy path returns session + questions + trace', async ({ page }) => {
    await openStory(page, 'dev-s2s-orchestration--default');

    await page.getByRole('button', { name: /start orchestration/i }).click();
    await expect(page.getByText(/^Status:/)).toContainText('200');
    await expect(page.locator('pre')).toContainText('sessionId');
    await expect(page.locator('pre')).toContainText('questions');
    await expect(page.getByText('Trace')).toBeVisible();
  });

  test('Journeys catalog page renders anchors', async ({ page }) => {
    await openStory(page, 'specs-journeys-user-journeys-detailed-catalog--page');
    await expect(page.getByText('Lowest Valley')).toBeVisible();
    await expect(page.getByText('Highest Mount')).toBeVisible();
    await expect(page.getByText('Live Demos')).toBeVisible();
  });
});

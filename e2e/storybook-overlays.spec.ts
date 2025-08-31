import { test, expect } from '@playwright/test';

const SB = process.env.STORYBOOK_URL || 'http://localhost:7007';

async function openStory(page, storyId: string, globals?: string) {
  const url = new URL(`${SB}/?path=/story/${storyId}`);
  if (globals) url.searchParams.set('globals', globals);
  await page.goto(url.toString());
}

test.describe('Storybook Overlays — Presenter and MSW Info', () => {
  test('Presenter overlay toggles with gg and closes with Esc', async ({ page }) => {
    await openStory(page, 'labs-index--page');

    // Toggle overlay with "gg"
    await page.keyboard.press('g');
    await page.waitForTimeout(120);
    await page.keyboard.press('g');

    await expect(page.getByText('Presenter Guide')).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByText('Presenter Guide')).toBeHidden();
  });

  test('Start Presentation sets presenter overlay and step 0 (Start Here active)', async ({ page }) => {
    await openStory(page, 'labs-index--page');

    // Click the Start Presentation button in Labs Index
    await page.getByRole('button', { name: /start presentation/i }).click();

    // Presenter overlay should be visible
    await expect(page.getByText('Presenter Guide')).toBeVisible();

    // The first step is "Start Here"; verify it has the active style
    const startHere = page.getByRole('link', { name: 'Start Here' }).first();
    const styleAttr = await startHere.getAttribute('style');
    expect(styleAttr || '').toContain('rgba(59,130,246,0.6)'); // active border color
  });

  test('Presenter overlay navigation: jump to API Playground via overlay link', async ({ page }) => {
    await openStory(page, 'labs-index--page');

    // Ensure overlay is on via gg
    await page.keyboard.press('g');
    await page.waitForTimeout(100);
    await page.keyboard.press('g');
    await expect(page.getByText('Presenter Guide')).toBeVisible();

    // Click API Playground link in the overlay
    await page.getByRole('link', { name: 'API Playground' }).click();

    // Wait for API Playground content to appear
    await expect(page.getByRole('button', { name: 'Call API' })).toBeVisible();
  });

  test('Open MSW Info overlay via toolbar chip menu', async ({ page }) => {
    await openStory(page, 'api-playground--default');

    // Click MSW chip (works whether it shows ON or OFF)
    const chip = page.getByRole('button', { name: /MSW:\s*(ON|OFF)/ });
    await chip.click();

    // Select the menu action: Open MSW Info
    await page.getByText('Open MSW Info', { exact: true }).click();

    // Verify overlay appears
    await expect(page.getByText('MSW Info')).toBeVisible();

    // Sanity check: it should show either a handler row or the empty state
    await expect(
      page.locator('text=/^No handlers introspected\.|GET|POST|PUT|DELETE/'),
    ).toBeVisible();
  });
});

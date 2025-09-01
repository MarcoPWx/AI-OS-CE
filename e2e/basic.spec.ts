import { test, expect } from "@playwright/test";

test("loads Storybook", async ({ page }) => {
  // Use PORT env var if set (for CI), otherwise default to 7007 (for local)
  const port = process.env.PORT || "7007";
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

  await page.goto(baseUrl);
  // Wait for index to load
  await page.waitForSelector("text=Docs");
  const title = await page.title();
  expect(title).toMatch(/Storybook/i);
});

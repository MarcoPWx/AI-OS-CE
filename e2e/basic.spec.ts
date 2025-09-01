import { test, expect } from "@playwright/test";

test("loads Storybook", async ({ page }) => {
  await page.goto(process.env.BASE_URL || "http://localhost:7007");
  // Wait for index to load
  await page.waitForSelector("text=Docs");
  const title = await page.title();
  expect(title).toMatch(/Storybook/i);
});

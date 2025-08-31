import { test, expect } from '@playwright/test';

/*
  Generated scaffold for user stories coverage.
  See docs/USER_STORIES.md → “Interactive Scenario User Stories (50)”.
  Each test is a placeholder (test.todo). Implement gradually and link to
  MSW-backed flows or real API as applicable.
*/

test.describe('User Stories Coverage', () => {
  // Implemented stories go here; skip them in the placeholder list below
  test('US-005 — Answer Single-Choice Question', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
    await expect(page.getByTestId('question-card')).toBeVisible();

    // Click an answer and expect explanation to appear
    await page.getByTestId('answer-option-0').click();
    await expect(page.getByTestId('explanation-card')).toBeVisible();
  });

  test('US-032 — Accessibility — Keyboard Navigation', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');
    await expect(page.getByTestId('quiz-screen')).toBeVisible();

    // Focus the second option and press Enter to select
    const option = page.getByTestId('answer-option-1');
    await option.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('explanation-card')).toBeVisible();
  });

  // US-004 — Start Timed Quiz
  test('US-004 — Start Timed Quiz', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript&timer=1&duration=3');
    const timer = page.getByTestId('timer-remaining');
    await expect(timer).toBeVisible();
    const initial = await timer.textContent();
    await page.waitForTimeout(1500);
    await expect(timer).not.toHaveText(initial || '');
  });

  // US-006 — Show Explanation After Answer
  test('US-006 — Show Explanation After Answer', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
    await expect(page.getByTestId('question-card')).toBeVisible();

    await page.getByTestId('answer-option-2').click();
    // Explanation pane should include heading text
    await expect(page.getByTestId('explanation-card')).toBeVisible();
    await expect(page.getByTestId('explanation-card')).toContainText('Explanation');
  });

  // US-008 — Progress Bar and Position
  test('US-008 — Progress Bar and Position', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');
    const counter = page.getByTestId('question-counter');
    await expect(counter).toHaveText(/1\s*\/\s*\d+/);

    // Answer the first question
    await page.getByTestId('answer-option-0').click();
    // After auto-advance, counter should update to 2 / N
    await expect(counter).toHaveText(/2\s*\/\s*\d+/, { timeout: 5000 });
  });

  // US-010 — End-of-Quiz Summary
  test('US-010 — End-of-Quiz Summary', async ({ page }) => {
    await page.goto('/quiz?skipIntro=1&category=javascript');
    // The default fallback has 3 questions; answer all
    for (let i = 0; i < 3; i++) {
      await page.getByTestId(`answer-option-0`).click();
      // Wait for auto-advance except on last
      if (i < 2) {
        await expect(page.getByTestId('question-counter')).toHaveText(
          new RegExp(`${i + 2}\s*/\s*\d+`),
          { timeout: 5000 },
        );
      }
    }
    // Results screen should appear
    await expect(page.getByTestId('results-screen')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('final-score')).toBeVisible();
  });

  const stories: Array<[id: string, title: string]> = [
    ['US-001', 'Complete First-Time Onboarding'],
    ['US-002', 'Resume Onboarding Later'],
    ['US-003', 'Select Category and Difficulty'],
    ['US-004', 'Start Timed Quiz'],
    ['US-005', 'Answer Single-Choice Question'],
    ['US-006', 'Show Explanation After Answer'],
    ['US-007', 'Skip Question'],
    ['US-008', 'Progress Bar and Position'],
    ['US-009', 'Pause and Resume Quiz'],
    ['US-010', 'End-of-Quiz Summary'],
    ['US-011', 'Practice Mode (No Timer)'],
    ['US-012', 'Hints in Practice'],
    ['US-013', 'Bookmark Question'],
    ['US-014', 'XP Award for Correct Answers'],
    ['US-015', 'Streaks and Combos'],
    ['US-016', 'Daily Goal and Reminders'],
    ['US-017', 'Achievements Unlocked'],
    ['US-018', 'Achievement Progress Tracking'],
    ['US-019', 'Leaderboard (Global)'],
    ['US-020', 'Friend Leaderboard'],
    ['US-021', 'Share Results'],
    ['US-022', 'Profile Overview'],
    ['US-023', 'Edit Profile'],
    ['US-024', 'Settings — Theme & Notifications'],
    ['US-025', 'Settings — Language'],
    ['US-026', 'App Launch Reliability'],
    ['US-027', 'Offline Detection & Indicator'],
    ['US-028', 'Download Quiz Pack for Offline'],
    ['US-029', 'Sync After Offline Session'],
    ['US-030', 'Recover From API Errors'],
    ['US-031', 'Accessibility — Screen Reader'],
    ['US-032', 'Accessibility — Keyboard Navigation'],
    ['US-033', 'Localization — Date/Number Formats'],
    ['US-034', 'Search Categories'],
    ['US-035', 'Filter by Difficulty/Length'],
    ['US-036', 'Resume Last Session'],
    ['US-037', 'Recently Incorrect Practice'],
    ['US-038', 'Rate Limit Handling'],
    ['US-039', 'Cache & ETag Handling'],
    ['US-040', 'Login Persistence'],
    ['US-041', 'Logout Everywhere'],
    ['US-042', 'Password Reset Flow'],
    ['US-043', 'Profile Privacy Controls'],
    ['US-044', 'Notifications Preferences'],
    ['US-045', 'Session Timeout Handling'],
    ['US-046', 'Visual Regression Stability (Key Screens)'],
    ['US-047', 'Performance Budget (Quiz Start)'],
    ['US-048', 'Error Boundary on Quiz Screen'],
    ['US-049', 'Export My Data (GDPR)'],
    ['US-050', 'Delete Account'],
  ];

  const implemented = new Set(['US-004', 'US-005', 'US-006', 'US-008', 'US-010', 'US-032']);
  for (const [id, title] of stories) {
    if (implemented.has(id)) continue;
    test.todo(`${id} — ${title}`);
  }
});

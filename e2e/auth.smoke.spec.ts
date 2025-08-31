import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123!@#';
const NEW_USER_EMAIL = 'newuser@example.com';

test.describe('Authentication Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with MSW mocks enabled
    await page.goto('http://localhost:7007/?useMocks=true');
  });

  test('should complete email signup flow', async ({ page }) => {
    // Navigate to auth choice
    await page.getByTestId('auth-choice-button').click();

    // Choose email signup
    await page.getByTestId('email-signup-button').click();

    // Fill signup form
    await page.getByTestId('signup-email').fill(NEW_USER_EMAIL);
    await page.getByTestId('signup-password').fill(TEST_PASSWORD);
    await page.getByTestId('signup-confirm-password').fill(TEST_PASSWORD);

    // Submit signup
    await page.getByTestId('signup-submit').click();

    // Verify redirect to home with user session
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByTestId('user-profile')).toContainText(NEW_USER_EMAIL);
  });

  test('should complete email login flow', async ({ page }) => {
    // Navigate to auth choice
    await page.getByTestId('auth-choice-button').click();

    // Choose email login
    await page.getByTestId('email-login-button').click();

    // Fill login form
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);

    // Submit login
    await page.getByTestId('login-submit').click();

    // Verify redirect to home with user session
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByTestId('user-profile')).toBeVisible();
  });

  test('should handle GitHub OAuth flow', async ({ page, context }) => {
    // Listen for popup
    const popupPromise = page.waitForEvent('popup');

    // Navigate to auth choice
    await page.getByTestId('auth-choice-button').click();

    // Click GitHub login
    await page.getByTestId('github-login-button').click();

    // Handle OAuth popup
    const popup = await popupPromise;
    await popup.waitForLoadState();

    // Mock OAuth callback
    await popup.goto('http://localhost:7007/api/auth/callback?code=mock-auth-code');

    // Verify redirect to home with user session
    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByTestId('user-profile')).toBeVisible();
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    // Login first
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('email-login-button').click();
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    // Verify logged in
    await expect(page.getByTestId('user-profile')).toBeVisible();

    // Refresh page
    await page.reload();

    // Verify still logged in
    await expect(page.getByTestId('user-profile')).toBeVisible();
  });

  test('should handle logout flow', async ({ page }) => {
    // Login first
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('email-login-button').click();
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    // Verify logged in
    await expect(page.getByTestId('user-profile')).toBeVisible();

    // Logout
    await page.getByTestId('user-menu').click();
    await page.getByTestId('logout-button').click();

    // Verify logged out
    await expect(page.getByTestId('auth-choice-button')).toBeVisible();
    await expect(page.getByTestId('user-profile')).not.toBeVisible();
  });

  test('should handle token refresh', async ({ page }) => {
    // Login first
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('email-login-button').click();
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    // Wait for initial session
    await expect(page.getByTestId('user-profile')).toBeVisible();

    // Simulate token expiry by waiting (mock tokens expire quickly)
    await page.waitForTimeout(5000);

    // Perform action that requires auth
    await page.getByTestId('quiz-start-button').click();

    // Verify still authenticated (token should auto-refresh)
    await expect(page.getByTestId('quiz-screen')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to auth choice
    await page.getByTestId('auth-choice-button').click();

    // Choose email login
    await page.getByTestId('email-login-button').click();

    // Fill with invalid credentials
    await page.getByTestId('login-email').fill('wrong@example.com');
    await page.getByTestId('login-password').fill('WrongPassword');

    // Submit login
    await page.getByTestId('login-submit').click();

    // Verify error message
    await expect(page.getByTestId('auth-error')).toContainText('Invalid credentials');

    // Should stay on login page
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('should validate password requirements on signup', async ({ page }) => {
    // Navigate to signup
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('email-signup-button').click();

    // Try weak password
    await page.getByTestId('signup-email').fill('test@example.com');
    await page.getByTestId('signup-password').fill('weak');
    await page.getByTestId('signup-confirm-password').fill('weak');

    // Submit should show validation error
    await page.getByTestId('signup-submit').click();

    await expect(page.getByTestId('password-error')).toContainText(
      'Password must be at least 8 characters',
    );
  });

  test('should handle password reset flow', async ({ page }) => {
    // Navigate to login
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('email-login-button').click();

    // Click forgot password
    await page.getByTestId('forgot-password-link').click();

    // Enter email
    await page.getByTestId('reset-email').fill(TEST_EMAIL);
    await page.getByTestId('reset-submit').click();

    // Verify success message
    await expect(page.getByTestId('reset-success')).toContainText(
      'Check your email for reset instructions',
    );
  });

  test('should update user profile', async ({ page }) => {
    // Login first
    await page.getByTestId('auth-choice-button').click();
    await page.getByTestId('email-login-button').click();
    await page.getByTestId('login-email').fill(TEST_EMAIL);
    await page.getByTestId('login-password').fill(TEST_PASSWORD);
    await page.getByTestId('login-submit').click();

    // Navigate to profile
    await page.getByTestId('user-menu').click();
    await page.getByTestId('profile-link').click();

    // Update display name
    await page.getByTestId('display-name').fill('Test User Updated');
    await page.getByTestId('profile-save').click();

    // Verify update
    await expect(page.getByTestId('profile-success')).toContainText('Profile updated');
    await expect(page.getByTestId('user-profile')).toContainText('Test User Updated');
  });
});

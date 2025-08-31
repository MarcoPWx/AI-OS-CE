import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete signup flow successfully', async ({ page }) => {
    // Navigate to signup
    await page.getByTestId('auth-signup-button').click();

    // Fill signup form
    await page.getByTestId('signup-email-input').fill('newuser@example.com');
    await page.getByTestId('signup-username-input').fill('newuser123');
    await page.getByTestId('signup-displayname-input').fill('New User');
    await page.getByTestId('signup-password-input').fill('SecurePass123!');
    await page.getByTestId('signup-confirm-password-input').fill('SecurePass123!');

    // Accept terms
    await page.getByTestId('terms-checkbox').check();

    // Submit form
    await page.getByTestId('signup-submit-button').click();

    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding/welcome');
    await expect(page.getByTestId('welcome-message')).toContainText('Welcome to QuizMentor');

    // Should show user info
    await expect(page.getByTestId('user-display-name')).toContainText('New User');
  });

  test('should complete login flow successfully', async ({ page }) => {
    // Navigate to login
    await page.getByTestId('auth-login-button').click();

    // Fill login form
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-password-input').fill('TestPass123!');

    // Check remember me
    await page.getByTestId('remember-me-checkbox').check();

    // Submit form
    await page.getByTestId('login-submit-button').click();

    // Should redirect to home
    await expect(page).toHaveURL('/(tabs)/home');

    // Should show user menu
    await expect(page.getByTestId('user-menu-button')).toBeVisible();

    // Check streak display
    await expect(page.getByTestId('streak-display')).toBeVisible();
    await expect(page.getByTestId('hearts-display')).toBeVisible();
  });

  test('should handle login errors correctly', async ({ page }) => {
    await page.getByTestId('auth-login-button').click();

    // Try invalid credentials
    await page.getByTestId('login-email-input').fill('wrong@example.com');
    await page.getByTestId('login-password-input').fill('WrongPass');
    await page.getByTestId('login-submit-button').click();

    // Should show error message
    await expect(page.getByTestId('error-message')).toContainText('Invalid credentials');

    // Should not redirect
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should complete social login flow', async ({ page }) => {
    await page.getByTestId('auth-login-button').click();

    // Click Google login
    await page.getByTestId('google-login-button').click();

    // Mock Google OAuth flow
    // In real tests, you'd handle the OAuth popup
    await page.waitForURL('/(tabs)/home');

    // Should be logged in
    await expect(page.getByTestId('user-menu-button')).toBeVisible();
  });

  test('should complete password reset flow', async ({ page }) => {
    await page.getByTestId('auth-login-button').click();

    // Click forgot password
    await page.getByTestId('forgot-password-link').click();

    // Enter email
    await page.getByTestId('reset-email-input').fill('test@example.com');
    await page.getByTestId('reset-submit-button').click();

    // Should show success message
    await expect(page.getByTestId('success-message')).toContainText('Password reset email sent');

    // Should redirect back to login
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should validate signup form correctly', async ({ page }) => {
    await page.getByTestId('auth-signup-button').click();

    // Try to submit empty form
    await page.getByTestId('signup-submit-button').click();

    // Should show validation errors
    await expect(page.getByTestId('email-error')).toContainText('Email is required');
    await expect(page.getByTestId('username-error')).toContainText('Username is required');
    await expect(page.getByTestId('password-error')).toContainText('Password is required');

    // Test email validation
    await page.getByTestId('signup-email-input').fill('invalid-email');
    await page.getByTestId('signup-submit-button').click();
    await expect(page.getByTestId('email-error')).toContainText('Invalid email format');

    // Test password validation
    await page.getByTestId('signup-password-input').fill('weak');
    await page.getByTestId('signup-submit-button').click();
    await expect(page.getByTestId('password-error')).toContainText(
      'Password must be at least 8 characters',
    );

    // Test password mismatch
    await page.getByTestId('signup-password-input').fill('StrongPass123!');
    await page.getByTestId('signup-confirm-password-input').fill('DifferentPass123!');
    await page.getByTestId('signup-submit-button').click();
    await expect(page.getByTestId('confirm-password-error')).toContainText(
      'Passwords do not match',
    );
  });

  test('should check username availability', async ({ page }) => {
    await page.getByTestId('auth-signup-button').click();

    // Type existing username
    await page.getByTestId('signup-username-input').fill('existinguser');
    await page.getByTestId('signup-username-input').blur();

    // Wait for availability check
    await page.waitForTimeout(500);

    // Should show unavailable message
    await expect(page.getByTestId('username-error')).toContainText('Username is already taken');

    // Type available username
    await page.getByTestId('signup-username-input').clear();
    await page.getByTestId('signup-username-input').fill('newuniqueuser');
    await page.getByTestId('signup-username-input').blur();

    // Wait for availability check
    await page.waitForTimeout(500);

    // Should show available indicator
    await expect(page.getByTestId('username-available')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByTestId('auth-login-button').click();
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-password-input').fill('TestPass123!');
    await page.getByTestId('login-submit-button').click();

    // Wait for redirect
    await page.waitForURL('/(tabs)/home');

    // Open user menu
    await page.getByTestId('user-menu-button').click();

    // Click logout
    await page.getByTestId('logout-button').click();

    // Confirm logout
    await page.getByTestId('confirm-logout-button').click();

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');

    // Should not show user menu
    await expect(page.getByTestId('user-menu-button')).not.toBeVisible();
  });

  test('should persist session with remember me', async ({ page, context }) => {
    // Login with remember me
    await page.getByTestId('auth-login-button').click();
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-password-input').fill('TestPass123!');
    await page.getByTestId('remember-me-checkbox').check();
    await page.getByTestId('login-submit-button').click();

    // Wait for redirect
    await page.waitForURL('/(tabs)/home');

    // Close and reopen page
    await page.close();
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Should still be logged in
    await expect(newPage.getByTestId('user-menu-button')).toBeVisible();
  });

  test('should redirect to login for protected routes', async ({ page }) => {
    // Try to access protected route
    await page.goto('/(tabs)/profile');

    // Should redirect to login
    await expect(page).toHaveURL('/auth/login?redirect=%2F(tabs)%2Fprofile');

    // Login
    await page.getByTestId('login-email-input').fill('test@example.com');
    await page.getByTestId('login-password-input').fill('TestPass123!');
    await page.getByTestId('login-submit-button').click();

    // Should redirect to original destination
    await expect(page).toHaveURL('/(tabs)/profile');
  });
});

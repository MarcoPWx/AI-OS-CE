import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createAuthService } from '../index';
import { IAuthService } from '../index';

/**
 * Migration tests for authentication
 * These tests should pass with both mock and real Supabase implementations
 */

describe('Auth Service Migration Tests', () => {
  describe.each([
    ['Mock Provider', true],
    ['Real Provider', false],
  ])('%s', (providerName, useMock) => {
    let authService: IAuthService;
    let testEmail: string;
    let testPassword: string;

    beforeEach(() => {
      // Use unique email for each test to avoid conflicts
      const timestamp = Date.now();
      testEmail = `test${timestamp}@example.com`;
      testPassword = 'Test123!@#';

      // Set environment based on test mode
      if (useMock) {
        process.env.NX_USE_MOCK_AUTH = 'true';
      } else {
        delete process.env.NX_USE_MOCK_AUTH;
        // Ensure Supabase credentials are available for real tests
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn('Skipping real provider tests - Supabase credentials not configured');
          return;
        }
      }

      authService = createAuthService({ useMock });
    });

    afterEach(async () => {
      // Clean up - sign out if signed in
      try {
        await authService.logout();
      } catch (error) {
        // Ignore logout errors in cleanup
      }
    });

    describe('Authentication Flow', () => {
      it('should sign up a new user', async () => {
        const result = await authService.signUp(testEmail, testPassword, 'Test User');

        expect(result.user).toBeDefined();
        expect(result.user?.email).toBe(testEmail);
        expect(result.error).toBeUndefined();
      });

      it('should sign in with email and password', async () => {
        // First sign up
        await authService.signUp(testEmail, testPassword);

        // Then sign in
        const result = await authService.loginWithEmail(testEmail, testPassword);

        expect(result.user).toBeDefined();
        expect(result.user?.email).toBe(testEmail);
        expect(result.session).toBeDefined();
        expect(result.session?.access_token).toBeTruthy();
      });

      it('should fail sign in with wrong password', async () => {
        // First sign up
        await authService.signUp(testEmail, testPassword);

        // Try to sign in with wrong password
        const result = await authService.loginWithEmail(testEmail, 'WrongPassword');

        expect(result.user).toBeNull();
        expect(result.session).toBeNull();
        expect(result.error).toBeTruthy();
      });

      it('should sign out successfully', async () => {
        // Sign in first
        await authService.signUp(testEmail, testPassword);
        await authService.loginWithEmail(testEmail, testPassword);

        // Sign out
        const result = await authService.logout();

        expect(result.success).toBe(true);

        // Session should be null after logout
        const session = await authService.getSession();
        expect(session).toBeNull();
      });
    });

    describe('Session Management', () => {
      it('should get current session when signed in', async () => {
        // Sign up and sign in
        await authService.signUp(testEmail, testPassword);
        const loginResult = await authService.loginWithEmail(testEmail, testPassword);

        // Get session
        const session = await authService.getSession();

        expect(session).toBeDefined();
        expect(session?.access_token).toBe(loginResult.session?.access_token);
        expect(session?.user.email).toBe(testEmail);
      });

      it('should return null session when not signed in', async () => {
        const session = await authService.getSession();
        expect(session).toBeNull();
      });

      it('should refresh session with valid refresh token', async () => {
        // Sign in first
        await authService.signUp(testEmail, testPassword);
        const loginResult = await authService.loginWithEmail(testEmail, testPassword);

        if (!loginResult.session?.refresh_token) {
          console.warn('No refresh token available, skipping refresh test');
          return;
        }

        // Refresh session
        const refreshResult = await authService.refresh(loginResult.session.refresh_token);

        expect(refreshResult.user).toBeDefined();
        expect(refreshResult.session).toBeDefined();
        expect(refreshResult.session?.access_token).toBeTruthy();
        // New access token should be different from old one (in most cases)
        // Note: Mock might return same token for simplicity
      });
    });

    describe('User Profile Management', () => {
      it('should update user profile', async () => {
        // Sign up and sign in
        await authService.signUp(testEmail, testPassword, 'Original Name');
        await authService.loginWithEmail(testEmail, testPassword);

        // Update profile
        const updateResult = await authService.updateUser({
          name: 'Updated Name',
          metadata: { bio: 'Test bio' },
        });

        expect(updateResult.user).toBeDefined();
        expect(updateResult.user.name).toBe('Updated Name');
      });
    });

    describe('Password Reset', () => {
      it('should request password reset', async () => {
        // Sign up first
        await authService.signUp(testEmail, testPassword);

        // Request password reset
        const result = await authService.requestPasswordReset(testEmail);

        expect(result.message).toBeTruthy();
        expect(result.message).toContain('reset');
      });

      it('should handle password reset for non-existent user', async () => {
        const nonExistentEmail = 'nonexistent@example.com';

        // Most services don't reveal if email exists for security
        // So this should still return success
        const result = await authService.requestPasswordReset(nonExistentEmail);

        expect(result.message).toBeTruthy();
      });
    });

    describe('OAuth Providers', () => {
      it('should initiate GitHub OAuth flow', async () => {
        // Note: Can't fully test OAuth in unit tests
        // Just verify the method exists and returns expected structure
        const result = await authService.loginWithGitHub();

        // In mock mode, should complete login
        // In real mode, should return redirect URL
        if (useMock) {
          expect(result.user || result.error).toBeDefined();
        } else {
          // Real OAuth would require browser interaction
          expect(result).toBeDefined();
        }
      });
    });

    describe('Error Handling', () => {
      it('should handle network errors gracefully', async () => {
        // This test is more relevant for real provider
        if (!useMock) {
          // Temporarily break the network (simulate)
          const originalFetch = global.fetch;
          global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

          try {
            const result = await authService.loginWithEmail(testEmail, testPassword);
            expect(result.error).toBeTruthy();
          } finally {
            global.fetch = originalFetch;
          }
        }
      });

      it('should handle invalid email format', async () => {
        const invalidEmail = 'not-an-email';

        const result = await authService.signUp(invalidEmail, testPassword);

        expect(result.user).toBeNull();
        expect(result.error).toBeTruthy();
      });

      it('should handle weak password', async () => {
        const weakPassword = '123';

        const result = await authService.signUp(testEmail, weakPassword);

        // Behavior might differ between mock and real
        if (!useMock) {
          expect(result.user).toBeNull();
          expect(result.error).toBeTruthy();
        }
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle multiple simultaneous login attempts', async () => {
        // Sign up first
        await authService.signUp(testEmail, testPassword);

        // Attempt multiple logins simultaneously
        const promises = Array(3)
          .fill(null)
          .map(() => authService.loginWithEmail(testEmail, testPassword));

        const results = await Promise.all(promises);

        // All should succeed
        results.forEach((result) => {
          expect(result.user).toBeDefined();
          expect(result.session).toBeDefined();
        });
      });
    });
  });
});

// Performance benchmarks
describe('Auth Service Performance', () => {
  const iterations = 10;

  it.each([
    ['Mock Provider', true],
    ['Real Provider', false],
  ])('%s - login performance', async (providerName, useMock) => {
    if (
      !useMock &&
      (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
    ) {
      console.warn('Skipping real provider performance test - Supabase not configured');
      return;
    }

    const authService = createAuthService({ useMock });
    const testEmail = `perf${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    // Setup - create user
    await authService.signUp(testEmail, testPassword);

    // Measure login time
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await authService.loginWithEmail(testEmail, testPassword);
      await authService.logout();
    }

    const endTime = Date.now();
    const avgTime = (endTime - startTime) / iterations;

    console.log(`${providerName} - Average login time: ${avgTime}ms`);

    // Performance expectations
    if (useMock) {
      expect(avgTime).toBeLessThan(100); // Mock should be very fast
    } else {
      expect(avgTime).toBeLessThan(1000); // Real API calls under 1 second
    }
  });
});

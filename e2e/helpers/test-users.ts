import { Page } from '@playwright/test';
import { supabase } from '../../lib/supabase';

export interface TestUser {
  email: string;
  password: string;
  username: string;
  displayName: string;
  id?: string;
}

/**
 * Creates a test user in the database
 */
export async function createTestUser(overrides?: Partial<TestUser>): Promise<TestUser> {
  const timestamp = Date.now();
  const testUser: TestUser = {
    email: overrides?.email || `test-${timestamp}@example.com`,
    password: overrides?.password || 'Test123!@#',
    username: overrides?.username || `testuser${timestamp}`,
    displayName: overrides?.displayName || 'Test User',
  };

  try {
    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          username: testUser.username,
          display_name: testUser.displayName,
        },
      },
    });

    if (authError) {
      throw new Error(`Failed to create test user: ${authError.message}`);
    }

    testUser.id = authData.user?.id;

    // Create profile record
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: testUser.id,
      username: testUser.username,
      display_name: testUser.displayName,
      email: testUser.email,
    });

    if (profileError) {
      console.warn(`Failed to create profile: ${profileError.message}`);
    }

    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

/**
 * Deletes a test user from the database
 */
export async function deleteTestUser(email: string): Promise<void> {
  try {
    // First, get the user ID
    const { data: userData } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .single();

    if (userData?.user_id) {
      // Delete related data
      await Promise.all([
        supabase.from('quiz_sessions').delete().eq('user_id', userData.user_id),
        supabase.from('user_achievements').delete().eq('user_id', userData.user_id),
        supabase.from('leaderboards').delete().eq('user_id', userData.user_id),
        supabase.from('profiles').delete().eq('user_id', userData.user_id),
      ]);

      // Delete auth user (admin function required)
      await supabase.auth.admin?.deleteUser(userData.user_id);
    }
  } catch (error) {
    console.warn('Error deleting test user:', error);
    // Non-critical, continue tests
  }
}

/**
 * Logs in a test user via the UI
 */
export async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/');
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  await page.click('[data-testid="login-button"]');
  await page.waitForSelector('[data-testid="home-screen"]', { timeout: 10000 });
}

/**
 * Logs out the current user via the UI
 */
export async function logoutUser(page: Page): Promise<void> {
  await page.click('[data-testid="profile-tab"]');
  await page.click('[data-testid="logout-button"]');
  await page.click('[data-testid="confirm-logout"]');
  await page.waitForSelector('[data-testid="login-screen"]', { timeout: 5000 });
}

/**
 * Creates multiple test users
 */
export async function createTestUsers(count: number): Promise<TestUser[]> {
  const users: TestUser[] = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      displayName: `Test User ${i + 1}`,
    });
    users.push(user);
  }
  return users;
}

/**
 * Cleans up all test users
 */
export async function cleanupTestUsers(): Promise<void> {
  try {
    // Delete all test users (email starts with 'test-')
    const { data: testProfiles } = await supabase
      .from('profiles')
      .select('email')
      .like('email', 'test-%');

    if (testProfiles && testProfiles.length > 0) {
      await Promise.all(testProfiles.map((profile) => deleteTestUser(profile.email)));
    }
  } catch (error) {
    console.warn('Error cleaning up test users:', error);
  }
}

/**
 * Sets up test data for a user (quiz history, achievements, etc.)
 */
export async function setupTestData(userId: string): Promise<void> {
  try {
    // Add quiz history
    await supabase.from('quiz_sessions').insert([
      {
        user_id: userId,
        category_id: 'cat-1',
        score: 80,
        total_questions: 10,
        correct_answers: 8,
        time_spent: 120,
        completed_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        category_id: 'cat-2',
        score: 90,
        total_questions: 10,
        correct_answers: 9,
        time_spent: 100,
        completed_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      },
    ]);

    // Add achievements
    await supabase.from('user_achievements').insert([
      {
        user_id: userId,
        achievement_id: 'first-quiz',
        earned_at: new Date().toISOString(),
      },
      {
        user_id: userId,
        achievement_id: 'perfect-score',
        earned_at: new Date().toISOString(),
      },
    ]);

    // Update leaderboard
    await supabase.from('leaderboards').upsert({
      user_id: userId,
      total_xp: 1500,
      total_stars: 50,
      quizzes_completed: 2,
      perfect_scores: 1,
      current_streak: 2,
      longest_streak: 5,
    });
  } catch (error) {
    console.warn('Error setting up test data:', error);
  }
}

/**
 * Waits for an element to be visible and stable
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options?: { timeout?: number },
): Promise<void> {
  await page.waitForSelector(selector, {
    state: 'visible',
    timeout: options?.timeout || 5000,
  });

  // Wait for any animations to complete
  await page.waitForTimeout(300);
}

/**
 * Takes a screenshot for debugging
 */
export async function debugScreenshot(page: Page, name: string): Promise<void> {
  if (process.env.DEBUG_SCREENSHOTS === 'true') {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }
}

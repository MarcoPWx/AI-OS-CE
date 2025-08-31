import type { Meta, StoryObj } from '@storybook/react';
import { E2ETestDashboard } from './E2ETestDashboard';

const meta: Meta<typeof E2ETestDashboard> = {
  title: 'Testing/E2E Test Scenarios',
  component: E2ETestDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 🧪 End-to-End Test Scenarios

Comprehensive E2E test scenarios mapping directly to user journeys, designed for automated testing with Playwright/Cypress.

### Test Architecture

\`\`\`
User Stories → Test Scenarios → Test Cases → Automated Tests → CI/CD Pipeline
     ↓              ↓              ↓              ↓              ↓
  Business       Behavior        Step-by       Playwright    GitHub
  Requirements   Coverage        Step          Scripts       Actions
\`\`\`

### Test Coverage Matrix

| Journey | Scenarios | Test Cases | Automated | Coverage |
|---------|-----------|------------|-----------|----------|
| Onboarding | 12 | 45 | 40 | 89% |
| Daily User | 18 | 72 | 65 | 90% |
| Competition | 15 | 58 | 50 | 86% |
| Creator | 10 | 38 | 30 | 79% |
| Social | 8 | 32 | 28 | 88% |
| Payment | 6 | 24 | 24 | 100% |

### Test Environments

- **Local**: Docker Compose with test DB
- **CI**: GitHub Actions with parallel execution
- **Staging**: Automated nightly runs
- **Production**: Smoke tests after deployment
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OnboardingE2E: Story = {
  name: 'Onboarding E2E Tests',
  parameters: {
    docs: {
      description: {
        story: `
### 🎯 Onboarding E2E Test Scenarios

#### Test Suite: New User Registration
\`\`\`typescript
// tests/e2e/onboarding/registration.spec.ts
import { test, expect } from '@playwright/test';
import { UserFactory } from '../factories/user';
import { EmailService } from '../services/email';

describe('User Registration Flow', () => {
  let emailService: EmailService;
  
  beforeEach(async ({ page }) => {
    emailService = new EmailService();
    await page.goto('/');
  });
  
  test('TC001: Successful email registration', async ({ page }) => {
    // Arrange
    const user = UserFactory.create();
    
    // Act - Landing page
    await expect(page).toHaveTitle('QuizMentor - Learn Through Play');
    await page.click('[data-testid="signup-cta"]');
    
    // Act - Registration form
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', user.password);
    await page.fill('[data-testid="confirm-password"]', user.password);
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="submit-registration"]');
    
    // Assert - Success state
    await expect(page).toHaveURL('/verify-email');
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Check your email');
    
    // Verify email sent
    const email = await emailService.getLastEmail(user.email);
    expect(email).toBeDefined();
    expect(email.subject).toBe('Verify your QuizMentor account');
  });
  
  test('TC002: Registration with weak password', async ({ page }) => {
    // Act
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    
    // Assert
    await expect(page.locator('[data-testid="password-error"]'))
      .toContainText('Password must be at least 8 characters');
    await expect(page.locator('[data-testid="password-strength"]'))
      .toHaveAttribute('data-strength', 'weak');
  });
  
  test('TC003: Registration with existing email', async ({ page }) => {
    // Arrange
    const existingUser = await UserFactory.createAndSave();
    
    // Act
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', existingUser.email);
    await page.fill('[data-testid="password-input"]', 'NewPassword123!');
    await page.click('[data-testid="submit-registration"]');
    
    // Assert
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Email already registered');
    await expect(page.locator('[data-testid="login-link"]'))
      .toBeVisible();
  });
  
  test('TC004: Social registration with Google', async ({ page, context }) => {
    // Mock Google OAuth
    await context.route('**/oauth/google**', route => {
      route.fulfill({
        status: 302,
        headers: {
          'Location': '/oauth/callback?token=mock-token'
        }
      });
    });
    
    // Act
    await page.goto('/register');
    await page.click('[data-testid="google-signup"]');
    
    // Assert - Should redirect to profile setup
    await expect(page).toHaveURL('/setup/profile');
    await expect(page.locator('[data-testid="welcome-message"]'))
      .toContainText('Welcome! Let\\'s set up your profile');
  });
  
  test('TC005: Registration abandonment and recovery', async ({ page }) => {
    // Start registration
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', 'abandon@test.com');
    
    // Abandon
    await page.goto('/');
    
    // Return to registration
    await page.goto('/register');
    
    // Assert - Form should remember email
    await expect(page.locator('[data-testid="email-input"]'))
      .toHaveValue('abandon@test.com');
    await expect(page.locator('[data-testid="welcome-back"]'))
      .toContainText('Welcome back! Finish setting up your account');
  });
});
\`\`\`

#### Test Suite: Email Verification
\`\`\`typescript
describe('Email Verification Flow', () => {
  test('TC006: Successful email verification', async ({ page }) => {
    // Arrange
    const user = await UserFactory.createUnverified();
    const token = await generateVerificationToken(user);
    
    // Act
    await page.goto(\`/verify?token=\${token}\`);
    
    // Assert
    await expect(page).toHaveURL('/setup/profile');
    await expect(page.locator('[data-testid="verification-success"]'))
      .toContainText('Email verified successfully');
    
    // Verify user status updated
    const updatedUser = await getUserById(user.id);
    expect(updatedUser.emailVerified).toBe(true);
  });
  
  test('TC007: Expired verification token', async ({ page }) => {
    // Arrange
    const expiredToken = 'expired-token-123';
    
    // Act
    await page.goto(\`/verify?token=\${expiredToken}\`);
    
    // Assert
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Verification link has expired');
    await expect(page.locator('[data-testid="resend-button"]'))
      .toBeVisible();
  });
  
  test('TC008: Resend verification email', async ({ page }) => {
    // Arrange
    const user = await UserFactory.createUnverified();
    
    // Act
    await page.goto('/verify-email');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.click('[data-testid="resend-button"]');
    
    // Assert
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Verification email sent');
    
    // Rate limiting check
    await page.click('[data-testid="resend-button"]');
    await expect(page.locator('[data-testid="rate-limit-message"]'))
      .toContainText('Please wait 60 seconds');
  });
});
\`\`\`

#### Test Suite: Profile Setup
\`\`\`typescript
describe('Profile Setup Flow', () => {
  test('TC009: Complete profile setup', async ({ page }) => {
    // Arrange
    const user = await loginAsNewUser(page);
    
    // Act - Basic info
    await page.fill('[data-testid="username-input"]', 'testuser123');
    await page.fill('[data-testid="firstname-input"]', 'John');
    await page.fill('[data-testid="lastname-input"]', 'Doe');
    await page.click('[data-testid="next-button"]');
    
    // Act - Preferences
    await page.click('[data-testid="category-science"]');
    await page.click('[data-testid="category-history"]');
    await page.click('[data-testid="difficulty-intermediate"]');
    await page.click('[data-testid="goal-learn"]');
    await page.click('[data-testid="next-button"]');
    
    // Act - Notifications
    await page.check('[data-testid="daily-reminder"]');
    await page.check('[data-testid="streak-alerts"]');
    await page.click('[data-testid="complete-setup"]');
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-banner"]'))
      .toContainText('Welcome, John!');
  });
  
  test('TC010: Skip profile setup', async ({ page }) => {
    // Arrange
    const user = await loginAsNewUser(page);
    
    // Act
    await page.click('[data-testid="skip-button"]');
    await page.click('[data-testid="confirm-skip"]');
    
    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="profile-incomplete"]'))
      .toBeVisible();
  });
  
  test('TC011: Username availability check', async ({ page }) => {
    // Arrange
    await UserFactory.create({ username: 'taken123' });
    await loginAsNewUser(page);
    
    // Act
    await page.fill('[data-testid="username-input"]', 'taken123');
    await page.locator('[data-testid="username-input"]').blur();
    
    // Assert
    await expect(page.locator('[data-testid="username-error"]'))
      .toContainText('Username already taken');
    await expect(page.locator('[data-testid="username-suggestions"]'))
      .toContainText('taken123_1');
  });
});
\`\`\`

#### Test Suite: First Quiz Tutorial
\`\`\`typescript
describe('First Quiz Tutorial', () => {
  test('TC012: Complete tutorial successfully', async ({ page }) => {
    // Arrange
    const user = await setupNewUser(page);
    
    // Act - Start tutorial
    await page.click('[data-testid="start-tutorial"]');
    
    // Tutorial step 1: Introduction
    await expect(page.locator('[data-testid="tutorial-overlay"]'))
      .toBeVisible();
    await page.click('[data-testid="tutorial-next"]');
    
    // Tutorial step 2: Question explanation
    await expect(page.locator('[data-testid="question-highlight"]'))
      .toHaveClass(/highlighted/);
    await page.click('[data-testid="tutorial-next"]');
    
    // Tutorial step 3: Answer question
    await page.click('[data-testid="answer-option-0"]');
    await expect(page.locator('[data-testid="correct-feedback"]'))
      .toContainText('Correct! +10 XP');
    
    // Complete remaining questions
    await page.click('[data-testid="continue-button"]');
    await page.click('[data-testid="answer-option-1"]');
    await page.click('[data-testid="continue-button"]');
    await page.click('[data-testid="answer-option-2"]');
    
    // Assert - Tutorial completion
    await expect(page.locator('[data-testid="tutorial-complete"]'))
      .toContainText('Tutorial Complete!');
    await expect(page.locator('[data-testid="xp-earned"]'))
      .toContainText('50 XP');
    await expect(page.locator('[data-testid="achievement-unlocked"]'))
      .toContainText('First Steps');
  });
  
  test('TC013: Tutorial with wrong answers', async ({ page }) => {
    // Arrange
    const user = await setupNewUser(page);
    await page.click('[data-testid="start-tutorial"]');
    
    // Act - Answer incorrectly
    await navigateToQuestion(page);
    await page.click('[data-testid="answer-option-2"]'); // Wrong answer
    
    // Assert
    await expect(page.locator('[data-testid="incorrect-feedback"]'))
      .toContainText('Not quite right');
    await expect(page.locator('[data-testid="explanation"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="hint-shown"]'))
      .toContainText('Here\\'s why');
  });
});
\`\`\`

#### Test Data Management
\`\`\`typescript
// tests/e2e/fixtures/test-data.ts
export const TestUsers = {
  new: {
    email: 'newuser@test.com',
    password: 'Test123!@#',
    username: 'newuser123'
  },
  existing: {
    email: 'existing@test.com',
    password: 'Existing123!',
    username: 'existinguser'
  },
  premium: {
    email: 'premium@test.com',
    password: 'Premium123!',
    username: 'premiumuser',
    subscription: 'pro'
  }
};

export const TestQuizzes = {
  tutorial: {
    id: 'tutorial-quiz',
    questions: 3,
    difficulty: 'easy'
  },
  daily: {
    id: 'daily-quiz',
    questions: 10,
    difficulty: 'medium'
  }
};
\`\`\`

#### Page Object Model
\`\`\`typescript
// tests/e2e/pages/registration.page.ts
export class RegistrationPage {
  constructor(private page: Page) {}
  
  async navigateTo() {
    await this.page.goto('/register');
  }
  
  async fillEmail(email: string) {
    await this.page.fill('[data-testid="email-input"]', email);
  }
  
  async fillPassword(password: string) {
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.fill('[data-testid="confirm-password"]', password);
  }
  
  async acceptTerms() {
    await this.page.check('[data-testid="terms-checkbox"]');
  }
  
  async submit() {
    await this.page.click('[data-testid="submit-registration"]');
  }
  
  async registerWithEmail(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.acceptTerms();
    await this.submit();
  }
  
  async registerWithGoogle() {
    await this.page.click('[data-testid="google-signup"]');
  }
  
  async getErrorMessage(): Promise<string> {
    return await this.page.textContent('[data-testid="error-message"]');
  }
}
\`\`\`
        `,
      },
    },
  },
};

export const DailyUserE2E: Story = {
  name: 'Daily Active User E2E Tests',
  parameters: {
    docs: {
      description: {
        story: `
### 📅 Daily Active User E2E Test Scenarios

#### Test Suite: Daily Login & Streak Management
\`\`\`typescript
describe('Daily Login Flow', () => {
  test('TC014: Maintain daily streak', async ({ page }) => {
    // Arrange
    const user = await createUserWithStreak(7);
    await login(page, user);
    
    // Act
    await page.goto('/dashboard');
    
    // Assert - Streak displayed
    await expect(page.locator('[data-testid="streak-counter"]'))
      .toContainText('7 day streak');
    await expect(page.locator('[data-testid="streak-bonus"]'))
      .toContainText('1.5x XP bonus');
    
    // Complete daily quiz
    await page.click('[data-testid="daily-quiz-button"]');
    await completeQuiz(page);
    
    // Assert - Streak updated
    await expect(page.locator('[data-testid="streak-counter"]'))
      .toContainText('8 day streak');
  });
  
  test('TC015: Streak warning notification', async ({ page, context }) => {
    // Arrange - User hasn't played today
    const user = await createUserWithLastPlay('22 hours ago');
    
    // Enable notifications
    await context.grantPermissions(['notifications']);
    
    // Act
    await login(page, user);
    
    // Assert
    await expect(page.locator('[data-testid="streak-warning"]'))
      .toContainText('2 hours left to maintain your streak!');
    await expect(page.locator('[data-testid="streak-warning"]'))
      .toHaveClass(/urgent/);
  });
  
  test('TC016: Streak lost recovery', async ({ page }) => {
    // Arrange
    const user = await createUserWithBrokenStreak();
    await login(page, user);
    
    // Assert - Streak lost message
    await expect(page.locator('[data-testid="streak-lost"]'))
      .toContainText('You lost your 15 day streak');
    
    // Act - Offer streak repair
    await expect(page.locator('[data-testid="repair-streak"]'))
      .toContainText('Restore for 500 coins');
    
    await page.click('[data-testid="repair-streak"]');
    await page.click('[data-testid="confirm-repair"]');
    
    // Assert - Streak restored
    await expect(page.locator('[data-testid="streak-counter"]'))
      .toContainText('15 day streak');
    await expect(page.locator('[data-testid="coins-balance"]'))
      .toContainText('500 coins spent');
  });
});
\`\`\`

#### Test Suite: Quiz Selection & Gameplay
\`\`\`typescript
describe('Quiz Gameplay Flow', () => {
  test('TC017: Browse and filter quizzes', async ({ page }) => {
    // Arrange
    await loginAsActiveUser(page);
    
    // Act - Navigate to quiz browser
    await page.click('[data-testid="browse-quizzes"]');
    
    // Apply filters
    await page.click('[data-testid="filter-category"]');
    await page.click('[data-testid="category-science"]');
    await page.click('[data-testid="filter-difficulty"]');
    await page.click('[data-testid="difficulty-hard"]');
    await page.click('[data-testid="apply-filters"]');
    
    // Assert - Filtered results
    const quizCards = page.locator('[data-testid="quiz-card"]');
    await expect(quizCards).toHaveCount(5);
    
    for (const card of await quizCards.all()) {
      await expect(card.locator('[data-testid="quiz-category"]'))
        .toContainText('Science');
      await expect(card.locator('[data-testid="quiz-difficulty"]'))
        .toContainText('Hard');
    }
  });
  
  test('TC018: Complete quiz with power-ups', async ({ page }) => {
    // Arrange
    const user = await createUserWithPowerUps();
    await login(page, user);
    
    // Start quiz
    await page.click('[data-testid="quick-play"]');
    await waitForQuizLoad(page);
    
    // Question 1: Use hint
    await page.click('[data-testid="power-up-hint"]');
    await expect(page.locator('[data-testid="hint-text"]'))
      .toBeVisible();
    await page.click('[data-testid="answer-option-1"]');
    
    // Question 2: Use 50-50
    await page.click('[data-testid="power-up-5050"]');
    await expect(page.locator('[data-testid="answer-option"]'))
      .toHaveCount(2);
    await page.click('[data-testid="answer-option-0"]');
    
    // Question 3: Skip
    await page.click('[data-testid="power-up-skip"]');
    
    // Complete remaining questions normally
    await completeRemainingQuestions(page, 7);
    
    // Assert - Results
    await expect(page.locator('[data-testid="quiz-complete"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="power-ups-used"]'))
      .toContainText('3 power-ups used');
  });
  
  test('TC019: Quiz with interruption recovery', async ({ page, context }) => {
    // Arrange
    await loginAsActiveUser(page);
    await page.click('[data-testid="start-quiz"]');
    
    // Answer 3 questions
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="answer-option-0"]');
      await page.click('[data-testid="next-question"]');
    }
    
    // Simulate interruption
    await page.reload();
    
    // Assert - Resume prompt
    await expect(page.locator('[data-testid="resume-quiz"]'))
      .toContainText('Resume your quiz (Question 4/10)');
    
    // Act - Resume
    await page.click('[data-testid="resume-yes"]');
    
    // Assert - Resumed at correct position
    await expect(page.locator('[data-testid="question-number"]'))
      .toContainText('Question 4 of 10');
    await expect(page.locator('[data-testid="score-so-far"]'))
      .toContainText('3 answered');
  });
});
\`\`\`

#### Test Suite: Social Features
\`\`\`typescript
describe('Social Interaction Flow', () => {
  test('TC020: Send and accept friend challenge', async ({ page, context }) => {
    // Arrange - Two users
    const user1 = await createUser('user1');
    const user2 = await createUser('user2');
    await makeFriends(user1, user2);
    
    // User 1 sends challenge
    await login(page, user1);
    await page.goto('/friends');
    await page.click(\`[data-testid="friend-\${user2.id}"]\`);
    await page.click('[data-testid="challenge-friend"]');
    await page.click('[data-testid="quiz-to-challenge"]');
    await page.fill('[data-testid="challenge-message"]', 'Beat my score!');
    await page.click('[data-testid="send-challenge"]');
    
    // Assert - Challenge sent
    await expect(page.locator('[data-testid="challenge-sent"]'))
      .toContainText('Challenge sent to user2');
    
    // User 2 receives challenge
    await logout(page);
    await login(page, user2);
    await page.goto('/challenges');
    
    // Assert - Challenge received
    await expect(page.locator('[data-testid="challenge-from-user1"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="challenge-message"]'))
      .toContainText('Beat my score!');
    
    // Accept challenge
    await page.click('[data-testid="accept-challenge"]');
    await completeQuiz(page, { targetScore: 85 });
    
    // Assert - Challenge completed
    await expect(page.locator('[data-testid="challenge-result"]'))
      .toContainText('You won the challenge!');
  });
  
  test('TC021: Leaderboard interaction', async ({ page }) => {
    // Arrange
    await loginAsActiveUser(page);
    
    // Navigate to leaderboard
    await page.click('[data-testid="leaderboard-nav"]');
    
    // Switch between boards
    await page.click('[data-testid="leaderboard-daily"]');
    await expect(page.locator('[data-testid="leaderboard-title"]'))
      .toContainText('Daily Leaderboard');
    
    await page.click('[data-testid="leaderboard-friends"]');
    await expect(page.locator('[data-testid="leaderboard-title"]'))
      .toContainText('Friends Leaderboard');
    
    // View player profile
    await page.click('[data-testid="player-rank-1"]');
    await expect(page.locator('[data-testid="player-modal"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="player-stats"]'))
      .toContainText('Total XP');
    
    // Challenge from leaderboard
    await page.click('[data-testid="challenge-player"]');
    await expect(page).toHaveURL(/\\/challenge/);
  });
});
\`\`\`

#### Test Suite: Quest System
\`\`\`typescript
describe('Daily Quests Flow', () => {
  test('TC022: Complete daily quests', async ({ page }) => {
    // Arrange
    const user = await createUserWithQuests();
    await login(page, user);
    
    // View quests
    await page.goto('/quests');
    
    // Assert - Daily quests displayed
    const questCards = page.locator('[data-testid="quest-card"]');
    await expect(questCards).toHaveCount(3);
    
    // Complete Quest 1: Play 3 quizzes
    for (let i = 0; i < 3; i++) {
      await page.goto('/quick-play');
      await completeQuiz(page);
    }
    
    // Check quest progress
    await page.goto('/quests');
    await expect(page.locator('[data-testid="quest-1-progress"]'))
      .toContainText('3/3 Complete');
    
    // Claim reward
    await page.click('[data-testid="claim-quest-1"]');
    await expect(page.locator('[data-testid="reward-modal"]'))
      .toContainText('+100 XP');
    await expect(page.locator('[data-testid="reward-modal"]'))
      .toContainText('+20 Coins');
    
    // Assert - Quest marked complete
    await expect(page.locator('[data-testid="quest-1-status"]'))
      .toHaveClass(/completed/);
  });
  
  test('TC023: Quest expiration and refresh', async ({ page }) => {
    // Arrange - User with expiring quests
    const user = await createUserWithExpiringQuests();
    await login(page, user);
    
    // Fast forward time
    await page.evaluate(() => {
      // Mock time to next day
      Date.now = () => new Date('2024-01-16T00:01:00').getTime();
    });
    
    await page.goto('/quests');
    
    // Assert - New quests available
    await expect(page.locator('[data-testid="quests-refreshed"]'))
      .toContainText('New daily quests available!');
    await expect(page.locator('[data-testid="quest-card"]'))
      .toHaveCount(3);
  });
});
\`\`\`

#### Performance Testing
\`\`\`typescript
describe('Performance Tests', () => {
  test('TC024: Page load performance', async ({ page }) => {
    // Measure dashboard load time
    await login(page);
    
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Assert - Page loads within acceptable time
    expect(loadTime).toBeLessThan(3000); // 3 seconds
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return {
        FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        LCP: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime,
        CLS: performance.getEntriesByType('layout-shift')
          .reduce((sum, entry) => sum + entry.value, 0)
      };
    });
    
    expect(metrics.FCP).toBeLessThan(1800); // 1.8s
    expect(metrics.LCP).toBeLessThan(2500); // 2.5s
    expect(metrics.CLS).toBeLessThan(0.1); // 0.1
  });
  
  test('TC025: Quiz response time under load', async ({ page }) => {
    // Simulate multiple users
    const pages = await Promise.all(
      Array(5).fill(0).map(() => browser.newPage())
    );
    
    // All users start quiz simultaneously
    const results = await Promise.all(
      pages.map(async (p) => {
        await login(p);
        const start = Date.now();
        await p.goto('/quick-play');
        await p.waitForSelector('[data-testid="question-text"]');
        return Date.now() - start;
      })
    );
    
    // Assert - All load within acceptable time
    results.forEach(time => {
      expect(time).toBeLessThan(2000);
    });
    
    // Cleanup
    await Promise.all(pages.map(p => p.close()));
  });
});
\`\`\`
        `,
      },
    },
  },
};

export const CompetitiveE2E: Story = {
  name: 'Competitive Mode E2E Tests',
  parameters: {
    docs: {
      description: {
        story: `
### 🏆 Competitive Mode E2E Test Scenarios

#### Test Suite: Tournament System
\`\`\`typescript
describe('Tournament Participation', () => {
  test('TC026: Join and complete tournament', async ({ page, browser }) => {
    // Arrange - Create tournament with multiple players
    const tournament = await createTournament({
      name: 'Daily Challenge',
      format: 'elimination',
      entryFee: 100,
      prizePool: 1000
    });
    
    const player = await createCompetitiveUser();
    await login(page, player);
    
    // Navigate to tournaments
    await page.goto('/tournaments');
    await page.click(\`[data-testid="tournament-\${tournament.id}"]\`);
    
    // Assert - Tournament details
    await expect(page.locator('[data-testid="tournament-name"]'))
      .toContainText('Daily Challenge');
    await expect(page.locator('[data-testid="participants"]'))
      .toContainText('12/16 players');
    await expect(page.locator('[data-testid="prize-pool"]'))
      .toContainText('1000 coins');
    
    // Join tournament
    await page.click('[data-testid="join-tournament"]');
    await page.click('[data-testid="confirm-entry-fee"]');
    
    // Wait for tournament start
    await page.waitForSelector('[data-testid="tournament-starting"]');
    await page.waitForTimeout(3000); // Countdown
    
    // Round 1
    await expect(page.locator('[data-testid="round-indicator"]'))
      .toContainText('Round 1 of 4');
    await completeQuiz(page, { competitive: true });
    
    // Assert - Advanced to next round
    await expect(page.locator('[data-testid="round-result"]'))
      .toContainText('You advanced!');
    
    // Continue through tournament
    for (let round = 2; round <= 4; round++) {
      await page.click('[data-testid="next-round"]');
      await completeQuiz(page, { competitive: true });
    }
    
    // Final results
    await expect(page.locator('[data-testid="tournament-complete"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="final-position"]'))
      .toContainText(/Position: [1-4]/);
    await expect(page.locator('[data-testid="prize-won"]'))
      .toBeVisible();
  });
  
  test('TC027: Tournament with disconnection recovery', async ({ page, context }) => {
    // Arrange
    const tournament = await createLiveTournament();
    const player = await joinTournament(tournament);
    await login(page, player);
    
    // Start tournament round
    await page.goto(\`/tournament/\${tournament.id}/play\`);
    await answerQuestions(page, 3);
    
    // Simulate disconnection
    await context.setOffline(true);
    await page.waitForTimeout(2000);
    
    // Assert - Disconnection detected
    await expect(page.locator('[data-testid="connection-lost"]'))
      .toBeVisible();
    
    // Reconnect
    await context.setOffline(false);
    await page.waitForTimeout(1000);
    
    // Assert - Resumed
    await expect(page.locator('[data-testid="connection-restored"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="question-number"]'))
      .toContainText('Question 4');
    
    // Complete round
    await completeRemainingQuestions(page);
  });
});
\`\`\`

#### Test Suite: Head-to-Head Battles
\`\`\`typescript
describe('1v1 Battle System', () => {
  test('TC028: Real-time 1v1 battle', async ({ browser }) => {
    // Create two browser contexts for two players
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Setup players
    const player1 = await createUser('player1');
    const player2 = await createUser('player2');
    
    // Player 1 creates battle
    await login(page1, player1);
    await page1.goto('/battle');
    await page1.click('[data-testid="create-battle"]');
    await page1.selectOption('[data-testid="battle-format"]', 'best-of-3');
    await page1.click('[data-testid="start-matchmaking"]');
    
    // Get battle code
    const battleCode = await page1.textContent('[data-testid="battle-code"]');
    
    // Player 2 joins battle
    await login(page2, player2);
    await page2.goto('/battle');
    await page2.click('[data-testid="join-battle"]');
    await page2.fill('[data-testid="battle-code-input"]', battleCode);
    await page2.click('[data-testid="join-button"]');
    
    // Both players see match started
    await expect(page1.locator('[data-testid="opponent-joined"]'))
      .toContainText('player2 joined');
    await expect(page2.locator('[data-testid="opponent-name"]'))
      .toContainText('player1');
    
    // Simulate battle rounds
    for (let round = 1; round <= 3; round++) {
      // Both answer simultaneously
      const question1 = page1.locator('[data-testid="question-text"]');
      const question2 = page2.locator('[data-testid="question-text"]');
      
      await expect(question1).toBeVisible();
      await expect(question2).toBeVisible();
      
      // Player 1 answers faster
      await page1.click('[data-testid="answer-option-0"]');
      await page1.waitForTimeout(500);
      await page2.click('[data-testid="answer-option-1"]');
      
      // See each other's progress
      await expect(page1.locator('[data-testid="opponent-answered"]'))
        .toBeVisible();
      await expect(page2.locator('[data-testid="opponent-answered"]'))
        .toBeVisible();
      
      // Continue to next question
      await Promise.all([
        page1.click('[data-testid="next-question"]'),
        page2.click('[data-testid="next-question"]')
      ]);
    }
    
    // Match complete
    await expect(page1.locator('[data-testid="match-result"]'))
      .toBeVisible();
    await expect(page2.locator('[data-testid="match-result"]'))
      .toBeVisible();
    
    // Cleanup
    await context1.close();
    await context2.close();
  });
  
  test('TC029: Battle with emotes and chat', async ({ browser }) => {
    // Setup 2-player battle
    const { page1, page2 } = await setupBattle(browser);
    
    // Player 1 sends emote
    await page1.click('[data-testid="emote-button"]');
    await page1.click('[data-testid="emote-fire"]');
    
    // Player 2 sees emote
    await expect(page2.locator('[data-testid="opponent-emote"]'))
      .toHaveAttribute('data-emote', 'fire');
    
    // Player 2 sends chat
    await page2.fill('[data-testid="chat-input"]', 'Good luck!');
    await page2.press('[data-testid="chat-input"]', 'Enter');
    
    // Player 1 sees chat
    await expect(page1.locator('[data-testid="chat-message"]'))
      .toContainText('Good luck!');
    
    // Test spam protection
    for (let i = 0; i < 5; i++) {
      await page1.click('[data-testid="emote-button"]');
      await page1.click('[data-testid="emote-laugh"]');
    }
    
    await expect(page1.locator('[data-testid="rate-limit-warning"]'))
      .toContainText('Slow down!');
  });
});
\`\`\`

#### Test Suite: League System
\`\`\`typescript
describe('League Progression', () => {
  test('TC030: Weekly league cycle', async ({ page }) => {
    // Arrange - User in Gold League
    const user = await createUserInLeague('gold', 3);
    await login(page, user);
    
    // Check current position
    await page.goto('/league');
    await expect(page.locator('[data-testid="current-league"]'))
      .toContainText('Gold III');
    await expect(page.locator('[data-testid="league-position"]'))
      .toContainText('Position: 25/50');
    
    // Play matches to gain points
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="play-ranked"]');
      await completeQuiz(page, { minScore: 80 });
    }
    
    // Check updated position
    await page.goto('/league');
    await expect(page.locator('[data-testid="league-position"]'))
      .toContainText(/Position: [5-15]\\/50/);
    await expect(page.locator('[data-testid="promotion-zone"]'))
      .toHaveClass(/active/);
    
    // Simulate week end
    await triggerWeekEnd();
    
    // Check promotion
    await page.reload();
    await expect(page.locator('[data-testid="promotion-modal"]'))
      .toContainText('Promoted to Gold II!');
    await expect(page.locator('[data-testid="promotion-rewards"]'))
      .toContainText('500 XP');
  });
  
  test('TC031: League relegation protection', async ({ page }) => {
    // Arrange - User in relegation zone
    const user = await createUserInRelegationZone();
    await login(page, user);
    
    await page.goto('/league');
    await expect(page.locator('[data-testid="relegation-warning"]'))
      .toContainText('Relegation zone - Win games to stay safe!');
    
    // Win a protection match
    await page.click('[data-testid="play-ranked"]');
    await completeQuiz(page, { minScore: 90 });
    
    // Check protection status
    await expect(page.locator('[data-testid="protection-active"]'))
      .toContainText('Protected from relegation (1 loss remaining)');
    
    // Lose protection
    await page.click('[data-testid="play-ranked"]');
    await completeQuiz(page, { maxScore: 30 });
    
    await expect(page.locator('[data-testid="protection-lost"]'))
      .toContainText('Protection lost!');
  });
});
\`\`\`

#### Test Suite: Team/Clan Features
\`\`\`typescript
describe('Team System', () => {
  test('TC032: Create and manage team', async ({ page }) => {
    // Create team
    await loginAsActiveUser(page);
    await page.goto('/teams');
    await page.click('[data-testid="create-team"]');
    
    // Fill team details
    await page.fill('[data-testid="team-name"]', 'Quiz Masters');
    await page.fill('[data-testid="team-description"]', 'Elite quiz team');
    await page.selectOption('[data-testid="team-privacy"]', 'invite-only');
    await page.click('[data-testid="create-button"]');
    
    // Assert - Team created
    await expect(page).toHaveURL(/\\/teams\\/[a-z0-9-]+/);
    await expect(page.locator('[data-testid="team-header"]'))
      .toContainText('Quiz Masters');
    await expect(page.locator('[data-testid="member-count"]'))
      .toContainText('1/20 members');
    
    // Invite members
    await page.click('[data-testid="invite-members"]');
    await page.fill('[data-testid="invite-email"]', 'friend@example.com');
    await page.click('[data-testid="send-invite"]');
    
    await expect(page.locator('[data-testid="invite-sent"]'))
      .toContainText('Invitation sent');
    
    // Manage team settings
    await page.click('[data-testid="team-settings"]');
    await page.check('[data-testid="require-approval"]');
    await page.fill('[data-testid="min-level"]', '10');
    await page.click('[data-testid="save-settings"]');
    
    await expect(page.locator('[data-testid="settings-saved"]'))
      .toBeVisible();
  });
  
  test('TC033: Team battles and quests', async ({ page, browser }) => {
    // Arrange - Two teams
    const team1 = await createTeam('Alpha Squad', 5);
    const team2 = await createTeam('Beta Force', 5);
    
    // Start team battle
    const captain1 = await loginAsTeamCaptain(page, team1);
    await page.goto('/team-battles');
    await page.click('[data-testid="create-battle"]');
    await page.selectOption('[data-testid="battle-type"]', '5v5');
    await page.click('[data-testid="find-opponent"]');
    
    // Match found
    await page.waitForSelector('[data-testid="opponent-found"]');
    await expect(page.locator('[data-testid="opponent-team"]'))
      .toContainText('Beta Force');
    
    // Battle starts - simulate team members playing
    const teamMembers = await Promise.all(
      team1.members.map(async (member) => {
        const context = await browser.newContext();
        const memberPage = await context.newPage();
        await login(memberPage, member);
        await memberPage.goto('/team-battles/active');
        return memberPage;
      })
    );
    
    // Each member completes their part
    await Promise.all(
      teamMembers.map(async (memberPage) => {
        await completeQuiz(memberPage);
      })
    );
    
    // Check team results
    await page.goto('/team-battles/results');
    await expect(page.locator('[data-testid="team-score"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="mvp-player"]'))
      .toBeVisible();
    
    // Cleanup
    await Promise.all(teamMembers.map(p => p.context().close()));
  });
});
\`\`\`
        `,
      },
    },
  },
};

export const PaymentE2E: Story = {
  name: 'Payment & Subscription E2E Tests',
  parameters: {
    docs: {
      description: {
        story: `
### 💳 Payment & Subscription E2E Test Scenarios

#### Test Suite: Subscription Purchase
\`\`\`typescript
describe('Subscription Purchase Flow', () => {
  test('TC034: Purchase premium subscription', async ({ page }) => {
    // Arrange
    const user = await createFreeUser();
    await login(page, user);
    
    // Navigate to pricing
    await page.goto('/pricing');
    
    // Select premium plan
    await page.click('[data-testid="plan-premium"]');
    await expect(page.locator('[data-testid="plan-details"]'))
      .toContainText('$9.99/month');
    await expect(page.locator('[data-testid="plan-features"]'))
      .toContainText('Unlimited quizzes');
    
    // Click subscribe
    await page.click('[data-testid="subscribe-button"]');
    
    // Payment form (Stripe)
    const stripeFrame = page.frameLocator('[data-testid="stripe-frame"]');
    await stripeFrame.locator('[placeholder="Card number"]')
      .fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]')
      .fill('12/25');
    await stripeFrame.locator('[placeholder="CVC"]')
      .fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]')
      .fill('12345');
    
    // Confirm payment
    await page.click('[data-testid="confirm-payment"]');
    
    // Wait for processing
    await page.waitForSelector('[data-testid="payment-processing"]');
    await page.waitForSelector('[data-testid="payment-success"]', {
      timeout: 10000
    });
    
    // Assert - Subscription active
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Welcome to Premium!');
    await expect(page.locator('[data-testid="subscription-status"]'))
      .toContainText('Premium - Active');
    
    // Verify premium features unlocked
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="premium-badge"]'))
      .toBeVisible();
    await expect(page.locator('[data-testid="unlimited-quizzes"]'))
      .toBeVisible();
  });
  
  test('TC035: Payment failure handling', async ({ page }) => {
    // Arrange
    const user = await createFreeUser();
    await login(page, user);
    
    // Attempt payment with declining card
    await page.goto('/pricing');
    await page.click('[data-testid="plan-premium"]');
    await page.click('[data-testid="subscribe-button"]');
    
    // Use card that will be declined
    const stripeFrame = page.frameLocator('[data-testid="stripe-frame"]');
    await stripeFrame.locator('[placeholder="Card number"]')
      .fill('4000000000000002'); // Stripe test card that declines
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    
    await page.click('[data-testid="confirm-payment"]');
    
    // Assert - Error shown
    await expect(page.locator('[data-testid="payment-error"]'))
      .toContainText('Your card was declined');
    await expect(page.locator('[data-testid="try-again-button"]'))
      .toBeVisible();
    
    // Retry with different card
    await page.click('[data-testid="try-again-button"]');
    await stripeFrame.locator('[placeholder="Card number"]')
      .fill('4242424242424242');
    await page.click('[data-testid="confirm-payment"]');
    
    // Assert - Success on retry
    await expect(page.locator('[data-testid="payment-success"]'))
      .toBeVisible();
  });
  
  test('TC036: Subscription cancellation', async ({ page }) => {
    // Arrange - User with active subscription
    const user = await createPremiumUser();
    await login(page, user);
    
    // Navigate to account settings
    await page.goto('/account/subscription');
    
    // Assert - Current subscription shown
    await expect(page.locator('[data-testid="current-plan"]'))
      .toContainText('Premium');
    await expect(page.locator('[data-testid="next-billing"]'))
      .toContainText(/Next billing:/);
    
    // Cancel subscription
    await page.click('[data-testid="manage-subscription"]');
    await page.click('[data-testid="cancel-subscription"]');
    
    // Cancellation survey
    await page.click('[data-testid="reason-too-expensive"]');
    await page.fill('[data-testid="feedback"]', 'Testing cancellation');
    await page.click('[data-testid="confirm-cancel"]');
    
    // Assert - Cancellation confirmed
    await expect(page.locator('[data-testid="cancellation-confirmed"]'))
      .toContainText('Subscription cancelled');
    await expect(page.locator('[data-testid="access-until"]'))
      .toContainText(/You have access until:/);
    
    // Offer to keep subscription
    await expect(page.locator('[data-testid="retention-offer"]'))
      .toContainText('50% off for 2 months');
  });
});
\`\`\`

#### Test Suite: In-App Purchases
\`\`\`typescript
describe('In-App Purchases', () => {
  test('TC037: Purchase coins/credits', async ({ page }) => {
    // Arrange
    const user = await createUserWithLowCoins();
    await login(page, user);
    
    // Check current balance
    await expect(page.locator('[data-testid="coin-balance"]'))
      .toContainText('10 coins');
    
    // Open shop
    await page.click('[data-testid="shop-button"]');
    
    // Select coin package
    await page.click('[data-testid="coins-package-500"]');
    await expect(page.locator('[data-testid="package-details"]'))
      .toContainText('500 coins for $4.99');
    
    // Purchase
    await page.click('[data-testid="buy-now"]');
    await completePayment(page);
    
    // Assert - Coins added
    await expect(page.locator('[data-testid="purchase-complete"]'))
      .toContainText('500 coins added!');
    await expect(page.locator('[data-testid="coin-balance"]'))
      .toContainText('510 coins');
    
    // Transaction history
    await page.goto('/account/transactions');
    await expect(page.locator('[data-testid="transaction-latest"]'))
      .toContainText('Purchased 500 coins');
  });
  
  test('TC038: Purchase power-ups bundle', async ({ page }) => {
    // Arrange
    await loginAsActiveUser(page);
    
    // Navigate to power-ups shop
    await page.goto('/shop/power-ups');
    
    // Select bundle
    await page.click('[data-testid="power-up-mega-bundle"]');
    await expect(page.locator('[data-testid="bundle-contents"]'))
      .toContainText('10x Hints, 5x 50-50, 3x Skip');
    
    // Purchase with coins
    await page.click('[data-testid="buy-with-coins"]');
    await page.click('[data-testid="confirm-purchase"]');
    
    // Assert - Power-ups added
    await expect(page.locator('[data-testid="purchase-success"]'))
      .toBeVisible();
    
    // Verify in inventory
    await page.goto('/inventory');
    await expect(page.locator('[data-testid="hint-count"]'))
      .toContainText('10');
    await expect(page.locator('[data-testid="fifty-fifty-count"]'))
      .toContainText('5');
  });
});
\`\`\`

#### Test Suite: Refunds & Disputes
\`\`\`typescript
describe('Refund Process', () => {
  test('TC039: Request and process refund', async ({ page }) => {
    // Arrange - User with recent purchase
    const user = await createUserWithRecentPurchase();
    await login(page, user);
    
    // Navigate to purchase history
    await page.goto('/account/purchases');
    await page.click('[data-testid="purchase-yesterday"]');
    
    // Request refund
    await page.click('[data-testid="request-refund"]');
    await page.selectOption('[data-testid="refund-reason"]', 'accidental');
    await page.fill('[data-testid="refund-details"]', 
      'Accidentally purchased wrong package');
    await page.click('[data-testid="submit-refund"]');
    
    // Assert - Refund requested
    await expect(page.locator('[data-testid="refund-requested"]'))
      .toContainText('Refund request submitted');
    await expect(page.locator('[data-testid="refund-status"]'))
      .toContainText('Pending review');
    
    // Simulate admin approval (in test environment)
    await approveRefund(user.lastPurchaseId);
    
    // Check refund processed
    await page.reload();
    await expect(page.locator('[data-testid="refund-status"]'))
      .toContainText('Refunded');
    await expect(page.locator('[data-testid="refund-amount"]'))
      .toContainText('$4.99 refunded');
  });
});
\`\`\`

#### Test Helpers
\`\`\`typescript
// tests/e2e/helpers/payment.ts
export async function completePayment(
  page: Page,
  cardNumber = '4242424242424242'
) {
  const stripeFrame = page.frameLocator('[data-testid="stripe-frame"]');
  await stripeFrame.locator('[placeholder="Card number"]').fill(cardNumber);
  await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
  await stripeFrame.locator('[placeholder="CVC"]').fill('123');
  await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');
  await page.click('[data-testid="confirm-payment"]');
  await page.waitForSelector('[data-testid="payment-success"]');
}

export async function mockStripeWebhook(event: string, data: any) {
  return fetch('/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'stripe-signature': generateTestSignature(),
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      type: event,
      data
    })
  });
}

export const TestCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expired: '4000000000000069',
  incorrect3DS: '4000002760003184'
};
\`\`\`
        `,
      },
    },
  },
};

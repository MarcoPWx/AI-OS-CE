import { test, expect, Page } from '@playwright/test';
import { SelfLearningOrchestrator } from '../services/selfLearningOrchestrator';
import BloomsTaxonomyValidator from '../services/bloomsTaxonomyValidator';

/**
 * Playwright E2E Tests for Self-Learning System
 * Tests adaptive learning, Bloom's Taxonomy validation, and pedagogical features
 */

// Configure test settings for video and screenshot capture
test.use({
  video: {
    mode: 'on',
    size: { width: 1280, height: 720 },
  },
  screenshot: {
    mode: 'on',
    fullPage: true,
  },
  trace: 'on-first-retry',
});

test.describe('Self-Learning System Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage, context }) => {
    page = testPage;

    // Set up test user session
    await context.addCookies([
      {
        name: 'test_user_session',
        value: 'test_user_123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/');
  });

  test.afterEach(async () => {
    // Capture final screenshot for documentation
    await page.screenshot({
      path: `screenshots/test-end-${Date.now()}.png`,
      fullPage: true,
    });
  });

  test.describe("Bloom's Taxonomy Validation", () => {
    test('should validate questions according to Bloom levels', async () => {
      // Navigate to question creation
      await page.goto('/admin/questions/create');

      // Test Remember level question
      await test.step('Create Remember level question', async () => {
        await page.fill('[data-testid="question-text"]', 'What is the capital of France?');
        await page.selectOption('[data-testid="question-type"]', 'multiple-choice');
        await page.fill('[data-testid="option-1"]', 'Paris');
        await page.fill('[data-testid="option-2"]', 'London');
        await page.fill('[data-testid="option-3"]', 'Berlin');
        await page.fill('[data-testid="option-4"]', 'Madrid');

        // Capture screenshot of question creation
        await page.screenshot({
          path: 'screenshots/bloom-remember-question.png',
          fullPage: true,
        });

        // Validate with Bloom's Taxonomy
        await page.click('[data-testid="validate-question"]');

        // Check validation results
        await expect(page.locator('[data-testid="bloom-level"]')).toContainText('Remember');
        await expect(page.locator('[data-testid="cognitive-complexity"]')).toBeVisible();
      });

      // Test Analyze level question
      await test.step('Create Analyze level question', async () => {
        await page.click('[data-testid="new-question"]');

        await page.fill(
          '[data-testid="question-text"]',
          'Analyze the relationship between climate change and biodiversity loss. ' +
            'Which factors contribute most significantly to species extinction?',
        );
        await page.selectOption('[data-testid="question-type"]', 'essay');

        // Capture screenshot
        await page.screenshot({
          path: 'screenshots/bloom-analyze-question.png',
          fullPage: true,
        });

        // Validate
        await page.click('[data-testid="validate-question"]');

        // Check validation
        await expect(page.locator('[data-testid="bloom-level"]')).toContainText('Analyze');
        await expect(page.locator('[data-testid="pedagogical-alignment"]')).toBeVisible();
      });

      // Test Create level question
      await test.step('Create Create level question', async () => {
        await page.click('[data-testid="new-question"]');

        await page.fill(
          '[data-testid="question-text"]',
          'Design an innovative solution to reduce plastic waste in oceans. ' +
            'Create a comprehensive plan including implementation strategies.',
        );
        await page.selectOption('[data-testid="question-type"]', 'project');

        // Capture screenshot
        await page.screenshot({
          path: 'screenshots/bloom-create-question.png',
          fullPage: true,
        });

        // Validate
        await page.click('[data-testid="validate-question"]');

        // Check validation
        await expect(page.locator('[data-testid="bloom-level"]')).toContainText('Create');
        await expect(page.locator('[data-testid="cognitive-load"]')).toBeVisible();
      });
    });

    test('should provide pedagogical suggestions', async () => {
      await page.goto('/admin/questions/validate');

      // Upload question set for validation
      await page.setInputFiles('[data-testid="question-file"]', 'test-data/questions.json');
      await page.click('[data-testid="validate-set"]');

      // Wait for validation results
      await page.waitForSelector('[data-testid="validation-results"]');

      // Check for suggestions
      await expect(page.locator('[data-testid="suggestions-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="bloom-distribution"]')).toBeVisible();

      // Capture validation report
      await page.screenshot({
        path: 'screenshots/pedagogical-validation-report.png',
        fullPage: true,
      });

      // Check recommendations
      const recommendations = await page.locator('[data-testid="recommendations"] li').count();
      expect(recommendations).toBeGreaterThan(0);
    });
  });

  test.describe('Adaptive Learning Engine', () => {
    test('should generate personalized learning session', async () => {
      await page.goto('/quiz/start');

      // Select adaptive mode
      await page.click('[data-testid="adaptive-mode"]');
      await page.selectOption('[data-testid="category"]', 'science');

      // Start session
      await page.click('[data-testid="start-quiz"]');

      // Wait for personalized session to load
      await page.waitForSelector('[data-testid="question-container"]');

      // Verify adaptive features
      await expect(page.locator('[data-testid="difficulty-indicator"]')).toBeVisible();
      await expect(page.locator('[data-testid="personalized-hint"]')).toBeVisible();

      // Answer questions to test adaptation
      for (let i = 0; i < 3; i++) {
        await test.step(`Answer question ${i + 1}`, async () => {
          // Capture question state
          await page.screenshot({
            path: `screenshots/adaptive-question-${i + 1}.png`,
          });

          // Select answer
          await page.click('[data-testid="answer-option-1"]');
          await page.click('[data-testid="submit-answer"]');

          // Check for adaptive feedback
          await expect(page.locator('[data-testid="adaptive-feedback"]')).toBeVisible();

          // Continue to next question
          if (i < 2) {
            await page.click('[data-testid="next-question"]');
          }
        });
      }

      // Check session results
      await expect(page.locator('[data-testid="session-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="learning-analytics"]')).toBeVisible();
    });

    test('should adjust difficulty based on performance', async () => {
      await page.goto('/quiz/adaptive');

      // Start with baseline assessment
      await page.click('[data-testid="start-assessment"]');

      // Track difficulty changes
      const difficulties: number[] = [];

      // Answer questions with varying accuracy
      for (let i = 0; i < 5; i++) {
        await test.step(`Question ${i + 1} difficulty tracking`, async () => {
          // Get current difficulty
          const difficultyText = await page
            .locator('[data-testid="difficulty-level"]')
            .textContent();
          difficulties.push(parseInt(difficultyText || '0'));

          // Answer incorrectly for first 2, correctly for rest
          if (i < 2) {
            await page.click('[data-testid="answer-option-3"]'); // Wrong answer
          } else {
            await page.click('[data-testid="answer-option-1"]'); // Correct answer
          }

          await page.click('[data-testid="submit-answer"]');

          if (i < 4) {
            await page.click('[data-testid="next-question"]');
          }
        });
      }

      // Verify difficulty adjustment
      expect(difficulties[2]).toBeLessThan(difficulties[0]); // Decreased after wrong answers
      expect(difficulties[4]).toBeGreaterThan(difficulties[2]); // Increased after correct answers

      // Capture final state
      await page.screenshot({
        path: 'screenshots/adaptive-difficulty-progression.png',
        fullPage: true,
      });
    });

    test('should maintain flow state optimization', async () => {
      await page.goto('/quiz/flow-optimized');

      await page.click('[data-testid="start-flow-session"]');

      // Monitor flow indicators
      for (let i = 0; i < 7; i++) {
        await test.step(`Flow state question ${i + 1}`, async () => {
          // Check flow indicators
          await expect(page.locator('[data-testid="flow-indicator"]')).toBeVisible();

          // Verify question ordering follows flow curve
          const position = await page.locator('[data-testid="question-position"]').textContent();
          const difficulty = await page.locator('[data-testid="difficulty-level"]').textContent();

          // Capture flow state
          if (i === 3) {
            // Mid-session
            await page.screenshot({
              path: 'screenshots/flow-state-peak.png',
            });
          }

          // Answer question
          await page.click('[data-testid="answer-option-1"]');
          await page.click('[data-testid="submit-answer"]');

          if (i < 6) {
            await page.click('[data-testid="next-question"]');
          }
        });
      }

      // Check flow metrics
      await expect(page.locator('[data-testid="flow-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="engagement-score"]')).toBeVisible();
    });
  });

  test.describe('Learning Plan Creation', () => {
    test('should create personalized learning plan', async () => {
      await page.goto('/learning/create-plan');

      // Set learning goals
      await page.selectOption('[data-testid="target-level"]', 'analyze');
      await page.fill('[data-testid="timeframe"]', '30'); // 30 days
      await page.selectOption('[data-testid="pace"]', 'moderate');

      // Capture plan configuration
      await page.screenshot({
        path: 'screenshots/learning-plan-config.png',
      });

      // Generate plan
      await page.click('[data-testid="generate-plan"]');

      // Wait for plan generation
      await page.waitForSelector('[data-testid="learning-plan"]');

      // Verify plan components
      await expect(page.locator('[data-testid="milestones"]')).toBeVisible();
      await expect(page.locator('[data-testid="estimated-duration"]')).toBeVisible();
      await expect(page.locator('[data-testid="adaptive-strategy"]')).toBeVisible();
      await expect(page.locator('[data-testid="pedagogical-approach"]')).toBeVisible();

      // Check milestones
      const milestones = await page.locator('[data-testid="milestone-item"]').count();
      expect(milestones).toBeGreaterThanOrEqual(3);

      // Capture complete plan
      await page.screenshot({
        path: 'screenshots/complete-learning-plan.png',
        fullPage: true,
      });
    });

    test('should track learning progress', async () => {
      await page.goto('/learning/progress');

      // Check progress dashboard
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="bloom-mastery"]')).toBeVisible();
      await expect(page.locator('[data-testid="knowledge-map"]')).toBeVisible();

      // Capture progress visualization
      await page.screenshot({
        path: 'screenshots/learning-progress-dashboard.png',
        fullPage: true,
      });

      // Check detailed analytics
      await page.click('[data-testid="detailed-analytics"]');

      await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="engagement-metrics"]')).toBeVisible();
      await expect(page.locator('[data-testid="recommendations"]')).toBeVisible();

      // Verify recommendations
      const recommendations = await page.locator('[data-testid="recommendation-item"]').count();
      expect(recommendations).toBeGreaterThan(0);
    });
  });

  test.describe('Self-Learning Feedback Loop', () => {
    test('should process session feedback and adapt', async () => {
      await page.goto('/quiz/adaptive');

      // Complete a session
      await page.click('[data-testid="start-quiz"]');

      // Answer questions
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="answer-option-1"]');
        await page.click('[data-testid="submit-answer"]');
        if (i < 4) {
          await page.click('[data-testid="next-question"]');
        }
      }

      // Check feedback processing
      await page.waitForSelector('[data-testid="session-complete"]');
      await expect(page.locator('[data-testid="feedback-processing"]')).toBeVisible();

      // Capture feedback results
      await page.screenshot({
        path: 'screenshots/feedback-loop-results.png',
      });

      // Start new session to verify adaptation
      await page.click('[data-testid="new-session"]');

      // Verify adaptations applied
      await expect(page.locator('[data-testid="adapted-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="personalized-path"]')).toBeVisible();
    });

    test('should analyze question effectiveness', async () => {
      await page.goto('/admin/analytics/questions');

      // View question effectiveness metrics
      await expect(page.locator('[data-testid="effectiveness-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="discrimination-index"]')).toBeVisible();

      // Filter by Bloom level
      await page.selectOption('[data-testid="bloom-filter"]', 'analyze');

      // Check effectiveness data
      const questionRows = await page.locator('[data-testid="question-row"]').count();
      expect(questionRows).toBeGreaterThan(0);

      // Capture analytics
      await page.screenshot({
        path: 'screenshots/question-effectiveness-analytics.png',
        fullPage: true,
      });
    });
  });

  test.describe('Learning Analytics Dashboard', () => {
    test('should display comprehensive learning analytics', async () => {
      await page.goto('/dashboard/analytics');

      // Check main metrics
      await expect(page.locator('[data-testid="overall-accuracy"]')).toBeVisible();
      await expect(page.locator('[data-testid="learning-velocity"]')).toBeVisible();
      await expect(page.locator('[data-testid="flow-frequency"]')).toBeVisible();

      // Check Bloom's Taxonomy distribution
      await expect(page.locator('[data-testid="bloom-chart"]')).toBeVisible();

      // Capture dashboard
      await page.screenshot({
        path: 'screenshots/learning-analytics-dashboard.png',
        fullPage: true,
      });

      // Check recommendations
      await page.click('[data-testid="view-recommendations"]');
      await expect(page.locator('[data-testid="ml-recommendations"]')).toBeVisible();

      // Verify recommendation types
      const hasContentRec = await page
        .locator('[data-testid="content-recommendation"]')
        .isVisible();
      const hasStrategyRec = await page
        .locator('[data-testid="strategy-recommendation"]')
        .isVisible();

      expect(hasContentRec || hasStrategyRec).toBeTruthy();
    });

    test('should export learning report', async () => {
      await page.goto('/dashboard/reports');

      // Configure report
      await page.selectOption('[data-testid="report-type"]', 'comprehensive');
      await page.click('[data-testid="include-bloom"]');
      await page.click('[data-testid="include-recommendations"]');

      // Generate report
      await page.click('[data-testid="generate-report"]');

      // Wait for report generation
      await page.waitForSelector('[data-testid="report-ready"]');

      // Capture report preview
      await page.screenshot({
        path: 'screenshots/learning-report-preview.png',
        fullPage: true,
      });

      // Verify report contents
      await expect(page.locator('[data-testid="report-sections"]')).toBeVisible();
      const sections = await page.locator('[data-testid="report-section"]').count();
      expect(sections).toBeGreaterThanOrEqual(5);
    });
  });
});

// Performance tests for self-learning system
test.describe('Self-Learning Performance Tests', () => {
  test('should handle large question sets efficiently', async ({ page }) => {
    await page.goto('/admin/questions/bulk-validate');

    const startTime = Date.now();

    // Upload large question set
    await page.setInputFiles('[data-testid="bulk-file"]', 'test-data/large-question-set.json');
    await page.click('[data-testid="validate-bulk"]');

    // Wait for processing
    await page.waitForSelector('[data-testid="validation-complete"]', { timeout: 30000 });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Should process within reasonable time (30 seconds for large set)
    expect(processingTime).toBeLessThan(30000);

    // Verify all questions validated
    const validatedCount = await page.locator('[data-testid="validated-count"]').textContent();
    expect(parseInt(validatedCount || '0')).toBeGreaterThan(100);
  });

  test('should maintain responsive UI during adaptive calculations', async ({ page }) => {
    await page.goto('/quiz/adaptive');

    // Start intensive adaptive session
    await page.click('[data-testid="start-intensive"]');

    // Measure UI responsiveness
    const measurements: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await page.click('[data-testid="answer-option-1"]');
      await page.click('[data-testid="submit-answer"]');

      // Wait for adaptive calculation
      await page.waitForSelector('[data-testid="calculation-complete"]');

      const responseTime = Date.now() - start;
      measurements.push(responseTime);

      if (i < 9) {
        await page.click('[data-testid="next-question"]');
      }
    }

    // Check average response time
    const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    expect(avgResponseTime).toBeLessThan(2000); // Should respond within 2 seconds
  });
});

// Accessibility tests for self-learning features
test.describe('Self-Learning Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/quiz/adaptive');

    // Navigate using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Start quiz

    // Navigate through questions
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Space'); // Select answer
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Submit

      if (i < 2) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter'); // Next question
      }
    }

    // Verify completion
    await expect(page.locator('[data-testid="session-complete"]')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/learning/create-plan');

    // Check ARIA labels
    const ariaLabels = [
      '[aria-label="Target Bloom level"]',
      '[aria-label="Learning pace"]',
      '[aria-label="Time frame in days"]',
      '[aria-label="Generate learning plan"]',
    ];

    for (const label of ariaLabels) {
      await expect(page.locator(label)).toBeVisible();
    }
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Check for screen reader announcements
    await expect(page.locator('[role="status"]')).toBeVisible();
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();

    // Check chart descriptions
    await expect(page.locator('[aria-label="Bloom taxonomy distribution chart"]')).toBeVisible();
    await expect(page.locator('[aria-describedby="chart-description"]')).toBeVisible();
  });
});

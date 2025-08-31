import { test, expect, Page } from '@playwright/test';

/**
 * S2S (Server-to-Server) Orchestration - Mock-First E2E Tests
 *
 * Tests service orchestration patterns with comprehensive mock validation
 * Validates chaos testing, failure recovery, and service coordination
 */

// Helper to setup S2S orchestration mocks
async function setupS2SOrchestration(
  page: Page,
  scenario: 'happy' | 'failure' | 'chaos' = 'happy',
) {
  await page.goto(
    `http://localhost:7007/?path=/story/dev-s2s-orchestration--default&chaos=${scenario === 'chaos' ? '50' : '0'}`,
  );

  // Wait for Storybook to load
  await page.waitForSelector('iframe#storybook-preview-iframe');
  const frame = page.frameLocator('#storybook-preview-iframe');

  return frame;
}

test.describe('S2S Orchestration: Mock Service Coordination', () => {
  test('S2S-001: Happy Path - Full Quiz Generation Pipeline', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'happy');

    // Start orchestration
    await frame.getByTestId('orchestrate-btn').click();

    // Monitor service calls
    const serviceCalls = {
      scraper: false,
      ai: false,
      validator: false,
      database: false,
    };

    // Track service status updates
    await expect(frame.getByTestId('status-scraper')).toHaveText('Running', { timeout: 5000 });
    serviceCalls.scraper = true;

    await expect(frame.getByTestId('status-ai')).toHaveText('Running', { timeout: 5000 });
    serviceCalls.ai = true;

    await expect(frame.getByTestId('status-validator')).toHaveText('Running', { timeout: 5000 });
    serviceCalls.validator = true;

    await expect(frame.getByTestId('status-database')).toHaveText('Success', { timeout: 10000 });
    serviceCalls.database = true;

    // Verify all services were called
    expect(Object.values(serviceCalls).every((v) => v)).toBe(true);

    // Check final status
    await expect(frame.getByTestId('orchestration-status')).toHaveText('Complete');

    // Validate DB writes preview
    await frame.getByTestId('preview-tab').click();
    const dbWrites = await frame.getByTestId('db-writes-preview').textContent();
    expect(dbWrites).toContain('INSERT INTO questions');
    expect(dbWrites).toContain('userId');
    expect(dbWrites).toContain('topic');
  });

  test('S2S-002: Failure Recovery - Scraper Service Down', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'failure');

    // Configure scraper to fail
    await frame.getByTestId('service-scraper-fail').click();

    // Start orchestration
    await frame.getByTestId('orchestrate-btn').click();

    // Verify scraper fails
    await expect(frame.getByTestId('status-scraper')).toHaveText('Failed', { timeout: 5000 });

    // Verify retry mechanism activates
    await expect(frame.getByTestId('retry-count-scraper')).toHaveText('1/3');
    await expect(frame.getByTestId('retry-count-scraper')).toHaveText('2/3', { timeout: 5000 });
    await expect(frame.getByTestId('retry-count-scraper')).toHaveText('3/3', { timeout: 5000 });

    // Verify fallback activates
    await expect(frame.getByTestId('fallback-active')).toBeVisible();

    // Check orchestration continues with fallback
    await expect(frame.getByTestId('status-ai')).toHaveText('Running', { timeout: 5000 });

    // Verify degraded mode indicator
    await expect(frame.getByTestId('orchestration-status')).toHaveText('Complete (Degraded)');
  });

  test('S2S-003: Chaos Testing - Random Failures', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'chaos');

    // Run multiple orchestrations to test chaos
    const results = [];

    for (let i = 0; i < 5; i++) {
      // Reset state
      await frame.getByTestId('reset-btn').click();

      // Start orchestration
      await frame.getByTestId('orchestrate-btn').click();

      // Wait for completion
      await expect(frame.getByTestId('orchestration-status')).toHaveText(/(Complete|Failed)/, {
        timeout: 15000,
      });

      const status = await frame.getByTestId('orchestration-status').textContent();
      results.push(status);
    }

    // With 50% chaos, we should see some failures
    const failures = results.filter((r) => r?.includes('Failed')).length;
    const successes = results.filter((r) => r?.includes('Complete')).length;

    expect(failures).toBeGreaterThan(0);
    expect(successes).toBeGreaterThan(0);

    // Verify metrics are collected
    const metrics = await frame.getByTestId('chaos-metrics').textContent();
    expect(metrics).toContain('Success Rate');
    expect(metrics).toContain('Avg Response Time');
  });

  test('S2S-004: Circuit Breaker Pattern', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'failure');

    // Configure AI service to fail repeatedly
    await frame.getByTestId('service-ai-fail').click();
    await frame.getByTestId('fail-count-input').fill('10');

    // Run orchestrations to trip circuit breaker
    for (let i = 0; i < 3; i++) {
      await frame.getByTestId('orchestrate-btn').click();
      await expect(frame.getByTestId('status-ai')).toHaveText('Failed', { timeout: 5000 });
      await frame.getByTestId('reset-btn').click();
    }

    // Circuit breaker should now be open
    await expect(frame.getByTestId('circuit-breaker-ai')).toHaveText('OPEN');

    // Next call should fail fast
    const startTime = Date.now();
    await frame.getByTestId('orchestrate-btn').click();
    await expect(frame.getByTestId('status-ai')).toHaveText('Circuit Open', { timeout: 1000 });
    const duration = Date.now() - startTime;

    // Should fail fast (< 500ms) when circuit is open
    expect(duration).toBeLessThan(500);

    // Wait for circuit to half-open
    await page.waitForTimeout(5000);
    await expect(frame.getByTestId('circuit-breaker-ai')).toHaveText('HALF-OPEN');

    // Configure service to succeed
    await frame.getByTestId('service-ai-success').click();

    // Test recovery
    await frame.getByTestId('orchestrate-btn').click();
    await expect(frame.getByTestId('status-ai')).toHaveText('Success', { timeout: 5000 });

    // Circuit should close
    await expect(frame.getByTestId('circuit-breaker-ai')).toHaveText('CLOSED');
  });

  test('S2S-005: Rate Limiting and Backpressure', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'happy');

    // Configure rate limits
    await frame.getByTestId('rate-limit-input').fill('5');
    await frame.getByTestId('rate-window-input').fill('1000'); // 5 requests per second

    // Send burst of requests
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(frame.getByTestId('orchestrate-btn').click());
    }

    // Some should be rate limited
    await page.waitForTimeout(2000);

    const rateLimited = await frame.getByTestId('rate-limited-count').textContent();
    expect(parseInt(rateLimited || '0')).toBeGreaterThan(0);

    // Verify backpressure queue
    const queueSize = await frame.getByTestId('queue-size').textContent();
    expect(parseInt(queueSize || '0')).toBeGreaterThan(0);

    // Wait for queue to drain
    await expect(frame.getByTestId('queue-size')).toHaveText('0', { timeout: 10000 });
  });

  test('S2S-006: Distributed Tracing', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'happy');

    // Enable tracing
    await frame.getByTestId('enable-tracing').click();

    // Start orchestration
    await frame.getByTestId('orchestrate-btn').click();

    // Wait for completion
    await expect(frame.getByTestId('orchestration-status')).toHaveText('Complete', {
      timeout: 10000,
    });

    // Open trace viewer
    await frame.getByTestId('view-trace-btn').click();

    // Verify trace contains all service calls
    await expect(frame.getByTestId('trace-span-scraper')).toBeVisible();
    await expect(frame.getByTestId('trace-span-ai')).toBeVisible();
    await expect(frame.getByTestId('trace-span-validator')).toBeVisible();
    await expect(frame.getByTestId('trace-span-database')).toBeVisible();

    // Check trace timing
    const totalTime = await frame.getByTestId('trace-total-time').textContent();
    expect(parseInt(totalTime || '0')).toBeGreaterThan(0);

    // Verify parent-child relationships
    const scraperParent = await frame.getByTestId('trace-span-scraper').getAttribute('data-parent');
    expect(scraperParent).toBe('root');

    const aiParent = await frame.getByTestId('trace-span-ai').getAttribute('data-parent');
    expect(aiParent).toBe('scraper');
  });

  test('S2S-007: Service Health Checks', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'happy');

    // Run health checks
    await frame.getByTestId('health-check-btn').click();

    // Verify all services report healthy
    await expect(frame.getByTestId('health-scraper')).toHaveText('Healthy');
    await expect(frame.getByTestId('health-ai')).toHaveText('Healthy');
    await expect(frame.getByTestId('health-validator')).toHaveText('Healthy');
    await expect(frame.getByTestId('health-database')).toHaveText('Healthy');

    // Configure AI service to be unhealthy
    await frame.getByTestId('service-ai-unhealthy').click();

    // Re-run health checks
    await frame.getByTestId('health-check-btn').click();

    // AI should now be unhealthy
    await expect(frame.getByTestId('health-ai')).toHaveText('Unhealthy');

    // Orchestration should skip unhealthy service
    await frame.getByTestId('orchestrate-btn').click();
    await expect(frame.getByTestId('status-ai')).toHaveText('Skipped (Unhealthy)');
  });

  test('S2S-008: Saga Pattern - Compensating Transactions', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'failure');

    // Configure database to fail after validation
    await frame.getByTestId('fail-at-stage').selectOption('database');

    // Start orchestration
    await frame.getByTestId('orchestrate-btn').click();

    // Services should run until database
    await expect(frame.getByTestId('status-scraper')).toHaveText('Success', { timeout: 5000 });
    await expect(frame.getByTestId('status-ai')).toHaveText('Success', { timeout: 5000 });
    await expect(frame.getByTestId('status-validator')).toHaveText('Success', { timeout: 5000 });
    await expect(frame.getByTestId('status-database')).toHaveText('Failed', { timeout: 5000 });

    // Compensating transactions should trigger
    await expect(frame.getByTestId('compensation-active')).toBeVisible();

    // Verify rollback actions
    await expect(frame.getByTestId('rollback-validator')).toHaveText('Rolled back');
    await expect(frame.getByTestId('rollback-ai')).toHaveText('Rolled back');
    await expect(frame.getByTestId('rollback-scraper')).toHaveText('Rolled back');

    // Final status should indicate rollback
    await expect(frame.getByTestId('orchestration-status')).toHaveText('Rolled Back');
  });

  test('S2S-009: WebSocket Real-time Updates', async ({ page }) => {
    // Navigate to WS demo
    await page.goto('http://localhost:7007/?path=/story/demo-live-ws-sse-fallback--default');
    const frame = page.frameLocator('#storybook-preview-iframe');

    // Connect to WebSocket
    await frame.getByTestId('connect-ws').click();
    await expect(frame.getByTestId('connection-status')).toHaveText('Connected');

    // Subscribe to orchestration events
    await frame.getByTestId('subscribe-orchestration').click();

    // Trigger S2S orchestration
    await frame.getByTestId('trigger-orchestration').click();

    // Verify real-time updates
    await expect(frame.getByTestId('event-scraper-started')).toBeVisible({ timeout: 1000 });
    await expect(frame.getByTestId('event-scraper-completed')).toBeVisible({ timeout: 3000 });
    await expect(frame.getByTestId('event-ai-started')).toBeVisible({ timeout: 3000 });
    await expect(frame.getByTestId('event-ai-completed')).toBeVisible({ timeout: 5000 });

    // Verify event ordering
    const events = await frame.getByTestId('event-log').textContent();
    const eventOrder = ['scraper-started', 'scraper-completed', 'ai-started', 'ai-completed'];

    let lastIndex = -1;
    for (const event of eventOrder) {
      const index = events?.indexOf(event) ?? -1;
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
    }
  });

  test('S2S-010: Performance Metrics Collection', async ({ page }) => {
    const frame = await setupS2SOrchestration(page, 'happy');

    // Enable metrics collection
    await frame.getByTestId('enable-metrics').click();

    // Run multiple orchestrations
    for (let i = 0; i < 3; i++) {
      await frame.getByTestId('orchestrate-btn').click();
      await expect(frame.getByTestId('orchestration-status')).toHaveText('Complete', {
        timeout: 10000,
      });
      await frame.getByTestId('reset-btn').click();
    }

    // View metrics dashboard
    await frame.getByTestId('view-metrics').click();

    // Verify metrics are collected
    await expect(frame.getByTestId('metric-p50')).toBeVisible();
    await expect(frame.getByTestId('metric-p95')).toBeVisible();
    await expect(frame.getByTestId('metric-p99')).toBeVisible();

    // Check service-specific metrics
    await expect(frame.getByTestId('metric-scraper-avg')).toBeVisible();
    await expect(frame.getByTestId('metric-ai-avg')).toBeVisible();
    await expect(frame.getByTestId('metric-validator-avg')).toBeVisible();
    await expect(frame.getByTestId('metric-database-avg')).toBeVisible();

    // Verify throughput metrics
    const throughput = await frame.getByTestId('metric-throughput').textContent();
    expect(parseFloat(throughput || '0')).toBeGreaterThan(0);
  });
});

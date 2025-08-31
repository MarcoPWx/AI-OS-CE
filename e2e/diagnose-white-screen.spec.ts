import { test, expect } from '@playwright/test';

test.describe('White Screen Diagnosis', () => {
  test('diagnose white screen issue', async ({ page, browserName }) => {
    console.log(`Testing in ${browserName}`);

    // Capture all console messages
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.error(`[Console Error]: ${text}`);
      } else {
        consoleLogs.push(text);
        console.log(`[Console]: ${text}`);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      console.error(`[Page Error]: ${error.message}`);
      consoleErrors.push(error.message);
    });

    // Capture network failures
    page.on('requestfailed', (request) => {
      console.error(`[Request Failed]: ${request.url()} - ${request.failure()?.errorText}`);
    });

    console.log('1. Navigating to app...');
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });

    console.log('2. Checking HTML structure...');
    const html = await page.content();
    console.log(`HTML length: ${html.length} characters`);

    // Check if basic HTML is loaded
    const hasHtml = html.includes('<html');
    const hasBody = html.includes('<body');
    const hasRoot = html.includes('root');

    console.log(`Has HTML tag: ${hasHtml}`);
    console.log(`Has Body tag: ${hasBody}`);
    console.log(`Has root element: ${hasRoot}`);

    // Check for React root
    const rootElement = await page.$('#root');
    console.log(`Root element exists: ${rootElement !== null}`);

    if (rootElement) {
      const rootContent = await rootElement.innerHTML();
      console.log(`Root element content length: ${rootContent.length}`);
      console.log(`Root element first 200 chars: ${rootContent.substring(0, 200)}`);
    }

    // Check for any visible text
    const bodyText = await page.textContent('body');
    console.log(`Body text content: "${bodyText?.trim()}"`);

    // Check computed styles
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
      };
    });
    console.log('Body styles:', JSON.stringify(bodyStyles, null, 2));

    // Check for JavaScript execution
    const jsWorks = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    console.log(`JavaScript execution works: ${jsWorks}`);

    // Check for React
    const hasReact = await page.evaluate(() => {
      return typeof (window as any).React !== 'undefined';
    });
    console.log(`React loaded: ${hasReact}`);

    // Check for bundler issues
    const hasImportMeta = await page.evaluate(() => {
      try {
        // Check if import.meta is available
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = 'window.__importMetaTest = typeof import.meta !== "undefined";';
        document.head.appendChild(script);
        return (window as any).__importMetaTest || false;
      } catch (e) {
        return false;
      }
    });
    console.log(`import.meta available: ${hasImportMeta}`);

    // Take screenshots
    await page.screenshot({
      path: `test-results/white-screen-${browserName}.png`,
      fullPage: true,
    });

    // Print all errors found
    if (consoleErrors.length > 0) {
      console.error('\n=== CONSOLE ERRORS FOUND ===');
      consoleErrors.forEach((err) => console.error(err));
      console.error('=== END CONSOLE ERRORS ===\n');
    }

    // Assertions
    expect(consoleErrors.length, 'Should have no console errors').toBe(0);
    expect(bodyText?.trim(), 'Body should have text content').not.toBe('');
  });

  test('check Metro bundler output', async ({ page }) => {
    // Try to access the bundle directly
    const response = await page.goto('http://localhost:8082/index.bundle?platform=web', {
      waitUntil: 'networkidle',
    });

    if (response) {
      console.log(`Bundle response status: ${response.status()}`);
      const contentType = response.headers()['content-type'];
      console.log(`Bundle content-type: ${contentType}`);

      if (response.ok()) {
        const text = await response.text();
        console.log(`Bundle size: ${text.length} characters`);

        // Check for common issues
        const hasImportMeta = text.includes('import.meta');
        const hasModuleExports = text.includes('module.exports');
        const hasReact = text.includes('React');

        console.log(`Bundle contains import.meta: ${hasImportMeta}`);
        console.log(`Bundle contains module.exports: ${hasModuleExports}`);
        console.log(`Bundle contains React: ${hasReact}`);

        // Check for errors in bundle
        if (text.includes('error') || text.includes('Error')) {
          const errorMatch = text.match(/.{0,200}[Ee]rror.{0,200}/);
          if (errorMatch) {
            console.error(`Bundle contains error: ${errorMatch[0]}`);
          }
        }
      }
    }
  });

  test('try minimal React app', async ({ page, browserName }) => {
    // Inject a minimal React app to test if React works at all
    await page.goto('/');

    const reactWorks = await page.evaluate(() => {
      try {
        // Clear the body
        document.body.innerHTML = '<div id="test-root"></div>';

        // Create a simple element
        const root = document.getElementById('test-root');
        if (root) {
          root.innerHTML = '<h1>Test React App</h1><p>If you see this, HTML injection works!</p>';
          return true;
        }
        return false;
      } catch (e) {
        console.error('Failed to inject HTML:', e);
        return false;
      }
    });

    console.log(`HTML injection works: ${reactWorks}`);

    await page.screenshot({
      path: `test-results/minimal-inject-${browserName}.png`,
    });
  });

  test('check for specific Firefox issues', async ({ page, browserName }) => {
    if (browserName !== 'firefox') {
      test.skip();
      return;
    }

    console.log('Running Firefox-specific checks...');

    // Check for module script support
    const moduleScriptSupport = await page.evaluate(() => {
      const script = document.createElement('script');
      script.type = 'module';
      return 'noModule' in script;
    });
    console.log(`Firefox module script support: ${moduleScriptSupport}`);

    // Check for specific CSS issues
    const flexboxWorks = await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      document.body.appendChild(div);
      const computed = window.getComputedStyle(div).display;
      document.body.removeChild(div);
      return computed === 'flex';
    });
    console.log(`Firefox flexbox support: ${flexboxWorks}`);

    // Check Content Security Policy
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.getAttribute('content') : null;
    });
    console.log(`CSP: ${csp || 'none'}`);
  });

  test('test with inline app', async ({ page }) => {
    // Create a completely inline app to bypass bundling issues
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inline Test</title>
        <style>
          body { 
            margin: 0; 
            font-family: system-ui; 
            background: #f0f0f0;
          }
          .app {
            padding: 20px;
            text-align: center;
          }
          .title {
            font-size: 24px;
            color: #333;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div id="root">
          <div class="app">
            <h1 class="title">🎯 QuizMentor</h1>
            <p>Inline HTML Test - If you see this, rendering works!</p>
            <button onclick="alert('JavaScript works!')">Test JS</button>
          </div>
        </div>
      </body>
      </html>
    `);

    await page.waitForTimeout(1000);

    const text = await page.textContent('body');
    console.log(`Inline app text: ${text}`);

    const jsWorks = await page.evaluate(() => {
      return typeof window !== 'undefined';
    });
    console.log(`Inline app JS works: ${jsWorks}`);

    await page.screenshot({
      path: 'test-results/inline-app.png',
    });

    expect(text).toContain('QuizMentor');
  });
});

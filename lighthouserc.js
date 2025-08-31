module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'webpack compiled successfully',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/home',
        'http://localhost:3000/quiz/tech',
        'http://localhost:3000/quiz/results',
        'http://localhost:3000/profile',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.9 }],

        // Performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        interactive: ['error', { maxNumericValue: 3800 }],

        // Best practices
        'no-document-write': 'error',
        'uses-http2': 'warn',
        'uses-passive-event-listeners': 'error',
        'no-vulnerable-libraries': 'error',

        // Accessibility
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'button-name': 'error',
        'color-contrast': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'image-alt': 'error',
        label: 'error',
        'link-name': 'error',
        list: 'error',
        listitem: 'error',

        // SEO
        'meta-description': 'error',
        'meta-viewport': 'error',
        'tap-targets': 'error',

        // PWA
        'service-worker': 'warn',
        'offline-start-url': 'warn',
        'maskable-icon': 'warn',
        'installable-manifest': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn',
        viewport: 'error',

        // Resource optimization
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',

        // Network
        'network-rtt': ['warn', { maxNumericValue: 100 }],
        'network-server-latency': ['warn', { maxNumericValue: 200 }],
        'main-thread-tasks': ['warn', { maxNumericValue: 2000 }],

        // JavaScript execution
        'bootup-time': ['warn', { maxNumericValue: 2000 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 2000 }],
        'third-party-summary': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
      githubStatusContextSuffix: '/performance',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './.lighthouseci/db.sql',
      },
    },
  },
};

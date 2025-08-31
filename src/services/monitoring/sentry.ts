// src/services/monitoring/sentry.ts
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] SENTRY_DSN not set; skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    debug: __DEV__,
    tracesSampleRate: 0.2,
    enableAutoPerformanceTracing: true,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,
    environment: process.env.EXPO_PUBLIC_ENV || (Platform.OS === 'web' ? 'web' : 'native'),
    integrations: [
      new Sentry.ReactNativeTracing({
        routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
      }),
    ],
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'http' && breadcrumb.data && 'url' in breadcrumb.data) {
        // Redact secrets from URLs
        try {
          const url = new URL(String(breadcrumb.data.url));
          url.search = '';
          breadcrumb.data.url = url.toString();
        } catch {}
      }
      return breadcrumb;
    },
  });
};

export default Sentry;

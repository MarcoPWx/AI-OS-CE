import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export async function startWorker(
  options: { onUnhandledRequest?: 'bypass' | 'warn' | 'error' } = {},
) {
  // Avoid starting multiple times
  if (typeof window !== 'undefined') {
    const w = worker as any;
    if (w.__isStarted) return w;
    const started = await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      onUnhandledRequest: options.onUnhandledRequest ?? 'bypass',
    });
    (worker as any).__isStarted = true;
    return started;
  }
}

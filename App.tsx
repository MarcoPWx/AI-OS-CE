// Centralized app entry with Storybook toggle
// Set EXPO_PUBLIC_STORYBOOK=1 to launch on-device Storybook
import AppWithAuth from './AppWithAuth';
// @ts-expect-error - Storybook is dev-only
import StorybookUIRoot from './.rnstorybook';
import TourLanding from './src/components/TourLanding';
import DeviceDuoOverlay from './src/components/DeviceDuoOverlay';

// Optionally start MSW in web during development
if (
  typeof window !== 'undefined' &&
  (process.env.EXPO_PUBLIC_USE_MSW === '1' || process.env.EXPO_PUBLIC_USE_ALL_MOCKS === '1')
) {
  import('./src/mocks/msw/browser')
    .then((mod) => mod.startWorker?.({ onUnhandledRequest: 'bypass' }))
    .catch(() => {});
}

const SHOW_STORYBOOK = process.env.EXPO_PUBLIC_STORYBOOK === '1';

function Root() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    const sp = new URLSearchParams(window.location.search);
    const duo = sp.get('duo') === '1' && sp.get('duoChild') !== '1';
    if (path === '/tour') {
      return <TourLanding />;
    }
    if (duo) {
      return <DeviceDuoOverlay />;
    }
  }
  const Impl: any = SHOW_STORYBOOK ? StorybookUIRoot : AppWithAuth;
  return <Impl />;
}

export default Root;

/**
 * AppWithAuth - Wrapper component that provides authentication context
 */

import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import AppProfessionalRefined from './AppProfessionalRefined';
import MockBanner from './src/components/MockBanner';
import BetaBanner from './src/components/BetaBanner';
import WebPlatformSkin from './src/components/WebPlatformSkin';

export default function AppWithAuth() {
  // Check environment for mock usage
  const useMock =
    process.env.USE_MOCKS === 'true' ||
    process.env.EXPO_PUBLIC_USE_ALL_MOCKS === '1' ||
    process.env.NX_USE_MOCK_AUTH === 'true' ||
    process.env.REACT_APP_USE_MOCK_AUTH === 'true';

  const showMockBanner =
    useMock || process.env.EXPO_PUBLIC_MOCK_BANNER === '1' || process.env.EXPO_PUBLIC_USE_MSW === '1';

  const isWeb = typeof window !== 'undefined';
  const tourActive = isWeb
    ? new URLSearchParams(window.location.search).get('tour') === '1' ||
      process.env.EXPO_PUBLIC_TOUR_DEFAULT === '1'
    : false;
  const storybookPath = '/storybook/';

  return (
    <AuthProvider useMock={useMock}>
      <WebPlatformSkin />
      {showMockBanner && <MockBanner />}
      {tourActive && <BetaBanner storybookPath={storybookPath} />}
      <AppProfessionalRefined />
    </AuthProvider>
  );
}

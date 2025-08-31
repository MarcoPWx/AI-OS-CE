import React from 'react';

export default function WebPlatformSkin() {
  React.useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const styleId = '__platform_skin_css__';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        :root[data-platform='ios'] body { background-color: #0b1020; color: #d7e0ff; }
        :root[data-platform='android'] body { background-color: #0c121a; color: #e3edf7; }
        :root[data-platform='ios'] { --platform-font: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif; --platform-radius: 12px; }
        :root[data-platform='android'] { --platform-font: Roboto, 'Noto Sans', Arial, sans-serif; --platform-radius: 8px; }
        .platform-surface { font-family: var(--platform-font, system-ui); }
      `;
      document.head.appendChild(style);
    }

    try {
      const sp = new URLSearchParams(window.location.search);
      const platform = sp.get('duoPlatform'); // 'ios' | 'android' | null
      if (platform === 'ios' || platform === 'android') {
        document.documentElement.setAttribute('data-platform', platform);
      } else {
        document.documentElement.removeAttribute('data-platform');
      }
    } catch {}
  }, []);

  return null;
}


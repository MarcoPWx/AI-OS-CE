// src/stories/PlatformThemePreview.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

function CardPreview() {
  const cardStyle: React.CSSProperties = {
    borderRadius: 'var(--platform-radius, 8px)',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.15))',
    border: '1px solid rgba(255,255,255,0.12)',
    padding: 16,
    maxWidth: 420,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  };
  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '9999px',
    background: 'rgba(255,255,255,0.08)',
    fontSize: 12,
    marginRight: 8,
  };
  return (
    <div style={{ fontFamily: 'var(--platform-font, system-ui)', color: 'inherit' }}>
      <div style={cardStyle}>
        <div style={{ marginBottom: 8, opacity: 0.9 }}>Platform & Theme Preview</div>
        <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 600 }}>Design Tokens</div>
        <div style={{ marginBottom: 12 }}>
          <span style={badgeStyle}>
            theme:{' '}
            <strong>
              {typeof document !== 'undefined'
                ? document.documentElement.getAttribute('data-theme')
                : 'light'}
            </strong>
          </span>
          <span style={badgeStyle}>
            platform:{' '}
            <strong>
              {typeof document !== 'undefined'
                ? document.documentElement.getAttribute('data-platform')
                : 'web'}
            </strong>
          </span>
          <span style={badgeStyle}>
            radius: <strong>var(--platform-radius)</strong>
          </span>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9 }}>
          Use the Theme and Platform toolbars to see font and border radius change.
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Design/PlatformThemePreview',
  component: CardPreview,
  parameters: {
    docs: {
      description: {
        component:
          'Demonstrates the Theme and Platform toolbar globals by applying CSS variables to a preview card.',
      },
    },
    chromatic: {
      viewports: [375, 768, 1280],
    },
  },
} satisfies Meta<typeof CardPreview>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const DarkTheme: StoryObj<typeof meta> = {
  parameters: {
    globals: { theme: 'dark' },
  },
};

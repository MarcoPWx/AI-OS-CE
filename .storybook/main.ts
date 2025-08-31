// .storybook/main.ts
// .storybook/main.ts (web Storybook)
import type { StorybookConfig } from '@storybook/react-vite';
import { defineConfig } from 'vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const BUILD_PUBLIC = process.env.STORYBOOK_OUTPUT_PUBLIC === '1';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)', './stories/**/*.mdx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', 'msw-storybook-addon'],
  docs: {
    autodocs: true,
  },
  typescript: {
    // Disable react-docgen to avoid scanning entire project and reduce bundle issues
    reactDocgen: false as any,
  } as any,
  staticDirs: [
    // Avoid copying public -> a subdir of itself when building to public/storybook
    ...(BUILD_PUBLIC ? [] : ['../public']),
    '../docs',
    '../data',
    // Expose test artifacts if present
    { from: '../playwright-summary.json', to: '/data/tests/playwright-summary.json' } as any,
    { from: '../playwright-summary.json', to: '/playwright-summary.json' } as any,
    { from: '../playwright-report', to: '/reports/playwright' } as any,
    { from: '../coverage', to: '/coverage' } as any,
  ],
  viteFinal: async (cfg) => {
    return defineConfig({
      ...cfg,
      resolve: {
        ...(cfg.resolve || {}),
        alias: {
          ...(cfg.resolve?.alias as any),
          // Alias react-native to react-native-web for the web Storybook build
          'react-native': 'react-native-web',
          // Stub Expo's LinearGradient for web Storybook build to avoid Metro/JSX issues in node_modules
          'expo-linear-gradient': path.resolve(__dirname, './stubs/expo-linear-gradient.tsx'),
          '@': path.resolve(__dirname, '../src'),
          // Stub Expo vector icons for web Storybook build
          '@expo/vector-icons': path.resolve(__dirname, './stubs/expo-vector-icons.tsx'),
          // Stub Expo AV for web Storybook build
          'expo-av': path.resolve(__dirname, './stubs/expo-av.ts'),
          // Stub safe-area-context for web Storybook build
          'react-native-safe-area-context': path.resolve(
            __dirname,
            './stubs/react-native-safe-area-context.tsx',
          ),
        },
      },
      plugins: [
        ...(cfg.plugins || []),
        process.env.STATS
          ? (visualizer({
              filename: 'storybook-bundle.html',
              open: false,
              gzipSize: true,
              brotliSize: true,
            }) as any)
          : undefined,
      ].filter(Boolean) as any,
    });
  },
};

export default config;

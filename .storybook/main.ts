import type { StorybookConfig } from '@storybook/react-vite';
import fs from 'node:fs'
import path from 'node:path'

const staticDirs: any[] = [
  '../public',
  '../docs',
]

try {
  const cov = path.resolve(__dirname, '../coverage')
  if (fs.existsSync(cov)) staticDirs.push('../coverage')
} catch {}
try {
  const pwr = path.resolve(__dirname, '../playwright-report')
  if (fs.existsSync(pwr)) staticDirs.push('../playwright-report')
} catch {}

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(tsx|ts|jsx|js)',
    '../docs/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'msw-storybook-addon'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs,
  docs: { autodocs: 'tag' },
  typescript: { reactDocgen: false },
};

export default config;


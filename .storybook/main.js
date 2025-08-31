const shimPath = new URL('../src/storybook/shims/expo-linear-gradient.tsx', import.meta.url).pathname;
const iconsShimPath = new URL('../src/storybook/shims/expo-vector-icons.tsx', import.meta.url).pathname;

const config = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
'react-native': 'react-native-web',
      'expo-linear-gradient': shimPath,
      '@expo/vector-icons': iconsShimPath,
    };
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude || []),
      'react-native'
    ];
    config.optimizeDeps.esbuildOptions = config.optimizeDeps.esbuildOptions || {};
    config.optimizeDeps.esbuildOptions.loader = {
      ...(config.optimizeDeps.esbuildOptions.loader || {}),
      '.js': 'jsx',
    };
    return config;
  }
};

export default config;


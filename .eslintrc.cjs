module.exports = {
  root: true,
  ignorePatterns: [
    'node_modules/',
    'storybook-static/',
    'coverage/',
    'dist/',
    'build/',
    'android/',
    'ios/',
    'venv/',
    'harvest_output/',
    'data/',
    'playwright-report/',
    'test-results/',
    'public/',
    '*.min.js'
  ],
  env: {
    es2022: true,
    node: true,
    browser: true,
    jest: true
  },
  settings: {
    react: { version: 'detect' }
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'mdx'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:mdx/recommended',
    'prettier'
  ],
  rules: {
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-comment-textnodes': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
'@typescript-eslint/no-var-requires': 'warn',
    'no-empty': 'warn'
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: false
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
'react/no-unknown-property': ['warn', { ignore: ['testID', 'onPress'] }]
      }
    },
    {
      files: ['**/*.md', '**/*.mdx'],
      extends: ['plugin:mdx/recommended'],
      rules: {
        'mdx/no-jsx-html-comments': 'off',
        'mdx/no-unused-expressions': 'off',
        'mdx/no-unescaped-entities': 'off'
      }
    },
    {
      files: ['**/*.{test,spec}.{ts,tsx,js,jsx}', '**/__tests__/**/*.{ts,tsx,js,jsx}', 'e2e/**/*.{ts,tsx,js,jsx}', '**/*.stories.{ts,tsx}'],
      env: { jest: true, node: true, browser: true },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-empty': 'off',
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
'react/no-unknown-property': 'off',
        'no-useless-escape': 'off'
      }
    },
    {
      files: [
        '*.config.js',
        '*.config.cjs',
        '*.config.mjs',
        'jest.config.js',
        'babel.config.js',
        'metro.config.js',
        'tailwind.config.js',
        'e2e/jest.config.js'
      ],
      env: { node: true },
      rules: { 'no-undef': 'off', '@typescript-eslint/no-unused-vars': 'off', 'no-useless-escape': 'off', '@typescript-eslint/no-var-requires': 'off' }
    },
    {
      files: ['jest.setup.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-empty': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      files: ['scripts/**/*.js'],
      env: { node: true }
    }
  ]
};


export default {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:mdx/recommended'
  ],
  overrides: [
    {
      files: ['**/*.md', '**/*.mdx'],
      extends: ['plugin:mdx/recommended'],
      rules: {
        'mdx/no-jsx-html-comments': 'off',
        'mdx/no-unused-expressions': 'off',
        'mdx/no-unescaped-entities': 'off'
      }
    }
  ]
}

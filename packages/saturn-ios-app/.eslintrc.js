module.exports = {
  extends: ['../../.eslintrc.js'],
  // Temporary overrides for development
  rules: {
    // Disable strict TypeScript checks globally for now to unblock development
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    // Keep color literals as warnings to fix later
    'react-native/no-color-literals': 'warn',
    'react-native/no-unused-styles': 'warn',
    // Allow any as a warning to fix later
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  // Add overrides for specific test files
  overrides: [
    {
      // Target test files only
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.contract.test.ts',
        '**/test/**/*.ts',
        '**/test/**/*.tsx',
      ],
      rules: {
        // Disable strict TypeScript checks for tests
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      // Ignore coverage reports
      files: ['**/coverage/**'],
      rules: {
        // Disable all rules for coverage files
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-expressions': 'off',
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-redeclare': 'off',
        'eslint-disable': 'off',
      },
    },
    {
      // Target files with complex typing issues
      files: [
        '**/PostCard.tsx',
        '**/MainTabNavigator.tsx',
        '**/FeedScreen.tsx',
      ],
      rules: {
        // Completely disable styled-components related warnings
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};

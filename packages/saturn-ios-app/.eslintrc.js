module.exports = {
  extends: ['../../.eslintrc.js'],
  // Add overrides for specific test files
  overrides: [
    {
      // Target test files only
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/test/**/*.ts',
        '**/test/**/*.tsx',
      ],
      rules: {
        // Disable strict TypeScript checks for tests
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};

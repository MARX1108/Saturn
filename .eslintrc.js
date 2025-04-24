// /.eslintrc.js (Example - adjust based on project needs)
module.exports = {
  root: true, // Important for monorepos
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier', // Integrates Prettier rules
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Recommended TS rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // Stricter rules requiring TS program
    'prettier', // Disables ESLint rules conflicting with Prettier
    'plugin:prettier/recommended', // Runs Prettier as an ESLint rule & reports differences as errors
  ],
  env: {
    node: true,
    es2021: true,
    jest: true, // Recognize Jest global variables
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    // Point to your root tsconfig for rules requiring type info
    // Adjust if you have multiple tsconfigs needing linting
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './packages/*/tsconfig.json'], // Include root and package tsconfigs
    // project: ['./packages/server/tsconfig.json'],
  },
  rules: {
    // --- Prettier Integration ---
    'prettier/prettier': 'warn', // Show Prettier issues as warnings during linting

    // --- TypeScript Specific ---
    '@typescript-eslint/no-explicit-any': 'warn', // Flag explicit 'any' usage (consider 'error' later)
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn on unused vars except those starting with _
    '@typescript-eslint/no-floating-promises': 'error', // Ensure Promises are handled (await, .catch(), .then())
    '@typescript-eslint/no-misused-promises': 'error', // Prevent passing async functions where sync is expected
    '@typescript-eslint/explicit-function-return-type': 'off', // Optional: Enforce return types if desired
    '@typescript-eslint/no-unsafe-assignment': 'warn', // Warn when assigning 'any' to a typed variable
    '@typescript-eslint/no-unsafe-call': 'warn', // Warn on calling 'any' typed values
    '@typescript-eslint/no-unsafe-member-access': 'warn', // Warn on accessing members of 'any' typed values

    // --- General Best Practices ---
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Allow console in dev, warn in prod
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    eqeqeq: ['error', 'always'], // Enforce strict equality (===, !==)
    'no-unused-vars': 'off', // Disable base rule, use '@typescript-eslint/no-unused-vars' instead
    // Add other rules as needed
  },
  // Special rules for specific file patterns
  overrides: [
    {
      // Apply to route handler files in server package
      files: [
        'packages/server/src/modules/*/routes/*.ts',
        'packages/server/src/routes/*.ts',
      ],
      rules: {
        // Allow async functions in Express route handlers
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {
              arguments: false,
              attributes: false,
            },
          },
        ],
      },
    },
    {
      // Apply to test files that might use unbound methods for assertions
      files: ['packages/server/test/**/*.test.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
  settings: {
    // Optional: configure specific settings for plugins if needed
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '*.d.ts', // Ignore declaration files
    'babel.config.js', // Ignore config files if needed
    'jest.config.js',
    '.eslintrc.js',
    '.prettierrc.js',
    // Add other specific files/directories to ignore
  ],
};

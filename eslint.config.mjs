import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '*.d.ts',
      'babel.config.js',
      'jest.config.js',
      'eslint.config.mjs', // Ignore self
      '.prettierrc.js',
      'packages/mobile-app/', // Ignore mobile app for now, assuming it has its own setup
      // Add other specific files/directories to ignore at the root level
    ],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript specific configurations (including custom rules)
  // Apply TS rules to TS/TSX files across the monorepo (excluding ignored dirs)
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['packages/**/*.{ts,tsx}', '*.{ts,tsx}'], // Target root and package TS files
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...(config.languageOptions?.parserOptions ?? {}),
        project: true, // Automatically find tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Set root for tsconfig resolution
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    // Merge our custom rules with the recommended ones
    rules: {
      ...(config.rules ?? {}), // Keep existing rules from recommendedTypeChecked
      // --- Our custom TS rules ---
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      // --- General rules applied within TS context ---
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      eqeqeq: ['error', 'always'],
    },
  })),

  // Configuration specifically for *.js files (e.g., config files at root)
  {
    files: ['*.js', 'packages/**/*.js'], // Target root and package JS files
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // --- General Best Practices for JS ---
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      eqeqeq: ['error', 'always'],
      // Add any JS-only rules here if needed
    },
  },

  // Prettier recommended config LAST to override conflicting style rules
  // This applies Prettier formatting rules via ESLint
  eslintPluginPrettierRecommended
);

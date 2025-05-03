// eslint.config.mjs
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier'; // Ensure this is installed if needed

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Point to your tsconfig
      },
      globals: {
        // Define globals if needed, e.g., for Jest or React Native
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Base ESLint recommended rules
      // ... (You might need to explicitly add 'eslint:recommended' equivalent rules if not using extends)

      // TypeScript Rules (Example: start with recommended, add stricter ones)
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking']?.rules, // Optional stricter rules
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn', // Consider 'error' for stricter enforcement

      // React Rules
      ...reactPlugin.configs.recommended.rules,
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform

      // React Hooks Rules
      ...reactHooksPlugin.configs.recommended.rules,

      // React Native Rules (Example)
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'warn', // Encourage StyleSheet or styled-components
      'react-native/no-color-literals': 'warn', // Encourage theme usage

      // Prettier Integration
      ...prettierConfig.rules, // Disables rules conflicting with Prettier
      'prettier/prettier': 'warn', // Runs Prettier as an ESLint rule
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
  {
    // Configuration for JS files if needed (e.g., config files)
    files: ['**/*.js'],
    // ... add specific rules or configs for JS
  },
  {
    // Ignore files if necessary
    ignores: [
      'node_modules/',
      'dist/',
      '.expo/',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];

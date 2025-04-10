import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Base recommended configs
  ...tseslint.configs.recommended,

  // Custom configuration for TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        // Define explicit Node.js globals instead of spreading globals.node
        // This avoids the issue with "AudioWorkletGlobalScope " having trailing whitespace
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'writable',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {},
    rules: {
      // Common rules for TypeScript projects
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  
  // Configuration for test files
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      // Relaxed rules for test files
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  
  // Apply Prettier compatibility
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] }
);

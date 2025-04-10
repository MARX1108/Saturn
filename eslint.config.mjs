import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

// Calculate __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// For handling ESLint configuration compatibility
const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default [
  // Use existing eslint.config.js files in each package
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**']
  },
  
  // Mobile App - Use all of its flat config objects
  ...(await import('./packages/mobile-app/eslint.config.mjs').then(module => 
    module.default.map(config => ({
      files: ['packages/mobile-app/**/*.{js,jsx,ts,tsx}'],
      ...config
    }))
  )),
  
  // Client - Use all of its flat config objects
  ...(await import('./packages/client/eslint.config.mjs').then(module => 
    module.default.map(config => ({
      files: ['packages/client/**/*.{js,jsx,ts,tsx}'],
      ...config
    }))
  )),
  
  // Server - Use all of its flat config objects
  ...(await import('./packages/server/eslint.config.mjs').then(module => 
    module.default.map(config => ({
      files: ['packages/server/**/*.{js,ts}'],
      ...config
    }))
  )),
  
  // Shared package - Basic TypeScript config
  {
    files: ['packages/shared/**/*.{js,ts,tsx,jsx}'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn'
    }
  }
];

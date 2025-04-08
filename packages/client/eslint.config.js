import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
export default tseslint.config(plugin-react-hooks';
  // Base recommended configs
  ...tseslint.configs.recommended,
  // Base recommended configs
  // Custom configuration for TypeScript files
  {
    files: ['**/*.ts'],config
    languageOptions: {
      globals: {*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
        ...globals.node,
      },act,
      parserOptions: {eactHooks
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },rserOptions: {
    },  ecmaFeatures: {
    plugins: {},rue,
    rules: {
      // Common rules for TypeScript projects
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],ngs: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },  version: 'detect',
  },  },
    },
  // Configuration for test files
  {   // React-specific rules
    files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    languageOptions: {jsx-scope': 'off',
      globals: {ks/rules-of-hooks': 'error',
        ...globals.jest,stive-deps': 'warn',
        ...globals.node,
      },
    },
    rules: {ipt configuration
      // Relaxed rules for test files
      '@typescript-eslint/explicit-function-return-type': 'off',
    },nguageOptions: {
  },  parserOptions: {
        project: true,
  // Apply Prettier compatibilityeta.dirname,
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] }
);  },
    rules: {



npx eslint .cd /Users/marxw/Desktop/FYP-Saturn/packages/server      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Configuration for test files
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  
  // Apply Prettier compatibility
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] }
);

cd /Users/marxw/Desktop/FYP-Saturn/packages/client
npx eslint .

#!/bin/bash

# Script to run only API and Hooks tests that don't depend on React Native native modules

# Run TypeScript compilation check
echo "Running TypeScript compilation check..."
npx tsc --noEmit || exit 1

# Run ESLint
echo "Running ESLint..."
yarn lint || exit 1

# Run contract tests
echo "Running contract tests..."
npx jest --testMatch="**/*.contract.test.ts" || exit 1

# Run useUpdateProfile test
echo "Running hook tests..."
npx jest --testMatch="**/hooks/useUpdate*.test.tsx" || exit 1

echo "All tests passed!"
exit 0 
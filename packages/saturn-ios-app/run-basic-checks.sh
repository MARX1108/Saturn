#!/bin/bash

# Script to run only the basic TypeScript and ESLint checks

# Run TypeScript compilation check
echo "Running TypeScript compilation check..."
npx tsc --noEmit && echo "TypeScript check passed!" || exit 1

# Run ESLint
echo "Running ESLint..."
yarn lint && echo "ESLint check passed!" || exit 1

echo "All basic checks passed!"
exit 0 
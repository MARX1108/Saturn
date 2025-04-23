# 🪐 FYP Saturn

[![codecov](https://codecov.io/gh/marx1108/FYP-Saturn/branch/main/graph/badge.svg)](https://codecov.io/gh/marx1108/Saturn)

A federated social platform using ActivityPub with integrated AI capabilities.

## Getting Started

### Prerequisites

- Node.js v16+
- Yarn package manager
- MongoDB (or use Docker)

### Development

1. Start MongoDB:

```bash
docker-compose up -d mongodb
```

### Scripts

```json
{
  "scripts": {
    // ...existing scripts...
    "test:coverage": "jest --coverage",
    "coverage:report": "jest --coverage && codecov -f coverage/lcov.info -F server"
  },
  "devDependencies": {
    // ...existing dependencies...
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

## Testing Setup

This project uses Jest for testing. The testing configuration is defined in:

```javascript
// In packages/client/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setup.ts',
    '<rootDir>/jest.setup.js',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^import\\.meta\\.env\\.(.*)$': '<rootDir>/src/test/environment.ts',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        isolatedModules: true,
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
    '!**/node_modules/**',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
```

For the server package:

```javascript
// In packages/server/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
```

### Running Tests

To run tests for the client package:

```bash
cd packages/client
yarn test
```

To run tests for the server package:

```bash
cd packages/server
yarn test
```

### GitHub Actions

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./packages/client/coverage/lcov.info,./packages/server/coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
```

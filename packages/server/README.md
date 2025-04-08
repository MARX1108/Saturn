# Server Testing Strategy

This README documents our testing strategy and directory structure.

## Test Directory Structure

We follow a co-located test pattern, with test files residing directly alongside the source code they test:

```
src/modules/[feature]/
  ├── services/
  │   ├── someService.ts
  │   └── __tests__/
  │       └── someService.test.ts
  ├── routes/
  │   ├── someRoutes.ts
  │   └── __tests__/
  │       └── someRoutes.test.ts
  └── repositories/
      ├── someRepository.ts
      └── __tests__/
          └── someRepository.test.ts
```

## Test Categories

- **Unit Tests**: Test individual functions/classes in isolation with mocks
- **Integration Tests**: Test interactions between components using in-memory MongoDB
- **API Tests**: Test complete HTTP endpoints using Supertest

## Testing Guidelines

1. Tests must be independent - no test should depend on another test's execution
2. Each test file should focus on testing a single module or component
3. Use factory functions from `tests/helpers/factories.ts` to create test data
4. Always clear database between tests using provided helpers
```

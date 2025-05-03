# Server Testing Strategy

> **Note:** For API documentation, see the [API Reference](api-reference.md) document.

This document outlines our testing strategy and directory structure.

# Integration Test Strategy Refactoring

## Current Approach Analysis

The current integration test approach for routes has several characteristics:

1. **Heavy Reliance on mockSetup.ts**: All route tests depend on this complex and brittle file which mocks all services and controllers.

2. **Global Mock Setup**: Service mocks are attached to the global scope, making test isolation difficult.

3. **Mock Implementation Complexity**: mockSetup.ts contains complex implementations that simulate the behavior of real services, but require maintenance when those services change.

4. **Limited Test Scope**: Tests don't verify interactions between real services, only between routes and mocked services.

5. **Type Safety Issues**: The use of `any` and unsafe type casts in the mocks creates maintenance challenges.

## Proposed Alternative Strategies

### Strategy A: Service Integration Tests

This approach keeps route handlers intact but uses real service implementations while mocking only the repository layer.

#### Implementation Steps:

1. **Create Repository Mocks**: Instead of mocking services, mock only repositories. Use jest-mock-extended's `DeepMockProxy` for full type safety.

2. **Use Real Services**: Initialize real service instances with mocked repositories in each test file.

3. **Test App Configuration**: Create test app instances that wire together real routes, controllers, and services but with mock repositories.

4. **Database Isolation**: Continue using mongodb-memory-server, but now only for schema validation; actual data operations use mocked repositories.

#### Pros:

- Tests real service and controller integrations
- More accurate verification of business logic
- Reduced maintenance burden when controller/service interfaces change
- Better type safety (no complex mock implementations)
- Tests remain fast (no real database operations)

#### Cons:

- More complex test setup in each file
- May require code changes to make services injectable with repositories
- Requires careful mocking of repository responses

### Strategy B: Selective Real Services

This approach selectively uses real services or mocked services based on the test focus.

#### Implementation Steps:

1. **Create Service Factory**: Implement a test service factory that decides when to return real or mock services.

2. **Per-Test Configuration**: Allow tests to specify which services should be real vs. mocked.

3. **Focus-Based Testing**: Mock all services except the one under test.

4. **Simplified MockSetup**: Keep mockSetup.ts but significantly simplify it to focus only on basic mock implementations.

#### Pros:

- More focused testing of service interactions
- Gradual migration path from current approach
- Better balance between test speed and coverage
- More maintainable mock implementation

#### Cons:

- Still requires some mocking infrastructure
- Partial real/mock boundaries can lead to unexpected behaviors
- Not as comprehensive as fully real service testing

## Sample Implementation Approach

Here's how Strategy A (Service Integration Tests) could be implemented for an auth route test:

```typescript
// In auth.routes.test.ts
import { DeepMockProxy, mock } from 'jest-mock-extended';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { AuthService } from '@/modules/auth/services/auth.service';
import { createTestApp } from '../helpers/testApp';
import { Express } from 'express';
import request from 'supertest';

describe('Auth Routes', () => {
  let app: Express;
  let authRepositoryMock: DeepMockProxy<AuthRepository>;
  let authService: AuthService;

  beforeEach(() => {
    // Create repository mock with type safety
    authRepositoryMock = mock<AuthRepository>();

    // Create real service with mocked repository
    authService = new AuthService(authRepositoryMock);

    // Create test app with real service
    app = createTestApp({
      authService,
      // Other services could still be mocked if needed
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Setup repository mock behavior
      authRepositoryMock.findUserByUsername.mockResolvedValue(null);
      authRepositoryMock.createUser.mockImplementation(async userData => {
        return {
          _id: 'generated-id',
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // Test against real endpoint using real service + mocked repository
      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.actor.preferredUsername).toBe('testuser');

      // Verify repository was called correctly
      expect(authRepositoryMock.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredUsername: 'testuser',
          email: 'test@example.com',
        })
      );
    });
  });
});
```

## Migration Recommendations

1. **Start with a Single Route**: Begin by converting a single, simple route test (like auth) to the new approach.

2. **Create Repository Mocks**: Implement properly typed repository mocks for each domain.

3. **Adjust Service Constructors**: Ensure services accept repository dependencies in their constructors.

4. **Gradually Migrate Tests**: Convert route tests one by one, starting with the simplest.

5. **Deprecate mockSetup.ts**: Once all tests are migrated, remove the global mock setup.

6. **Add Integration Test Helpers**: Create helper functions to make test setup easier and more consistent.

## Benefits of the New Approach

1. **Improved Type Safety**: Repository mocks use full TypeScript typing.

2. **Better Test Isolation**: Each test file controls its own mocks.

3. **Reduced Maintenance Burden**: Less complex mock implementations to maintain.

4. **More Realistic Tests**: Tests verify real service interactions.

5. **Easier Debugging**: When tests fail, the cause is more apparent due to simpler mocking.

This approach balances the need for fast, reliable tests with the need for comprehensive integration coverage, while significantly reducing the complexity and maintenance burden of the current approach.

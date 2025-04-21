**Overall Assessment & Next Steps:**

- **Step 1: Build & Test Execution:**

  - Verify `yarn tsc --noEmit` still runs cleanly within `packages/server`.
  - Briefly assess the final state of `packages/server/jest.config.js` and `packages/server/babel.config.js` - do they look standard and clean now?
  - Are the root Jest config warnings (`/Users/marxw/Saturn/jest.config.js`) confirmed fixed (containing only `projects`)?

- **Step 2: Baseline Test Pass Rate:**

  - Confirm that `test/routes/auth.test.ts`, `test/routes/actors.test.ts`, and `test/routes/posts.test.ts` are passing based on the last run.
  - Identify other test suites within `packages/server` (e.g., under `src/repositories/__tests__/`, `src/services/__tests__/`). What is their likely status based on previous runs or current code state (e.g., did `actorRepository.test.ts` previously time out? Do service tests exist?)?
  - What is the overall test pass rate for `packages/server` currently? What are the main categories of failure in the remaining suites (if known)?
  - Report current code coverage figures if readily available (or state they are likely still low ~10%).

- **Step 3: Type Safety (`any` Elimination):**

  - Scan `packages/server/src` and `packages/server/test`. Are there significant remaining uses of `any` type (explicit or implicit)?
  - Check key interfaces/types (e.g., `ServiceContainer`, controller method signatures, repository method signatures, main data models). Are they well-defined or are there gaps?

- **Step 4: Feature Integration (Notifications, Comments):**

  - Check `src/modules/notifications` and `src/modules/comments`. Do they have defined services, controllers, routes?
  - Are these modules integrated? (e.g., Does `PostService` call `NotificationService`? Are their routes included in `src/routes/index.ts`?).
  - Do these modules have corresponding tests?

- **Step 5: Input Validation:**

  - Is a validation library (`zod`, `express-validator`, etc.) installed?
  - Check key controller methods (e.g., `AuthController.register`, `PostsController.createPost`). Is input validation middleware being applied to the corresponding routes?

- **Step 6: Security & Error Handling:**

  - Is rate-limiting middleware (e.g., `express-rate-limit`) implemented anywhere in `testApp.ts` or `src/app.ts`?
  - Review `src/middleware/errorHandler.ts` (or equivalent). Does it hide stack traces in production (`process.env.NODE_ENV === 'production'`)?
  - Check a sample async controller method. Does it use `try/catch` or rely solely on the global error handler via promise rejection?

- **Step 7-10 (Brief Assessment):**
  - Briefly assess the state of unit testing for services/repositories (Step 7).
  - Briefly assess the DI mechanism used in production code (`src/config/serviceContainer.ts`) - is it still manual factories? (Step 8).
  - Briefly check key dependency versions (`express`, `mongodb`, `typescript`) listed in `packages/server/package.json` (Step 9).
  - Are there signs of API documentation generation or deployment scripts (Dockerfile)? (Step 10).





**Conclusion:**

The server is currently in a **fragile state** despite the successful Jest refactoring. The immediate next phase must focus entirely on **achieving type safety (fixing all `tsc` errors)**. Only after the codebase compiles cleanly can we reliably address the failing tests, implement missing features (validation, rate limiting), complete module integration, and improve test coverage.

**Recommended Next Steps:**

1.  **Fix `tsc` errors:** Install missing `@types` packages, resolve `any` types, fix type mismatches. This will likely touch many files, especially tests and models.
2.  **Run Tests:** Once `tsc` passes, run `yarn test` in `packages/server` to identify remaining test failures beyond type errors.
3.  **Fix Failing Tests:** Address logic errors, mock issues, or timeouts in the existing test suites (`actorRepository`, `postService`, etc.).
4.  **Implement Input Validation:** Choose a library (e.g., `zod`) and add validation middleware to routes, starting with critical ones like auth and post creation.
5.  **Implement Rate Limiting:** Add basic rate limiting.
6.  **Complete Feature Integration:** Ensure `comments` and `notifications` routes are correctly mounted and functional.
7.  **Write Missing Tests:** Add unit/integration tests for `comments`, `notifications`, and other uncovered areas.


Revised Roadmap V2: packages/server Stabilization & Testing
Goal: Transform the packages/server codebase into a stable, type-safe, reliably tested, and maintainable foundation ready for further development and eventual production deployment.

Guiding Principles: Stability First, Iterative Validation, Leverage Tooling, Security is Non-Negotiable.

Block 1: Achieve Type Safety & Structural Consistency
Goal: Eliminate all TypeScript compilation errors (tsc --noEmit passes cleanly), consolidate core type definitions, and address fundamental structural inconsistencies. This is the absolute prerequisite for reliable development.

Tasks:

Install Missing @types: Identify any remaining missing @types/* packages flagged by tsc and install them (yarn add --dev ...).

Consolidate Core Types:

Define canonical Actor interface/type in src/modules/actors/models/actor.ts, merging properties from duplicates.

Define canonical Post interface/type in src/modules/posts/models/post.ts, merging properties and ensuring published: Date exists.

Remove duplicate type definition files (e.g., src/types/actor.ts, src/modules/actors/types/actor.ts, src/types/post.ts).

Update Type Imports: Update all import statements across src and test to use the canonical Actor and Post types via @/ aliases.

Fix tsc Errors (Types & Properties): Systematically address all remaining tsc --noEmit errors, focusing on:

ObjectId vs string mismatches (standardize, likely using string for IDs in application code/interfaces).

Property access errors on potentially null/undefined objects (add checks or use optional chaining ?.).

Type mismatches in function arguments, return types, and variable assignments (correct types or logic).

Fixing explicit and implicit any types revealed by tsc.

Standardize Module Structure: Decide on a consistent pattern (models/ vs types/) and apply it across all modules in src/modules/.

Standardize File Naming: Decide on a convention (e.g., camelCase postService.ts or dot.case post.service.ts; singular post.model.ts vs plural posts.controller.ts) and rename files for consistency. Remove extraneous files like actorRoutes.ts.new.

Fix Path Errors: Correct specific import path errors noted (e.g., UploadService path in global.d.ts).

Validation: cd packages/server && yarn tsc --noEmit passes with 0 errors. Core types (Actor, Post) exist only in their canonical locations. Module structures and file naming conventions are consistent.

Block 2: Stabilize Test Suite & Standardize Mocks
Goal: Ensure all existing tests pass reliably, test files are correctly located, mocking is consistent, and test environment teardown is clean.

Tasks:

Consolidate Test Files: Move all test files (*.test.ts) from src/ subdirectories (like src/tests/, src/modules/posts/services/__tests__/) into the appropriate subdirectories under the top-level packages/server/test/ directory (e.g., test/services, test/repositories, test/routes). Ensure jest.config.js roots is just ['<rootDir>/test'].

Standardize Mock Access:

Decide on one method for sharing mocks from test/helpers/mockSetup.ts (either exporting individual mocks OR using global. consistently). Using direct imports/exports is generally cleaner than global.

Refactor mockSetup.ts and all test files (test/routes/*.test.ts, test/services/*.test.ts, etc.) to use the chosen consistent pattern for accessing mocks in beforeEach (mockReset) and within test cases (mockResolvedValue, toHaveBeenCalledWith). Eliminate the mockReset TypeErrors.

Fix Mock Authentication (401s): Ensure the chosen mock authentication strategy (likely jest.mock('@/middleware/auth', ...) in setup.ts) is correctly implemented and effectively bypasses auth checks for all necessary test scenarios. Debug why it previously failed for POST /api/auth/login and GET /api/posts.

Fix Repository Test Issues: Run repository tests (e.g., actorRepository.test.ts). Address any remaining type errors (now easier with consolidated types), timeouts (ensure hookTimeout is set in jest.config.js, simplify setupTestDb if needed), or logic errors.

Fix Service Test Issues: Run service tests (e.g., postService.unlike.test.ts). Fix any type errors, logic errors, or "empty suite" issues.

Fix Teardown Issues (Open Handles): Run the full suite with --detectOpenHandles if the warning persists. Identify and fix leaks, ensuring database connections and mongodb-memory-server are properly closed in test/setup.ts's afterAll, even if errors occur.

Validation: cd packages/server && yarn test runs successfully with all existing tests passing and no "open handles" warnings. Mocking patterns are consistent.

Block 3: Implement Core Features & Security
Goal: Add missing foundational features like input validation and rate limiting. Ensure basic functionality and routing for all core modules. Address critical DI gaps in production code.

Tasks:

Implement Input Validation:

Choose and install a library (e.g., zod + zod-express-middleware).

Define validation schemas for critical DTOs (e.g., user registration, login, post creation/update).

Apply validation middleware to the corresponding routes in authRoutes.ts, postRoutes.ts, etc. Ensure 4xx errors are returned for invalid input.

Implement Rate Limiting:

Install and configure express-rate-limit.

Apply rate limiting middleware globally or to specific routes in src/index.ts.

Complete Module Routing: Verify routes for comments and notifications are correctly defined (src/modules/.../routes.ts) and mounted in the main router (src/routes/index.ts). Ensure basic handlers exist.

Address Production DI TODOs/Gaps: Review src/utils/container.ts. Implement basic functional placeholders or actual implementations for any services previously returning undefined or marked TODO (mediaService, activityPubService, webfingerService) to prevent potential runtime errors in production. Resolve the circular dependency handling if feasible without major refactoring yet.

Validation: Input validation rejects invalid requests on key endpoints. Rate limiting is active. Basic requests to comment/notification routes succeed. Production DI container instantiates all declared services without placeholders.

Block 4: Enhance Test Coverage & Code Quality
Goal: Significantly increase test coverage across different layers (unit, integration) to build confidence and improve overall code quality and maintainability.

Tasks:

Write Unit Tests: Create comprehensive unit tests for key services (AuthService, PostService, ActorService, CommentService, NotificationService) and repositories, thoroughly mocking dependencies.

Expand Integration Tests: Add more supertest tests for API routes, covering:

Error cases (validation failures, 404s, 403s).

Edge cases and different user inputs.

Authentication/Authorization scenarios.

Tests for comments and notifications routes.

Increase Coverage Threshold: Update coverageThreshold in packages/server/jest.config.js to reflect higher targets (e.g., 70-80%) and ensure tests meet them.

Code Style Enforcement: Setup and run eslint --fix and prettier --write based on project configurations to ensure consistent code style. Address remaining naming/structure inconsistencies identified in Block 1.

Dependency Update: Review and update key dependencies (express, mongodb, typescript, Jest, Babel, etc.) to their latest stable versions, running tests after each significant update.

Validation: yarn test --coverage passes with coverage meeting the new, higher thresholds. Codebase adheres to defined linting/formatting rules. Dependencies are up-to-date.

Block 5: Production Readiness & Polish
Goal: Add necessary documentation, deployment artifacts, and final touches to make the service understandable, deployable, and maintainable.

Tasks:

API Documentation: Implement API documentation using Swagger/OpenAPI (e.g., via tsoa or zod-to-openapi). Ensure major endpoints are documented.

README: Create/update README.md in packages/server with clear setup, configuration, testing, and deployment instructions. Document architecture decisions.

Environment Configuration: Create .env.example documenting all required environment variables.

Deployment Artifacts: Create a Dockerfile for building a container image. Refine build scripts in package.json.

Logging & Monitoring: Review and enhance logging. Add basic health check endpoints if needed.

Final DI Review (Optional): Re-assess the manual DI in container.ts. If deemed necessary now, refactor to a lightweight DI library for better long-term maintainability.

Validation: API documentation is generated and accessible. README is comprehensive. Environment is clearly defined. A container image can be built. Basic logging is functional.
# Saturn Server Architecture

## Overview

Saturn is built on a modular architecture that separates concerns and improves maintainability. The codebase follows a domain-driven design approach, organizing code by feature rather than technical function.

## Directory Structure

```
src/
├── config/             # Application configuration
├── middleware/         # Express middleware
├── modules/            # Feature modules
│   ├── actors/         # Actor (user) features
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── auth/           # Authentication features
│   ├── posts/          # Post features
│   ├── webfinger/      # WebFinger implementation for federation
│   ├── activitypub/    # ActivityPub implementation for federation
│   └── shared/         # Shared code between modules
├── plugins/            # Plugin system
├── utils/              # Utilities
└── index.ts            # Application entry point
```

## Architectural Patterns

### Module Structure

Each feature module follows a consistent structure:

- **models/** - Data models and interfaces
- **repositories/** - Data access layer
- **services/** - Business logic
- **controllers/** - Request handlers
- **routes/** - Route definitions
- **index.ts** - Public API for the module

### Request Flow

1. A request comes in and is routed to the appropriate route handler
2. The route handler calls the appropriate controller method
3. The controller uses services to perform business logic
4. Services use repositories to access data
5. The controller formats and returns a response

### Dependency Injection

The application uses a simple dependency injection pattern:

1. Services are instantiated with database connections in the service container
2. The service container is attached to the Express app
3. The serviceMiddleware attaches services to each request
4. Controllers can access services through `req.services`

## Creating a New Feature

To add a new feature:

1. Create a new directory in `modules/`
2. Add the required subdirectories (models, repositories, etc.)
3. Implement the feature
4. Export the feature's components from an `index.ts`
5. Register routes in `src/index.ts`

## Testing

Each module should have its own test files. Tests should be organized by module structure, mirroring the source directory structure.

## Federation

The ActivityPub and WebFinger modules handle federation with other servers. These modules expose endpoints that follow the relevant specifications:

- `/.well-known/webfinger` - WebFinger endpoint for actor discovery
- `/users/:username` - ActivityPub actor profile
- `/users/:username/inbox` - Actor inbox
- `/users/:username/outbox` - Actor outbox

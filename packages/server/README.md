# Saturn Server

The server component of Saturn, a federated social network built on top of ActivityPub.

## Project Structure

- `src/`: Main application source code
  - `config/`: Configuration files
  - `modules/`: Feature modules (actors, posts, comments, etc.)
  - `utils/`: Utility functions
- `test/`: Test files
  - `unit/`: Unit tests
  - `integration/`: Integration tests
- `docs/`: Documentation
  - `api-reference.md`: API documentation for frontend developers
  - `integration-test-strategy.md`: Testing strategy documentation

## Available Scripts

- `yarn start`: Start the server
- `yarn dev`: Start the server in development mode with hot reloading
- `yarn build`: Build the project
- `yarn test`: Run tests
- `yarn test:debug`: Run tests in debug mode
- `yarn lint`: Lint the code

## API Documentation

For detailed API documentation, see [API Reference](docs/api-reference.md).

## Testing Strategy

For information about our testing approach, see [Integration Test Strategy](docs/integration-test-strategy.md).

## Features

- **Authentication**: JWT-based authentication system
- **Actors**: User profiles and management
- **Posts**: Create, read, update, and delete posts
- **Comments**: Commenting system for posts
- **Likes**: Like and unlike posts
- **Notifications**: Real-time notification system
- **Media**: Media upload and management
- **ActivityPub Support**: Federation with other ActivityPub servers
- **WebFinger**: User discovery across federated servers
- **Rate Limiting**: Protection against abuse
- **Structured Logging**: Comprehensive logging system
- **Graceful Shutdown**: Proper handling of server shutdown
- **Security Headers**: Implementation of security best practices

## Getting Started

1. Clone the repository
2. Install dependencies: `yarn install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `yarn dev`

## Dependencies

- Node.js
- Express
- MongoDB
- Redis (for rate limiting)
- Other dependencies listed in package.json

```

```

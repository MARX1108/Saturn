// Global setup for Jest tests
import { Request, Response, NextFunction } from 'express'; // Add express types for mock
import { Actor } from '@/modules/actors/models/actor'; // Added import
import { ObjectId } from 'mongodb';
// import jwt from 'jsonwebtoken'; // Remove top-level import

// Temporarily comment out the global mock to test its effect on routing
// Mock the actual authentication middleware module
jest.mock('@/middleware/auth', () => {
  // Restore require inside the factory function
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const jwt = require('jsonwebtoken');
  // Also require mongodb specifically for ObjectId within this scope
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ObjectId: MockObjectId } = require('mongodb'); // Use alias to avoid conflict if needed

  // Define the known user ID from mockSetup for default user
  const knownTestUserIdHex = '60a0f3f1e1b8f1a1a8b4c1c1';
  const knownTestUsername = 'testuser';

  const defaultMockUser = {
    _id: knownTestUserIdHex, // Use the hex string
    id: knownTestUserIdHex, // Use the hex string
    preferredUsername: knownTestUsername,
    email: 'mock@example.com',
    isAdmin: false,
    isVerified: true,
    profile: {
      /* ... */
    },
    // Add required Actor properties
    type: 'Person',
    username: knownTestUsername,
    inbox: `https://test.domain/users/${knownTestUsername}/inbox`,
    outbox: `https://test.domain/users/${knownTestUsername}/outbox`,
    followers: `https://test.domain/users/${knownTestUsername}/followers`,
    following: `https://test.domain/users/${knownTestUsername}/following`,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Actor; // First convert to unknown, then to Actor

  const mockMiddlewareImplementation = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // ObjectId is imported at top level, no require needed here

    // console.log( // Removed log block
    //   `>>> Mock authenticate MIDDLEWARE executing for path: ${req.path}`
    // );
    const authHeader = req.headers.authorization;
    let user: Actor | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Use simple object type and handle in a type-safe way
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'test-jwt-secret-key'
        );

        // Use type guard pattern without unsafe access
        if (
          decoded &&
          typeof decoded === 'object' &&
          'id' in decoded &&
          'username' in decoded
        ) {
          // Type assertion after validation
          const typedDecoded = decoded as { id: string; username: string };

          if (
            typeof typedDecoded.id === 'string' &&
            typeof typedDecoded.username === 'string'
          ) {
            user = {
              ...defaultMockUser,
              _id: new MockObjectId(typedDecoded.id),
              id: typedDecoded.id,
              preferredUsername: typedDecoded.username,
            };
          }
        } else {
          // Handle unexpected token structure (e.g., string or incorrect object)
          console.error(
            '>>> Mock authenticate: Unexpected JWT payload structure:',
            decoded
          );
          // Decide how to handle this - fail, fallback, etc. Falling back to default for now.
          // Consider returning 401? user = undefined;
          // Setting user explicitly undefined if token is bad/unexpected
          user = undefined;
        }
      } catch (_) {
        // Handle error type safely - no need to keep a reference to err
        res.status(401).json({ error: 'Unauthorized - Invalid Token' });
        return; // End function execution here
      }
    } else {
      // No token provided
      // If the route requires auth, let the controller/route handler return 401/403.
      // The middleware itself often just calls next() if no token is present,
      // unless it's configured to reject immediately.
      // Let's simulate passing through without setting req.user if no token.
      user = undefined;
    }

    // Convert Actor to DbUser for req.user
    req.user = user
      ? {
          _id: user._id.toString(),
          id: user.id,
          username: user.username,
          preferredUsername: user.preferredUsername,
          password: '', // Mock password (empty string is safe for tests)
          followers: [],
          following: [],
          email: user.email || 'mock@example.com',
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        }
      : undefined;

    // console.log( // Removed log block
    //   '>>> Mock authenticate MIDDLEWARE - req.user set to:',
    //   req.user
    //     ? { id: req.user._id, username: req.user.preferredUsername }
    //     : undefined
    // );
    next();
  };

  return {
    __esModule: true,
    authenticate: jest
      .fn()
      .mockImplementation(() => mockMiddlewareImplementation),
    auth: mockMiddlewareImplementation, // Ensure named export is also updated
  };
});

import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
// Removed dbHelper import
// import {
//   connectDB,
//   disconnectDB,
//   clearDatabase,
// } from '../tests/helpers/dbHelper';

// Use testUtils instead
// import { setupTestDb, teardownTestDb } from './helpers/testUtils';

import { createTestApp } from './helpers/testApp';
import request from 'supertest'; // Remove unused SuperTest and Test types
import { Express } from 'express'; // Ensured Express is imported

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DOMAIN = 'localhost:4000';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '4000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.DISABLE_RATE_LIMITS = 'true';

// Increase timeout for tests that may take longer (database operations)
jest.setTimeout(30000);

// Shared variables for MongoDB connection and test app
let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;
let mongoDb: Db;
let testApp: Express;

// Configure global Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Setup before all tests
beforeAll(async (): Promise<void> => {
  // Create MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  mongoDb = mongoClient.db();

  // Create test app with proper configuration
  testApp = createTestApp(mongoDb, process.env.DOMAIN || 'test.domain'); // Removed await as createTestApp is not async

  // Make app available globally for tests (using declarations from global.d.ts)
  global.testApp = testApp;

  // Using a type assertion to match the expected type
  global.request = request as unknown as (
    app: Express
  ) => import('supertest').SuperTest<import('supertest').Test>;

  global.mongoDb = mongoDb;
});

// Cleanup after all tests
afterAll(async (): Promise<void> => {
  // Disconnect from the database
  if (mongoClient) {
    await mongoClient.close();
  }

  // Stop the MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clean database before each test
beforeEach(async (): Promise<void> => {
  try {
    if (mongoDb) {
      // Clear all collections manually
      const collections = await mongoDb.listCollections().toArray();
      for (const collection of collections) {
        // Avoid deleting system collections if any exist
        if (!collection.name.startsWith('system.')) {
          await mongoDb.collection(collection.name).deleteMany({});
        }
      }
    }
  } catch (error) {
    console.error('Failed to clear test database:', error);
    throw error;
  }
});

// For tests, we need to mock jsonwebtoken

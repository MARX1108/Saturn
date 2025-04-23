// Global setup for Jest tests
import { Request, Response, NextFunction } from 'express'; // Add express types for mock
import { Actor } from '@/modules/actors/models/actor'; // Added import
import { JwtPayload } from 'jsonwebtoken'; // Added import

// Temporarily comment out the global mock to test its effect on routing
// Mock the actual authentication middleware module
jest.mock('@/middleware/auth', () => {
  // console.log('>>> jest.mock factory for @/middleware/auth EXECUTING'); // Removed log

  // Require jwt *inside* the factory function
  const jwt = require('jsonwebtoken'); // <-- Put require back

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
  } as Actor; // Replaced 'any' with 'Actor'

  const mockMiddlewareImplementation = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // console.log( // Removed log block
    //   `>>> Mock authenticate MIDDLEWARE executing for path: ${req.path}`
    // );
    const authHeader = req.headers.authorization;
    let user = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'test-jwt-secret-key'
        );

        // Type guard and cast for decoded payload
        if (
          typeof decoded === 'object' &&
          decoded !== null &&
          'id' in decoded &&
          'username' in decoded
        ) {
          // Use inline type for the cast
          const payload = decoded as { id: string; username: string };
          user = {
            ...defaultMockUser,
            _id: payload.id, // Use validated payload
            id: payload.id,
            preferredUsername: payload.username,
          };
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

        // console.log( // Removed log block
        //   '>>> Mock authenticate MIDDLEWARE - Token VERIFIED, user set from token:',
        //   { id: user._id, username: user.preferredUsername }
        // );
      } catch (err) {
        // Handle error type safely
        let errorMessage = 'Unknown token verification error';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        // console.log( // Removed log block
        //   '>>> Mock authenticate MIDDLEWARE - Token VERIFICATION FAILED',
        //   errorMessage
        // );
        // For tests, we might still want to allow progression but without a valid user,
        // or fall back to default. Falling back to default for now.
        // user = defaultMockUser;
        // OR treat as unauthorized explicitly if token is bad?
        // Let's return 401 for bad tokens
        return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
      }
    } else {
      // No token provided
      // console.log('>>> Mock authenticate MIDDLEWARE - No token found'); // Removed log
      // If the route requires auth, let the controller/route handler return 401/403.
      // The middleware itself often just calls next() if no token is present,
      // unless it's configured to reject immediately.
      // Let's simulate passing through without setting req.user if no token.
      user = undefined;
    }

    req.user = user;
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
import request, { SuperTest, Test } from 'supertest'; // Ensured SuperTest, Test are imported
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
  global.request = request; // Assign the supertest function itself
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

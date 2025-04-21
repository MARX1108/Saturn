// Global setup for Jest tests
import { Request, Response, NextFunction } from 'express'; // Add express types for mock

// Mock the actual authentication middleware module
jest.mock('@/middleware/auth', () => {
  // Define the mock middleware implementation once
  const mockMiddlewareImplementation = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.user = {
      _id: 'mockUserId',
      id: 'mockUserId',
      preferredUsername: 'mockUser',
      email: 'mock@example.com',
      isAdmin: false,
      isVerified: true,
      profile: {
        displayName: 'Mock User',
        bio: 'Mock Bio',
        avatar: null,
        banner: null,
      },
    } as any;
    next();
  };

  // Return the module mock
  return {
    __esModule: true, // Important if the original module uses ES modules
    // Mock the 'authenticate' export (used by postRoutes)
    authenticate: jest
      .fn()
      .mockImplementation(() => mockMiddlewareImplementation),
    // Mock the 'auth' export (used by authRoutes)
    auth: jest.fn().mockImplementation(() => mockMiddlewareImplementation),
    // Mock any other exports from this module if they are used and need mocking
    // e.g., generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
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
import request from 'supertest';

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
let testApp: Express.Application;

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
  try {
    // Create MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db();

    // Create test app with proper configuration
    testApp = await createTestApp(mongoDb, process.env.DOMAIN || 'test.domain');

    // Make app available globally for tests
    (global as any).testApp = testApp;
    (global as any).request = request;
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async (): Promise<void> => {
  try {
    // Disconnect from the database
    if (mongoClient) {
      await mongoClient.close();
    }

    // Stop the MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Failed to cleanup test environment:', error);
    throw error;
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

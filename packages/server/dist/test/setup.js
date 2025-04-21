'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
// Mock the actual authentication middleware module
jest.mock('@/middleware/auth', () => {
  // Define the mock middleware implementation once
  const mockMiddlewareImplementation = (req, res, next) => {
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
    };
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
const mongodb_memory_server_1 = require('mongodb-memory-server');
const dbHelper_1 = require('../tests/helpers/dbHelper');
const testApp_1 = require('./helpers/testApp');
const supertest_1 = __importDefault(require('supertest'));
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
let mongoServer;
let mongoClient;
let mongoDb;
let testApp;
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
beforeAll(async () => {
  try {
    // Create MongoDB Memory Server
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Connect to the in-memory database
    const connection = await (0, dbHelper_1.connectDB)(mongoUri);
    mongoClient = connection.client;
    mongoDb = connection.db;
    // Create test app with proper configuration
    testApp = await (0, testApp_1.createTestApp)(mongoDb, process.env.DOMAIN);
    // Make app available globally for tests
    global.testApp = testApp;
    global.request = supertest_1.default;
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  }
});
// Cleanup after all tests
afterAll(async () => {
  try {
    // Disconnect from the database
    if (mongoClient) {
      await (0, dbHelper_1.disconnectDB)(mongoClient);
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
beforeEach(async () => {
  try {
    if (mongoDb) {
      await (0, dbHelper_1.clearDatabase)(mongoDb);
    }
  } catch (error) {
    console.error('Failed to clear test database:', error);
    throw error;
  }
});

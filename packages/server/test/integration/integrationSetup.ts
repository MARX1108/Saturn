// Integration test setup
import { Express } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { createIntegrationTestApp } from '../helpers/integrationTestApp';
import request from 'supertest';

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DOMAIN = 'test.domain';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '4001'; // Different from regular tests to avoid conflicts
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-integration';
process.env.DISABLE_RATE_LIMITS = 'true';

// Increase timeout for tests that may take longer
jest.setTimeout(30000);

// Shared variables for MongoDB connection and test app
let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;
let mongoDb: Db;
let integrationTestApp: Express;

// Configure global Jest matchers if needed
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

  // Create test app with proper configuration - use the real services with mocked repositories
  integrationTestApp = createIntegrationTestApp(
    mongoDb,
    process.env.DOMAIN || 'test.domain'
  );

  // Make app available globally for tests
  global.testApp = integrationTestApp;
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

// Make available to global context
declare global {
  // eslint-disable-next-line no-var
  var testApp: Express;
  // eslint-disable-next-line no-var
  var request: (
    app: Express
  ) => import('supertest').SuperTest<import('supertest').Test>;
  // eslint-disable-next-line no-var
  var mongoDb: Db;
}

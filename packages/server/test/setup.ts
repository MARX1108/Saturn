// Global setup for Jest tests
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { connectDB, disconnectDB, clearDatabase } from '../tests/helpers/dbHelper';

// Set environment variables for testing
process.env.NODE_ENV = "test";
process.env.DOMAIN = "localhost:4000";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.PORT = "4000";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.DISABLE_RATE_LIMITS = "true";

// Increase timeout for tests that may take longer (database operations)
jest.setTimeout(30000);

// Shared variables for MongoDB connection
let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient; 
let mongoDb: Db;

// Configure global Jest matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
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
  const connection = await connectDB(mongoUri);
  mongoClient = connection.client;
  mongoDb = connection.db;
  
  // Make the connection available globally
  global.__MONGO_URI__ = mongoUri;
  global.__MONGO_DB__ = mongoDb;
  global.__MONGO_CLIENT__ = mongoClient;
  
  // Log test database initialization
  console.log(`MongoDB Memory Server started at ${mongoUri}`);
});

// Clean database between tests
beforeEach(async () => {
  if (mongoDb) {
    await clearDatabase(mongoDb);
  }
});

// Cleanup after all tests
afterAll(async (): Promise<void> => {
  if (mongoClient) {
    await disconnectDB(mongoClient);
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  console.log('MongoDB Memory Server stopped');
});

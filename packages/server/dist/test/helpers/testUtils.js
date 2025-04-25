'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTestActor = exports.createTestPost = void 0;
exports.setupTestDb = setupTestDb;
exports.teardownTestDb = teardownTestDb;
exports.createMockServiceContainer = createMockServiceContainer;
const mongodb_1 = require('mongodb');
const jest_mock_extended_1 = require('jest-mock-extended');
/**
 * Sets up a test database and service container
 */
async function setupTestDb() {
  // Consider using mongo-memory-server or environment variables for connection string
  const client = new mongodb_1.MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('saturn_test_' + new mongodb_1.ObjectId().toString());
  return { client, db };
}
/**
 * Tears down the test database
 */
async function teardownTestDb(client, db) {
  if (!db) {
    console.warn('Database object is undefined. Skipping dropDatabase.');
    return;
  }
  try {
    await db.dropDatabase();
  } catch (error) {
    console.error('Error dropping database:', error);
  }
  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.error('Error closing MongoDB client:', error);
    }
  } else {
    console.warn('MongoDB client is undefined. Skipping client.close().');
  }
}
/**
 * Creates a mock service container for testing.
 * Allows overriding specific services with custom mocks.
 */
function createMockServiceContainer(overrides) {
  const mockContainer = (0, jest_mock_extended_1.mockDeep)();
  // Apply overrides if provided
  if (overrides) {
    for (const key in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        mockContainer[key] = overrides[key];
      }
    }
  }
  return mockContainer;
}
// Removed setupTestServices and mockServiceMiddleware as they seem Express-specific
// and Fastify setup might be different. Add back if needed for Fastify testing.
// Existing createTestPost (assuming it's still needed)
const createTestPost = () => {
  // Consider using OptionalUnlessRequiredId for _id if it comes from DB
  return {
    _id: new mongodb_1.ObjectId(), // Added ObjectId
    content: 'Test post content',
    authorId: new mongodb_1.ObjectId(), // Changed to ObjectId
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [], // Array of ObjectIds
    shares: 0,
    sensitive: false,
    contentWarning: null,
    attachments: [], // Assuming attachments are IDs or URLs
    // Removed embedded actor, prefer fetching actor via authorId
  };
};
exports.createTestPost = createTestPost;
// Added helper for creating a test actor
const createTestActor = (username, domain) => {
  return {
    _id: new mongodb_1.ObjectId(),
    username: username,
    domain: domain,
    publicKey: 'test-public-key',
    privateKey: 'test-private-key', // Should not typically be stored or returned
    inboxUrl: `https://${domain}/inbox`,
    outboxUrl: `https://${domain}/outbox`,
    followingUrl: `https://${domain}/following`,
    followersUrl: `https://${domain}/followers`,
    sharedInboxUrl: `https://${domain}/inbox`, // Assuming shared inbox
    uri: `https://${domain}/actors/${username}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Add other necessary Actor fields as needed
  };
};
exports.createTestActor = createTestActor;

import { Db, MongoClient, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import { createServiceContainer, ServiceContainer } from '@/utils/container'; // Corrected import path using @/
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

/**
 * Sets up a test database and service container
 */
export async function setupTestDb(): Promise<{ client: MongoClient; db: Db }> {
  // Consider using mongo-memory-server or environment variables for connection string
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('saturn_test_' + new ObjectId().toString());
  return { client, db };
}

/**
 * Tears down the test database
 */
export async function teardownTestDb(
  client: MongoClient,
  db: Db
): Promise<void> {
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
export function createMockServiceContainer(
  overrides?: Partial<ServiceContainer>
): DeepMockProxy<ServiceContainer> {
  const mockContainer = mockDeep<ServiceContainer>();

  // Apply overrides if provided
  if (overrides) {
    for (const key in overrides) {
      if (Object.prototype.hasOwnProperty.call(overrides, key)) {
        mockContainer[key as keyof ServiceContainer] =
          overrides[key as keyof ServiceContainer];
      }
    }
  }
  return mockContainer;
}

// Removed setupTestServices and mockServiceMiddleware as they seem Express-specific
// and Fastify setup might be different. Add back if needed for Fastify testing.

// Existing createTestPost (assuming it's still needed)
export const createTestPost = () => {
  // Consider using OptionalUnlessRequiredId for _id if it comes from DB
  return {
    _id: new ObjectId(), // Added ObjectId
    content: 'Test post content',
    authorId: new ObjectId(), // Changed to ObjectId
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [] as ObjectId[], // Array of ObjectIds
    shares: 0,
    sensitive: false,
    contentWarning: null,
    attachments: [] as string[], // Assuming attachments are IDs or URLs
    // Removed embedded actor, prefer fetching actor via authorId
  };
};

// Added helper for creating a test actor
export const createTestActor = (username: string, domain: string) => {
  return {
    _id: new ObjectId(),
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

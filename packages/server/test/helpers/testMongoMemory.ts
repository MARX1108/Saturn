import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

/**
 * Helper function to properly close MongoDB connections in test environments
 * This ensures that all handles are closed and Jest can exit properly
 */
export async function closeMongoDBConnections(
  mongoClient: MongoClient | null,
  mongoServer: MongoMemoryServer | null
): Promise<void> {
  try {
    // Step 1: Close client connection forcefully to terminate all sockets
    if (mongoClient) {
      await mongoClient.close(true);
    }

    // Step 2: Stop the MongoDB memory server
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: true, force: true });
    }

    // Step 3: Add a small delay to ensure all connections have time to close
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error closing MongoDB connections:', error);
    throw error;
  }
}

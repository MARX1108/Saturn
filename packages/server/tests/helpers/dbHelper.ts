import { MongoClient, Db } from 'mongodb';

/**
 * Connect to MongoDB using the provided URI
 * @param serverUri - The MongoDB URI to connect to (typically from mongodb-memory-server)
 * @returns Object containing the MongoDB client and database instance
 */
export async function connectDB(serverUri: string): Promise<{ client: MongoClient, db: Db }> {
  try {
    const client = await MongoClient.connect(serverUri);
    const db = client.db();
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * @param client - The MongoDB client to close
 */
export async function disconnectDB(client: MongoClient): Promise<void> {
  if (client) {
    await client.close();
  }
}

/**
 * Clear all collections in the database
 * @param db - The MongoDB database instance
 */
export async function clearDatabase(db: Db): Promise<void> {
  try {
    const collections = await db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
}

/**
 * Clear specific collections in the database
 * @param db - The MongoDB database instance
 * @param collectionNames - Array of collection names to clear
 */
export async function clearCollections(db: Db, collectionNames: string[]): Promise<void> {
  try {
    for (const collectionName of collectionNames) {
      const collection = db.collection(collectionName);
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clear collections:', error);
    throw error;
  }
}

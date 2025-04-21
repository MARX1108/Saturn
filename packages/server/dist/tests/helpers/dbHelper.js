'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
exports.clearDatabase = clearDatabase;
exports.clearCollections = clearCollections;
const mongodb_1 = require('mongodb');
/**
 * Connect to MongoDB using the provided URI
 * @param serverUri - The MongoDB URI to connect to (typically from mongodb-memory-server)
 * @returns Object containing the MongoDB client and database instance
 */
async function connectDB(serverUri) {
  try {
    const client = await mongodb_1.MongoClient.connect(serverUri);
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
async function disconnectDB(client) {
  if (client) {
    await client.close();
  }
}
/**
 * Clear all collections in the database
 * @param db - The MongoDB database instance
 */
async function clearDatabase(db) {
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
async function clearCollections(db, collectionNames) {
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

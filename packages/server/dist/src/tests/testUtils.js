'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.setupTestDb = setupTestDb;
exports.teardownTestDb = teardownTestDb;
exports.setupTestServices = setupTestServices;
exports.mockServiceMiddleware = mockServiceMiddleware;
const mongodb_1 = require('mongodb');
const container_1 = require('../utils/container');
const serviceMiddleware_1 = require('../middleware/serviceMiddleware');
/**
 * Sets up a test database and service container
 */
async function setupTestDb() {
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
 * Sets up the service container for testing with the application
 */
function setupTestServices(app, db) {
  const testDomain = 'testdomain.com';
  const services = (0, container_1.createServiceContainer)(db, testDomain);
  app.set('services', services);
  app.set('db', db);
  app.set('domain', testDomain);
  // Make sure middleware is applied
  app.use(serviceMiddleware_1.serviceMiddleware);
  return services;
}
/**
 * Middleware for mocking services in tests
 * Useful for route testing without setting up the entire service container
 */
function mockServiceMiddleware(services) {
  return (req, res, next) => {
    req.services = { ...req.services, ...services };
    next();
  };
}

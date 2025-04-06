// filepath: /Users/marxw/Desktop/FYP-Saturn/packages/server/src/tests/testUtils.ts
import { Express, Request, Response, NextFunction } from "express";
import { Db, MongoClient, ObjectId } from "mongodb";
import { createServiceContainer, ServiceContainer } from "../utils/container";
import { serviceMiddleware } from "../middleware/serviceMiddleware";

/**
 * Sets up a test database and service container
 */
export async function setupTestDb(): Promise<{ client: MongoClient; db: Db }> {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();
  const db = client.db("saturn_test_" + new ObjectId().toString());
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
    console.warn("Database object is undefined. Skipping dropDatabase.");
    return;
  }

  try {
    await db.dropDatabase();
  } catch (error) {
    console.error("Error dropping database:", error);
  }

  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.error("Error closing MongoDB client:", error);
    }
  } else {
    console.warn("MongoDB client is undefined. Skipping client.close().");
  }
}

/**
 * Sets up the service container for testing with the application
 */
export function setupTestServices(app: Express, db: Db): ServiceContainer {
  const testDomain = "testdomain.com";
  const services = createServiceContainer(db, testDomain);
  app.set("services", services);
  app.set("db", db);
  app.set("domain", testDomain);
  
  // Make sure middleware is applied
  app.use(serviceMiddleware);
  
  return services;
}

/**
 * Middleware for mocking services in tests
 * Useful for route testing without setting up the entire service container
 */
export function mockServiceMiddleware(services: Partial<ServiceContainer>) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.services = { ...req.services, ...services } as ServiceContainer;
    next();
  };
}
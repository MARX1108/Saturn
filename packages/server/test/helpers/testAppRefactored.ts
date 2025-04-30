import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
// Setup environment variables before other imports
import './setupEnvironment';
import { Db } from 'mongodb';
import { ServiceContainer } from '@/utils/container';
import { configureRoutes } from '@/routes';
import { AppError } from '@/utils/errors';
import logger from '@/utils/logger';

// Import our test setup utilities
import {
  TestSetup,
  createTestSetup,
  CreateTestAppOptions,
  createCustomTestSetup,
} from './createTestServices';

// Define an interface for error objects with status code
interface ErrorWithStatusCode {
  statusCode?: number;
  message?: string;
  [key: string]: unknown;
}

/**
 * Create a basic test app with mocked repositories and real services/controllers
 *
 * @param db Optional database connection (for hybrid testing)
 * @param domain Domain name for URLs
 * @returns Express application configured for testing
 */
export function createRefactoredTestApp(db?: Db, domain = 'test.domain') {
  const testSetup = createTestSetup(domain);
  return createTestAppFromSetup(testSetup, db, domain);
}

/**
 * Create a test app with custom configuration options
 *
 * @param options Customization options for the test app
 * @returns Express application configured for testing
 */
export function createCustomTestApp(options: CreateTestAppOptions = {}) {
  const { db, domainName = 'test.domain' } = options;
  const testSetup = createCustomTestSetup(options);
  return createTestAppFromSetup(testSetup, db, domainName);
}

/**
 * Create a test app from an existing test setup
 *
 * @param testSetup The test setup with repositories, services, and controllers
 * @param db Optional database connection (for hybrid testing)
 * @param domain Domain name for URLs
 * @returns Express application configured for testing
 */
export function createTestAppFromSetup(
  testSetup: TestSetup,
  db?: Db,
  domain = 'test.domain'
) {
  const app = express();

  // Add standard middleware
  app.use(express.json());
  app.use(cors());

  // Create a service container with all the real services and mocked repositories
  const serviceContainer: ServiceContainer = {
    // Add services
    authService: testSetup.services.authService,
    actorService: testSetup.services.actorService,
    postService: testSetup.services.postService,
    commentService: testSetup.services.commentService,
    notificationService: testSetup.services.notificationService,
    mediaService: testSetup.services.mediaService,
    uploadService: testSetup.services.uploadService,
    activityPubService: testSetup.services.activityPubService,
    webfingerService: testSetup.services.webfingerService,

    // Add controllers
    authController: testSetup.controllers.authController,
    actorsController: testSetup.controllers.actorsController,
    postsController: testSetup.controllers.postsController,
    commentsController: testSetup.controllers.commentsController,
    mediaController: testSetup.controllers.mediaController,
    activityPubController: testSetup.controllers.activityPubController,
    webfingerController: testSetup.controllers.webfingerController,
    notificationsController: testSetup.controllers.notificationsController,

    // Domain configuration
    domain,

    // Service lookup function
    getService: function <T>(name: keyof ServiceContainer): T | null {
      return (this as ServiceContainer)[name] as T;
    },
  };

  // If a database is provided, add it to the app locals for hybrid repo testing
  if (db) {
    app.locals.db = db;
  }

  // Configure routes with the service container
  app.use('/api', configureRoutes(serviceContainer));

  // Centralized error handling middleware
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Use structured logging
    logger.error({ err }, 'Test app error handler caught an error');

    if (err instanceof AppError) {
      return res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    }

    // Handle ZodError
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      err.name === 'ZodError'
    ) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    // Type guard for objects with statusCode property
    const errorObj = err as ErrorWithStatusCode;

    if (
      errorObj &&
      typeof errorObj === 'object' &&
      'statusCode' in errorObj &&
      typeof errorObj.statusCode === 'number'
    ) {
      return res
        .status(errorObj.statusCode)
        .json({ error: errorObj.message || 'An error occurred' });
    }

    // Default to 500 error
    return res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

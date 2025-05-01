import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Db } from 'mongodb';
import { configureRoutes } from '@/routes';
import { createServiceContainer } from '@/utils/container';
import { AppError } from '@/utils/errors';
import logger from '../../src/utils/logger';

// Define an interface for error objects with status code
interface ErrorWithStatusCode {
  statusCode?: number;
  message?: string;
  [key: string]: unknown;
}

/**
 * Creates a test Express application with real services and controllers
 * but with mocked repositories (Strategy A for integration tests)
 *
 * @param db - MongoDB database connection
 * @param domain - Domain for URLs
 * @returns Express application for testing
 */
export function createIntegrationTestApp(db: Db, domain: string) {
  const app = express();

  // Add JSON body parser
  app.use(express.json());
  app.use(cors());

  // Create service container with real services
  const serviceContainer = createServiceContainer(db, domain);

  // Configure routes with the real service container
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

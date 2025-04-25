import express, { Request, Response, NextFunction } from 'express';
import { mockServiceContainer } from './mockSetup';
import cors from 'cors';
// Setup environment variables before other imports
import './setupEnvironment';
import { Db } from 'mongodb';
import { configureRoutes } from '@/routes';
import { AppError } from '@/utils/errors';

// Define an interface for error objects with status code
interface ErrorWithStatusCode {
  statusCode?: number;
  message?: string;
  [key: string]: unknown;
}

export function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add JSON body parser
  app.use(express.json());
  app.use(cors());

  // Configure routes
  app.use('/api', configureRoutes(mockServiceContainer));

  // Centralized error handling middleware
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Test app error handler caught:', err);

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

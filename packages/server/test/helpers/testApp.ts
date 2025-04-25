import express, { Express, Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import supertest from 'supertest';
import { mockServiceContainer } from './mockSetup';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { serializeError } from 'serialize-error';
import cors from 'cors';
import path from 'path';
// Setup environment variables before other imports
import './setupEnvironment';
import { Db } from 'mongodb';
import { configureRoutes } from '@/routes';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
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

  // Instantiate controllers (assuming this is correct now)
  const postsController = new PostsController(
    mockServiceContainer.postService,
    mockServiceContainer.actorService,
    mockServiceContainer.uploadService,
    domain
  );
  const commentsController = new CommentsController(
    mockServiceContainer.commentService
  );
  const authController = new AuthController(
    mockServiceContainer.actorService,
    mockServiceContainer.authService
  );
  const actorsController = new ActorsController(
    mockServiceContainer.actorService,
    mockServiceContainer.uploadService,
    mockServiceContainer.postService,
    domain
  );

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

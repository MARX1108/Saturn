import express from 'express';
import { Db } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { configureRoutes } from '@/routes';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
import { mockServiceContainer } from './mockSetup';
import { AppError } from '@/utils/errors';

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add JSON body parser
  app.use(express.json());

  // Create real controllers with mock services
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

  // Create service container with mock services and real controllers
  const serviceContainer = {
    // Services
    authService: mockServiceContainer.authService,
    actorService: mockServiceContainer.actorService,
    postService: mockServiceContainer.postService,
    commentService: mockServiceContainer.commentService,
    mediaService: mockServiceContainer.uploadService,
    notificationService: mockServiceContainer.notificationService,
    uploadService: mockServiceContainer.uploadService,
    // Controllers
    postsController,
    commentsController,
    authController,
    actorsController,
  };

  // Apply middleware in correct order
  app.use(require('cors')());

  // Pass the complete mock container to configureRoutes
  app.use('/api', configureRoutes(mockServiceContainer));

  // Centralized error handling middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('-------------------------');
    console.log('Error Handler Called');
    console.log('Error Object:', JSON.stringify(err)); // May be {} if properties aren't enumerable
    console.log('Error Message:', err?.message);
    console.log('Error StatusCode:', err?.statusCode);
    console.log('Error Type:', typeof err);
    console.log('err instanceof Error:', err instanceof Error);
    console.log('err instanceof AppError:', err instanceof AppError);
    console.log('-------------------------');

    if (err instanceof AppError) {
      // Use status code and message from AppError instances
      console.log(`Caught AppError (${err.statusCode}), sending response.`);
      res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    } else if (err && typeof err.statusCode === 'number') {
      // Fallback for other errors with a statusCode property
      console.log(
        `Caught non-AppError with statusCode (${err.statusCode}), sending response.`
      );
      res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    } else {
      // Default internal server error for unexpected errors
      console.error('Caught unexpected error, sending 500.');
      console.error(err?.stack || err); // Log full stack for unexpected errors
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return app;
}

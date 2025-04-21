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

  // Improved Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error caught by middleware:', err?.message);
    if (err && typeof err.statusCode === 'number') {
      res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    } else {
      // Default internal server error for unexpected errors
      console.error(err.stack); // Log full stack for unexpected errors
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return app;
}

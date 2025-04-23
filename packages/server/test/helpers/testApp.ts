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
  app.use(require('cors')());

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
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
      res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    } else if (err && typeof err.statusCode === 'number') {
      res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return app;
}

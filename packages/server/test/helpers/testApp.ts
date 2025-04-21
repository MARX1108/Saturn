import express from 'express';
import { Db } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { configureRoutes } from '@/routes';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
import { mockServiceContainer, mockAuthMiddleware } from './mockSetup';

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add test ping route for debugging
  app.get('/test-ping', (req, res) => {
    console.log('!!! DEBUG: /test-ping endpoint reached !!!');
    res.status(200).send('pong');
  });

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
    mockServiceContainer.authService,
    mockServiceContainer.actorService
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

  console.log(
    `!!! DEBUG: In createTestApp, before configuring routes. uploadService from container: ${typeof serviceContainer.uploadService}`
  );

  // Apply middleware in correct order
  app.use(require('cors')());
  app.use(mockAuthMiddleware); // Apply auth middleware before routes
  app.use('/api', configureRoutes(serviceContainer));

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
  });

  return app;
}

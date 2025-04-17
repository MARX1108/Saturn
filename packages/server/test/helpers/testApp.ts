import express from 'express';
import { Db } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { configureRoutes } from '@/routes';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
import {
  mockAuthService,
  mockActorService,
  mockPostService,
  mockUploadService,
  mockNotificationService,
  mockCommentService,
  mockAuthMiddleware,
} from './mockSetup';

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
    mockPostService,
    mockActorService,
    mockUploadService,
    domain
  );
  const commentsController = new CommentsController(mockCommentService);
  const authController = new AuthController(mockAuthService, mockActorService);
  const actorsController = new ActorsController(
    mockActorService,
    mockUploadService,
    mockPostService,
    domain
  );

  // Create service container with mock services and real controllers
  const serviceContainer = {
    // Services
    authService: mockAuthService,
    actorService: mockActorService,
    postService: mockPostService,
    commentService: mockCommentService,
    mediaService: mockUploadService,
    notificationService: mockNotificationService,
    uploadService: mockUploadService,
    // Controllers
    postsController,
    commentsController,
    authController,
    actorsController,
  };

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

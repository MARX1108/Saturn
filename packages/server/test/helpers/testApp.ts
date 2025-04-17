import express from 'express';
import { Db } from 'mongodb';
import { mock } from 'jest-mock-extended';
import { AuthService } from '../../src/modules/auth/services/authService';
import { ActorService } from '../../src/modules/actors/services/actorService';
import { PostsController } from '../../src/modules/posts/controllers/postsController';
import { CommentsController } from '../../src/modules/comments/controllers/comments.controller';
import { UploadService } from '../../src/modules/uploads/services/uploadService';
import { PostService } from '../../src/modules/posts/services/postService';
import configureRoutes from '../../src/routes';

// Export mock services for tests
export const mockAuthService = mock<AuthService>();
export const mockActorService = mock<ActorService>();
export const mockPostsController = mock<PostsController>();
export const mockCommentsController = mock<CommentsController>();
export const mockUploadService = mock<UploadService>();
export const mockPostService = mock<PostService>();

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add test ping route for debugging
  app.get('/test-ping', (req, res) => {
    console.log('!!! DEBUG: /test-ping endpoint reached !!!');
    res.status(200).send('pong');
  });

  // Add JSON body parser
  app.use(express.json());

  // Create service container with all required services
  const serviceContainer = {
    authService: mockAuthService,
    actorService: mockActorService,
    postsController: mockPostsController,
    commentsController: mockCommentsController,
    uploadService: mockUploadService,
    postService: mockPostService,
  };

  // Add service container middleware
  app.use((req, res, next) => {
    req.services = serviceContainer;
    next();
  });

  // Mount all routes under /api
  console.log('!!! DEBUG: Attempting to mount all routes under /api !!!');
  app.use('/api', configureRoutes(serviceContainer));

  return app;
}

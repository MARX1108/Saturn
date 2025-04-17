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
import { Request, Response, NextFunction } from 'express';
import { DbUser } from '../src/models/user';
import { createServiceContainer } from '../src/config/serviceContainer';
import { mainRouter } from '../src/routes';
import { CommentService } from '../src/modules/comments/services/commentService';
import { MediaService } from '../src/modules/media/services/mediaService';
import { NotificationService } from '../src/modules/notifications/services/notificationService';

// Export mock services for tests
export const mockAuthService = mock<AuthService>();
export const mockActorService = mock<ActorService>();
export const mockPostsController = mock<PostsController>();
export const mockCommentsController = mock<CommentsController>();
export const mockUploadService = mock<UploadService>();
export const mockPostService = mock<PostService>();

export const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.user = {
    _id: 'test-user-id',
    id: 'test-user-id',
    preferredUsername: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as DbUser;
  next();
};

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Add test ping route for debugging
  app.get('/test-ping', (req, res) => {
    console.log('!!! DEBUG: /test-ping endpoint reached !!!');
    res.status(200).send('pong');
  });

  // Add JSON body parser
  app.use(express.json());

  // Create mock services
  const mockAuthService = mock<AuthService>();
  const mockActorService = mock<ActorService>();
  const mockPostService = mock<PostService>();
  const mockCommentService = mock<CommentService>();
  const mockMediaService = mock<MediaService>();
  const mockNotificationService = mock<NotificationService>();

  // Configure mock services
  mockPostService.getPostById.mockImplementation(async id => {
    if (id === 'nonexistent') return null;
    return {
      id,
      content: 'Test post content',
      authorId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
      shares: 0,
      sensitive: false,
      contentWarning: null,
      attachments: [],
      actor: {
        id: 'test-user-id',
        username: 'testuser',
      },
    };
  });

  mockPostService.getFeed.mockResolvedValue({
    posts: [
      {
        id: 'test-post-id',
        content: 'Test post content',
        authorId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: [],
        shares: 0,
        sensitive: false,
        contentWarning: null,
        attachments: [],
        actor: {
          id: 'test-user-id',
          username: 'testuser',
        },
      },
    ],
    hasMore: false,
  });

  // Create service container with mock services
  const serviceContainer = {
    authService: mockAuthService,
    actorService: mockActorService,
    postService: mockPostService,
    commentService: mockCommentService,
    mediaService: mockMediaService,
    notificationService: mockNotificationService,
  };

  // Apply middleware
  app.use(require('cors')());
  app.use(mockAuthMiddleware);

  // Mount routes with service container
  app.use('/api', mainRouter(serviceContainer));

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
  });

  return app;
}

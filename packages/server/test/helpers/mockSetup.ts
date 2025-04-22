import { mock } from 'jest-mock-extended';
import { ObjectId } from 'mongodb';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { ServiceContainer } from '@/utils/container';
import { CommentService } from '@/modules/comments/services/comment.service';
import { auth } from '@/middleware/auth';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import {
  AppError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '@/utils/errors';
import { Request, Response } from 'express';

// Create mock services
export const mockAuthService = mock<any>();
export const mockActorService = mock<ActorService>();
export const mockPostService = mock<PostService>();
export const mockUploadService = mock<any>();
export const mockNotificationService = mock<any>();
export const mockCommentService = mock<any>();
export const mockMediaService = mock<any>();
export const mockActivityPubService = mock<any>();
export const mockWebfingerService = mock<any>();
export const mockPostsController = mock<any>();
export const mockCommentsController = mock<any>();
export const mockAuthController = mock<any>();
export const mockActorsController = mock<any>();
export const mockMediaController = mock<any>();
export const mockActivityPubController = mock<any>();
export const mockWebfingerController = mock<any>();

// Attach to global scope
(global as any).mockAuthService = mockAuthService;
(global as any).mockActorService = mockActorService;
(global as any).mockPostService = mockPostService;
(global as any).mockUploadService = mockUploadService;
(global as any).mockNotificationService = mockNotificationService;
(global as any).mockCommentService = mockCommentService;
(global as any).mockMediaService = mockMediaService;
(global as any).mockActivityPubService = mockActivityPubService;
(global as any).mockWebfingerService = mockWebfingerService;
(global as any).mockPostsController = mockPostsController;
(global as any).mockCommentsController = mockCommentsController;
(global as any).mockAuthController = mockAuthController;
(global as any).mockActorsController = mockActorsController;
(global as any).mockMediaController = mockMediaController;
(global as any).mockActivityPubController = mockActivityPubController;
(global as any).mockWebfingerController = mockWebfingerController;

// Mock methods called during setup
// const mockMulterMiddleware = (req: Request, res: Response, next: NextFunction) => next();
// mockUploadService.configureImageUploadMiddleware.mockReturnValue(mockMulterMiddleware);

// Ensure configureImageUploadMiddleware is still mocked if needed by controller setup
const globalUploadService = (global as any).mockUploadService;
if (globalUploadService && globalUploadService.configureImageUploadMiddleware) {
  globalUploadService.configureImageUploadMiddleware.mockReturnValue(
    (req: any, res: any, next: any) => next()
  );
}

// Configure default mock implementations
const mockDate = new Date();
const mockActor = {
  _id: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1'),
  id: 'https://test.domain/users/testuser',
  username: 'testuser@test.domain',
  preferredUsername: 'testuser',
  displayName: 'Test User',
  name: 'Test User',
  bio: 'Test bio',
  summary: 'Test summary',
  type: 'Person' as const,
  inbox: 'https://test.domain/users/testuser/inbox',
  outbox: 'https://test.domain/users/testuser/outbox',
  followers: 'https://test.domain/users/testuser/followers',
  createdAt: mockDate,
  updatedAt: mockDate,
};

mockActorService.getActorById.mockResolvedValue(mockActor as any);
mockActorService.getActorByUsername.mockResolvedValue(mockActor as any);

// Mock AuthController.register and mockAuthController.login
mockAuthController.register.mockImplementation(
  async (req: Request, res: Response) => {
    console.log('>>> MOCK Controller.register CALLED with body:', req.body);
    const { username, password, displayName } = req.body;

    // Input validation simulation (based on test cases)
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Missing registration fields' });
    }
    if (username === 'invalid@username') {
      return res.status(400).json({ error: 'Username validation failed' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password too short' });
    }
    // Conflict simulation
    if (username === 'existinguser') {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Simulate successful registration
    const registeredActor = {
      ...mockActor,
      preferredUsername: username,
      displayName: displayName,
    };
    res
      .status(201)
      .json({ actor: registeredActor, token: 'mock-ctrl-token-register' });
  }
);

mockAuthController.login.mockImplementation(
  async (req: Request, res: Response) => {
    console.log('>>> MOCK Controller.login CALLED with body:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing login fields' });
    }

    // Simulate successful login
    if (username === 'testuser' && password === 'password123') {
      res
        .status(200)
        .json({ actor: mockActor, token: 'mock-ctrl-token-login' });
      return;
    }

    // Simulate failed login (wrong username or password)
    return res.status(401).json({ error: 'Invalid credentials' });
  }
);

mockPostService.getPostById.mockImplementation(async id => {
  if (id === 'nonexistent') return null;
  const postObjectId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c2');
  const postUrl = `https://test.domain/posts/${id}`;
  const actorObjectId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const actorApId = 'https://test.domain/users/testuser';
  return {
    _id: postObjectId,
    id: postUrl,
    type: 'Note' as const,
    actorId: actorObjectId,
    content: 'Test post content',
    visibility: 'public',
    sensitive: false,
    summary: undefined,
    attachments: [],
    published: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    attributedTo: actorApId,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [`${actorApId}/followers`],
    url: postUrl,
    replyCount: 0,
    likesCount: 0,
    sharesCount: 0,
    likedBy: [],
    sharedBy: [],
    actor: {
      // Include actor summary
      id: actorApId,
      username: 'testuser@test.domain',
      preferredUsername: 'testuser',
      displayName: 'Test User',
      icon: undefined,
    },
  } as Post; // Ensure the mock return type matches Post model
});

mockPostService.getFeed.mockResolvedValue({
  posts: [
    {
      _id: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3'),
      id: 'https://test.domain/posts/test-post-id',
      type: 'Note' as const,
      actorId: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1'),
      content: 'Test post content',
      visibility: 'public',
      sensitive: false,
      summary: undefined,
      attachments: [],
      published: mockDate,
      createdAt: mockDate,
      updatedAt: mockDate,
      attributedTo: 'https://test.domain/users/testuser',
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: ['https://test.domain/users/testuser/followers'],
      url: 'https://test.domain/posts/test-post-id',
      replyCount: 0,
      likesCount: 0,
      sharesCount: 0,
      likedBy: [],
      sharedBy: [],
      actor: {
        // Include actor summary
        id: 'https://test.domain/users/testuser',
        username: 'testuser@test.domain',
        preferredUsername: 'testuser',
        displayName: 'Test User',
        icon: undefined,
      },
    } as Post, // Ensure the mock return type matches Post model
  ],
  hasMore: false,
});

// Create and export the container using these mocks
// Ensure ALL properties from ServiceContainer interface are present
export const mockServiceContainer: ServiceContainer = {
  authService: mockAuthService,
  actorService: mockActorService,
  postService: mockPostService,
  uploadService: mockUploadService,
  notificationService: mockNotificationService,
  commentService: mockCommentService,
  mediaService: mockMediaService,
  activityPubService: mockActivityPubService,
  webfingerService: mockWebfingerService,
  postsController: mockPostsController,
  commentsController: mockCommentsController,
  authController: mockAuthController,
  actorsController: mockActorsController,
  activityPubController: mockActivityPubController,
  webfingerController: mockWebfingerController,
  mediaController: mockMediaController,
  domain: 'test.domain',
  getService: jest.fn().mockImplementation(<T>(name: string): T | null => {
    const serviceName = name as keyof ServiceContainer;
    if (
      Object.prototype.hasOwnProperty.call(mockServiceContainer, serviceName)
    ) {
      return mockServiceContainer[serviceName] as T;
    }
    return null;
  }),
};

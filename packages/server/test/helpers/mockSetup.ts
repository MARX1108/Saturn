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
import { Request, Response, NextFunction } from 'express';

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

// Mock AuthController methods (Remove logs)
mockAuthController.register.mockImplementation(
  async (req: Request, res: Response) => {
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

// --- ADD Multer Mock ---
// Mock the multer library itself
jest.mock('multer', () => {
  // Mock the default export (which is the main multer function)
  const multer = jest.fn(() => ({
    // Mock specific methods used by your code, e.g., array(), single()
    array: jest.fn(
      () => (req: Request, res: Response, next: NextFunction) => next()
    ),
    single: jest.fn(
      () => (req: Request, res: Response, next: NextFunction) => next()
    ),
    // Add other methods if needed (fields, none)
  }));
  // If you use multer.diskStorage or multer.memoryStorage, mock them too
  multer.diskStorage = jest.fn(() => ({
    /* return a dummy storage object if needed */
  }));
  multer.memoryStorage = jest.fn(() => ({
    /* return a dummy storage object if needed */
  }));
  return multer;
});
// --- END Multer Mock ---

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

// --- Define a mock Post object for responses ---
const mockPost = {
  _id: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3'),
  id: 'https://test.domain/posts/test-post-id',
  type: 'Note' as const,
  actorId: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1'),
  content: 'Mock post content from controller',
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
    id: 'https://test.domain/users/testuser',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    displayName: 'Test User',
    icon: undefined,
  },
} as Post;

// Add mock implementations for PostsController methods

mockPostsController.createPost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.createPost CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const { content, sensitive, contentWarning } = req.body;
    // Basic validation simulation
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    // Simulate attachment handling result (if files were present)
    const attachments = ((req.files as Express.Multer.File[]) || []).map(
      file => ({
        type: 'Document' as const,
        mediaType: file.mimetype,
        url: `https://test.domain/media/${file.filename}`, // Example URL
        name: file.originalname,
      })
    );
    // Simulate success
    const createdPost = {
      ...mockPost,
      content: content,
      sensitive: sensitive === 'true',
      contentWarning: sensitive === 'true' ? contentWarning : undefined,
      attachments: attachments,
      // Simulate author based on authenticated user from mock middleware
      actor: {
        ...mockActor,
        preferredUsername: req.user?.preferredUsername || 'unknown',
      },
    };
    res.status(201).json(createdPost);
  }
);

mockPostsController.getPostById.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.getPostById CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    // Simulate invalid ID format
    if (postId === 'invalid-id-format') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    // Simulate not found
    try {
      new ObjectId(postId); // Check if valid ObjectId string
      if (postId === new ObjectId().toString()) {
        // Simulate a random valid ID not found
        return res.status(404).json({ error: 'Post not found' });
      }
    } catch (e) {
      // If not a valid ObjectId string, potentially treat as not found or invalid based on real logic
      return res
        .status(404)
        .json({ error: 'Post not found (invalid ObjectId)' });
    }

    // Simulate success - return mock post, add like status
    const postWithLike = {
      ...mockPost,
      _id: new ObjectId(postId), // Use requested ID for mock response _id
      id: `https://test.domain/posts/${postId}`, // Update other IDs too
      url: `https://test.domain/posts/${postId}`,
      likedByUser: !!req.user, // Simplistic: liked if user is authenticated for test
    };
    res.status(200).json(postWithLike);
  }
);

mockPostsController.getFeed.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.getFeed CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    // Simulate success - return a list containing mockPost
    // Add pagination/filtering simulation if needed later
    const response = {
      posts: [{ ...mockPost, likedByUser: !!req.user }],
      total: 1,
      // hasMore: false,
    };
    res.status(200).json(response);
  }
);

mockPostsController.getPostsByUsername.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.getPostsByUsername CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const username = req.params.username;
    if (username === 'nonexistentuser') {
      return res.status(404).json({ error: 'User not found' });
    }
    // Simulate success
    const response = {
      posts: [
        { ...mockPost, actor: { ...mockActor, preferredUsername: username } },
      ],
      total: 1,
    };
    res.status(200).json(response);
  }
);

mockPostsController.updatePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.updatePost CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    const { content } = req.body;
    // Simulate auth check (assuming authenticate middleware added req.user)
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    // Simulate not found
    if (postId === new ObjectId().toString()) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Simulate forbidden
    if (req.user.preferredUsername !== 'testuser') {
      // Assuming testPostId belongs to testuser
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Simulate missing content
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    // Simulate success
    res
      .status(200)
      .json({ ...mockPost, _id: new ObjectId(postId), content: content });
  }
);

mockPostsController.deletePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.deletePost CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    // Simulate auth check
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    // Simulate not found
    if (postId === new ObjectId().toString()) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Simulate forbidden
    if (req.user.preferredUsername !== 'testuser') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Simulate success
    res.status(204).send();
  }
);

mockPostsController.likePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.likePost CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    // Simulate not found / already liked / basic validation fail -> 400
    if (postId === new ObjectId().toString() || postId === 'invalid-id') {
      return res.status(400).json({ error: 'Bad request on like' }); // Combine 404/409/400 for simplicity
    }
    // Simulate success
    res.status(200).json({ message: 'Post liked successfully' });
  }
);

mockPostsController.unlikePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.unlikePost CALLED. req.user:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    // Simulate not found / not liked / basic validation fail -> 400
    if (postId === new ObjectId().toString() || postId === 'invalid-id') {
      return res.status(400).json({ error: 'Bad request on unlike' }); // Combine 404/409/400 for simplicity
    }
    // Simulate success
    res.status(200).json({ message: 'Post unliked successfully' });
  }
);

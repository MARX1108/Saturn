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
// Use a valid 24-char hex string for the mock user ID
const knownTestUserIdHex = '60a0f3f1e1b8f1a1a8b4c1c1'; // Reusing a previous mock ID for consistency
const knownTestUserId = new ObjectId(knownTestUserIdHex);
const knownTestUsername = 'testuser'; // From auth mock
const knownTestPostObjectId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3'); // Consistent mock ID
const knownTestPostIdString = knownTestPostObjectId.toHexString();
const knownTestPostUrl = `https://test.domain/posts/${knownTestPostIdString}`;
const knownNonExistentObjectId = new ObjectId('ffffffffffffffffffffffff');
const knownNonExistentIdString = knownNonExistentObjectId.toHexString();

const mockActor = {
  _id: knownTestUserId, // Use the ObjectId instance
  id: `https://test.domain/users/${knownTestUsername}`,
  username: `${knownTestUsername}@test.domain`,
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

// --- Helper Data & Mocks ---
const mockPost = {
  _id: knownTestPostObjectId,
  id: knownTestPostUrl,
  type: 'Note' as const,
  actorId: knownTestUserId, // Use the ObjectId instance directly
  content: 'Default mock post content',
  visibility: 'public',
  sensitive: false,
  summary: undefined,
  attachments: [],
  published: mockDate,
  createdAt: mockDate,
  updatedAt: mockDate,
  attributedTo: `https://test.domain/users/${knownTestUsername}`,
  to: ['https://www.w3.org/ns/activitystreams#Public'],
  cc: [`https://test.domain/users/${knownTestUsername}/followers`],
  url: knownTestPostUrl,
  replyCount: 0,
  likesCount: 0, // Start at 0
  sharesCount: 0,
  likedBy: [],
  sharedBy: [],
  actor: {
    ...mockActor,
    _id: knownTestUserId, // Ensure consistent ID type
    id: `https://test.domain/users/${knownTestUsername}`,
    preferredUsername: knownTestUsername,
  },
} as Post;

export let isPostLikedTestState = false;

// --- CONTROLLER MOCKS ---

mockPostsController.createPost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.createPost CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    console.log('>>> Body:', req.body);
    console.log('>>> Files:', req.files);

    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized - No user found in controller mock' });
    }

    let content = req.body.content;
    let sensitive = req.body.sensitive;
    let contentWarning = req.body.contentWarning;

    // Handle multipart: Only require content IF no files are present
    const hasFiles =
      req.files && (req.files as Express.Multer.File[]).length > 0;
    if (hasFiles) {
      console.log('>>> Multipart detected, content check skipped.');
      // Attempt to get fields from body anyway (might be populated by some middleware/superagent plugin)
      content = req.body.content;
      sensitive = req.body.sensitive;
      contentWarning = req.body.contentWarning;
    } else if (!content || String(content).trim() === '') {
      // Require content only if NOT multipart
      return res.status(400).json({ error: 'Content is required' });
    }

    const isSensitive = String(sensitive).toLowerCase() === 'true';

    const attachments = ((req.files as Express.Multer.File[]) || []).map(
      file => ({
        type: 'Document' as const,
        mediaType: file.mimetype,
        url: `https://test.domain/media/${file.filename || 'mockfile.png'}`,
        name: file.originalname,
      })
    );

    const createdPost = {
      ...mockPost,
      _id: new ObjectId(),
      content: content ? String(content) : null,
      sensitive: isSensitive,
      contentWarning: isSensitive ? String(contentWarning || '') : undefined,
      attachments: attachments,
      actor: { ...mockActor, preferredUsername: req.user.preferredUsername },
    };
    res.status(201).json(createdPost);
  }
);

mockPostsController.getPostById.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.getPostById CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    console.log(
      '>>> Request Post ID:',
      postId,
      'Known Test Post ID:',
      knownTestPostIdString
    );

    if (postId === 'invalid-id-format') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Check if it's a potentially valid but non-existent ObjectId
    try {
      new ObjectId(postId);
      // Add specific check if the ID matches the known test post ID used in beforeEach
      if (
        postId !== knownTestPostIdString &&
        postId !== mockPost._id.toHexString()
      ) {
        // This checks against the dynamically generated ID from beforeEach
        // And the static mockPost ID just in case
        console.log(
          `>>> ID ${postId} does not match known test ID ${knownTestPostIdString} or static mock ID`
        );
        // Removed the random check, rely on specific non-existent ID test case
        // return res.status(404).json({ error: 'Post not found' });
      }
    } catch (e) {
      return res
        .status(400)
        .json({ error: 'Post ID format invalid (ObjectId conversion failed)' });
    }

    // Simulate success
    const postData = {
      ...mockPost,
      _id: knownTestPostObjectId,
      id: knownTestPostUrl,
      url: knownTestPostUrl,
      content: 'This is a test post',
      // FIXED: Check username for liked status
      likedByUser:
        !!req.user && req.user.preferredUsername === knownTestUsername,
    };
    res.status(200).json(postData);
  }
);

mockPostsController.getFeed.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.getFeed CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    console.log('>>> Query Params:', req.query);
    try {
      // FIXED: Check username for liked status
      const likedByUserStatus =
        !!req.user && req.user.preferredUsername === knownTestUsername;

      // Generate MORE posts (e.g., 15)
      const generatedPosts = Array.from({ length: 15 }).map((_, i) => ({
        ...mockPost,
        _id: new ObjectId(),
        content: `Feed Post ${i + 1}`,
        createdAt: new Date(Date.now() - i * 5000), // Vary dates
        likedByUser: likedByUserStatus,
        // Use the correct author structure
        author: {
          preferredUsername: i % 4 === 0 ? 'otheruser' : knownTestUsername, // Vary author
        },
      }));

      let allMockPosts = generatedPosts;

      const usernameFilter = req.query.username as string;
      if (usernameFilter) {
        allMockPosts = allMockPosts.filter(
          p => p.author.preferredUsername === usernameFilter
        );
      }

      const limit = parseInt((req.query.limit as string) || '10', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);
      const paginatedPosts = allMockPosts.slice(offset, offset + limit);

      const response = {
        posts: paginatedPosts,
        total: allMockPosts.length,
      };
      res.status(200).json(response);
    } catch (error: any) {
      console.error('>>> ERROR inside getFeed mock:', error);
      res.status(500).json({ error: 'Internal server error in mock getFeed' });
    }
  }
);

mockPostsController.getPostsByUsername.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.getPostsByUsername CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const username = req.params.username;
    if (username === 'nonexistentuser') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (username !== knownTestUsername) {
      // Return empty for other users unless specifically handled
      return res.status(200).json({ posts: [], total: 0 });
    }
    // Simulate success for known test user
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
      '>>> MOCK PostsController.updatePost CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;
    const { content } = req.body;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // FIXED: Check permission based on username comparison for mock scenario
    if (
      postId === knownTestPostIdString &&
      req.user.preferredUsername !== mockPost.actor.preferredUsername
    ) {
      console.log(
        `>>> Permission check FAIL: User ${req.user.preferredUsername} != Actor ${mockPost.actor.preferredUsername}`
      );
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }
    res
      .status(200)
      .json({ ...mockPost, _id: new ObjectId(postId), content: content });
  }
);

mockPostsController.deletePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.deletePost CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // FIXED: Check permission based on username comparison for mock scenario
    if (
      postId === knownTestPostIdString &&
      req.user.preferredUsername !== mockPost.actor.preferredUsername
    ) {
      console.log(
        `>>> Permission check FAIL: User ${req.user.preferredUsername} != Actor ${mockPost.actor.preferredUsername}`
      );
      return res.status(403).json({ error: 'Forbidden' });
    }
    isPostLikedTestState = false;
    res.status(204).send();
  }
);

mockPostsController.likePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.likePost CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Simulate already liked
    if (isPostLikedTestState) {
      return res.status(409).json({ error: 'Post already liked' });
    }
    // Simulate basic validation failure
    if (postId === 'invalid-id') {
      return res.status(400).json({ error: 'Invalid Post ID for like' });
    }
    // Simulate success
    isPostLikedTestState = true;
    res.status(200).json({ message: 'Post liked successfully' });
  }
);

mockPostsController.unlikePost.mockImplementation(
  async (req: Request, res: Response) => {
    console.log(
      '>>> MOCK PostsController.unlikePost CALLED. User:',
      req.user
        ? { id: req.user._id, username: req.user.preferredUsername }
        : undefined
    );
    const postId = req.params.id;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Simulate not liked
    if (!isPostLikedTestState) {
      return res.status(409).json({ error: 'Post not liked' });
    }
    // Simulate basic validation failure
    if (postId === 'invalid-id') {
      return res.status(400).json({ error: 'Invalid Post ID for unlike' });
    }
    // Simulate success
    isPostLikedTestState = false;
    res.status(200).json({ message: 'Post unliked successfully' });
  }
);

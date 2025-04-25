/* eslint-disable @typescript-eslint/no-unsafe-return */
import { mock, DeepMockProxy } from 'jest-mock-extended';
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
  // BadRequestError, // Removed unused import
  // ConflictError, // Removed unused import
  // UnauthorizedError, // Removed unused import
} from '@/utils/errors';
import { Request, Response, NextFunction } from 'express';
import { createTestApp } from './testApp';
import { Comment } from '@/modules/comments/models/comment';
import { jest } from '@jest/globals';
import { AuthService } from '@/modules/auth/services/auth.service';
import { MediaService } from '@/modules/media/services/media.service';
import { UploadService } from '@/modules/media/services/upload.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { ActivityPubService } from '@/modules/activitypub/services/activitypub.service';
import { WebfingerService } from '@/modules/webfinger/services/webfinger.service';
import { PostsController } from '@/modules/posts/controllers/postsController';
import { CommentsController } from '@/modules/comments/controllers/comments.controller';
import { AuthController } from '@/modules/auth/controllers/authController';
import { ActorsController } from '@/modules/actors/controllers/actorsController';
import { MediaController } from '@/modules/media/controllers/media.controller';
import { ActivityPubController } from '@/modules/activitypub/controllers/activitypubController';
import { WebfingerController } from '@/modules/webfinger/controllers/webfingerController';

// Type definition for middleware functions
type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Type for mock implementations
interface MockService {
  [key: string]: jest.Mock;
}

// Create mock services with proper types
export const mockAuthService: DeepMockProxy<AuthService> = mock<AuthService>();
export const mockActorService: DeepMockProxy<ActorService> =
  mock<ActorService>();
export const mockPostService: DeepMockProxy<PostService> = mock<PostService>();
export const mockUploadService: DeepMockProxy<UploadService & MockService> =
  mock<UploadService & MockService>();
export const mockNotificationService: DeepMockProxy<NotificationService> =
  mock<NotificationService>();
export const mockCommentService: DeepMockProxy<CommentService> =
  mock<CommentService>();
export const mockMediaService: DeepMockProxy<MediaService> =
  mock<MediaService>();
export const mockActivityPubService: DeepMockProxy<ActivityPubService> =
  mock<ActivityPubService>();
export const mockWebfingerService: DeepMockProxy<WebfingerService> =
  mock<WebfingerService>();
export const mockPostsController: DeepMockProxy<PostsController> =
  mock<PostsController>();
export const mockCommentsController: DeepMockProxy<CommentsController> =
  mock<CommentsController>();
export const mockAuthController: DeepMockProxy<AuthController> =
  mock<AuthController>();
export const mockActorsController: DeepMockProxy<ActorsController> =
  mock<ActorsController>();
export const mockMediaController: DeepMockProxy<MediaController> =
  mock<MediaController>();
export const mockActivityPubController: DeepMockProxy<ActivityPubController> =
  mock<ActivityPubController>();
export const mockWebfingerController: DeepMockProxy<WebfingerController> =
  mock<WebfingerController>();

// Define a type for the global scope to avoid 'any'
interface TestGlobals {
  mockAuthService: DeepMockProxy<AuthService>;
  mockActorService: DeepMockProxy<ActorService>;
  mockPostService: DeepMockProxy<PostService>;
  mockUploadService: DeepMockProxy<UploadService & MockService>;
  mockNotificationService: DeepMockProxy<NotificationService>;
  mockCommentService: DeepMockProxy<CommentService>;
  mockMediaService: DeepMockProxy<MediaService>;
  mockActivityPubService: DeepMockProxy<ActivityPubService>;
  mockWebfingerService: DeepMockProxy<WebfingerService>;
  mockPostsController: DeepMockProxy<PostsController>;
  mockCommentsController: DeepMockProxy<CommentsController>;
  mockAuthController: DeepMockProxy<AuthController>;
  mockActorsController: DeepMockProxy<ActorsController>;
  mockMediaController: DeepMockProxy<MediaController>;
  mockActivityPubController: DeepMockProxy<ActivityPubController>;
  mockWebfingerController: DeepMockProxy<WebfingerController>;
}

// Attach to global scope with proper typing
const globalWithMocks = global as unknown as TestGlobals;
globalWithMocks.mockAuthService = mockAuthService;
globalWithMocks.mockActorService = mockActorService;
globalWithMocks.mockPostService = mockPostService;
globalWithMocks.mockUploadService = mockUploadService;
globalWithMocks.mockNotificationService = mockNotificationService;
globalWithMocks.mockCommentService = mockCommentService;
globalWithMocks.mockMediaService = mockMediaService;
globalWithMocks.mockActivityPubService = mockActivityPubService;
globalWithMocks.mockWebfingerService = mockWebfingerService;
globalWithMocks.mockPostsController = mockPostsController;
globalWithMocks.mockCommentsController = mockCommentsController;
globalWithMocks.mockAuthController = mockAuthController;
globalWithMocks.mockActorsController = mockActorsController;
globalWithMocks.mockMediaController = mockMediaController;
globalWithMocks.mockActivityPubController = mockActivityPubController;
globalWithMocks.mockWebfingerController = mockWebfingerController;

// Ensure configureImageUploadMiddleware is still mocked if needed by controller setup
const globalUploadService = globalWithMocks.mockUploadService;
if (globalUploadService && globalUploadService.configureImageUploadMiddleware) {
  const middlewareFn: MiddlewareFunction = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => next();
  globalUploadService.configureImageUploadMiddleware.mockReturnValue(
    middlewareFn
  );
} else {
  globalUploadService.configureImageUploadMiddleware = jest.fn();

  const middlewareFn: MiddlewareFunction = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => next();

  globalUploadService.configureImageUploadMiddleware.mockReturnValue(
    middlewareFn
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

const mockActor: Actor = {
  _id: knownTestUserId, // Use the ObjectId instance
  id: `https://test.domain/users/${knownTestUsername}`,
  username: `${knownTestUsername}@test.domain`,
  preferredUsername: 'testuser',
  displayName: 'Test User',
  name: 'Test User',
  summary: 'Test summary',
  type: 'Person' as const,
  inbox: 'https://test.domain/users/testuser/inbox',
  outbox: 'https://test.domain/users/testuser/outbox',
  followers: 'https://test.domain/users/testuser/followers',
  createdAt: mockDate,
  updatedAt: mockDate,
};

mockActorService.getActorById.mockResolvedValue(mockActor);
mockActorService.getActorByUsername.mockResolvedValue(mockActor);

// Mock AuthController methods
mockAuthController.register.mockImplementation(
  // Removed async, next. Function now implicitly returns void.
  (req: Request, res: Response): void => {
    // Destructure with expected types, provide defaults if appropriate
    const {
      username,
      password,
      displayName,
      // Add other potential fields if needed by the logic
    } = req.body as {
      username?: string;
      password?: string;
      displayName?: string;
    };

    // Input validation simulation (based on test cases)
    if (!username || !password || !displayName) {
      res.status(400).json({ error: 'Missing registration fields' });
      return; // Ensure void return
    }
    if (username === 'invalid@username') {
      res.status(400).json({ error: 'Username validation failed' });
      return;
    }
    // Use safe access for length check
    if (!password || password.length < 8) {
      res.status(400).json({ error: 'Password too short' });
      return;
    }
    // Conflict simulation
    if (username === 'existinguser') {
      res.status(409).json({ error: 'Username already exists' });
      return;
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
    // No explicit return needed as res.json() completes the response
  }
);

mockAuthController.login.mockImplementation(
  (req: Request, res: Response): void => {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      res.status(400).json({ error: 'Missing login fields' });
      return;
    }

    // Simulate successful login
    if (username === 'testuser' && password === 'password123') {
      res
        .status(200)
        .json({ actor: mockActor, token: 'mock-ctrl-token-login' });
      return;
    }

    // Simulate failed login (wrong username or password)
    res.status(401).json({ error: 'Invalid credentials' });
  }
);

mockPostService.getPostById.mockImplementation((id: string) => {
  if (id === 'nonexistent') return Promise.resolve(null);
  const postObjectId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3');
  const postUrl = `https://test.domain/posts/${id}`;
  const actorObjectId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const actorApId = 'https://test.domain/users/testuser';

  const post: Post = {
    _id: postObjectId,
    id: postUrl,
    type: 'Note' as const,
    actorId: actorObjectId,
    content: 'This is a test post',
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
  };

  return Promise.resolve(post);
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

  // Create a properly typed diskStorage mock
  (multer as jest.Mock).diskStorage = jest.fn(() => ({
    _handleFile: jest.fn(),
    _removeFile: jest.fn(),
  }));

  // Create a properly typed memoryStorage mock
  (multer as jest.Mock).memoryStorage = jest.fn(() => ({
    _handleFile: jest.fn(),
    _removeFile: jest.fn(),
  }));

  return multer;
});
// --- END Multer Mock ---

// --- Helper Data & Mocks ---
const mockPost: Post = {
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
};

export let isPostLikedTestState = false;

// --- CONTROLLER MOCKS ---

// Type for attachment in response
interface AttachmentResponse {
  type: string;
  mediaType: string;
  url: string;
  name: string;
}

// Type for post response
interface PostResponse {
  _id: string | ObjectId;
  id: string;
  content: string;
  attachments: AttachmentResponse[];
  actor: {
    preferredUsername: string;
    displayName: string;
  };
}

mockPostsController.createPost.mockImplementation(
  (req: Request, res: Response): void => {
    // CRITICAL: User check MUST be first
    if (!req.user) {
      res
        .status(401)
        .json({ error: 'Unauthorized - No user found in controller mock' });
      return;
    }

    // Use unknown for body initially
    const body = req.body as Record<string, unknown>;

    // Check if this is a multipart/form-data request (used for attachments)
    const isMultipart =
      req.headers &&
      req.headers['content-type'] &&
      typeof req.headers['content-type'] === 'string' &&
      req.headers['content-type'].includes('multipart/form-data');

    if (isMultipart) {
      const attachments: AttachmentResponse[] = [
        {
          type: 'Image',
          mediaType: 'image/png', // Default to png for valid mock
          url: 'https://test.domain/media/mockfile.png',
          name: 'mock-image.png',
        },
      ];
      // Safely access content from body
      const content =
        typeof body.content === 'string'
          ? body.content
          : 'Post with attachment';

      const createdPost: PostResponse = {
        _id: new ObjectId(),
        id: `https://test.domain/posts/${new ObjectId().toHexString()}`,
        content: content, // Use validated content
        attachments: attachments,
        actor: {
          preferredUsername: req.user.preferredUsername,
          displayName: 'Test User', // Or derive from req.user if available
        },
      };

      res.status(201).json(createdPost);
      return;
    }

    // Handle regular JSON post (no attachments)
    // Safely access content, ensuring it's a string
    const content = typeof body.content === 'string' ? body.content : undefined;
    if (!content || content.trim() === '') {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    // Safely access optional boolean/string fields
    const sensitive =
      (typeof body.sensitive === 'string' &&
        body.sensitive.toLowerCase() === 'true') ||
      body.sensitive === true;
    const contentWarning =
      sensitive && typeof body.contentWarning === 'string'
        ? body.contentWarning
        : undefined;

    const createdPost = {
      ...mockPost,
      _id: new ObjectId(), // Generate new ID for creation
      id: `https://test.domain/posts/${new ObjectId().toHexString()}`, // Generate new AP ID
      url: `https://test.domain/posts/${new ObjectId().toHexString()}`, // Generate new URL
      content: content, // Use validated content
      sensitive: sensitive,
      contentWarning: contentWarning,
      attachments: [], // No attachments for JSON post
      actor: { ...mockActor, preferredUsername: req.user.preferredUsername }, // Associate with logged-in user
    };

    res.status(201).json(createdPost);
  }
);

mockPostsController.getPostById.mockImplementation(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const postId = req.params.id;

    try {
      // --- Basic ID validation ---
      if (postId === 'invalid-id-format') {
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }
      if (postId === knownNonExistentIdString) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      try {
        new ObjectId(postId); // Validate format if needed, though service call might handle it
      } catch (e) {
        // Potentially unnecessary if service handles invalid IDs
        // res.status(400).json({ error: 'Invalid ObjectId format' });
        // return;
      }

      // --- Call the mocked service ---
      // Access mock service safely via globalWithMocks
      const postData =
        await globalWithMocks.mockPostService.getPostById(postId);

      if (!postData) {
        // Handle case where service returns null (post not found)
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // --- SIMPLIFICATION: Determine likedByUser status ---
      const likedByUser = false; // Keep simplified logic for now
      // TODO: This needs proper handling, likely based on req.user._id

      // Create final response
      const responseData = {
        ...postData, // Use data returned from the service mock
        likedByUser: likedByUser,
      };

      res.status(200).json(responseData);
    } catch (error: unknown) {
      // Handle potential errors more robustly
      console.error('Error in getPostById mock:', error);
      // Pass the error to the next middleware (Express error handler)
      next(error);
    }
  }
);

mockPostsController.getFeed.mockImplementation(
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const username = user?.preferredUsername;
      const checkUsername = knownTestUsername;
      const likedByUserStatus = !!user && username === checkUsername;

      const generatedPosts = Array.from({ length: 15 }).map((_, i) => ({
        ...mockPost,
        _id: new ObjectId(),
        content: `Feed Post ${i + 1}`,
        createdAt: new Date(Date.now() - i * 5000),
        author: {
          preferredUsername: i % 4 === 0 ? 'otheruser' : knownTestUsername,
        },
        likedByUser: likedByUserStatus,
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
      res.status(500).json({ error: 'Internal server error in mock getFeed' });
    }
  }
);

mockPostsController.getPostsByUsername.mockImplementation(
  (req: Request, res: Response) => {
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
  (req: Request, res: Response) => {
    const postId = req.params.id;
    const { content } = req.body;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Check permission based on username comparison for mock scenario
    if (
      postId === knownTestPostIdString &&
      req.user.preferredUsername !== mockPost.actor?.preferredUsername
    ) {
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
  (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString) {
      return res.status(404).json({ error: 'Post not found' });
    }
    // Check permission based on username comparison for mock scenario
    if (
      postId === knownTestPostIdString &&
      req.user.preferredUsername !== mockPost.actor?.preferredUsername
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    isPostLikedTestState = false;
    res.status(204).send();
  }
);

mockPostsController.likePost.mockImplementation(
  (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString)
      return res.status(404).json({ error: 'Post not found' });

    if (isPostLikedTestState) {
      return res.status(409).json({ error: 'Post already liked' });
    }
    if (postId === 'invalid-id')
      return res.status(400).json({ error: 'Invalid Post ID for like' });

    isPostLikedTestState = true;
    res.status(200).json({ message: 'Post liked successfully' });
  }
);

mockPostsController.unlikePost.mockImplementation(
  (req: Request, res: Response) => {
    const postId = req.params.id;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (postId === knownNonExistentIdString)
      return res.status(404).json({ error: 'Post not found' });

    if (!isPostLikedTestState) {
      return res.status(409).json({ error: 'Post not liked' });
    }
    if (postId === 'invalid-id')
      return res.status(400).json({ error: 'Invalid Post ID for unlike' });

    isPostLikedTestState = false;
    res.status(200).json({ message: 'Post unliked successfully' });
  }
);

// Create and export the container using these mocks
export const mockServiceContainer: ServiceContainer = {
  authService: mockAuthService,
  actorService: mockActorService,
  postService: mockPostService,
  uploadService: mockUploadService as unknown as UploadService, // Cast to UploadService
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
  // Properly type the getService method
  getService: jest
    .fn()
    .mockImplementation(<T>(name: keyof ServiceContainer): T | null => {
      if (Object.prototype.hasOwnProperty.call(mockServiceContainer, name)) {
        // Type-safe approach to return service
        const service = mockServiceContainer[name] as unknown;
        // Return service as T
        return service as T;
      }
      return null;
    }),
};
/* eslint-enable @typescript-eslint/no-unsafe-return */

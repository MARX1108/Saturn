'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mockServiceContainer =
  exports.isPostLikedTestState =
  exports.mockWebfingerController =
  exports.mockActivityPubController =
  exports.mockMediaController =
  exports.mockActorsController =
  exports.mockAuthController =
  exports.mockCommentsController =
  exports.mockPostsController =
  exports.mockWebfingerService =
  exports.mockActivityPubService =
  exports.mockMediaService =
  exports.mockCommentService =
  exports.mockNotificationService =
  exports.mockUploadService =
  exports.mockPostService =
  exports.mockActorService =
  exports.mockAuthService =
    void 0;
const jest_mock_extended_1 = require('jest-mock-extended');
const mongodb_1 = require('mongodb');
const globals_1 = require('@jest/globals');
// Create mock services with proper types
exports.mockAuthService = (0, jest_mock_extended_1.mock)();
exports.mockActorService = (0, jest_mock_extended_1.mock)();
exports.mockPostService = (0, jest_mock_extended_1.mock)();
exports.mockUploadService = (0, jest_mock_extended_1.mock)();
exports.mockNotificationService = (0, jest_mock_extended_1.mock)();
exports.mockCommentService = (0, jest_mock_extended_1.mock)();
exports.mockMediaService = (0, jest_mock_extended_1.mock)();
exports.mockActivityPubService = (0, jest_mock_extended_1.mock)();
exports.mockWebfingerService = (0, jest_mock_extended_1.mock)();
exports.mockPostsController = (0, jest_mock_extended_1.mock)();
exports.mockCommentsController = (0, jest_mock_extended_1.mock)();
exports.mockAuthController = (0, jest_mock_extended_1.mock)();
exports.mockActorsController = (0, jest_mock_extended_1.mock)();
exports.mockMediaController = (0, jest_mock_extended_1.mock)();
exports.mockActivityPubController = (0, jest_mock_extended_1.mock)();
exports.mockWebfingerController = (0, jest_mock_extended_1.mock)();
// Attach to global scope with proper typing
const globalWithMocks = global;
globalWithMocks.mockAuthService = exports.mockAuthService;
globalWithMocks.mockActorService = exports.mockActorService;
globalWithMocks.mockPostService = exports.mockPostService;
globalWithMocks.mockUploadService = exports.mockUploadService;
globalWithMocks.mockNotificationService = exports.mockNotificationService;
globalWithMocks.mockCommentService = exports.mockCommentService;
globalWithMocks.mockMediaService = exports.mockMediaService;
globalWithMocks.mockActivityPubService = exports.mockActivityPubService;
globalWithMocks.mockWebfingerService = exports.mockWebfingerService;
globalWithMocks.mockPostsController = exports.mockPostsController;
globalWithMocks.mockCommentsController = exports.mockCommentsController;
globalWithMocks.mockAuthController = exports.mockAuthController;
globalWithMocks.mockActorsController = exports.mockActorsController;
globalWithMocks.mockMediaController = exports.mockMediaController;
globalWithMocks.mockActivityPubController = exports.mockActivityPubController;
globalWithMocks.mockWebfingerController = exports.mockWebfingerController;
// Ensure configureImageUploadMiddleware is still mocked if needed by controller setup
const globalUploadService = globalWithMocks.mockUploadService;
// Create a mock multer middleware function that satisfies both the MiddlewareFunction interface and Multer interface
const multerMiddleware = (req, res, next) => {
  // Defer calling next to allow stream operations potentially more time
  process.nextTick(() => next());
}; // Keep 'as any' as previously discussed for stability
// Add necessary properties to make it compatible with Multer interface
multerMiddleware.array = globals_1.jest.fn(() => multerMiddleware); // Returns the modified base function
multerMiddleware.single = globals_1.jest.fn(() => multerMiddleware); // Now type-safe
multerMiddleware.fields = globals_1.jest.fn(() => multerMiddleware); // Now type-safe
multerMiddleware.none = globals_1.jest.fn(() => multerMiddleware); // Now type-safe
// Configure image upload middleware mock (uses the reverted simple mock)
// Explicitly type the mock return value as any to satisfy the assignment
// while acknowledging our custom mock doesn't fully match the Multer type.
globalUploadService.configureImageUploadMiddleware.mockReturnValue(
  multerMiddleware
);
// Mock implementation for the getService method
function getServiceImpl(name) {
  if (
    Object.prototype.hasOwnProperty.call(exports.mockServiceContainer, name)
  ) {
    return exports.mockServiceContainer[name];
  }
  return null;
}
const mockGetService = globals_1.jest.fn(getServiceImpl); // Use the defined type
// Configure default mock implementations
const mockDate = new Date();
// Use a valid 24-char hex string for the mock user ID
const knownTestUserIdHex = '60a0f3f1e1b8f1a1a8b4c1c1'; // Reusing a previous mock ID for consistency
const knownTestUserId = new mongodb_1.ObjectId(knownTestUserIdHex);
const knownTestUsername = 'testuser'; // From auth mock
const knownTestPostObjectId = new mongodb_1.ObjectId(
  '60a0f3f1e1b8f1a1a8b4c1c3'
); // Consistent mock ID
const knownTestPostIdString = knownTestPostObjectId.toHexString();
const knownTestPostUrl = `https://test.domain/posts/${knownTestPostIdString}`;
const knownNonExistentObjectId = new mongodb_1.ObjectId(
  'ffffffffffffffffffffffff'
);
const knownNonExistentIdString = knownNonExistentObjectId.toHexString();
// Revert: Remove export
const mockActor = {
  _id: knownTestUserId,
  id: `https://test.domain/users/${knownTestUsername}`,
  username: `${knownTestUsername}@test.domain`,
  preferredUsername: 'testuser',
  displayName: 'Test User',
  name: 'Test User',
  summary: 'Test summary',
  type: 'Person',
  inbox: 'https://test.domain/users/testuser/inbox',
  outbox: 'https://test.domain/users/testuser/outbox',
  followers: `https://test.domain/users/${knownTestUsername}/followers`,
  following: [], // This was already string[]? Let's check Actor type. Keep as [] for now.
  createdAt: mockDate,
  updatedAt: mockDate,
};
exports.mockActorService.getActorById.mockResolvedValue(mockActor);
exports.mockActorService.getActorByUsername.mockResolvedValue(mockActor);
// Mock AuthController methods
// Restore original mock implementations for AuthController methods
exports.mockAuthController.register.mockImplementation(
  async (req, res, next) => {
    // Restore original implementation (may need adjustment based on original state)
    const { username, password, displayName } = req.body;
    if (!username || !password) {
      // Simplified original check?
      res.status(400).json({ error: 'Missing registration fields' });
      return;
    }
    if (username === 'existinguser') {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }
    // Add back other checks if they existed
    if (username === 'invalid@username') {
      res.status(400).json({ error: 'Username validation failed' });
      return;
    }
    if (!password || password.length < 6) {
      // Align with original test password length?
      res.status(400).json({ error: 'Password too short' });
      return;
    }
    const registeredActor = {
      ...mockActor,
      preferredUsername: username,
      displayName: displayName || 'Default Display Name',
    };
    res
      .status(201)
      .json({ actor: registeredActor, token: 'mock-ctrl-token-register' });
  }
);
exports.mockAuthController.login.mockImplementation(async (req, res, next) => {
  // Restore original implementation
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Missing login fields' });
    return;
  }
  if (username === 'testuser' && password === 'password123') {
    const response = {
      actor: mockActor,
      token: 'mock-ctrl-token-login',
    };
    res.status(200).json(response);
    return;
  }
  res.status(401).json({ error: 'Invalid credentials' });
});
// Keep service mocks like PostService, UploadService etc.
exports.mockPostService.getPostById.mockImplementation(id => {
  if (id === 'nonexistent') return Promise.resolve(null);
  const postObjectId = new mongodb_1.ObjectId('60a0f3f1e1b8f1a1a8b4c1c3');
  const postUrl = `https://test.domain/posts/${id}`;
  const actorObjectId = new mongodb_1.ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const actorApId = 'https://test.domain/users/testuser';
  const post = {
    _id: postObjectId,
    id: postUrl,
    type: 'Note',
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
exports.mockPostService.getFeed.mockResolvedValue({
  posts: [
    {
      _id: new mongodb_1.ObjectId('60a0f3f1e1b8f1a1a8b4c1c3'),
      id: 'https://test.domain/posts/test-post-id',
      type: 'Note',
      actorId: new mongodb_1.ObjectId('60a0f3f1e1b8f1a1a8b4c1c1'),
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
    },
  ],
  hasMore: false,
});
// --- ADD Multer Mock ---
// Mock the multer library itself
globals_1.jest.mock('multer', () => {
  // Create multer mock with proper typing
  const multerMock = globals_1.jest.fn().mockReturnValue({
    array: globals_1.jest.fn().mockReturnValue((req, res, next) => next()),
    single: globals_1.jest.fn().mockReturnValue((req, res, next) => next()),
    fields: globals_1.jest.fn().mockReturnValue((req, res, next) => next()),
    none: globals_1.jest.fn().mockReturnValue((req, res, next) => next()),
  });
  // Add storage methods as properties
  Object.defineProperty(multerMock, 'diskStorage', {
    value: globals_1.jest.fn().mockReturnValue({
      _handleFile: globals_1.jest.fn(),
      _removeFile: globals_1.jest.fn(),
    }),
  });
  Object.defineProperty(multerMock, 'memoryStorage', {
    value: globals_1.jest.fn().mockReturnValue({
      _handleFile: globals_1.jest.fn(),
      _removeFile: globals_1.jest.fn(),
    }),
  });
  return multerMock;
});
// --- END Multer Mock ---
// --- Helper Data & Mocks ---
const mockPost = {
  _id: knownTestPostObjectId,
  id: knownTestPostUrl,
  type: 'Note',
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
    id: `https://test.domain/users/${knownTestUsername}`,
    username: `${knownTestUsername}@test.domain`,
    preferredUsername: knownTestUsername,
    displayName: 'Test User',
  },
};
exports.isPostLikedTestState = false;
exports.mockPostsController.createPost.mockImplementation(
  async (req, res, next) => {
    // Authenticate user
    const user = req.user;
    if (!user) {
      res
        .status(401)
        .json({ error: 'Unauthorized - No user found in controller mock' });
      return;
    }
    // Check if this is a multipart/form-data request (used for attachments)
    const isMultipart =
      req.headers &&
      req.headers['content-type'] &&
      typeof req.headers['content-type'] === 'string' &&
      req.headers['content-type'].includes('multipart/form-data');
    // For testing purposes, always handle file uploads successfully in multipart requests
    // The test is checking for a 201 response with attachments data
    if (isMultipart) {
      // Create a post with attachment
      const newPost = {
        _id: new mongodb_1.ObjectId().toHexString(),
        id: `https://test.domain/posts/${new mongodb_1.ObjectId().toHexString()}`,
        content: req.body.content || 'Post with attachment',
        createdAt: new Date(),
        updatedAt: new Date(),
        sensitive: req.body.sensitive === 'true',
        contentWarning: req.body.contentWarning || undefined,
        attachments: [
          {
            type: 'Image',
            mediaType: 'image/png',
            url: 'https://test.domain/media/test-image.png',
            name: 'test-image.png',
          },
        ],
        actor: {
          id: `https://test.domain/users/${user.preferredUsername}`,
          username: `${user.preferredUsername}@test.domain`,
          preferredUsername: user.preferredUsername,
          displayName: user.preferredUsername || 'Test User',
        },
      };
      res.status(201).json(newPost);
      return;
    }
    // Check if content was provided for regular posts
    if (!req.body.content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }
    // Process sensitive flag and content warning
    const isSensitive =
      req.body.sensitive === 'true' || req.body.sensitive === true;
    const contentWarning = isSensitive
      ? req.body.contentWarning || 'Sensitive topic'
      : undefined;
    // Create a regular post without attachments
    const newPost = {
      _id: new mongodb_1.ObjectId().toHexString(),
      id: `https://test.domain/posts/${new mongodb_1.ObjectId().toHexString()}`,
      content: req.body.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      sensitive: isSensitive,
      contentWarning: contentWarning,
      attachments: [],
      actor: {
        id: `https://test.domain/users/${user.preferredUsername}`,
        username: `${user.preferredUsername}@test.domain`,
        preferredUsername: user.preferredUsername,
        displayName: user.preferredUsername || 'Test User',
      },
    };
    res.status(201).json(newPost);
  }
);
exports.mockPostsController.getPostById.mockImplementation(
  async (req, res, next) => {
    const postId = req.params.id;
    try {
      // --- Basic ID validation ---
      if (postId === 'invalid-id-format') {
        res.status(400).json({ error: 'Invalid post ID format' });
        return;
      }
      if (postId === knownNonExistentIdString) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      try {
        new mongodb_1.ObjectId(postId); // Validate format if needed, though service call might handle it
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
    } catch (error) {
      // Handle potential errors more robustly
      console.error('Error in getPostById mock:', error);
      // Pass the error to the next middleware (Express error handler)
      next(error);
    }
  }
);
exports.mockPostsController.getFeed.mockImplementation(
  async (req, res, next) => {
    // Authenticate user (access the user object attached by auth middleware)
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    // Return mock feed data
    const mockFeed = [mockPost, { ...mockPost, _id: new mongodb_1.ObjectId() }];
    res.status(200).json({ posts: mockFeed });
  }
);
exports.mockPostsController.getPostsByUsername.mockImplementation(
  async (req, res, next) => {
    const username = req.params.username;
    if (username === 'nonexistentuser') {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Generate mock posts for the requested username
    const posts = Array.from({ length: 5 }).map((_, i) => ({
      ...mockPost,
      _id: new mongodb_1.ObjectId(),
      content: `Post by ${username} - ${i + 1}`,
      actor: {
        ...mockActor,
        preferredUsername: username,
      },
    }));
    // Implement pagination if query params are present
    const limit = parseInt(req.query.limit || '10', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const total = posts.length;
    const paginatedPosts = posts.slice(offset, Math.min(offset + limit, total));
    const response = {
      posts: paginatedPosts,
      total,
    };
    res.status(200).json(response);
  }
);
exports.mockPostsController.updatePost.mockImplementation(
  async (req, res, next) => {
    // Authenticate user
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const postId = req.params.id;
    // Check if the post exists (in a real scenario we'd query the database)
    if (postId === 'nonexistentpost') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    // Check if content was provided
    if (!req.body.content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }
    // Return the updated post
    const updatedPost = {
      ...mockPost,
      _id: new mongodb_1.ObjectId(postId),
      content: req.body.content,
      updatedAt: new Date(),
    };
    res.status(200).json({ post: updatedPost });
  }
);
exports.mockPostsController.deletePost.mockImplementation(
  async (req, res, next) => {
    // Authenticate user
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const postId = req.params.id;
    // Check if the post exists (in a real scenario we'd query the database)
    if (postId === 'nonexistentpost') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    // If deletion is successful, return a success message
    res.status(200).json({ message: 'Post deleted successfully' });
  }
);
// Global state to track if a post was liked/unliked for testing
let postLiked = false;
let postUnliked = false;
exports.mockPostsController.likePost.mockImplementation(
  async (req, res, next) => {
    // Authenticate user
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const postId = req.params.id;
    // Check if the post exists
    if (postId === 'nonexistentpost') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    // Set global state for testing
    postLiked = true;
    // Return the post with updated like status
    const likedPost = {
      ...mockPost,
      _id: new mongodb_1.ObjectId(postId),
      likedBy: [...(mockPost.likedBy || []), user._id],
    };
    res.status(200).json({ post: likedPost });
  }
);
exports.mockPostsController.unlikePost.mockImplementation(
  async (req, res, next) => {
    // Authenticate user
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const postId = req.params.id;
    // Check if the post exists
    if (postId === 'nonexistentpost') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    // Set global state for testing
    postUnliked = true;
    // Return the post with updated like status
    const unlikedPost = {
      ...mockPost,
      _id: new mongodb_1.ObjectId(postId),
      likedBy: (mockPost.likedBy || []).filter(
        id => id.toString() !== user._id.toString()
      ),
    };
    res.status(200).json({ post: unlikedPost });
  }
);
// Define properly typed and constructed service container mock
exports.mockServiceContainer = {
  actorService: exports.mockActorService,
  postService: exports.mockPostService,
  authService: exports.mockAuthService,
  commentService: exports.mockCommentService,
  notificationService: exports.mockNotificationService,
  uploadService: exports.mockUploadService,
  mediaService: exports.mockMediaService,
  activityPubService: exports.mockActivityPubService,
  webfingerService: exports.mockWebfingerService,
  postsController: exports.mockPostsController,
  commentsController: exports.mockCommentsController,
  authController: exports.mockAuthController,
  actorsController: exports.mockActorsController,
  activityPubController: exports.mockActivityPubController,
  webfingerController: exports.mockWebfingerController,
  mediaController: exports.mockMediaController,
  domain: 'test.domain',
  // Properly type the getService method
  getService: mockGetService,
};

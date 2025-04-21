import { mock } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/authService';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/uploads/services/uploadService';
import { NotificationService } from '@/modules/notifications/services/notificationService';
import { CommentService } from '@/modules/comments/services/commentService';
import { Request, Response, NextFunction } from 'express';
import { DbUser } from '@/models/user';
import { ServiceContainer } from '@/types';

// Create mock services
const mockAuthService = mock<AuthService>();
const mockActorService = mock<ActorService>();
const mockPostService = mock<PostService>();
const mockUploadService = mock<UploadService>();
const mockNotificationService = mock<NotificationService>();
const mockCommentService = mock<CommentService>();

// Attach to global scope
global.mockAuthService = mockAuthService;
global.mockActorService = mockActorService;
global.mockPostService = mockPostService;
global.mockUploadService = mockUploadService;
global.mockNotificationService = mockNotificationService;
global.mockCommentService = mockCommentService;

// Mock methods called during setup
const mockMulterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => next();
mockUploadService.configureImageUploadMiddleware.mockReturnValue(
  mockMulterMiddleware
);

// Configure default mock implementations
const mockDate = new Date();
const mockActor = {
  id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: mockDate,
  updatedAt: mockDate,
};

mockActorService.findById.mockResolvedValue(mockActor);
mockActorService.findByUsername.mockResolvedValue(mockActor);
mockActorService.getActorById.mockResolvedValue(mockActor);
mockActorService.getActorByUsername.mockResolvedValue(mockActor);

mockPostService.getPostById.mockImplementation(async id => {
  if (id === 'nonexistent') return null;
  return {
    id,
    content: 'Test post content',
    authorId: 'test-user-id',
    createdAt: mockDate,
    updatedAt: mockDate,
    likes: [],
    shares: 0,
    sensitive: false,
    contentWarning: null,
    attachments: [],
    actor: mockActor,
  };
});

mockPostService.getFeed.mockResolvedValue({
  posts: [
    {
      id: 'test-post-id',
      content: 'Test post content',
      authorId: 'test-user-id',
      createdAt: mockDate,
      updatedAt: mockDate,
      likes: [],
      shares: 0,
      sensitive: false,
      contentWarning: null,
      attachments: [],
      actor: mockActor,
    },
  ],
  hasMore: false,
});

// Export mock auth middleware
export const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set up a complete mock user object
  const mockUser = {
    _id: 'test-user-id',
    id: 'test-user-id',
    preferredUsername: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: mockDate,
    updatedAt: mockDate,
    isAdmin: false,
    isVerified: true,
    profile: {
      displayName: 'Test User',
      bio: 'Test bio',
      avatar: null,
      banner: null,
    },
  } as DbUser;

  // Set the user on the request
  req.user = mockUser;

  // Log for debugging
  console.log('!!! DEBUG: mockAuthMiddleware setting user:', mockUser);

  next();
};

// Create and export the container using these mocks
export const mockServiceContainer: ServiceContainer = {
  authService: mockAuthService,
  actorService: mockActorService,
  postService: mockPostService,
  uploadService: mockUploadService,
  notificationService: mockNotificationService,
  commentService: mockCommentService,
};

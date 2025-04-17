import { mock } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/authService';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/uploads/services/uploadService';
import { NotificationService } from '@/modules/notifications/services/notificationService';
import { CommentService } from '@/modules/comments/services/commentService';
import { Request, Response, NextFunction } from 'express';
import { DbUser } from '@/models/user';

// Create and export mock services with all required methods
export const mockAuthService = mock<AuthService>({
  createUser: jest.fn(),
  login: jest.fn(),
  validateToken: jest.fn(),
  getCurrentUser: jest.fn(),
});

export const mockActorService = mock<ActorService>({
  findById: jest.fn(),
  findByUsername: jest.fn(),
  createActor: jest.fn(),
  getActorById: jest.fn(),
  getActorByUsername: jest.fn(),
});

export const mockPostService = mock<PostService>({
  getPostById: jest.fn(),
  getFeed: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  getPostsByUsername: jest.fn(),
});

export const mockUploadService = mock<UploadService>({
  configureImageUploadMiddleware: jest.fn(),
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
});

export const mockNotificationService = mock<NotificationService>({
  createNotification: jest.fn(),
  getNotifications: jest.fn(),
  markAsRead: jest.fn(),
});

export const mockCommentService = mock<CommentService>({
  createComment: jest.fn(),
  getComments: jest.fn(),
  deleteComment: jest.fn(),
  updateComment: jest.fn(),
});

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
    // Add any additional required fields
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

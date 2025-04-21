import { mock } from 'jest-mock-extended';
import { AuthService } from '@/modules/auth/services/authService';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { UploadService } from '@/modules/uploads/services/uploadService';
import { NotificationService } from '@/modules/notifications/services/notificationService';
import { CommentService } from '@/modules/comments/services/commentService';
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
// const mockMulterMiddleware = (req: Request, res: Response, next: NextFunction) => next();
// mockUploadService.configureImageUploadMiddleware.mockReturnValue(mockMulterMiddleware);

// Ensure configureImageUploadMiddleware is still mocked if needed by controller setup
if (
  global.mockUploadService &&
  global.mockUploadService.configureImageUploadMiddleware
) {
  global.mockUploadService.configureImageUploadMiddleware.mockReturnValue(
    (req: any, res: any, next: any) => next()
  );
}

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

// Create and export the container using these mocks
export const mockServiceContainer: ServiceContainer = {
  authService: global.mockAuthService,
  actorService: global.mockActorService,
  postService: global.mockPostService,
  uploadService: global.mockUploadService,
  notificationService: global.mockNotificationService,
  commentService: global.mockCommentService,
};

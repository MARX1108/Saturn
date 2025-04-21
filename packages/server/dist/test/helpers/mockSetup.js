'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.mockServiceContainer = void 0;
const jest_mock_extended_1 = require('jest-mock-extended');
// Create mock services
const mockAuthService = (0, jest_mock_extended_1.mock)();
const mockActorService = (0, jest_mock_extended_1.mock)();
const mockPostService = (0, jest_mock_extended_1.mock)();
const mockUploadService = (0, jest_mock_extended_1.mock)();
const mockNotificationService = (0, jest_mock_extended_1.mock)();
const mockCommentService = (0, jest_mock_extended_1.mock)();
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
    (req, res, next) => next()
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
exports.mockServiceContainer = {
  authService: global.mockAuthService,
  actorService: global.mockActorService,
  postService: global.mockPostService,
  uploadService: global.mockUploadService,
  notificationService: global.mockNotificationService,
  commentService: global.mockCommentService,
};

'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require('express'));
const routes_1 = require('@/routes');
const authController_1 = require('@/modules/auth/controllers/authController');
const actorsController_1 = require('@/modules/actors/controllers/actorsController');
const postsController_1 = require('@/modules/posts/controllers/postsController');
const comments_controller_1 = require('@/modules/comments/controllers/comments.controller');
const mockSetup_1 = require('./mockSetup');
async function createTestApp(db, domain) {
  const app = (0, express_1.default)();
  // Add JSON body parser
  app.use(express_1.default.json());
  // Create real controllers with mock services
  const postsController = new postsController_1.PostsController(
    mockSetup_1.mockServiceContainer.postService,
    mockSetup_1.mockServiceContainer.actorService,
    mockSetup_1.mockServiceContainer.uploadService,
    domain
  );
  const commentsController = new comments_controller_1.CommentsController(
    mockSetup_1.mockServiceContainer.commentService
  );
  const authController = new authController_1.AuthController(
    mockSetup_1.mockServiceContainer.authService,
    mockSetup_1.mockServiceContainer.actorService
  );
  const actorsController = new actorsController_1.ActorsController(
    mockSetup_1.mockServiceContainer.actorService,
    mockSetup_1.mockServiceContainer.uploadService,
    mockSetup_1.mockServiceContainer.postService,
    domain
  );
  // Create service container with mock services and real controllers
  const serviceContainer = {
    // Services
    authService: mockSetup_1.mockServiceContainer.authService,
    actorService: mockSetup_1.mockServiceContainer.actorService,
    postService: mockSetup_1.mockServiceContainer.postService,
    commentService: mockSetup_1.mockServiceContainer.commentService,
    mediaService: mockSetup_1.mockServiceContainer.uploadService,
    notificationService: mockSetup_1.mockServiceContainer.notificationService,
    uploadService: mockSetup_1.mockServiceContainer.uploadService,
    // Controllers
    postsController,
    commentsController,
    authController,
    actorsController,
  };
  // Apply middleware in correct order
  app.use(require('cors')());
  // The real authenticate middleware used within configureRoutes will now be intercepted by the jest.mock in setup.ts
  app.use('/api', (0, routes_1.configureRoutes)(serviceContainer));
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
  });
  return app;
}

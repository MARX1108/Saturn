'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require('express'));
const mockSetup_1 = require('./mockSetup');
const cors_1 = __importDefault(require('cors'));
// Setup environment variables before other imports
require('./setupEnvironment');
const routes_1 = require('@/routes');
const authController_1 = require('@/modules/auth/controllers/authController');
const actorsController_1 = require('@/modules/actors/controllers/actorsController');
const postsController_1 = require('@/modules/posts/controllers/postsController');
const comments_controller_1 = require('@/modules/comments/controllers/comments.controller');
const errors_1 = require('@/utils/errors');
function createTestApp(db, domain) {
  const app = (0, express_1.default)();
  // Add JSON body parser
  app.use(express_1.default.json());
  app.use((0, cors_1.default)());
  // Instantiate controllers (assuming this is correct now)
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
    mockSetup_1.mockServiceContainer.actorService,
    mockSetup_1.mockServiceContainer.authService
  );
  const actorsController = new actorsController_1.ActorsController(
    mockSetup_1.mockServiceContainer.actorService,
    mockSetup_1.mockServiceContainer.uploadService,
    mockSetup_1.mockServiceContainer.postService,
    domain
  );
  // Configure routes
  app.use(
    '/api',
    (0, routes_1.configureRoutes)(mockSetup_1.mockServiceContainer)
  );
  // Centralized error handling middleware
  app.use((err, _req, res, _next) => {
    console.error('Test app error handler caught:', err);
    if (err instanceof errors_1.AppError) {
      return res
        .status(err.statusCode)
        .json({ error: err.message || 'An error occurred' });
    }
    // Handle ZodError
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      err.name === 'ZodError'
    ) {
      return res.status(400).json({ error: 'Validation failed' });
    }
    // Type guard for objects with statusCode property
    const errorObj = err;
    if (
      errorObj &&
      typeof errorObj === 'object' &&
      'statusCode' in errorObj &&
      typeof errorObj.statusCode === 'number'
    ) {
      return res
        .status(errorObj.statusCode)
        .json({ error: errorObj.message || 'An error occurred' });
    }
    // Default to 500 error
    return res.status(500).json({ error: 'Internal Server Error' });
  });
  return app;
}

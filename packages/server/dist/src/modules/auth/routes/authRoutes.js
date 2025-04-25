'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureAuthRoutes;
const express_1 = __importDefault(require('express'));
const auth_1 = require('../../../middleware/auth');
const routeHandler_1 = require('../../../utils/routeHandler');
/**
 * Configure authentication routes with the controller
 */
function configureAuthRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const authController = serviceContainer.getService('authController');
  if (!authController) {
    throw new Error(
      'AuthController not found in service container during route setup'
    );
  }
  // Bind methods from the MOCKED controller
  const boundRegister = authController.register.bind(authController);
  const boundLogin = authController.login.bind(authController);
  // Wrap the getCurrentUser method to make it async
  const wrappedGetCurrentUser = async (req, res, next) => {
    authController.getCurrentUser(req, res, next);
    return Promise.resolve();
  };
  // Register new user
  router.post('/register', (0, routeHandler_1.wrapAsync)(boundRegister));
  // Login user
  router.post('/login', (0, routeHandler_1.wrapAsync)(boundLogin));
  // Get current user (protected route)
  router.get(
    '/me',
    auth_1.auth,
    (0, routeHandler_1.wrapAsync)(wrappedGetCurrentUser)
  );
  return router;
}

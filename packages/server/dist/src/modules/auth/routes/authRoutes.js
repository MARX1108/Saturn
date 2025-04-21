'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureAuthRoutes;
const express_1 = __importDefault(require('express'));
const authController_1 = require('../controllers/authController');
const auth_1 = require('../../../middleware/auth');
/**
 * Configure authentication routes with the controller
 */
function configureAuthRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { authService, actorService } = serviceContainer;
  // Create controller with injected dependencies
  const authController = new authController_1.AuthController(
    actorService,
    authService
  );
  // Register new user
  router.post('/register', (req, res, next) => {
    authController.register(req, res).catch(next);
  });
  // Login user
  router.post('/login', (req, res, next) => {
    authController.login(req, res).catch(next);
  });
  // Get current user (protected route)
  router.get('/me', auth_1.auth, (req, res, next) => {
    authController.getCurrentUser(req, res).catch(next);
  });
  return router;
}

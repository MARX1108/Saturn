import express, { Request, Response, Router, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';

// Async Handler Wrapper
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Configure authentication routes with the controller
 */
export default function configureAuthRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const authController =
    serviceContainer.getService<AuthController>('authController');
  if (!authController) {
    throw new Error(
      'AuthController not found in service container during route setup'
    );
  }

  // Bind methods from the MOCKED controller
  const boundRegister = authController.register.bind(authController);
  const boundLogin = authController.login.bind(authController);
  const boundGetCurrentUser =
    authController.getCurrentUser.bind(authController);

  // Register new user
  router.post('/register', asyncHandler(boundRegister));

  // Login user
  router.post('/login', asyncHandler(boundLogin));

  // Get current user (protected route)
  router.get('/me', auth, asyncHandler(boundGetCurrentUser));

  return router;
}

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
  console.log('[[configureAuthRoutes]] Function executing...');
  const router = express.Router();
  // const { authService, actorService } = serviceContainer; // Don't need these directly

  // Get the MOCKED controller instance from the container
  const controller = serviceContainer.authController; // <<< CHANGE HERE
  if (!controller) {
    throw new Error(
      'AuthController not found in service container during route setup'
    );
  }

  // Bind methods from the MOCKED controller
  const boundRegister = controller.register.bind(controller); // Use the controller from container
  const boundLogin = controller.login.bind(controller); // Use the controller from container
  const boundGetCurrentUser = controller.getCurrentUser.bind(controller); // Use the controller from container

  // Register new user
  router.post('/register', asyncHandler(boundRegister));

  // Login user
  router.post('/login', asyncHandler(boundLogin));

  // Get current user (protected route)
  router.get('/me', auth, asyncHandler(boundGetCurrentUser));

  return router;
}

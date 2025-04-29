import express, { Router, NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';
import { validateRequestBody } from '../../../middleware/validateRequest';
import { registerBodySchema, loginBodySchema } from '../schemas/auth.schema';
import { authRateLimiter } from '../../../middleware/rateLimiter';
import { AuthService } from '../services/auth.service';

/**
 * Configure authentication routes with the controller
 */
export default function configureAuthRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const authController =
    serviceContainer.getService<AuthController>('authController');
  const authService = serviceContainer.getService<AuthService>('authService');

  if (!authController) {
    throw new Error(
      'AuthController not found in service container during route setup'
    );
  }

  if (!authService) {
    throw new Error(
      'AuthService not found in service container during route setup'
    );
  }

  // Bind methods from the MOCKED controller
  const boundRegister = authController.register.bind(authController);
  const boundLogin = authController.login.bind(authController);

  // Wrap the getCurrentUser method to make it async
  const wrappedGetCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    authController.getCurrentUser(req, res, next);
    return Promise.resolve();
  };

  // Register new user
  router.post(
    '/register',
    authRateLimiter,
    validateRequestBody(registerBodySchema),
    wrapAsync(boundRegister)
  );

  // Login user
  router.post(
    '/login',
    authRateLimiter,
    validateRequestBody(loginBodySchema),
    wrapAsync(boundLogin)
  );

  // Get current user (protected route)
  router.get(
    '/me',
    authenticate(authService),
    wrapAsync(wrappedGetCurrentUser)
  );

  return router;
}

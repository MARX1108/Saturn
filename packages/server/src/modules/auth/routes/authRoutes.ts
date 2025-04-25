import express, { Router, NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';
import { processRequestBody } from 'zod-express-middleware';
import { loginSchema } from '../schemas/auth.schema';
import { z } from 'zod';

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

  // Wrap the getCurrentUser method to make it async
  const wrappedGetCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    authController.getCurrentUser(req, res, next);
    return Promise.resolve();
  };

  // Register new user
  router.post(
    '/register',
    processRequestBody(
      z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
      })
    ),
    wrapAsync(boundRegister)
  );

  // Login user
  router.post(
    '/login',
    processRequestBody(loginSchema.shape.body),
    wrapAsync(boundLogin)
  );

  // Get current user (protected route)
  router.get('/me', auth, wrapAsync(wrappedGetCurrentUser));

  return router;
}

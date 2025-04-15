import express, { Request, Response, Router, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';

/**
 * Configure authentication routes with the controller
 */
export default function configureAuthRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { authService, actorService } = serviceContainer;

  // Create controller with injected dependencies
  const authController = new AuthController(actorService, authService);

  // Register new user
  router.post(
    '/register',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await authController.register(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Login user
  router.post(
    '/login',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await authController.login(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Get current user (protected route)
  router.get(
    '/me',
    auth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await authController.getCurrentUser(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}

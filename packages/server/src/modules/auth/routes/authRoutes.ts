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
    (req: Request, res: Response, next: NextFunction) => {
      authController.register(req, res).catch(next);
    }
  );

  // Login user
  router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    authController.login(req, res).catch(next);
  });

  // Get current user (protected route)
  router.get('/me', auth, (req: Request, res: Response, next: NextFunction) => {
    authController.getCurrentUser(req, res).catch(next);
  });

  return router;
}

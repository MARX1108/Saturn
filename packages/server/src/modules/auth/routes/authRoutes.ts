import express, { Request, Response, Router } from "express";
import { Db } from "mongodb";
import { AuthController } from "../controllers/authController";
import { auth } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure authentication routes with the controller
 */
export function configureAuthRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const authController = new AuthController();
  const authService = serviceContainer.getService('authService');

  // Register new user
  router.post("/register", (req: Request, res: Response) => {
    return authController.register(req, res);
  });

  // Login user
  router.post("/login", (req: Request, res: Response) => {
    return authController.login(req, res);
  });

  // Get current user (protected route)
  router.get("/me", auth, (req: Request, res: Response) => {
    return authController.getCurrentUser(req, res);
  });

  return router;
}

// Keep the old signature for backwards compatibility during transition
export function configureAuthRoutesLegacy(db: Db, domain: string): Router {
  // Create a service container from legacy params
  const serviceContainer = {
    getService: (name: string) => {
      if (name === 'authService') {
        // Return a minimal implementation to keep things working
        return {};
      }
      return null;
    }
  } as ServiceContainer;
  
  return configureAuthRoutes(serviceContainer);
}
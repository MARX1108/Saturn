import express, { Request, Response, Router, NextFunction, RequestHandler } from "express";
import { AuthController } from "../controllers/authController";
import { auth } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure authentication routes with the controller
 */
export function configureAuthRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { authService, actorService } = serviceContainer;

  // Create controller with injected dependencies
  const authController = new AuthController(actorService, authService);

  // Register new user - define as RequestHandler and use type assertion
  const registerHandler: RequestHandler = (req, res, next) => {
    authController.register(req as any, res).catch(next);
  };
  router.post("/register", registerHandler);

  // Login user - define as RequestHandler and use type assertion
  const loginHandler: RequestHandler = (req, res, next) => {
    authController.login(req as any, res).catch(next);
  };
  router.post("/login", loginHandler);

  // Get current user (protected route) - define as RequestHandler and use type assertion
  const getCurrentUserHandler: RequestHandler = (req, res, next) => {
    authController.getCurrentUser(req as any, res).catch(next);
  };
  router.get("/me", auth as any, getCurrentUserHandler);

  return router;
}

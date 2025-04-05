import express, { Request, Response } from "express";
import { Db } from "mongodb";
import { AuthController } from "../controllers/authController";
import { auth } from "../../../middleware/auth";

/**
 * Configure authentication routes with the controller
 */
export function configureAuthRoutes(db: Db, domain: string) {
  const router = express.Router();
  const authController = new AuthController();

  // Middleware to inject db and domain into app for controller access
  router.use((req, res, next) => {
    req.app.set("db", db);
    req.app.set("domain", domain);
    next();
  });

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
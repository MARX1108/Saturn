import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import { ActorService } from "../../actors/services/actorService";
import { AuthService } from "../services/auth.service";
import { generateToken } from "../../../middleware/auth";

/**
 * Controller for handling authentication operations
 */
export class AuthController {
  private actorService: ActorService;
  private authService: AuthService;

  constructor(actorService: ActorService, authService: AuthService) {
    this.actorService = actorService;
    this.authService = authService;
  }

  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, displayName, bio } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }

      // Validate username (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          error: "Username can only contain letters, numbers, and underscores",
        });
      }

      // Check if username already exists
      const exists = await this.actorService.usernameExists(username);
      if (exists) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Create actor
      const actor = await this.actorService.createActor({
        username,
        displayName,
        bio,
        password,
      });

      // Remove password from response
      const { password: _, ...actorWithoutPassword } = actor;

      // Generate JWT
      const token = generateToken(actorWithoutPassword);

      return res.status(201).json({
        actor: actorWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Failed to register user" });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }

      // Use auth service to authenticate the user
      const user = await this.authService.authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT
      const token = generateToken(user);

      return res.json({
        actor: user,
        token,
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({ error: "Failed to login user" });
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      // This route is protected by auth middleware
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Return user data
      return res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      return res.status(500).json({ error: "Failed to fetch current user" });
    }
  }
}
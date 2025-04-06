import { Request, Response } from "express";
import bcryptjs from "bcryptjs"; // Replace bcrypt with bcryptjs
import { generateToken } from "../../../middleware/auth";

/**
 * Controller for handling authentication operations
 */
export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
      const db = req.app.get("db");
      const domain = req.app.get("domain");
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
      const exists = await actorService.usernameExists(username);
      if (exists) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Hash password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      // Create actor data
      const actorData = {
        type: "Person",
        preferredUsername: username,
        name: displayName || username,
        summary: bio || "",
        id: `https://${domain}/users/${username}`,
        inbox: `https://${domain}/users/${username}/inbox`,
        outbox: `https://${domain}/users/${username}/outbox`,
        followers: `https://${domain}/users/${username}/followers`,
        following: `https://${domain}/users/${username}/following`,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert into database
      await db.collection("actors").insertOne(actorData);

      // Remove password from response
      const { password: _, ...actorWithoutPassword } = actorData;

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
      const db = req.app.get("db");
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }

      // Find user in database
      const user = await db
        .collection("actors")
        .findOne({ preferredUsername: username });

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isMatch = await bcryptjs.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      // Generate JWT
      const token = generateToken(userWithoutPassword);

      return res.json({
        actor: userWithoutPassword,
        token,
      });
    } catch (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({ error: "Failed to login user" });
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      // This route is protected by auth middleware
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      return res.status(500).json({ error: "Failed to fetch current user" });
    }
  }
}
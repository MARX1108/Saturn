import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { ActorService } from "../services/actorService";
import { CreateActorRequest } from "../models/actor";

export class ActorsController {
  /**
   * Search actors by query
   */
  async searchActors(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);
      
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(200).json([]);
      }

      const actors = await actorService.searchActors(q);
      
      return res.status(200).json(actors);
    } catch (error) {
      console.error("Error searching actors:", error);
      return res.status(500).json({ error: "Failed to search actors" });
    }
  }

  /**
   * Create a new actor
   */
  async createActor(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);
      
      // Extract data from request
      const { username, displayName, bio, password } = req.body;
      const avatarFile = req.file;

      // Validate required fields
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          error: "Username can only contain letters, numbers, and underscores",
        });
      }

      // Check if username exists
      const exists = await actorService.usernameExists(username);
      if (exists) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Handle avatar if provided
      let iconInfo = undefined;
      if (avatarFile) {
        const publicDir = path.join(process.cwd(), "public", "avatars");
        fs.mkdirSync(publicDir, { recursive: true });

        const fileExt = path.extname(avatarFile.originalname);
        const fileName = `${username}-${Date.now()}${fileExt}`;
        const finalPath = path.join(publicDir, fileName);

        fs.renameSync(avatarFile.path, finalPath);

        iconInfo = {
          url: `https://${domain}/avatars/${fileName}`,
          mediaType: avatarFile.mimetype,
        };
      }

      // Create actor
      const actor = await actorService.createActor(
        {
          username,
          displayName,
          bio,
          password,
        },
        iconInfo
      );

      return res.status(201).json(actor);
    } catch (error) {
      console.error("Error creating actor:", error);
      return res.status(500).json({ error: "Failed to create actor" });
    }
  }

  /**
   * Get actor by username
   */
  async getActorByUsername(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);
      
      const { username } = req.params;
      const actor = await actorService.getActorByUsername(username);

      if (!actor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      return res.status(200).json(actor);
    } catch (error) {
      console.error("Error fetching actor:", error);
      return res.status(500).json({ error: "Failed to fetch actor" });
    }
  }

  /**
   * Update actor
   */
  async updateActor(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);
      
      const { username } = req.params;
      const { displayName, bio } = req.body;
      const avatarFile = req.file;

      // Check if actor exists
      const exists = await actorService.usernameExists(username);
      if (!exists) {
        return res.status(404).json({ error: "Actor not found" });
      }

      // Handle avatar update if provided
      let iconInfo = undefined;
      if (avatarFile) {
        const publicDir = path.join(process.cwd(), "public", "avatars");
        fs.mkdirSync(publicDir, { recursive: true });

        const fileExt = path.extname(avatarFile.originalname);
        const fileName = `${username}-${Date.now()}${fileExt}`;
        const finalPath = path.join(publicDir, fileName);

        fs.renameSync(avatarFile.path, finalPath);

        iconInfo = {
          url: `https://${domain}/avatars/${fileName}`,
          mediaType: avatarFile.mimetype,
        };
      }

      // Update actor
      const updatedActor = await actorService.updateActor(
        username,
        {
          displayName,
          bio,
        },
        iconInfo
      );

      if (!updatedActor) {
        return res.status(404).json({ error: "Failed to update actor" });
      }

      return res.status(200).json(updatedActor);
    } catch (error) {
      console.error("Error updating actor:", error);
      return res.status(500).json({ error: "Failed to update actor" });
    }
  }

  /**
   * Delete actor
   */
  async deleteActor(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);
      
      const { username } = req.params;

      // Check if actor exists
      const actor = await actorService.getActorByUsername(username);
      if (!actor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      // Check if user is authorized to delete this actor
      if (req.user && req.user.id !== actor._id) {
        return res
          .status(403)
          .json({ error: "You are not authorized to delete this actor" });
      }

      // Delete actor
      await actorService.deleteActor(username);

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting actor:", error);
      return res.status(500).json({ error: "Failed to delete actor" });
    }
  }
}
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

/**
 * Controller for handling actor-related operations
 */
export class ActorsController {
  /**
   * Create a new actor
   */
  async createActor(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
      
      // Extract data from request
      const { username, displayName, bio } = req.body;
      const avatarFile = req.file;

      // Validate required fields
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
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

      // Handle avatar
      let iconInfo = undefined;
      if (avatarFile) {
        const domain = req.app.get("domain") as string;
        iconInfo = await this.processAvatarFile(avatarFile, username, domain);
      }

      // Create actor data
      const actorData = {
        username,
        displayName,
        bio,
      };

      // Create actor through service
      const actor = await actorService.createActor(actorData, iconInfo);

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
      const { actorService } = req.services;
      
      const { username } = req.params;
      const actor = await actorService.getActorByUsername(username);

      if (!actor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      return res.json(actor);
    } catch (error) {
      console.error("Error fetching actor:", error);
      return res.status(500).json({ error: "Failed to fetch actor" });
    }
  }

  /**
   * Update an actor
   */
  async updateActor(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
      
      const { username } = req.params;
      const { displayName, bio } = req.body;
      const avatarFile = req.file;

      // Check if actor exists
      const exists = await actorService.usernameExists(username);
      if (!exists) {
        return res.status(404).json({ error: "Actor not found" });
      }

      // Handle avatar update
      let iconInfo = undefined;
      if (avatarFile) {
        const domain = req.app.get("domain") as string;
        iconInfo = await this.processAvatarFile(avatarFile, username, domain);
      }

      // Update actor
      const updates = {
        displayName,
        bio,
      };

      const updatedActor = await actorService.updateActor(
        username,
        updates,
        iconInfo
      );

      if (!updatedActor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      return res.json(updatedActor);
    } catch (error) {
      console.error("Error updating actor:", error);
      return res.status(500).json({ error: "Failed to update actor" });
    }
  }

  /**
   * Delete an actor
   */
  async deleteActor(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
      
      const { username } = req.params;
      const deleted = await actorService.deleteActor(username);

      if (!deleted) {
        return res.status(404).json({ error: "Actor not found" });
      }

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting actor:", error);
      return res.status(500).json({ error: "Failed to delete actor" });
    }
  }

  /**
   * Get ActivityPub formatted actor profile
   */
  async getActivityPubActor(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
      
      const { username } = req.params;

      // Check Accept header for ActivityPub requests
      const acceptHeader = req.get("Accept");
      if (!acceptHeader || !acceptHeader.includes("application/activity+json")) {
        res.redirect(`/profile/${username}`);
        return res; // Return the response object explicitly
      }

      const actor = await actorService.getFullActorByUsername(username);

      if (!actor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      // Return ActivityPub compliant actor
      return res.json({
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1",
        ],
        ...actor,
      });
    } catch (error) {
      console.error("Error fetching ActivityPub actor:", error);
      return res.status(500).json({ error: "Failed to fetch actor" });
    }
  }

  /**
   * Search for actors
   */
  async searchActors(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
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
   * Helper method to process avatar file upload
   */
  private async processAvatarFile(
    avatarFile: Express.Multer.File, 
    username: string, 
    domain: string
  ): Promise<{ url: string; mediaType: string } | undefined> {
    // Move to permanent storage in public directory
    const publicDir = path.join(process.cwd(), "public", "avatars");
    fs.mkdirSync(publicDir, { recursive: true });

    const fileExt = path.extname(avatarFile.originalname);
    const fileName = `${username}-${Date.now()}${fileExt}`;
    const finalPath = path.join(publicDir, fileName);

    fs.renameSync(avatarFile.path, finalPath);

    return {
      url: `https://${domain}/avatars/${fileName}`,
      mediaType: avatarFile.mimetype,
    };
  }
}
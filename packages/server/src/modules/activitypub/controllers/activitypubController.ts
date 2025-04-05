import { Request, Response } from "express";

/**
 * Controller for handling ActivityPub protocol requests
 */
export class ActivityPubController {
  /**
   * Get ActivityPub formatted actor profile
   */
  async getActor(req: Request, res: Response): Promise<Response> {
    try {
      const { actorService } = req.services;
      const { username } = req.params;

      // Check Accept header for ActivityPub requests
      const acceptHeader = req.get("Accept");
      if (!acceptHeader || !acceptHeader.includes("application/activity+json")) {
        // Redirect to user profile page for browsers
        res.redirect(`/profile/${username}`);
        return res; // Explicitly return the response object
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
}
import { Request, Response } from "express";
import { ActorService } from "../../actors/services/actorService";

export class ActivityPubController {
  /**
   * Get ActivityPub actor profile
   */
  async getActor(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);
      
      const { username } = req.params;
      const actor = await actorService.getFullActorByUsername(username);

      if (!actor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      const acceptHeader = req.get("Accept") || "";

      if (acceptHeader.includes("application/activity+json")) {
        // Return ActivityPub format
        const activityPubActor = {
          "@context": [
            "https://www.w3.org/ns/activitystreams",
            "https://w3id.org/security/v1",
          ],
          id: `https://${domain}/users/${username}`,
          type: "Person",
          preferredUsername: username,
          name: actor.name,
          summary: actor.bio,
          inbox: `https://${domain}/users/${username}/inbox`,
          outbox: `https://${domain}/users/${username}/outbox`,
          following: `https://${domain}/users/${username}/following`,
          followers: `https://${domain}/users/${username}/followers`,
          icon: actor.icon ? {
            type: "Image",
            mediaType: actor.icon.mediaType,
            url: actor.icon.url
          } : undefined,
          publicKey: actor.publicKey
        };

        return res.json(activityPubActor);
      }

      // For non-ActivityPub requests, redirect to the profile page
      res.redirect(302, `/profile/${username}`);
      return res;
    } catch (error) {
      console.error("Error fetching actor:", error);
      return res.status(500).json({ error: "Failed to fetch actor" });
    }
  }

  /**
   * Handle incoming activities at actor inbox
   */
  async receiveActivity(req: Request, res: Response): Promise<Response> {
    try {
      // Implementation of inbox activity handling would go here
      // For now, just accept the activity
      console.log("Received activity:", req.body);
      return res.status(202).json({ message: "Activity accepted" });
    } catch (error) {
      console.error("Error processing activity:", error);
      return res.status(500).json({ error: "Failed to process activity" });
    }
  }

  /**
   * Get actor outbox (collection of actor's activities)
   */
  async getOutbox(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      
      const { username } = req.params;
      
      // For now, return an empty collection
      // In a full implementation, you would fetch posts and convert to activities
      const outbox = {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://${domain}/users/${username}/outbox`,
        type: "OrderedCollection",
        totalItems: 0,
        orderedItems: []
      };

      return res.json(outbox);
    } catch (error) {
      console.error("Error fetching outbox:", error);
      return res.status(500).json({ error: "Failed to fetch outbox" });
    }
  }
}
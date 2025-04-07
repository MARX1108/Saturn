import { Request, Response } from "express";
import { ActorService } from "../../actors/services/actorService";

export class WebFingerController {
  /**
   * Get WebFinger resource for actor discovery
   */
  async getResource(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const actorService = new ActorService(db, domain);

      const resource = req.query.resource as string;

      if (!resource) {
        return res
          .status(400)
          .json({ error: "Resource query parameter is required" });
      }

      // Parse the resource URI (acct:username@domain)
      const match = resource.match(/^acct:([^@]+)@(.+)$/);

      if (!match) {
        return res.status(400).json({ error: "Invalid resource format" });
      }

      const [, username, resourceDomain] = match;
      const serverDomain = domain;

      // Verify this is for our domain
      if (resourceDomain !== serverDomain) {
        return res.status(404).json({ error: "Resource not found" });
      }

      // Look up the actor
      const actor = await actorService.getActorByUsername(username);

      if (!actor) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return WebFinger response
      return res.json({
        subject: `acct:${username}@${domain}`,
        links: [
          {
            rel: "self",
            type: "application/activity+json",
            href: `https://${domain}/users/${username}`,
          },
        ],
      });
    } catch (error) {
      console.error("WebFinger error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}
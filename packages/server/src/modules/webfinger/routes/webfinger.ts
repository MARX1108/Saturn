// filepath: /Users/marxw/Desktop/FYP-Saturn/packages/server/src/modules/webfinger/routes/webfinger.ts
import express from "express";
import { ActorService } from "../../actors/services/actorService";
import { Db } from "mongodb";

const router = express.Router();

// WebFinger endpoint for actor discovery
router.get("/.well-known/webfinger", async (req, res) => {
  try {
    const db = req.app.get("db") as Db;
    const domain = req.app.get("domain") as string;
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
});

export default router;
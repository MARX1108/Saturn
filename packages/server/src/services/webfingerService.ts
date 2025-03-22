import { Db } from "mongodb";

export class WebFingerService {
  private db: Db;
  private domain: string;

  constructor(db: Db, domain: string) {
    this.db = db;
    this.domain = domain;
  }

  async handleWebFingerRequest(resource: string): Promise<any> {
    // resource format: acct:username@domain
    if (!resource.startsWith("acct:")) {
      throw new Error("Invalid resource format");
    }

    const parts = resource.substr(5).split("@");
    if (parts.length !== 2 || parts[1] !== this.domain) {
      throw new Error("User not found on this instance");
    }

    const username = parts[0];

    // Find actor in database
    const actor = await this.db.collection("actors").findOne({
      preferredUsername: username,
    });

    if (!actor) {
      throw new Error("User not found");
    }

    // Return WebFinger response
    return {
      subject: resource,
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: actor.id,
        },
      ],
    };
  }
}

// Configure in routes to enable discovery from other instances

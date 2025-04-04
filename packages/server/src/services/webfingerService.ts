import { Db } from "mongodb";
import { ActorRepository } from "../repositories/actorRepository";

export interface WebFingerResource {
  subject: string;
  links: WebFingerLink[];
}

export interface WebFingerLink {
  rel: string;
  type?: string;
  href?: string;
  template?: string;
}

export class WebFingerService {
  private actorRepository: ActorRepository;
  private domain: string;

  constructor(db: Db, domain: string) {
    this.actorRepository = new ActorRepository(db);
    this.domain = domain;
  }

  /**
   * Resolve a WebFinger resource
   * @param resource The resource to resolve (acct:username@domain)
   */
  async resolveResource(resource: string): Promise<WebFingerResource> {
    // Parse the resource URI (acct:username@domain)
    const match = resource.match(/^acct:([^@]+)@(.+)$/);

    if (!match) {
      throw new Error("Invalid resource format");
    }

    const [, username, resourceDomain] = match;

    // Verify this is for our domain
    if (resourceDomain !== this.domain) {
      throw new Error("Resource not found on this server");
    }

    // Find the actor
    const actor = await this.actorRepository.findByUsername(username);

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

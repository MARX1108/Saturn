import { Request, Response } from 'express';
import { ActorService } from '@/modules/actors/services/actorService';
import { WebfingerService } from '../services/webfinger.service';
import { ServiceContainer } from '../../../utils/container';

// Extend Request type locally for this controller
interface RequestWithServices extends Request {
  services: ServiceContainer; // Changed to required property to match expected type
}

export class WebFingerController {
  private actorService: ActorService;
  private webfingerService: WebfingerService;
  private domain: string;

  constructor(
    actorService: ActorService,
    webfingerService: WebfingerService,
    domain: string
  ) {
    this.actorService = actorService;
    this.webfingerService = webfingerService;
    this.domain = domain;
  }

  /**
   * Get WebFinger resource for actor discovery
   */
  async getResource(
    req: RequestWithServices,
    res: Response
  ): Promise<Response> {
    try {
      const resource = req.query.resource as string;

      if (!resource) {
        return res
          .status(400)
          .json({ error: 'Resource query parameter is required' });
      }

      // Parse the resource URI (acct:username@domain)
      const match = resource.match(/^acct:([^@]+)@(.+)$/);

      if (!match) {
        return res.status(400).json({ error: 'Invalid resource format' });
      }

      const [, username, resourceDomain] = match;
      const serverDomain = this.domain;

      // Verify this is for our domain
      if (resourceDomain !== serverDomain) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Look up the actor
      const actor = await this.actorService.getActorByUsername(username);

      if (!actor) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return WebFinger response
      return res.json({
        subject: `acct:${username}@${this.domain}`,
        links: [
          {
            rel: 'self',
            type: 'application/activity+json',
            href: `https://${this.domain}/users/${username}`,
          },
        ],
      });
    } catch (error) {
      console.error('WebFinger error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

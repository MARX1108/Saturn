'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebFingerService = void 0;
const actorRepository_1 = require('@/modules/actors/repositories/actorRepository');
class WebFingerService {
  constructor(db, domain) {
    this.actorRepository = new actorRepository_1.ActorRepository(db);
    this.domain = domain;
  }
  /**
   * Resolve a WebFinger resource
   * @param resource The resource to resolve (acct:username@domain)
   */
  async resolveResource(resource) {
    // Parse the resource URI (acct:username@domain)
    const match = resource.match(/^acct:([^@]+)@(.+)$/);
    if (!match) {
      throw new Error('Invalid resource format');
    }
    const [, username, resourceDomain] = match;
    // Verify this is for our domain
    if (resourceDomain !== this.domain) {
      throw new Error('Resource not found on this server');
    }
    // Find the actor
    const actor = await this.actorRepository.findByUsername(username);
    if (!actor) {
      throw new Error('User not found');
    }
    // Return WebFinger response
    return {
      subject: resource,
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: actor.id,
        },
      ],
    };
  }
}
exports.WebFingerService = WebFingerService;

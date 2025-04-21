'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActivityPubController = void 0;
class ActivityPubController {
  constructor(actorService, activityPubService, domain) {
    this.actorService = actorService;
    this.activityPubService = activityPubService;
    this.domain = domain;
  }
  /**
   * Get ActivityPub actor profile
   */
  async getActor(req, res) {
    try {
      const { username } = req.params;
      const actor = await this.actorService.getFullActorByUsername(username);
      if (!actor) {
        return res.status(404).json({ error: 'Actor not found' });
      }
      const acceptHeader = req.get('Accept') || '';
      if (acceptHeader.includes('application/activity+json')) {
        // Return ActivityPub format
        const activityPubActor = {
          '@context': [
            'https://www.w3.org/ns/activitystreams',
            'https://w3id.org/security/v1',
          ],
          id: `https://${this.domain}/users/${username}`,
          type: 'Person',
          preferredUsername: username,
          name: actor.name,
          summary: actor.bio,
          inbox: `https://${this.domain}/users/${username}/inbox`,
          outbox: `https://${this.domain}/users/${username}/outbox`,
          following: `https://${this.domain}/users/${username}/following`,
          followers: `https://${this.domain}/users/${username}/followers`,
          icon: actor.icon
            ? {
                type: 'Image',
                mediaType: actor.icon.mediaType,
                url: actor.icon.url,
              }
            : undefined,
          publicKey: actor.publicKey,
        };
        return res.json(activityPubActor);
      }
      // For non-ActivityPub requests, redirect to the profile page
      res.redirect(302, `/profile/${username}`);
      return res;
    } catch (error) {
      console.error('Error fetching actor:', error);
      return res.status(500).json({ error: 'Failed to fetch actor' });
    }
  }
  /**
   * Handle incoming activities at actor inbox
   */
  async receiveActivity(req, res) {
    try {
      // Use ActivityPubService to process the incoming activity
      await this.activityPubService.processIncomingActivity(
        req.body,
        req.params.username
      );
      return res.status(202).json({ message: 'Activity accepted' });
    } catch (error) {
      console.error('Error processing activity:', error);
      return res.status(500).json({ error: 'Failed to process activity' });
    }
  }
  /**
   * Get actor outbox (collection of actor's activities)
   */
  async getOutbox(req, res) {
    try {
      const { username } = req.params;
      // For now, return an empty collection
      // In a full implementation, you would fetch posts and convert to activities
      const outbox = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `https://${this.domain}/users/${username}/outbox`,
        type: 'OrderedCollection',
        totalItems: 0,
        orderedItems: [],
      };
      return res.json(outbox);
    } catch (error) {
      console.error('Error fetching outbox:', error);
      return res.status(500).json({ error: 'Failed to fetch outbox' });
    }
  }
}
exports.ActivityPubController = ActivityPubController;

import { Request, Response } from 'express';
import { ActorService } from '../../actors/services/actorService';
import { ActivityPubService } from '../services/activitypub.service';
import { PostService } from '@/modules/posts/services/postService';
import { AppError, ErrorType } from '@/utils/errors';
import { Actor } from '@/modules/actors/models/actor';

export class ActivityPubController {
  private actorService: ActorService;
  private activityPubService: ActivityPubService;
  private domain: string;

  constructor(
    actorService: ActorService,
    activityPubService: ActivityPubService,
    domain: string
  ) {
    this.actorService = actorService;
    this.activityPubService = activityPubService;
    this.domain = domain;
  }

  /**
   * Get ActivityPub actor profile
   */
  async getActor(req: Request, res: Response): Promise<void> {
    const username = req.params.username;
    // Use getActorByUsername which expects preferredUsername
    const actor = await this.actorService.getActorByUsername(username);

    if (!actor) {
      res.status(404).send('Actor not found');
      return;
    }

    // Format actor for ActivityPub response
    const actorResponse = {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
      ],
      id: actor.id,
      type: actor.type,
      preferredUsername: actor.preferredUsername,
      name: actor.displayName || actor.name,
      summary: actor.summary,
      inbox: actor.inbox,
      outbox: actor.outbox,
      followers: actor.followers,
      following: `https://${req.hostname}/users/${username}/following`, // Following collection URL
      publicKey: actor.publicKey,
      icon: actor.icon, // Include icon if available
    };

    res.contentType('application/activity+json').json(actorResponse);
  }

  /**
   * Handle incoming activities at actor inbox
   */
  async receiveActivity(req: Request, res: Response): Promise<Response> {
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
  async getOutbox(req: Request, res: Response): Promise<Response> {
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

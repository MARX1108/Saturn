import { Request, Response } from 'express';
import { ActivityPubService } from '../services/activitypub.service';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { AppError, ErrorType } from '@/utils/errors';
import { Actor } from '@/modules/actors/models/actor';

const actor = await this.actorService.getActorById(actorId);
if (!actor) {
  return res.status(404).json({ error: 'Actor not found' });
}
// Return actor profile using ActivityPub format
const actorResponse = {
  '@context': [
    'https://www.w3.org/ns/activitystreams',
    'https://w3id.org/security/v1',
  ],
  id: actor.id,
  type: actor.type,
  preferredUsername: actor.preferredUsername,
  name: actor.displayName,
  summary: actor.summary,
  inbox: actor.inbox,
  outbox: actor.outbox,
};

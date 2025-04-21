import { ObjectId } from 'mongodb';
import { Actor } from '../../modules/actors/models/actor';

interface IconInfo {
  type: 'Image';
  mediaType: string;
  url: string;
}

export class MockActorService {
  private actors = new Map();
  private domain: string;

  constructor(domain = 'test.domain') {
    this.domain = domain;
  }

  async usernameExists(username: string): Promise<boolean> {
    return this.actors.has(username);
  }

  async getActorByUsername(username: string): Promise<Actor | null> {
    return this.actors.get(username) || null;
  }

  async createActor(
    actorData: Partial<Actor>,
    iconInfo?: IconInfo
  ): Promise<Actor> {
    const actor: Actor = {
      _id: new ObjectId().toString(),
      preferredUsername: actorData.preferredUsername || 'unknown',
      name: actorData.name || actorData.preferredUsername || 'unknown',
      username: actorData.username || actorData.preferredUsername || 'unknown',
      displayName:
        actorData.displayName ||
        actorData.name ||
        actorData.preferredUsername ||
        'unknown',
      summary: actorData.summary || '',
      id: `https://${this.domain}/users/${actorData.preferredUsername}`,
      inbox: `https://${this.domain}/users/${actorData.preferredUsername}/inbox`,
      outbox: `https://${this.domain}/users/${actorData.preferredUsername}/outbox`,
      followers: `https://${this.domain}/users/${actorData.preferredUsername}/followers`,
      type: 'Person',
      icon: iconInfo || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      bio: actorData.bio || '',
    };

    this.actors.set(actor.preferredUsername, actor);
    return actor;
  }

  async updateActor(
    username: string,
    updates: Partial<Actor>,
    iconInfo?: IconInfo
  ): Promise<Actor | null> {
    const actor = this.actors.get(username);
    if (!actor) {
      return null;
    }

    const updatedActor: Actor = {
      ...actor,
      name: updates.name || actor.name,
      summary: updates.summary || actor.summary,
      bio: updates.bio || actor.bio,
      icon: iconInfo || actor.icon,
      updatedAt: new Date(),
    };

    this.actors.set(username, updatedActor);
    return updatedActor;
  }

  async deleteActor(username: string): Promise<boolean> {
    if (!this.actors.has(username)) {
      return false;
    }

    this.actors.delete(username);
    return true;
  }
}

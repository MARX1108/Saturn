import { ObjectId, WithId } from 'mongodb'; // Added WithId
import { Actor } from '@/modules/actors/models/actor';

interface IconInfo {
  type: 'Image';
  mediaType: string;
  url: string;
}

// Basic mock implementation of ActorService
export class MockActorService {
  private actors = new Map<string, WithId<Actor>>(); // Store actors by username
  private domain: string;

  constructor(domain = 'test.domain') {
    this.domain = domain;
  }

  async usernameExists(username: string): Promise<boolean> {
    return this.actors.has(username);
  }

  async getActorByUsername(username: string): Promise<WithId<Actor> | null> {
    return this.actors.get(username) || null;
  }

  async getActorById(id: string | ObjectId): Promise<WithId<Actor> | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    for (const actor of this.actors.values()) {
      if (actor._id.equals(objectId)) {
        return actor;
      }
    }
    return null;
  }

  async createLocalActor(
    actorData: Partial<Actor>,
    iconInfo?: IconInfo
  ): Promise<WithId<Actor>> {
    const _id = actorData._id || new ObjectId();
    const preferredUsername = actorData.preferredUsername || 'unknown';
    const username =
      actorData.username || `${preferredUsername}@${this.domain}`;
    const actor: WithId<Actor> = {
      _id: _id,
      preferredUsername: preferredUsername,
      username: username,
      name: actorData.name || preferredUsername,
      summary: actorData.summary || '',
      type: 'Person',
      inboxUrl: `https://${this.domain}/inbox/${preferredUsername}`,
      outboxUrl: `https://${this.domain}/outbox/${preferredUsername}`,
      followersUrl: `https://${this.domain}/followers/${preferredUsername}`,
      followingUrl: `https://${this.domain}/following/${preferredUsername}`,
      publicKey: actorData.publicKey || 'mock-public-key',
      privateKey: actorData.privateKey || 'mock-private-key',
      icon: iconInfo,
      createdAt: actorData.createdAt || new Date(),
      updatedAt: actorData.updatedAt || new Date(),
      domain: this.domain,
      following: actorData.following || [],
      followers: actorData.followers || [],
      // Removed bio
      // Ensure all required Actor properties are included
    };

    this.actors.set(actor.username, actor);
    return actor;
  }

  async updateProfile(
    id: string | ObjectId,
    updates: Partial<Actor>,
    iconInfo?: IconInfo
  ): Promise<WithId<Actor> | null> {
    const actor = await this.getActorById(id);
    if (!actor) {
      return null;
    }

    // Create updated actor object, merging fields carefully
    const updatedActor: WithId<Actor> = {
      ...actor,
      name: updates.name !== undefined ? updates.name : actor.name,
      summary: updates.summary !== undefined ? updates.summary : actor.summary,
      icon: iconInfo !== undefined ? iconInfo : actor.icon,
      // Update other allowed fields from Partial<Actor>
      updatedAt: new Date(), // Always update timestamp
    };

    // Update the map using the actor's username key
    this.actors.set(actor.username, updatedActor);
    return updatedActor;
  }

  async deleteActor(id: string | ObjectId): Promise<boolean> {
    const actor = await this.getActorById(id);
    if (!actor) {
      return false;
    }
    return this.actors.delete(actor.username);
  }

  // Add mock implementations for other ActorService methods if needed
  async addFollower(
    actorId: string | ObjectId,
    followerActorId: string | ObjectId
  ): Promise<boolean> {
    // Mock implementation - add followerActorId to actorId's followers array
    const actor = await this.getActorById(actorId);
    const follower = await this.getActorById(followerActorId);
    if (!actor || !follower) return false;
    if (!actor.followers.some(f => f.equals(follower._id))) {
      actor.followers.push(follower._id);
      this.actors.set(actor.username, actor); // Update map
    }
    return true;
  }
  async removeFollower(
    actorId: string | ObjectId,
    followerActorId: string | ObjectId
  ): Promise<boolean> {
    const actor = await this.getActorById(actorId);
    const follower = await this.getActorById(followerActorId);
    if (!actor || !follower) return false;
    const initialLength = actor.followers.length;
    actor.followers = actor.followers.filter(f => !f.equals(follower._id));
    if (actor.followers.length < initialLength) {
      this.actors.set(actor.username, actor); // Update map
      return true;
    }
    return false;
  }
  async addFollowing(
    actorId: string | ObjectId,
    followingActorId: string | ObjectId
  ): Promise<boolean> {
    const actor = await this.getActorById(actorId);
    const following = await this.getActorById(followingActorId);
    if (!actor || !following) return false;
    if (!actor.following.some(f => f.equals(following._id))) {
      actor.following.push(following._id);
      this.actors.set(actor.username, actor); // Update map
    }
    return true;
  }
  async removeFollowing(
    actorId: string | ObjectId,
    followingActorId: string | ObjectId
  ): Promise<boolean> {
    const actor = await this.getActorById(actorId);
    const following = await this.getActorById(followingActorId);
    if (!actor || !following) return false;
    const initialLength = actor.following.length;
    actor.following = actor.following.filter(f => !f.equals(following._id));
    if (actor.following.length < initialLength) {
      this.actors.set(actor.username, actor); // Update map
      return true;
    }
    return false;
  }
  async getFollowers(actorId: string | ObjectId): Promise<Actor[]> {
    return [];
  }
  async getFollowing(actorId: string | ObjectId): Promise<Actor[]> {
    return [];
  }
  async getPublicKey(actorId: string | ObjectId): Promise<string | null> {
    return 'mock-public-key';
  }
  setNotificationService(service: any): void {}
  // ... etc
}

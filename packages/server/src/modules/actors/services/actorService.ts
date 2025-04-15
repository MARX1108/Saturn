import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Actor, CreateActorRequest } from '../models/actor';
import { ActorRepository } from '../repositories/actorRepository';
import { AppError, ErrorType } from '../../../utils/errors';

export class ActorService {
  private repository: ActorRepository;
  private domain: string;

  constructor(repository: ActorRepository, domain: string) {
    this.repository = repository;
    this.domain = domain;
  }

  async createActor(
    username: string,
    displayName: string,
    avatarUrl: string
  ): Promise<Actor> {
    const actor = new Actor();
    actor.username = username;
    actor.displayName = displayName;
    actor.avatarUrl = avatarUrl;
    actor.publicKey = await this.generateKeyPair();
    actor.privateKey = await this.generateKeyPair();
    actor.inboxUrl = `${process.env.APP_URL}/api/actors/${username}/inbox`;
    actor.outboxUrl = `${process.env.APP_URL}/api/actors/${username}/outbox`;
    actor.followersUrl = `${process.env.APP_URL}/api/actors/${username}/followers`;
    actor.followingUrl = `${process.env.APP_URL}/api/actors/${username}/following`;
    actor.preferredUsername = username;
    actor.name = displayName;
    actor.summary = '';
    actor.url = `${process.env.APP_URL}/api/actors/${username}`;
    actor.type = 'Person';
    actor.published = new Date();
    actor.updated = new Date();
    actor.icon = { type: 'Image', url: avatarUrl };
    actor.endpoints = {
      sharedInbox: `${process.env.APP_URL}/api/inbox`,
    };
    return this.repository.save(actor);
  }

  async getActorById(id: string): Promise<Actor | null> {
    return this.repository.findById(id);
  }

  async getActorByUsername(username: string): Promise<Actor | null> {
    return this.repository.findByUsername(username);
  }

  async updateProfile(
    id: string,
    updates: {
      displayName?: string;
      bio?: string;
      icon?: {
        type: 'Image';
        url: string;
        mediaType: string;
      };
    }
  ): Promise<boolean> {
    return this.repository.updateProfile(id, updates);
  }

  async usernameExists(username: string): Promise<boolean> {
    return this.repository.usernameExists(username);
  }

  async getFollowers(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    return this.repository.findFollowers(actorId, page, limit);
  }

  async getFollowing(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    return this.repository.findFollowing(actorId, page, limit);
  }

  async followActor(actorId: string, targetActorId: string): Promise<boolean> {
    return this.repository.addFollowing(actorId, targetActorId);
  }

  async unfollowActor(
    actorId: string,
    targetActorId: string
  ): Promise<boolean> {
    return this.repository.removeFollowing(actorId, targetActorId);
  }

  async updateActor(id: string, data: Partial<Actor>): Promise<Actor | null> {
    // Implementation
    return null;
  }

  async deleteActor(id: string): Promise<boolean> {
    // Implementation
    return true;
  }

  async getFullActorByUsername(username: string): Promise<Actor | null> {
    const actor = await this.repository.findByUsername(username);
    if (!actor) return null;

    return {
      ...actor,
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
      ],
    };
  }

  async searchActors(query: string): Promise<Actor[]> {
    // Implementation
    return [];
  }

  private async generateKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        'rsa',
        {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        },
        (err, publicKey, privateKey) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ publicKey, privateKey });
        }
      );
    });
  }
}

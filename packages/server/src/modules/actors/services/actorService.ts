import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Actor, CreateActorRequest } from '../models/actor';
import { ActorRepository } from '../repositories/actorRepository';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationType } from '../../notifications/models/notification';
import { AppError, ErrorType } from '../../../utils/errors';

export class ActorService {
  private repository: ActorRepository;
  private notificationService: NotificationService;
  private domain: string;

  constructor(
    repository: ActorRepository,
    notificationService: NotificationService,
    domain: string
  ) {
    this.repository = repository;
    this.notificationService = notificationService;
    this.domain = domain;
  }

  async createActor(
    username: string,
    displayName: string,
    avatarUrl: string
  ): Promise<Actor> {
    const keyPair = await this.generateKeyPair();
    const actor: Actor = {
      id: `${process.env.APP_URL}/api/actors/${username}`,
      username,
      displayName,
      bio: '',
      avatarUrl,
      publicKey: {
        id: `${process.env.APP_URL}/api/actors/${username}#main-key`,
        owner: `${process.env.APP_URL}/api/actors/${username}`,
        publicKeyPem: keyPair.publicKey,
      },
      privateKey: keyPair.privateKey,
      inbox: `${process.env.APP_URL}/api/actors/${username}/inbox`,
      outbox: `${process.env.APP_URL}/api/actors/${username}/outbox`,
      followers: `${process.env.APP_URL}/api/actors/${username}/followers`,
      following: [],
      preferredUsername: username,
      name: displayName,
      summary: '',
      type: 'Person',
      createdAt: new Date(),
      updatedAt: new Date(),
      icon: {
        type: 'Image',
        mediaType: 'image/jpeg',
        url: avatarUrl,
      },
    };

    return this.repository.create(actor);
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
    const success = await this.repository.addFollowing(actorId, targetActorId);

    if (success) {
      // Create notification for the followed user
      await this.notificationService.createNotification({
        recipientUserId: targetActorId,
        actorUserId: actorId,
        type: NotificationType.FOLLOW,
        read: false,
      });
    }

    return success;
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

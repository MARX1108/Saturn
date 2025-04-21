import { Db, ObjectId } from 'mongodb';
import crypto from 'crypto';
import { Actor } from '@/modules/actors/models/actor';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import bcryptjs from 'bcryptjs'; // Replace bcrypt with bcryptjs

export class ActorService {
  private repository: ActorRepository;
  private domain: string;

  constructor(db: Db, domain: string) {
    this.repository = new ActorRepository(db);
    this.domain = domain;
  }

  async createActor(
    actorInputData: /* CreateActorRequest */ any, // Rename param, use any temporarily
    iconInfo?: { url: string; mediaType: string }
  ): Promise<Actor> {
    // Validate required fields
    if (!actorInputData.password) {
      throw new Error('Password is required to create an actor');
    }

    // Generate keypair for ActivityPub federation
    const { publicKey, privateKey } = await this.generateKeyPair();

    // Prepare new actor object
    const actorId = new ObjectId();
    const actor: Actor = {
      _id: actorId,
      id: actorId.toHexString(),
      preferredUsername: actorInputData.username,
      name: actorInputData.displayName || actorInputData.username,
      createdAt: new Date(),
      updatedAt: new Date(),

      // ActivityPub fields
      type: 'Person',
      username: actorInputData.username,
      inbox: `https://${this.domain}/users/${actorInputData.username}/inbox`,
      outbox: `https://${this.domain}/users/${actorInputData.username}/outbox`,
      followers: `https://${this.domain}/users/${actorInputData.username}/followers`,
      following: [], // Ensure only one definition of following

      publicKey: {
        id: `https://${this.domain}/users/${actorInputData.username}#main-key`,
        owner: `https://${this.domain}/users/${actorInputData.username}`,
        publicKeyPem: publicKey,
      },
      privateKey: privateKey,

      // Security data
      password: actorInputData.password, // Should be hashed before reaching here

      // Additional data
      icon: iconInfo ? { type: 'Image', ...iconInfo } : undefined,
    };

    // Hash the password before saving
    const hashedPassword = await bcryptjs.hash(actorInputData.password, 10);
    actor.password = hashedPassword; // Replace the plain password with the hashed one

    // Wrap repository call in a try-catch block
    try {
      return await this.repository.create(actor);
    } catch (error) {
      console.error('Error creating actor in repository:', error);
      throw new Error('Failed to create actor');
    }
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
      icon?: {
        type: 'Image'; // Add type field
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

  async updateActor(
    username: string,
    updates: { displayName?: string },
    iconInfo?: { url: string; mediaType: string }
  ): Promise<Actor | null> {
    const updateData: Partial<Actor> = {
      ...updates,
      icon: iconInfo ? { type: 'Image', ...iconInfo } : undefined,
    };

    const result = await this.repository.updateProfileByUsername(
      username,
      updateData
    );
    if (!result) return null;

    return this.repository.findByUsername(username);
  }

  async deleteActor(username: string): Promise<boolean> {
    const result = await this.repository.deleteByUsername(username);
    return result.deletedCount > 0;
  }

  async getFullActorByUsername(username: string): Promise<Actor | null> {
    const actor = await this.repository.findByUsername(username);
    if (!actor) return null;

    return {
      ...actor,
    };
  }

  async searchActors(query: string, limit = 10): Promise<Actor[]> {
    return this.repository.search(query, limit);
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

import { Db, ObjectId } from "mongodb";
import crypto from "crypto";
import { Actor, CreateActorRequest } from "../types/actor";
import { ActorRepository } from "../repositories/actorRepository";

export class ActorService {
  private repository: ActorRepository;
  private domain: string;

  constructor(db: Db, domain: string) {
    this.repository = new ActorRepository(db);
    this.domain = domain;
  }

  async createActor(
    actorData: CreateActorRequest
  ): Promise<Actor> {
    // Generate keypair for ActivityPub federation
    const { publicKey, privateKey } = await this.generateKeyPair();

    // Prepare new actor object
    const actorId = new ObjectId();
    const newActor: Actor = {
      _id: actorId,
      preferredUsername: actorData.username,
      name: actorData.displayName || actorData.username,
      bio: actorData.bio || "",
      createdAt: new Date(),
      
      // ActivityPub fields
      type: "Person",
      id: `https://${this.domain}/users/${actorData.username}`,
      inbox: `https://${this.domain}/users/${actorData.username}/inbox`,
      outbox: `https://${this.domain}/users/${actorData.username}/outbox`,
      followers: `https://${this.domain}/users/${actorData.username}/followers`,
      following: `https://${this.domain}/users/${actorData.username}/following`,
      
      publicKey: {
        id: `https://${this.domain}/users/${actorData.username}#main-key`,
        owner: `https://${this.domain}/users/${actorData.username}`,
        publicKeyPem: publicKey
      },
      privateKey: privateKey,
      
      // Security data
      password: actorData.password, // Should be hashed before reaching here
      
      // Additional data
      following: [],
      icon: actorData.icon
    };

    // Save to database using repository
    return this.repository.create(newActor);
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

  async getFollowers(
    actorId: string,
    page = 1,
    limit = 20
  ): Promise<Actor[]> {
    return this.repository.findFollowers(actorId, page, limit);
  }

  async getFollowing(
    actorId: string,
    page = 1,
    limit = 20
  ): Promise<Actor[]> {
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

  private async generateKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
  }> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair(
        "rsa",
        {
          modulusLength: 2048,
          publicKeyEncoding: {
            type: "spki",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
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

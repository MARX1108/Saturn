import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Actor } from '@/modules/actors/models/actor';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { NotificationType } from '@/modules/notifications/models/notification';
import { AppError, ErrorType } from '@/utils/errors';
import { Filter } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { ActorService } from '../services/actorService'; // Keep relative for now
import { UploadService } from '@/modules/media/services/upload.service';

// Define DTO locally, do not export
interface CreateActorData {
  username: string; // Local username (preferredUsername)
  email: string;
  password?: string; // Required for local users
  displayName?: string;
  summary?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
}

export class ActorService {
  constructor(
    private actorRepository: ActorRepository,
    private notificationService: NotificationService,
    private domain: string
  ) {}

  // --- Create Local Actor ---
  async createLocalActor(data: CreateActorData): Promise<Actor> {
    if (!data.password) {
      throw new AppError(
        'Password is required for local actor creation',
        400,
        ErrorType.BAD_REQUEST
      );
    }

    // Check if username or email already exists
    const existingByUsername = await this.actorRepository.findOne({
      preferredUsername: data.username,
    });
    if (existingByUsername) {
      throw new AppError('Username already taken', 409, ErrorType.CONFLICT);
    }
    const existingByEmail = await this.actorRepository.findOne({
      email: data.email,
    });
    if (existingByEmail) {
      throw new AppError('Email already registered', 409, ErrorType.CONFLICT);
    }

    const actorId = new ObjectId();
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const actorAPID = `https://${this.domain}/users/${data.username}`;
    const now = new Date();

    // Generate Keypair (replace with more robust key generation/storage)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const newActor: Omit<Actor, '_id'> = {
      id: actorAPID,
      type: 'Person',
      username: `${data.username}@${this.domain}`, // Full username
      preferredUsername: data.username,
      email: data.email,
      password: hashedPassword,
      displayName: data.displayName || data.username,
      summary: data.summary || '',
      inbox: `${actorAPID}/inbox`,
      outbox: `${actorAPID}/outbox`,
      followers: `${actorAPID}/followers`,
      publicKey: {
        id: `${actorAPID}#main-key`,
        owner: actorAPID,
        publicKeyPem: publicKey,
      },
      privateKey: privateKey, // Store securely!
      isAdmin: data.isAdmin || false,
      isVerified: data.isVerified || false, // Should require email verification flow
      createdAt: now,
      updatedAt: now,
    };

    // Use create method from base repository
    const createdActor = await this.actorRepository.create({
      ...newActor,
      _id: actorId,
    } as Actor);
    return createdActor;
  }

  // --- Get Actor By ID (Internal ObjectId) ---
  async getActorById(id: string | ObjectId): Promise<Actor | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return this.actorRepository.findById(objectId);
  }

  // --- Get Actor By AP ID (URL) ---
  async getActorByApId(apId: string): Promise<Actor | null> {
    return this.actorRepository.findOne({ id: apId });
  }

  // --- Get Actor By Username (preferredUsername) ---
  async getActorByUsername(username: string): Promise<Actor | null> {
    // Search by preferredUsername for local lookups
    return this.actorRepository.findOne({ preferredUsername: username });
  }

  // --- Get Actor By Full Username (user@domain) ---
  async getActorByFullUsername(fullUsername: string): Promise<Actor | null> {
    // Search by the full username field
    return this.actorRepository.findOne({ username: fullUsername });
  }

  // --- Search Actors ---
  async searchActors(query: string, limit = 10): Promise<Actor[]> {
    if (!query) {
      return [];
    }
    // Simple search by preferredUsername or displayName (case-insensitive)
    const filter = {
      $or: [
        { preferredUsername: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
      ],
    };
    return this.actorRepository.find(filter, { limit });
  }

  // --- Update Actor Profile ---
  async updateActorProfile(
    actorId: string | ObjectId,
    updates: Partial<Pick<Actor, 'displayName' | 'summary' | 'icon'>>
  ): Promise<Actor | null> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const updatePayload = { ...updates, updatedAt: new Date() };
    // Use findOneAndUpdate to get the updated document back
    return this.actorRepository.findOneAndUpdate(
      { _id: objectId } as Filter<Actor>,
      { $set: updatePayload }
    );
  }

  // --- Follow Actor ---
  async follow(
    followerId: string | ObjectId,
    followeeApId: string
  ): Promise<boolean> {
    const follower = await this.getActorById(followerId);
    if (!follower)
      throw new AppError('Follower not found', 404, ErrorType.NOT_FOUND);

    // TODO: Fetch followee actor (local or remote)
    // const followee = await this.getActorByApId(followeeApId) || await this.fetchRemoteActor(followeeApId);
    const followee = await this.getActorByApId(followeeApId);
    if (!followee)
      throw new AppError('Followee not found', 404, ErrorType.NOT_FOUND);

    // Add followee AP ID to follower's following list
    const result = await this.actorRepository.updateById(follower._id, {
      $addToSet: { following: followee.id }, // Store AP ID
    });

    // TODO: Send Follow activity to followee's inbox
    // TODO: Handle accept/reject flow if followee manually approves
    // TODO: Update follower count on followee (if local)

    return result;
  }

  // --- Unfollow Actor ---
  async unfollow(
    followerId: string | ObjectId,
    followeeApId: string
  ): Promise<boolean> {
    const follower = await this.getActorById(followerId);
    if (!follower)
      throw new AppError('Follower not found', 404, ErrorType.NOT_FOUND);

    // Remove followee AP ID from follower's following list
    const result = await this.actorRepository.updateById(follower._id, {
      $pull: { following: followeeApId }, // Use AP ID
    });

    // TODO: Send Undo(Follow) activity to followee's inbox
    // TODO: Update follower count on followee (if local)

    return result;
  }

  // --- Get Followers (Requires pagination) ---
  async getFollowers(actorApId: string): Promise<Actor[]> {
    // This is complex - involves fetching actors who have *this* actor in their 'following' list
    // OR parsing the followers collection URL if using ActivityPub collections directly.
    // Placeholder: Returning empty array
    console.warn(`getFollowers for ${actorApId} not fully implemented.`);
    return [];
  }

  // --- Get Following (Requires pagination) ---
  async getFollowing(actorId: string | ObjectId): Promise<Actor[]> {
    const actor = await this.getActorById(actorId);
    if (!actor || !actor.following) return [];

    // Fetch actors based on the AP IDs stored in the following array
    const followingActors = await this.actorRepository.find({
      id: { $in: actor.following },
    });
    return followingActors;
  }

  // --- Fetch Remote Actor (Basic Example) ---
  async fetchRemoteActor(actorUrl: string): Promise<Actor | null> {
    // TODO: Implement proper ActivityPub actor fetching and validation
    console.warn(`Fetching remote actor ${actorUrl} not implemented`);
    return null;
  }
}

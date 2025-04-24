import { ObjectId } from 'mongodb';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Actor } from '@/modules/actors/models/actor';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { AppError, ErrorType } from '@/utils/errors';

// Define CreateActorData interface and export it
export interface CreateActorData {
  username: string;
  email: string;
  password?: string;
  displayName?: string;
  summary?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
}

export class ActorService {
  private notificationService!: NotificationService; // Mark for definite assignment

  constructor(
    private actorRepository: ActorRepository,
    private domain: string
  ) {}

  // Setter for NotificationService
  public setNotificationService(
    notificationService: NotificationService
  ): void {
    this.notificationService = notificationService;
  }

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
    // Use repository method
    return this.actorRepository.findByPreferredUsername(username);
  }

  // --- Get Actor By Full Username (user@domain) ---
  async getActorByFullUsername(fullUsername: string): Promise<Actor | null> {
    // Search by the full username field
    return this.actorRepository.findOne({ username: fullUsername });
  }

  // --- Search Actors ---
  async searchActors(query: string, limit = 10): Promise<Actor[]> {
    // Call repository method
    return this.actorRepository.search(query, limit);
  }

  // --- Update Actor Profile ---
  async updateActorProfile(
    actorId: string | ObjectId,
    updates: Partial<Pick<Actor, 'displayName' | 'summary' | 'icon'>>
  ): Promise<Actor | null> {
    // Call repository method
    return this.actorRepository.updateProfile(actorId, updates);
  }

  // --- Update Actor (by username) ---
  // Keep this method name if controllers/tests use it, but have it call repo
  async updateActor(
    username: string, // Assuming it should update by username
    updates: Partial<Actor>
  ): Promise<Actor | null> {
    // Call repository method
    return this.actorRepository.updateProfileByUsername(username, updates);
  }

  // --- Delete Actor (by username) ---
  // Keep this method name if controllers/tests use it, but have it call repo
  async deleteActor(username: string): Promise<boolean> {
    // Call repository method and return its boolean result
    return this.actorRepository.deleteByUsername(username);
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
    // Use addFollowing from repository
    const result = await this.actorRepository.addFollowing(
      follower._id,
      followee.id
    );

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
    // Use removeFollowing from repository
    const result = await this.actorRepository.removeFollowing(
      follower._id,
      followeeApId
    );

    // TODO: Send Undo(Follow) activity to followee's inbox
    // TODO: Update follower count on followee (if local)

    return result;
  }

  // --- Get Followers (Requires pagination) ---
  async getFollowers(
    actorApId: string,
    page = 1,
    limit = 20
  ): Promise<Actor[]> {
    // Call repository method
    return this.actorRepository.findFollowers(actorApId, page, limit);
  }

  // --- Get Following (Requires pagination) ---
  async getFollowing(
    actorId: string | ObjectId,
    page = 1,
    limit = 20
  ): Promise<Actor[]> {
    // Call repository method
    return this.actorRepository.findFollowing(actorId, page, limit);
  }

  // --- Fetch Remote Actor (Basic Example) ---
  fetchRemoteActor(actorUrl: string): Promise<Actor | null> {
    // TODO: Implement proper ActivityPub actor fetching and validation
    console.warn(`Fetching remote actor ${actorUrl} not implemented`);
    return Promise.resolve(null);
  }

  // Call repository method
  async usernameExists(username: string): Promise<boolean> {
    return this.actorRepository.usernameExists(username);
  }
}

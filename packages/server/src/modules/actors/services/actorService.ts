import { Actor } from '../models/actor';
import { ActorRepository } from '../repositories/actorRepository';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { AppError, ErrorType } from '@/utils/errors';
import { ObjectId } from 'mongodb';

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
    const {
      username,
      email,
      password,
      displayName = username, // Use username as default display name
      summary = '', // Empty string as default summary
      isAdmin = false,
      isVerified = false,
    } = data;

    // Validate password is required
    if (!password) {
      throw new AppError(
        'Password is required for local actor creation',
        400,
        ErrorType.BAD_REQUEST
      );
    }

    const domain = this.domain;
    const preferredUsername = username; // For local actors, preferredUsername is the username

    // Check if the username already exists
    // This should be done before attempting to create the user
    const existingActor = await this.actorRepository.findOne({
      preferredUsername,
    });

    if (existingActor) {
      throw new AppError('Username already taken', 409, ErrorType.CONFLICT);
    }

    // Check if email already exists
    const existingEmail = await this.actorRepository.findOne({
      email,
    });

    if (existingEmail) {
      throw new AppError('Email already registered', 409, ErrorType.CONFLICT);
    }

    // Generate MongoDB ObjectId (ensure _id and id are consistent)
    const actorObjectId = new ObjectId();

    // Create a new actor
    const actor: Omit<Actor, '_id'> = {
      id: `https://${domain}/actors/${preferredUsername}`, // ActivityPub ID (URL)
      type: 'Person', // ActivityPub type
      username: `${preferredUsername}@${domain}`, // Full username (user@domain)
      preferredUsername, // Local username
      name: displayName, // Also set name for ActivityPub compatibility
      displayName,
      summary,
      email, // Set email
      password, // Will be hashed in repository/controller
      inbox: `https://${domain}/actors/${preferredUsername}/inbox`,
      outbox: `https://${domain}/actors/${preferredUsername}/outbox`,
      followers: `https://${domain}/actors/${preferredUsername}/followers`,
      following: [], // Empty array initially
      isAdmin,
      isVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRemote: false, // Local actor
    };

    // Manually generate key pair if needed
    // TODO: Move key generation to a separate service/util

    // Use create method from base repository
    const createdActor = await this.actorRepository.create({
      ...actor,
      _id: actorObjectId,
    } as Actor);

    return createdActor;
  }

  // --- Get Actor By ID (Internal ObjectId) ---
  async getActorById(id: string | ObjectId): Promise<Actor | null> {
    console.log(
      '[ActorService] getActorById called with:',
      id,
      'type:',
      typeof id
    );

    // If id is null or undefined, return null immediately
    if (!id) {
      console.log('[ActorService] getActorById called with null/undefined id');
      return null;
    }

    try {
      // Handle different ID formats
      let objectId: ObjectId | string = id;

      // If string, try to convert to ObjectId
      if (typeof id === 'string') {
        try {
          // Check if it's a valid ObjectId string
          if (ObjectId.isValid(id)) {
            objectId = new ObjectId(id);
            console.log(
              '[ActorService] Converted string to ObjectId:',
              objectId
            );
          } else {
            // Keep as string if not a valid ObjectId (might be an API ID or username)
            console.log(
              '[ActorService] Using string ID as-is (not a valid ObjectId)'
            );
          }
        } catch (e) {
          console.log(
            '[ActorService] Error converting to ObjectId, using string as-is:',
            e
          );
          // Keep as string if conversion fails
        }
      }

      // First try direct lookup with the objectId
      let result = await this.actorRepository.findById(objectId);

      // If not found and objectId is an ObjectId instance, try with string representation
      if (!result && objectId instanceof ObjectId) {
        console.log('[ActorService] Trying string representation of ObjectId');
        result = await this.actorRepository.findOne({
          _id: objectId,
        });
      }

      // If still not found and id is a string that looks like a URL, try by AP ID
      if (!result && typeof id === 'string' && id.startsWith('http')) {
        console.log('[ActorService] Trying lookup by AP ID');
        result = await this.actorRepository.findOne({ id });
      }

      console.log(
        '[ActorService] findById result:',
        result ? 'Found' : 'Not found'
      );
      return result || null;
    } catch (error) {
      console.error('[ActorService] Error in getActorById:', error);
      return null;
    }
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
    try {
      console.log(`[ActorService] Updating actor profile with ID: ${actorId}`);
      console.log(`[ActorService] Update payload:`, JSON.stringify(updates));

      // Validate actorId
      if (!actorId) {
        console.error(
          '[ActorService] updateActorProfile called with null/undefined actorId'
        );
        return null;
      }

      // Validate update payload
      if (!updates || Object.keys(updates).length === 0) {
        console.error('[ActorService] Empty update payload provided');
        return null;
      }

      // Call repository method
      const result = await this.actorRepository.updateProfile(actorId, updates);

      if (!result) {
        console.error(
          `[ActorService] Actor update returned null for ID: ${actorId}`
        );
      } else {
        console.log(
          `[ActorService] Successfully updated actor: ${result.preferredUsername}`
        );
      }

      return result;
    } catch (error) {
      console.error(
        `[ActorService] Error in updateActorProfile for ID ${actorId}:`,
        error
      );
      throw error;
    }
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
    if (!follower) {
      throw new AppError('Follower not found', 404, ErrorType.NOT_FOUND);
    }

    // TODO: Fetch followee actor (local or remote)
    // const followee = await this.getActorByApId(followeeApId) || await this.fetchRemoteActor(followeeApId);
    const followee = await this.getActorByApId(followeeApId);
    if (!followee) {
      throw new AppError('Followee not found', 404, ErrorType.NOT_FOUND);
    }

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

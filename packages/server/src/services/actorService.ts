import { Collection, Db, ObjectId } from "mongodb";
import crypto from "crypto";
import { Actor, CreateActorRequest, ActorResponse } from "../types/actor";

export class ActorService {
  private actorsCollection: Collection;
  private keysCollection: Collection;
  private domain: string;
  private db: Db;

  constructor(db: Db, domain: string) {
    this.actorsCollection = db.collection("actors");
    this.keysCollection = db.collection("actorKeys");
    this.domain = domain;
    this.db = db;

    // Create indexes
    this.actorsCollection.createIndex(
      { preferredUsername: 1 },
      { unique: true }
    );
    this.actorsCollection.createIndex({ id: 1 }, { unique: true });
  }

  /**
   * Generate ActivityPub keypair
   * @returns RSA keypair
   */
  private generateKeyPair() {
    return crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
  }

  /**
   * Check if a username already exists
   * @param username Username to check
   * @returns True if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const actor = await this.actorsCollection.findOne({
      preferredUsername: username,
    });
    return !!actor;
  }

  /**
   * Create a new actor
   * @param actorData Actor creation data
   * @param iconInfo Optional icon information
   * @returns Created actor data
   */
  async createActor(
    actorData: CreateActorRequest,
    iconInfo?: { url: string; mediaType: string }
  ): Promise<ActorResponse> {
    const { username, displayName, bio } = actorData;

    // Generate keypair
    const { publicKey, privateKey } = this.generateKeyPair();

    // Create actor object
    const actor: Actor = {
      id: `https://${this.domain}/users/${username}`,
      type: "Person",
      preferredUsername: username,
      name: displayName || username,
      summary: bio || "",
      inbox: `https://${this.domain}/users/${username}/inbox`,
      outbox: `https://${this.domain}/users/${username}/outbox`,
      followers: `https://${this.domain}/users/${username}/followers`,
      following: `https://${this.domain}/users/${username}/following`,
      publicKey: {
        id: `https://${this.domain}/users/${username}#main-key`,
        owner: `https://${this.domain}/users/${username}`,
        publicKeyPem: publicKey,
      },
    };

    // Add icon if provided
    if (iconInfo) {
      actor.icon = {
        type: "Image",
        mediaType: iconInfo.mediaType,
        url: iconInfo.url,
      };
    }

    // Insert actor into database
    const result = await this.actorsCollection.insertOne({
      ...actor,
      createdAt: new Date(),
      updatedAt: new Date(),
      followersCount: 0,
      followingCount: 0,
    });

    // Store private key separately for security
    await this.keysCollection.insertOne({
      actorId: actor.id,
      privateKeyPem: privateKey,
      createdAt: new Date(),
    });

    // Return formatted response
    return {
      id: actor.id,
      username: actor.preferredUsername,
      displayName: actor.name,
      bio: actor.summary || undefined,
      avatarUrl: actor.icon?.url,
      followersCount: 0,
      followingCount: 0,
    };
  }

  /**
   * Get actor by username
   * @param username Username to lookup
   * @returns Actor data or null if not found
   */
  async getActorByUsername(username: string): Promise<ActorResponse | null> {
    const actor = await this.actorsCollection.findOne({
      preferredUsername: username,
    });

    if (!actor) return null;

    return {
      id: actor.id,
      username: actor.preferredUsername,
      displayName: actor.name,
      bio: actor.summary || undefined,
      avatarUrl: actor.icon?.url,
      followersCount: actor.followersCount || 0,
      followingCount: actor.followingCount || 0,
    };
  }

  /**
   * Get full ActivityPub actor object by username
   * @param username Username to lookup
   * @returns Full Actor object for ActivityPub or null if not found
   */
  async getFullActorByUsername(username: string): Promise<Actor | null> {
    const actor = await this.actorsCollection.findOne({
      preferredUsername: username,
    });

    if (!actor) return null;

    // Convert MongoDB _id to regular Actor object
    const {
      _id,
      followersCount,
      followingCount,
      createdAt,
      updatedAt,
      ...actorData
    } = actor;

    return actorData as Actor;
  }

  /**
   * Get actor by ID
   * @param id Actor ID to lookup
   * @returns Actor data or null if not found
   */
  async getActorById(id: string): Promise<any> {
    try {
      let objectId: ObjectId;
      try {
        objectId = new ObjectId(id);
      } catch (error) {
        return null; // Invalid ObjectId format
      }

      const actor = await this.actorsCollection.findOne({
        $or: [{ _id: objectId }, { id: id }],
      });

      if (!actor) return null;

      return actor;
    } catch (error) {
      console.error("Error getting actor by ID:", error);
      return null;
    }
  }

  /**
   * Update actor information
   * @param username Username of actor to update
   * @param updates Fields to update
   * @param iconInfo Optional new icon information
   * @returns Updated actor data or null if not found
   */
  async updateActor(
    username: string,
    updates: { displayName?: string; bio?: string },
    iconInfo?: { url: string; mediaType: string }
  ): Promise<ActorResponse | null> {
    const updateData: any = { updatedAt: new Date() };

    if (updates.displayName) updateData.name = updates.displayName;
    if (updates.bio) updateData.summary = updates.bio;
    if (iconInfo) {
      updateData.icon = {
        type: "Image",
        mediaType: iconInfo.mediaType,
        url: iconInfo.url,
      };
    }

    const result = await this.actorsCollection.findOneAndUpdate(
      { preferredUsername: username },
      { $set: updateData },
      { returnDocument: "after" }
    );

    // Access the document correctly from the result object
    const updatedActor = result.value;
    if (!updatedActor) return null;

    return {
      id: updatedActor.id,
      username: updatedActor.preferredUsername,
      displayName: updatedActor.name,
      bio: updatedActor.summary || undefined,
      avatarUrl: updatedActor.icon?.url,
      followersCount: updatedActor.followersCount || 0,
      followingCount: updatedActor.followingCount || 0,
    };
  }

  /**
   * Delete an actor
   * @param username Username to delete
   * @returns True if deleted, false if not found
   */
  async deleteActor(username: string): Promise<boolean> {
    const actor = await this.actorsCollection.findOne({
      preferredUsername: username,
    });

    if (!actor) return false;

    // Delete actor and keys
    await this.actorsCollection.deleteOne({ preferredUsername: username });
    await this.keysCollection.deleteOne({ actorId: actor.id });

    return true;
  }

  getDb(): Db {
    return this.db;
  }
}

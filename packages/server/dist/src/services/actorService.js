'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorService = void 0;
const mongodb_1 = require('mongodb');
const crypto_1 = __importDefault(require('crypto'));
const actorRepository_1 = require('@/modules/actors/repositories/actorRepository');
const bcryptjs_1 = __importDefault(require('bcryptjs')); // Replace bcrypt with bcryptjs
class ActorService {
  constructor(db, domain) {
    this.repository = new actorRepository_1.ActorRepository(db);
    this.domain = domain;
  }
  async createActor(
    actorInputData, // Use defined interface instead of any
    iconInfo
  ) {
    // Validate required fields
    if (!actorInputData.password) {
      throw new Error('Password is required to create an actor');
    }
    // Generate keypair for ActivityPub federation
    const { publicKey, privateKey } = await this.generateKeyPair();
    // Prepare new actor object
    const actorId = new mongodb_1.ObjectId();
    const actor = {
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
    const hashedPassword = await bcryptjs_1.default.hash(
      String(actorInputData.password),
      10
    );
    actor.password = hashedPassword; // Replace the plain password with the hashed one
    // Wrap repository call in a try-catch block
    try {
      return await this.repository.create(actor);
    } catch (error) {
      console.error('Error creating actor in repository:', error);
      throw new Error('Failed to create actor');
    }
  }
  async getActorById(id) {
    return this.repository.findById(id);
  }
  async getActorByUsername(username) {
    return this.repository.findByUsername(username);
  }
  async updateProfile(id, updates) {
    return this.repository.updateProfile(id, updates);
  }
  async usernameExists(username) {
    return this.repository.usernameExists(username);
  }
  async getFollowers(actorId, page = 1, limit = 20) {
    return this.repository.findFollowers(actorId, page, limit);
  }
  async getFollowing(actorId, page = 1, limit = 20) {
    return this.repository.findFollowing(actorId, page, limit);
  }
  async followActor(actorId, targetActorId) {
    return this.repository.addFollowing(actorId, targetActorId);
  }
  async unfollowActor(actorId, targetActorId) {
    return this.repository.removeFollowing(actorId, targetActorId);
  }
  async updateActor(username, updates, iconInfo) {
    const updateData = {
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
  async deleteActor(id) {
    const result = await this.repository.deleteById(id);
    return result;
  }
  async getFullActorByUsername(username) {
    const actor = await this.repository.findByUsername(username);
    if (!actor) return null;
    return {
      ...actor,
    };
  }
  async searchActors(query, limit = 10) {
    return this.repository.search(query, limit);
  }
  async generateKeyPair() {
    return new Promise((resolve, reject) => {
      crypto_1.default.generateKeyPair(
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
exports.ActorService = ActorService;

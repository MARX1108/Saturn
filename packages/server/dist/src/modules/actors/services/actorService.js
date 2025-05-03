'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorService = void 0;
const mongodb_1 = require('mongodb');
const crypto = __importStar(require('crypto'));
const bcryptjs = __importStar(require('bcryptjs'));
const errors_1 = require('../../../utils/errors');
class ActorService {
  constructor(actorRepository, domain) {
    this.actorRepository = actorRepository;
    this.domain = domain;
  }
  // Setter for NotificationService
  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }
  // --- Create Local Actor ---
  async createLocalActor(data) {
    if (!data.password) {
      throw new errors_1.AppError(
        'Password is required for local actor creation',
        400,
        errors_1.ErrorType.BAD_REQUEST
      );
    }
    // Check if username or email already exists
    const existingByUsername = await this.actorRepository.findOne({
      preferredUsername: data.username,
    });
    if (existingByUsername) {
      throw new errors_1.AppError(
        'Username already taken',
        409,
        errors_1.ErrorType.CONFLICT
      );
    }
    const existingByEmail = await this.actorRepository.findOne({
      email: data.email,
    });
    if (existingByEmail) {
      throw new errors_1.AppError(
        'Email already registered',
        409,
        errors_1.ErrorType.CONFLICT
      );
    }
    const actorId = new mongodb_1.ObjectId();
    const hashedPassword = await bcryptjs.hash(data.password, 10);
    const actorAPID = `https://${this.domain}/users/${data.username}`;
    const now = new Date();
    // Generate Keypair (replace with more robust key generation/storage)
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const newActor = {
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
    });
    return createdActor;
  }
  // --- Get Actor By ID (Internal ObjectId) ---
  async getActorById(id) {
    const objectId = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
    return this.actorRepository.findById(objectId);
  }
  // --- Get Actor By AP ID (URL) ---
  async getActorByApId(apId) {
    return this.actorRepository.findOne({ id: apId });
  }
  // --- Get Actor By Username (preferredUsername) ---
  async getActorByUsername(username) {
    // Use repository method
    return this.actorRepository.findByPreferredUsername(username);
  }
  // --- Get Actor By Full Username (user@domain) ---
  async getActorByFullUsername(fullUsername) {
    // Search by the full username field
    return this.actorRepository.findOne({ username: fullUsername });
  }
  // --- Search Actors ---
  async searchActors(query, limit = 10) {
    // Call repository method
    return this.actorRepository.search(query, limit);
  }
  // --- Update Actor Profile ---
  async updateActorProfile(actorId, updates) {
    // Call repository method
    return this.actorRepository.updateProfile(actorId, updates);
  }
  // --- Update Actor (by username) ---
  // Keep this method name if controllers/tests use it, but have it call repo
  async updateActor(
    username, // Assuming it should update by username
    updates
  ) {
    // Call repository method
    return this.actorRepository.updateProfileByUsername(username, updates);
  }
  // --- Delete Actor (by username) ---
  // Keep this method name if controllers/tests use it, but have it call repo
  async deleteActor(username) {
    // Call repository method and return its boolean result
    return this.actorRepository.deleteByUsername(username);
  }
  // --- Follow Actor ---
  async follow(followerId, followeeApId) {
    const follower = await this.getActorById(followerId);
    if (!follower)
      throw new errors_1.AppError(
        'Follower not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    // TODO: Fetch followee actor (local or remote)
    // const followee = await this.getActorByApId(followeeApId) || await this.fetchRemoteActor(followeeApId);
    const followee = await this.getActorByApId(followeeApId);
    if (!followee)
      throw new errors_1.AppError(
        'Followee not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
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
  async unfollow(followerId, followeeApId) {
    const follower = await this.getActorById(followerId);
    if (!follower)
      throw new errors_1.AppError(
        'Follower not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
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
  async getFollowers(actorApId, page = 1, limit = 20) {
    // Call repository method
    return this.actorRepository.findFollowers(actorApId, page, limit);
  }
  // --- Get Following (Requires pagination) ---
  async getFollowing(actorId, page = 1, limit = 20) {
    // Call repository method
    return this.actorRepository.findFollowing(actorId, page, limit);
  }
  // --- Fetch Remote Actor (Basic Example) ---
  fetchRemoteActor(actorUrl) {
    // TODO: Implement proper ActivityPub actor fetching and validation
    console.warn(`Fetching remote actor ${actorUrl} not implemented`);
    return Promise.resolve(null);
  }
  // Call repository method
  async usernameExists(username) {
    return this.actorRepository.usernameExists(username);
  }
}
exports.ActorService = ActorService;

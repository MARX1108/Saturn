'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorService = void 0;
const crypto_1 = __importDefault(require('crypto'));
const notification_1 = require('../../notifications/models/notification');
class ActorService {
  constructor(repository, notificationService, domain) {
    this.repository = repository;
    this.notificationService = notificationService;
    this.domain = domain;
  }
  async createActor(username, displayName, avatarUrl) {
    const keyPair = await this.generateKeyPair();
    const actor = {
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
    const success = await this.repository.addFollowing(actorId, targetActorId);
    if (success) {
      // Create notification for the followed user
      await this.notificationService.createNotification({
        recipientUserId: targetActorId,
        actorUserId: actorId,
        type: notification_1.NotificationType.FOLLOW,
        read: false,
      });
    }
    return success;
  }
  async unfollowActor(actorId, targetActorId) {
    return this.repository.removeFollowing(actorId, targetActorId);
  }
  async updateActor(id, data) {
    // Implementation
    return null;
  }
  async deleteActor(id) {
    // Implementation
    return true;
  }
  async getFullActorByUsername(username) {
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
  async searchActors(query) {
    // Implementation
    return [];
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

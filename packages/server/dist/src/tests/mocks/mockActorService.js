'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MockActorService = void 0;
const mongodb_1 = require('mongodb');
class MockActorService {
  constructor(domain = 'test.domain') {
    this.actors = new Map();
    this.domain = domain;
  }
  async usernameExists(username) {
    return this.actors.has(username);
  }
  async getActorByUsername(username) {
    return this.actors.get(username) || null;
  }
  async createActor(actorData, iconInfo) {
    const actor = {
      _id: new mongodb_1.ObjectId().toString(),
      preferredUsername: actorData.preferredUsername || 'unknown',
      name: actorData.name || actorData.preferredUsername || 'unknown',
      username: actorData.username || actorData.preferredUsername || 'unknown',
      displayName:
        actorData.displayName ||
        actorData.name ||
        actorData.preferredUsername ||
        'unknown',
      summary: actorData.summary || '',
      id: `https://${this.domain}/users/${actorData.preferredUsername}`,
      inbox: `https://${this.domain}/users/${actorData.preferredUsername}/inbox`,
      outbox: `https://${this.domain}/users/${actorData.preferredUsername}/outbox`,
      followers: `https://${this.domain}/users/${actorData.preferredUsername}/followers`,
      type: 'Person',
      icon: iconInfo || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      bio: actorData.bio || '',
    };
    this.actors.set(actor.preferredUsername, actor);
    return actor;
  }
  async updateActor(username, updates, iconInfo) {
    const actor = this.actors.get(username);
    if (!actor) {
      return null;
    }
    const updatedActor = {
      ...actor,
      name: updates.name || actor.name,
      summary: updates.summary || actor.summary,
      bio: updates.bio || actor.bio,
      icon: iconInfo || actor.icon,
      updatedAt: new Date(),
    };
    this.actors.set(username, updatedActor);
    return updatedActor;
  }
  async deleteActor(username) {
    if (!this.actors.has(username)) {
      return false;
    }
    this.actors.delete(username);
    return true;
  }
}
exports.MockActorService = MockActorService;

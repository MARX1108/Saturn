import { jest } from '@jest/globals';
import { DeepMockProxy } from 'jest-mock-extended';
import { Actor } from '@/modules/actors/models/actor';
import { ObjectId } from 'mongodb';

// Create a simple in-memory store for actors
const actors = new Map<string, Actor>();

export const mockActorService: DeepMockProxy<any> = {
  getActorById: jest.fn().mockImplementation(async id => {
    // Handle ObjectId or string ID
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return actors.get(objectId.toString()) || null;
  }),

  getActorByUsername: jest.fn().mockImplementation(async username => {
    for (const actor of actors.values()) {
      if (actor.username === username || actor.preferredUsername === username) {
        return actor;
      }
    }
    return null;
  }),

  resolveActor: jest.fn().mockImplementation(async identifier => {
    // Simplified resolve logic for mock
    for (const actor of actors.values()) {
      if (
        actor.id === identifier ||
        actor.username === identifier ||
        actor.preferredUsername === identifier
      ) {
        return actor;
      }
    }
    return null;
  }),

  createActor: jest
    .fn()
    .mockImplementation(async (actorData: Partial<Actor>) => {
      const newId = new ObjectId();
      const fullUsername = `${actorData.preferredUsername}@test.domain`;
      const actorIdUrl = `https://test.domain/users/${actorData.preferredUsername}`;
      const actor: Actor = {
        _id: newId,
        id: actorIdUrl,
        type: 'Person',
        username: fullUsername,
        preferredUsername: actorData.preferredUsername || 'unknown',
        email: actorData.email || `${actorData.preferredUsername}@test.domain`,
        displayName:
          actorData.displayName || actorData.preferredUsername || 'unknown',
        summary: actorData.summary || '',
        inbox: `${actorIdUrl}/inbox`,
        outbox: `${actorIdUrl}/outbox`,
        followers: `${actorIdUrl}/followers`,
        following: actorData.following || [],
        password: actorData.password,
        publicKey: actorData.publicKey,
        privateKey: actorData.privateKey,
        icon: actorData.icon,
        isAdmin: actorData.isAdmin || false,
        isVerified: actorData.isVerified || false,
        createdAt: actorData.createdAt || new Date(),
        updatedAt: actorData.updatedAt || new Date(),
        '@context': actorData['@context'] || [
          'https://www.w3.org/ns/activitystreams',
        ],
      };
      actors.set(newId.toString(), actor);
      return actor;
    }),

  updateActor: jest.fn().mockImplementation(async (id, updates) => {
    const actor = actors.get(id.toString());
    if (!actor) {
      return null;
    }
    const { _id, ...validUpdates } = updates;
    const updatedActor: Actor = {
      ...actor,
      ...validUpdates,
      displayName: updates.displayName || actor.displayName,
      summary: updates.summary || actor.summary,
      updatedAt: new Date(),
    };
    actors.set(actor._id.toString(), updatedActor);
    return updatedActor;
  }),

  searchActors: jest.fn().mockImplementation(async (query: string) => {
    if (!query) {
      return Array.from(actors.values());
    }
    const regex = new RegExp(query, 'i');
    return Array.from(actors.values()).filter(
      actor =>
        regex.test(actor.username) ||
        regex.test(actor.preferredUsername) ||
        regex.test(actor.displayName)
    );
  }),

  follow: jest.fn().mockResolvedValue(undefined),
  unfollow: jest.fn().mockResolvedValue(undefined),
};

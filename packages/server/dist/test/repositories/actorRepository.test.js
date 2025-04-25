'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const mongodb_1 = require('mongodb');
const actorRepository_1 = require('@/modules/actors/repositories/actorRepository');
describe('ActorRepository', () => {
  let db;
  let actorRepository;
  const testDomain = 'test.domain';
  beforeAll(() => {
    if (!global.mongoDb) {
      throw new Error(
        'Global mongoDb instance not found. Ensure test/setup.ts ran correctly.'
      );
    }
    db = global.mongoDb;
    actorRepository = new actorRepository_1.ActorRepository(db);
  });
  beforeEach(async () => {
    if (!db) {
      throw new Error('DB not initialized in beforeEach');
    }
    await db.collection('actors').deleteMany({});
  });
  const createActor = async data => {
    const username = data.preferredUsername || `user_${Date.now()}`;
    const actorData = {
      id: data.id || `https://${testDomain}/users/${username}`,
      type: data.type || 'Person',
      username: data.username || `${username}@${testDomain}`,
      preferredUsername: username,
      displayName: data.displayName || `${username} Display Name`,
      summary: data.summary || '',
      inbox: data.inbox || `https://${testDomain}/users/${username}/inbox`,
      outbox: data.outbox || `https://${testDomain}/users/${username}/outbox`,
      followers:
        data.followers || `https://${testDomain}/users/${username}/followers`,
      following: data.following || [],
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      publicKey: data.publicKey || { id: '', owner: '', publicKeyPem: '' },
      password: data.password || 'hashedPassword',
      ...data,
    };
    const result = await db.collection('actors').insertOne(actorData);
    // Ensure the result object has all the required fields from Actor
    return {
      ...actorData,
      _id: result.insertedId,
    }; // Use a proper type assertion here
  };
  describe('create', () => {
    it('should create a new actor with valid data', async () => {
      const result = await createActor({ preferredUsername: 'createuser' });
      expect(result).toBeDefined();
      expect(result.preferredUsername).toBe('createuser');
      expect(result._id).toBeInstanceOf(mongodb_1.ObjectId);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      const found = await db.collection('actors').findOne({ _id: result._id });
      expect(found).toBeDefined();
      expect(found?.preferredUsername).toBe('createuser');
    });
    it('should enforce unique preferredUsernames (if index exists)', async () => {
      await createActor({ preferredUsername: 'uniqueuser' });
      await expect(
        createActor({ preferredUsername: 'uniqueuser' })
      ).rejects.toThrow(/duplicate key error/);
    });
  });
  describe('findByUsername (preferredUsername)', () => {
    it('should find an actor by preferredUsername', async () => {
      const createdActor = await createActor({ preferredUsername: 'findme' });
      const result = await actorRepository.findByPreferredUsername('findme');
      expect(result).toBeDefined();
      expect(result?._id).toEqual(createdActor._id);
      expect(result?.preferredUsername).toBe('findme');
    });
    it('should return null when preferredUsername not found', async () => {
      const result =
        await actorRepository.findByPreferredUsername('nosuchuser');
      expect(result).toBeNull();
    });
  });
  describe('findById', () => {
    it('should find an actor by ObjectId', async () => {
      const createdActor = await createActor({ preferredUsername: 'findbyid' });
      const result = await actorRepository.findById(createdActor._id);
      expect(result).toBeDefined();
      expect(result?._id).toEqual(createdActor._id);
    });
    it('should find an actor by string ID representation', async () => {
      const createdActor = await createActor({
        preferredUsername: 'findbyidstring',
      });
      const stringId = createdActor._id.toHexString();
      const result = await actorRepository.findById(stringId);
      expect(result).toBeDefined();
      expect(result?._id).toEqual(createdActor._id);
    });
    it('should return null when ID not found', async () => {
      const nonExistentId = new mongodb_1.ObjectId();
      const result = await actorRepository.findById(nonExistentId);
      expect(result).toBeNull();
    });
    it('should return null for invalid ID format', async () => {
      const invalidId = 'not-an-object-id';
      const result = await actorRepository.findById(invalidId);
      expect(result).toBeNull();
    });
  });
  describe('updateProfile', () => {
    it('should update profile fields for an actor', async () => {
      const actor = await createActor({
        preferredUsername: 'profileupdate',
        displayName: 'Initial Name',
        summary: 'Initial Bio',
      });
      const actorId = actor._id;
      const updates = {
        displayName: 'Updated Name',
        summary: 'Updated Bio',
        icon: {
          type: 'Image',
          url: 'new-icon.jpg',
          mediaType: 'image/jpeg',
        },
      };
      const updateResult = await actorRepository.updateProfile(
        actorId,
        updates
      );
      expect(updateResult).toBeDefined();
      expect(updateResult?._id).toEqual(actorId);
      const updatedActor = await actorRepository.findById(actorId);
      expect(updatedActor).toBeDefined();
      expect(updatedActor?.displayName).toBe('Updated Name');
      expect(updatedActor?.summary).toBe('Updated Bio');
      expect(updatedActor?.icon?.url).toBe('new-icon.jpg');
    });
    it('should only update specified fields', async () => {
      const actor = await createActor({
        preferredUsername: 'partialupdate',
        displayName: 'Keep Me',
        summary: 'Original Summary',
      });
      const actorId = actor._id;
      const updates = { summary: 'New Summary' };
      const updateResult = await actorRepository.updateProfile(
        actorId,
        updates
      );
      expect(updateResult).toBeDefined();
      const updatedActor = await actorRepository.findById(actorId);
      expect(updatedActor?.displayName).toBe('Keep Me');
      expect(updatedActor?.summary).toBe('New Summary');
    });
    it('should return null if actor does not exist', async () => {
      const nonExistentId = new mongodb_1.ObjectId();
      const updates = { displayName: 'No Such Actor' };
      const updateResult = await actorRepository.updateProfile(
        nonExistentId,
        updates
      );
      expect(updateResult).toBeNull();
    });
    it('should handle updates with undefined fields gracefully', async () => {
      const actor = await createActor({ preferredUsername: 'undefupdate' });
      const actorId = actor._id;
      const updates = { displayName: undefined };
      const updateResult = await actorRepository.updateProfile(
        actorId,
        updates
      );
      expect(updateResult).toBeDefined();
      const updatedActor = await actorRepository.findById(actorId);
      expect(updatedActor?.displayName).toBeNull();
    });
  });
  describe('usernameExists', () => {
    it('should return true if preferredUsername exists', async () => {
      await createActor({ preferredUsername: 'existinguser' });
      const exists = await actorRepository.usernameExists('existinguser');
      expect(exists).toBe(true);
    });
    it('should return false if preferredUsername does not exist', async () => {
      const exists = await actorRepository.usernameExists('nonexistinguser');
      expect(exists).toBe(false);
    });
  });
  describe('Follow/Unfollow Logic (addFollowing, removeFollowing, findFollowers, findFollowing)', () => {
    let actor1;
    let actor2;
    let actor3;
    beforeEach(async () => {
      actor1 = await createActor({ preferredUsername: 'actor1' });
      actor2 = await createActor({ preferredUsername: 'actor2' });
      actor3 = await createActor({ preferredUsername: 'actor3' });
    });
    describe('addFollowing / removeFollowing', () => {
      it('should add a target actor ID to the following list', async () => {
        const result = await actorRepository.addFollowing(
          actor1._id,
          actor2.id
        );
        expect(result).toBe(true);
        const updatedActor1 = await actorRepository.findById(actor1._id);
        expect(updatedActor1?.following).toContainEqual(actor2.id);
      });
      it('should not add the same actor twice (idempotent)', async () => {
        await actorRepository.addFollowing(actor1._id, actor2.id);
        const result = await actorRepository.addFollowing(
          actor1._id,
          actor2.id
        );
        expect(result).toBe(false);
        const updatedActor1 = await actorRepository.findById(actor1._id);
        expect(updatedActor1?.following).toHaveLength(1);
        expect(updatedActor1?.following).toContainEqual(actor2.id);
      });
      it('should remove a target actor ID from the following list', async () => {
        await actorRepository.addFollowing(actor1._id, actor2.id);
        const result = await actorRepository.removeFollowing(
          actor1._id,
          actor2.id
        );
        expect(result).toBe(true);
        const updatedActor1 = await actorRepository.findById(actor1._id);
        expect(updatedActor1?.following).not.toContainEqual(actor2.id);
      });
      it('should return false when trying to remove an actor not being followed', async () => {
        const result = await actorRepository.removeFollowing(
          actor1._id,
          actor2.id
        );
        expect(result).toBe(false);
      });
    });
    describe('findFollowing', () => {
      it('should return a list of actors being followed', async () => {
        await actorRepository.addFollowing(actor1._id, actor2.id);
        await actorRepository.addFollowing(actor1._id, actor3.id);
        const followingList = await actorRepository.findFollowing(actor1._id);
        expect(followingList).toHaveLength(2);
        expect(followingList.map(a => a.id)).toContainEqual(actor2.id);
        expect(followingList.map(a => a.id)).toContainEqual(actor3.id);
      });
      it('should return an empty list if the actor is following no one', async () => {
        const followingList = await actorRepository.findFollowing(actor1._id);
        expect(followingList).toHaveLength(0);
      });
      it('should return an empty list if the actor does not exist', async () => {
        const nonExistentId = new mongodb_1.ObjectId();
        const followingList =
          await actorRepository.findFollowing(nonExistentId);
        expect(followingList).toHaveLength(0);
      });
      it('should handle pagination correctly', async () => {
        await actorRepository.addFollowing(actor1._id, actor2.id);
        await actorRepository.addFollowing(actor1._id, actor3.id);
        const actor4 = await createActor({ preferredUsername: 'actor4' });
        await actorRepository.addFollowing(actor1._id, actor4.id);
        const page1 = await actorRepository.findFollowing(actor1._id, 1, 2);
        expect(page1).toHaveLength(2);
        const page2 = await actorRepository.findFollowing(actor1._id, 2, 2);
        expect(page2).toHaveLength(1);
        const page3 = await actorRepository.findFollowing(actor1._id, 3, 2);
        expect(page3).toHaveLength(0);
      });
    });
    describe('findFollowers', () => {
      it('should return a list of actors who are following the given actor', async () => {
        await actorRepository.addFollowing(actor2._id, actor1.id);
        await actorRepository.addFollowing(actor3._id, actor1.id);
        const followersList = await actorRepository.findFollowers(actor1.id);
        expect(followersList).toHaveLength(2);
        expect(followersList.map(a => a.id)).toContainEqual(actor2.id);
        expect(followersList.map(a => a.id)).toContainEqual(actor3.id);
      });
      it('should return an empty list if the actor has no followers', async () => {
        const followersList = await actorRepository.findFollowers(actor1.id);
        expect(followersList).toHaveLength(0);
      });
      it('should return an empty list if the actor does not exist', async () => {
        const nonExistentId = new mongodb_1.ObjectId();
        const nonExistentApId = `https://${testDomain}/users/nonexistent`;
        const followersList =
          await actorRepository.findFollowers(nonExistentApId);
        expect(followersList).toHaveLength(0);
      });
      it('should handle pagination correctly', async () => {
        await actorRepository.addFollowing(actor2._id, actor1.id);
        await actorRepository.addFollowing(actor3._id, actor1.id);
        const actor4 = await createActor({ preferredUsername: 'follower4' });
        await actorRepository.addFollowing(actor4._id, actor1.id);
        const page1 = await actorRepository.findFollowers(actor1.id, 1, 2);
        expect(page1).toHaveLength(2);
        const page2 = await actorRepository.findFollowers(actor1.id, 2, 2);
        expect(page2).toHaveLength(1);
        const page3 = await actorRepository.findFollowers(actor1.id, 3, 2);
        expect(page3).toHaveLength(0);
      });
    });
  });
  describe('updateProfileByUsername', () => {
    it('should update profile fields by username', async () => {
      await createActor({
        preferredUsername: 'updatebyun',
        displayName: 'Old Name',
      });
      const updates = {
        displayName: 'New Name',
        summary: 'New Summary from updateByUsername',
      };
      const result = await actorRepository.updateProfileByUsername(
        'updatebyun',
        updates
      );
      expect(result).toBeDefined();
      const updatedActor =
        await actorRepository.findByPreferredUsername('updatebyun');
      expect(updatedActor?.displayName).toBe('New Name');
      expect(updatedActor?.summary).toBe('New Summary from updateByUsername');
    });
    it('should return null if username does not exist', async () => {
      const updates = { displayName: 'Wont Update' };
      const result = await actorRepository.updateProfileByUsername(
        'nosuchun',
        updates
      );
      expect(result).toBeNull();
    });
  });
  describe('deleteByUsername', () => {
    it('should delete an actor by username', async () => {
      await createActor({ preferredUsername: 'deletebyun' });
      const result = await actorRepository.deleteByUsername('deletebyun');
      expect(result).toBe(true);
      const deletedActor =
        await actorRepository.findByPreferredUsername('deletebyun');
      expect(deletedActor).toBeNull();
    });
    it('should return deletedCount 0 if username does not exist', async () => {
      const result = await actorRepository.deleteByUsername('nosuchun');
      expect(result).toBe(false);
    });
  });
  describe('search (using search for now)', () => {
    beforeEach(async () => {
      await createActor({
        preferredUsername: 'searchUserA',
        displayName: 'Search A',
      });
      await createActor({
        preferredUsername: 'searchUserB',
        displayName: 'Search B',
      });
      await createActor({
        preferredUsername: 'anotherUser',
        displayName: 'Another Name',
      });
    });
    it('should find actors matching the query (case-insensitive)', async () => {
      const results = await actorRepository.search('search');
      expect(results).toHaveLength(2);
      const names = results.map(a => a.preferredUsername);
      expect(names).toContain('searchUserA');
      expect(names).toContain('searchUserB');
      const displayNames = results.map(a => a.displayName);
      expect(displayNames).toContain('Search A');
      expect(displayNames).toContain('Search B');
    });
    it('should return an empty array if no actors match', async () => {
      const results = await actorRepository.search('nomatch');
      expect(results).toHaveLength(0);
    });
    it('should find specific actor by exact preferredUsername match', async () => {
      const results = await actorRepository.search('searchUserA');
      expect(results).toHaveLength(1);
      expect(results[0].preferredUsername).toBe('searchUserA');
    });
    it('should find specific actor by exact displayName match', async () => {
      const results = await actorRepository.search('Search B');
      expect(results).toHaveLength(1);
      expect(results[0].displayName).toBe('Search B');
    });
    it('should respect the limit parameter', async () => {
      const results = await actorRepository.search('search', 1);
      expect(results).toHaveLength(1);
    });
    it('should return empty if query is empty', async () => {
      const results = await actorRepository.search('');
      expect(results).toHaveLength(0);
    });
  });
});

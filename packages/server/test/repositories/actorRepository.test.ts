import { MongoClient, Db, ObjectId, WithId } from 'mongodb';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository'; // Use alias
// Adjust path for testUtils if it's moved or use alias @test/
import { setupTestDb, teardownTestDb } from '@test/helpers/testUtils';
import { Actor } from '@/modules/actors/models/actor'; // Import Actor model
import { jest } from '@jest/globals'; // Use globals for jest

jest.setTimeout(10000); // Increase timeout to 10 seconds for long-running tests

describe('ActorRepository', () => {
  let client: MongoClient;
  let db: Db;
  let actorRepository: ActorRepository;
  const testDomain = 'test.domain'; // Define test domain if needed for IDs

  beforeAll(async () => {
    const setup = await setupTestDb();
    client = setup.client;
    db = setup.db;
    actorRepository = new ActorRepository(db);
  });

  afterAll(async () => {
    await teardownTestDb(client, db);
  });

  beforeEach(async () => {
    await db.collection<Actor>('actors').deleteMany({});
  });

  // Helper to create actor with defaults matching Actor interface
  const createActor = async (data: Partial<Actor>): Promise<Actor> => {
    const actorId = data._id || new ObjectId();
    const username =
      data.preferredUsername || `testuser-${actorId.toHexString()}`;
    const actorData: Actor = {
      _id: actorId,
      id: data.id || `https://${testDomain}/users/${username}`,
      type: 'Person',
      username: data.username || `${username}@${testDomain}`,
      preferredUsername: username,
      name: data.name || 'Test User',
      displayName: data.displayName || data.name || 'Test User',
      summary: data.summary || '',
      inbox: data.inbox || `https://${testDomain}/users/${username}/inbox`,
      outbox: data.outbox || `https://${testDomain}/users/${username}/outbox`,
      followers:
        data.followers || `https://${testDomain}/users/${username}/followers`,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      publicKey: data.publicKey || { id: '', owner: '', publicKeyPem: '' }, // Provide default publicKey
      // Add other required fields with defaults if necessary
      password: data.password || 'hashedPassword', // Example, might not be needed if excluded
      following: data.following || [],
      ...data, // Spread remaining partial data
    };
    // Ensure we insert data that matches the Actor schema
    const result = await db
      .collection<Actor>('actors')
      .insertOne(actorData as any);
    return { ...actorData, _id: result.insertedId };
  };

  describe('create', () => {
    it('should create a new actor with valid data', async () => {
      const result = await createActor({ preferredUsername: 'createuser' });

      expect(result).toBeDefined();
      expect(result.preferredUsername).toBe('createuser');
      expect(result._id).toBeInstanceOf(ObjectId);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      const found = await db
        .collection<Actor>('actors')
        .findOne({ _id: result._id });
      expect(found).toBeDefined();
      expect(found?.preferredUsername).toBe('createuser');
    });

    it('should enforce unique preferredUsernames (if index exists)', async () => {
      await createActor({ preferredUsername: 'uniqueuser' });
      // Expect the second creation with the same preferredUsername to fail due to unique index
      await expect(
        createActor({ preferredUsername: 'uniqueuser' })
      ).rejects.toThrow(
        /duplicate key error/ // Check for MongoDB duplicate key error
      );
    });
  });

  describe('findByUsername (preferredUsername)', () => {
    it('should find an actor by preferredUsername', async () => {
      const createdActor = await createActor({ preferredUsername: 'findme' });
      const result = await actorRepository.findByUsername('findme');

      expect(result).toBeDefined();
      expect(result?._id).toEqual(createdActor._id);
      expect(result?.preferredUsername).toBe('findme');
    });

    it('should return null when preferredUsername not found', async () => {
      const result = await actorRepository.findByUsername('nosuchuser');
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
      const nonExistentId = new ObjectId();
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
          type: 'Image' as const,
          url: 'new-icon.jpg',
          mediaType: 'image/jpeg',
        },
      };

      const updateResult = await actorRepository.updateProfile(
        actorId,
        updates
      );
      expect(updateResult).toBe(true);

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
      expect(updateResult).toBe(true);

      const updatedActor = await actorRepository.findById(actorId);
      expect(updatedActor?.displayName).toBe('Keep Me'); // Should not change
      expect(updatedActor?.summary).toBe('New Summary'); // Should change
    });

    it('should return false if actor does not exist', async () => {
      const nonExistentId = new ObjectId();
      const updates = { displayName: 'No Such Actor' };
      const updateResult = await actorRepository.updateProfile(
        nonExistentId,
        updates
      );
      expect(updateResult).toBe(false);
    });

    it('should handle updates with undefined fields gracefully', async () => {
      const actor = await createActor({ preferredUsername: 'undefupdate' });
      const actorId = actor._id;
      const updates = { displayName: undefined }; // Try to set undefined

      // Update should succeed, but field might not be set or might be removed ($unset?)
      // Depending on repository logic, check outcome
      const updateResult = await actorRepository.updateProfile(
        actorId,
        updates
      );
      expect(updateResult).toBe(true); // Or false if no change is made

      const updatedActor = await actorRepository.findById(actorId);
      // Check if displayName is still the default or potentially unset
      expect(updatedActor?.displayName).toBe('Test User'); // Assuming default if not explicitly updated
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
    let actor1: Actor;
    let actor2: Actor;
    let actor3: Actor;

    beforeEach(async () => {
      // Create actors for follow tests
      actor1 = await createActor({ preferredUsername: 'actor1' });
      actor2 = await createActor({ preferredUsername: 'actor2' });
      actor3 = await createActor({ preferredUsername: 'actor3' });
    });

    describe('addFollowing / removeFollowing', () => {
      it('should add a target actor ID to the following list', async () => {
        const result = await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        );
        expect(result).toBe(true);

        const updatedActor1 = await actorRepository.findById(actor1._id);
        expect(updatedActor1?.following).toContainEqual(actor2._id);
      });

      it('should not add the same actor twice (idempotent)', async () => {
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        ); // First add
        const result = await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        ); // Second add
        expect(result).toBe(false); // Should return false as no modification was made

        const updatedActor1 = await actorRepository.findById(actor1._id);
        expect(updatedActor1?.following).toHaveLength(1);
        expect(updatedActor1?.following).toContainEqual(actor2._id);
      });

      it('should remove a target actor ID from the following list', async () => {
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        ); // Follow first
        const result = await actorRepository.removeFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        );
        expect(result).toBe(true);

        const updatedActor1 = await actorRepository.findById(actor1._id);
        expect(updatedActor1?.following).not.toContainEqual(actor2._id);
      });

      it('should return false when trying to remove an actor not being followed', async () => {
        const result = await actorRepository.removeFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        );
        expect(result).toBe(false);
      });
    });

    describe('findFollowing', () => {
      it('should return a list of actors being followed', async () => {
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        );
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor3._id.toHexString()
        );

        const followingList = await actorRepository.findFollowing(
          actor1._id.toHexString()
        );
        expect(followingList).toHaveLength(2);
        expect(followingList.map(a => a._id)).toContainEqual(actor2._id);
        expect(followingList.map(a => a._id)).toContainEqual(actor3._id);
      });

      it('should return an empty list if the actor is following no one', async () => {
        const followingList = await actorRepository.findFollowing(
          actor1._id.toHexString()
        );
        expect(followingList).toHaveLength(0);
      });

      it('should return an empty list if the actor does not exist', async () => {
        const nonExistentId = new ObjectId();
        const followingList = await actorRepository.findFollowing(
          nonExistentId.toHexString()
        );
        expect(followingList).toHaveLength(0);
      });

      it('should handle pagination correctly', async () => {
        // Follow 3 actors
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor2._id.toHexString()
        );
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor3._id.toHexString()
        );
        const actor4 = await createActor({ preferredUsername: 'actor4' });
        await actorRepository.addFollowing(
          actor1._id.toHexString(),
          actor4._id.toHexString()
        );

        // Page 1, Limit 2
        const page1 = await actorRepository.findFollowing(
          actor1._id.toHexString(),
          1,
          2
        );
        expect(page1).toHaveLength(2);

        // Page 2, Limit 2
        const page2 = await actorRepository.findFollowing(
          actor1._id.toHexString(),
          2,
          2
        );
        expect(page2).toHaveLength(1); // Only one remaining

        // Page 3, Limit 2
        const page3 = await actorRepository.findFollowing(
          actor1._id.toHexString(),
          3,
          2
        );
        expect(page3).toHaveLength(0);
      });
    });

    describe('findFollowers', () => {
      it('should return a list of actors who are following the given actor', async () => {
        // actor2 follows actor1, actor3 follows actor1
        await actorRepository.addFollowing(
          actor2._id.toHexString(),
          actor1._id.toHexString()
        );
        await actorRepository.addFollowing(
          actor3._id.toHexString(),
          actor1._id.toHexString()
        );

        const followersList = await actorRepository.findFollowers(
          actor1._id.toHexString()
        );
        expect(followersList).toHaveLength(2);
        expect(followersList.map(a => a._id)).toContainEqual(actor2._id);
        expect(followersList.map(a => a._id)).toContainEqual(actor3._id);
      });

      it('should return an empty list if the actor has no followers', async () => {
        const followersList = await actorRepository.findFollowers(
          actor1._id.toHexString()
        );
        expect(followersList).toHaveLength(0);
      });

      it('should return an empty list if the actor does not exist', async () => {
        const nonExistentId = new ObjectId();
        const followersList = await actorRepository.findFollowers(
          nonExistentId.toHexString()
        );
        expect(followersList).toHaveLength(0);
      });

      it('should handle pagination correctly', async () => {
        // actor2, actor3, actor4 follow actor1
        await actorRepository.addFollowing(
          actor2._id.toHexString(),
          actor1._id.toHexString()
        );
        await actorRepository.addFollowing(
          actor3._id.toHexString(),
          actor1._id.toHexString()
        );
        const actor4 = await createActor({ preferredUsername: 'follower4' });
        await actorRepository.addFollowing(
          actor4._id.toHexString(),
          actor1._id.toHexString()
        );

        // Page 1, Limit 2
        const page1 = await actorRepository.findFollowers(
          actor1._id.toHexString(),
          1,
          2
        );
        expect(page1).toHaveLength(2);

        // Page 2, Limit 2
        const page2 = await actorRepository.findFollowers(
          actor1._id.toHexString(),
          2,
          2
        );
        expect(page2).toHaveLength(1);

        // Page 3, Limit 2
        const page3 = await actorRepository.findFollowers(
          actor1._id.toHexString(),
          3,
          2
        );
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

      const updates: Partial<Actor> = {
        displayName: 'New Name',
        summary: 'New Summary from updateByUsername',
      };

      const result = await actorRepository.updateProfileByUsername(
        'updatebyun',
        updates
      );
      expect(result).toBe(true);

      const updatedActor = await actorRepository.findByUsername('updatebyun');
      expect(updatedActor?.displayName).toBe('New Name');
      expect(updatedActor?.summary).toBe('New Summary from updateByUsername');
    });

    it('should return false if username does not exist', async () => {
      const updates: Partial<Actor> = { displayName: 'Wont Update' };
      const result = await actorRepository.updateProfileByUsername(
        'nosuchun',
        updates
      );
      expect(result).toBe(false);
    });
  });

  describe('deleteByUsername', () => {
    it('should delete an actor by username', async () => {
      await createActor({ preferredUsername: 'deletebyun' });
      const result = await actorRepository.deleteByUsername('deletebyun');
      expect(result).toBe(true);

      const deletedActor = await actorRepository.findByUsername('deletebyun');
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
      // Check based on preferredUsername or displayName
      const names = results.map((a: WithId<Actor>) => a.preferredUsername);
      expect(names).toContain('searchUserA');
      expect(names).toContain('searchUserB');
      const displayNames = results.map((a: WithId<Actor>) => a.displayName);
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

    // Add tests for limit if implemented in search
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

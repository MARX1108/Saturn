import { MongoClient, Db, ObjectId, WithId } from 'mongodb';
import { ActorRepository } from '@/repositories/actorRepository'; // Corrected path using @/
import { setupTestDb, teardownTestDb } from '@test/helpers/testUtils'; // Corrected path using @test/
import { Actor } from '@/modules/actors/models/actor'; // Import Actor type

jest.setTimeout(10000); // Increase timeout to 10 seconds for long-running tests

describe('ActorRepository', () => {
  let client: MongoClient;
  let db: Db;
  let actorRepository: ActorRepository;
  let actor1: WithId<Actor>; // Use WithId<Actor> for actors with _id
  let actor2: WithId<Actor>;
  let actor3: WithId<Actor>;
  let actor4: WithId<Actor>;
  let nonExistentId: string;

  // Helper function to create actors consistently
  const createActor = async (
    username: string,
    domain: string,
  ): Promise<WithId<Actor>> => {
    const actorData = {
      username: username,
      domain: domain,
      preferredUsername: username.split('@')[0],
      name: `${username.split('@')[0]} Name`,
      summary: `${username.split('@')[0]} Summary`,
      type: 'Person' as const,
      inboxUrl: `https://${domain}/inbox/${username.split('@')[0]}`,
      outboxUrl: `https://${domain}/outbox/${username.split('@')[0]}`,
      followersUrl: `https://${domain}/followers/${username.split('@')[0]}`,
      followingUrl: `https://${domain}/following/${username.split('@')[0]}`,
      publicKey: 'test-public-key', // Add missing required fields
      privateKey: 'test-private-key', // Add missing required fields
      // other fields...
      // Ensure all required fields from Actor model are present
    };
    // Use the repository's create method which handles ObjectId generation
    const created = await actorRepository.create(actorData);
    // Ensure _id is present
    expect(created._id).toBeDefined();
    return created;
  };

  beforeAll(async () => {
    const setup = await setupTestDb();
    client = setup.client;
    db = setup.db;
    actorRepository = new ActorRepository(db);
  });

  afterAll(async () => {
    // Pass both client and db to teardownTestDb
    await teardownTestDb(client, db);
  });

  beforeEach(async () => {
    // Clean up the collection before each test
    await db.collection<Actor>('actors').deleteMany({});
    // Create common actors for tests
    actor1 = await createActor('actor1@test.com', 'test.com');
    actor2 = await createActor('actor2@test.com', 'test.com');
    actor3 = await createActor('actor3@test.com', 'test.com');
    actor4 = await createActor('actor4@test.com', 'test.com');
    nonExistentId = new ObjectId().toHexString(); // Create a valid but non-existent ID string
  });

  // --- Existing tests (create, findByUsername, findById, update) ---
  // Need to be reviewed/updated based on current Actor model and repository methods

  describe('create', () => {
    it('should create a new actor with required fields', async () => {
      // Arrange - actor1 is already created in beforeEach
      // Assert
      expect(actor1).toBeDefined();
      expect(actor1.username).toBe('actor1@test.com');
      expect(actor1.preferredUsername).toBe('actor1');
      expect(actor1.name).toBe('actor1 Name');
      expect(actor1._id).toBeInstanceOf(ObjectId);
      expect(actor1.createdAt).toBeInstanceOf(Date);
      expect(actor1.updatedAt).toBeInstanceOf(Date);
      expect(actor1.publicKey).toBe('test-public-key');
      expect(actor1.privateKey).toBe('test-private-key');
      // Add more assertions for other fields if needed
    });

    it('should enforce unique usernames (if index is set)', async () => {
      // Arrange - actor1 exists
      // Act & Assert - Attempt to create another actor with the same username
      // This depends on MongoDB unique index configuration
      await expect(
        createActor('actor1@test.com', 'test.com'),
      ).rejects.toThrow(); // Assuming duplicate key error
    });
  });

  describe('findByUsername', () => {
    it('should find an actor by username (case-insensitive search)', async () => {
      // Arrange - actor1 exists
      // Act
      const found = await actorRepository.findByUsername('Actor1@test.com'); // Case-insensitive
      // Assert
      expect(found).toBeDefined();
      expect(found?._id.equals(actor1._id)).toBe(true);
      expect(found?.username).toBe('actor1@test.com');
    });

    it('should return null if username not found', async () => {
      // Act
      const found = await actorRepository.findByUsername('nonexistent@test.com');
      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find an actor by ID string', async () => {
      // Arrange - actor1 exists
      // Act
      const found = await actorRepository.findById(actor1._id.toHexString());
      // Assert
      expect(found).toBeDefined();
      expect(found?._id.equals(actor1._id)).toBe(true);
      expect(found?.username).toBe('actor1@test.com');
    });

    it('should find an actor by ObjectId', async () => {
      // Arrange - actor1 exists
      // Act
      const found = await actorRepository.findById(actor1._id);
      // Assert
      expect(found).toBeDefined();
      expect(found?._id.equals(actor1._id)).toBe(true);
    });

    it('should return null if ID not found', async () => {
      // Act
      const found = await actorRepository.findById(nonExistentId);
      // Assert
      expect(found).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update actor profile fields', async () => {
      // Arrange - actor1 exists
      const updates = {
        name: 'Updated Actor1 Name',
        summary: 'Updated Summary',
      };
      // Act
      const result = await actorRepository.updateProfile(
        actor1._id.toHexString(), // Use string ID
        updates,
      );
      // Assert
      expect(result).toBeDefined(); // Should return the updated actor
      expect(result?._id.equals(actor1._id)).toBe(true);
      expect(result?.name).toBe('Updated Actor1 Name');
      expect(result?.summary).toBe('Updated Summary');
      expect(result?.username).toBe('actor1@test.com'); // Unchanged field
      expect(result?.updatedAt).not.toEqual(actor1.updatedAt); // Updated timestamp

      // Verify in DB
      const verified = await actorRepository.findById(actor1._id);
      expect(verified?.name).toBe('Updated Actor1 Name');
      expect(verified?.summary).toBe('Updated Summary');
    });

    it('should return null when updating non-existent actor', async () => {
      // Act
      const result = await actorRepository.updateProfile(nonExistentId, {
        name: 'Wont Update',
      });
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete an actor by ID string', async () => {
      // Arrange - actor1 exists
      // Act
      const result = await actorRepository.deleteById(actor1._id.toHexString());
      // Assert
      expect(result).toBe(true); // Correct assertion for boolean return
      const deleted = await actorRepository.findById(actor1._id);
      expect(deleted).toBeNull();
    });

    it('should return false when deleting non-existent actor', async () => {
      // Act
      const result = await actorRepository.deleteById(nonExistentId);
      // Assert
      expect(result).toBe(false); // Correct assertion for boolean return
    });
  });

  // --- Following / Followers ---

  describe('addFollowing', () => {
    it('should add actor2 to actor1 following list', async () => {
      // Act
      const result = await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      // Assert
      expect(result.modifiedCount).toBe(1);
      const updatedActor1 = await actorRepository.findById(actor1._id);
      expect(updatedActor1?.following).toContainEqual(actor2._id); // Check ObjectId equality
      // Check that actor2's followers list was also updated
      const updatedActor2 = await actorRepository.findById(actor2._id);
      expect(updatedActor2?.followers).toContainEqual(actor1._id); // Check ObjectId equality
    });

    it('should not add self to following list', async () => {
      // Act
      const result = await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor1._id.toHexString(), // Pass string
      );
      // Assert
      expect(result.modifiedCount).toBe(0); // Or handle as error depending on design
      const updatedActor1 = await actorRepository.findById(actor1._id);
      expect(updatedActor1?.following).not.toContainEqual(actor1._id);
    });

    it('should not add if already following', async () => {
      // Arrange: actor1 follows actor2
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      // Act: Try to follow again
      const result = await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      // Assert
      expect(result.modifiedCount).toBe(0); // No changes
      const updatedActor1 = await actorRepository.findById(actor1._id);
      // Check that actor2._id is not duplicated in the following array
      const followingIds = updatedActor1?.following?.map(id => id.toHexString());
      expect(
        followingIds?.filter(id => id === actor2._id.toHexString()).length,
      ).toBe(1);
    });
  });

  describe('removeFollowing', () => {
    it('should remove actor2 from actor1 following list', async () => {
      // Arrange: actor1 follows actor2
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      // Act
      const result = await actorRepository.removeFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      // Assert
      expect(result.modifiedCount).toBe(1);
      const updatedActor1 = await actorRepository.findById(actor1._id);
      expect(updatedActor1?.following).not.toContainEqual(actor2._id);
      // Check that actor1 was removed from actor2's followers
      const updatedActor2 = await actorRepository.findById(actor2._id);
      expect(updatedActor2?.followers).not.toContainEqual(actor1._id);
    });

    it('should not fail if not following', async () => {
      // Act
      const result = await actorRepository.removeFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      ); // actor1 does not follow actor2 initially
      // Assert
      expect(result.modifiedCount).toBe(0); // No changes made
    });
  });

  describe('findFollowing', () => {
    it('should return list of actors followed by actor1', async () => {
      // Arrange: actor1 follows actor2 and actor3
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor3._id.toHexString(), // Pass string
      );
      // Act
      const followingList = await actorRepository.findFollowing(
        actor1._id.toHexString(), // Pass string
      );
      // Assert
      expect(followingList).toHaveLength(2);
      const followingIds = followingList.map(actor => actor._id.toHexString());
      expect(followingIds).toContain(actor2._id.toHexString());
      expect(followingIds).toContain(actor3._id.toHexString());
      expect(followingList[0].username).toBeDefined(); // Check full actor objects are returned
    });

    it('should return empty list if following no one', async () => {
      // Act
      const followingList = await actorRepository.findFollowing(
        actor1._id.toHexString(), // Pass string
      );
      // Assert
      expect(followingList).toHaveLength(0);
    });

    it('should return empty list for non-existent actor', async () => {
      // Act
      const followingList = await actorRepository.findFollowing(nonExistentId); // Pass string (already string)
      // Assert
      expect(followingList).toHaveLength(0);
    });

    it('should handle pagination for following list', async () => {
      // Arrange: actor1 follows actor2, actor3, actor4
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor2._id.toHexString(), // Pass string
      );
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor3._id.toHexString(), // Pass string
      );
      await actorRepository.addFollowing(
        actor1._id.toHexString(), // Pass string
        actor4._id.toHexString(), // Pass string
      );

      // Act: Get page 1 (limit 2)
      const page1 = await actorRepository.findFollowing(
        actor1._id.toHexString(), // Pass string
        1,
        2,
      );
      // Assert: Page 1
      expect(page1).toHaveLength(2);

      // Act: Get page 2 (limit 2)
      const page2 = await actorRepository.findFollowing(
        actor1._id.toHexString(), // Pass string
        2,
        2,
      );
      // Assert: Page 2
      expect(page2).toHaveLength(1); // Only 1 remaining

      // Act: Get page 3 (limit 2)
      const page3 = await actorRepository.findFollowing(
        actor1._id.toHexString(), // Pass string
        3,
        2,
      );
      // Assert: Page 3
      expect(page3).toHaveLength(0); // No more actors
    });
  });

  describe('findFollowers', () => {
    it('should return list of actors following actor1', async () => {
      // Arrange: actor2 and actor3 follow actor1
      await actorRepository.addFollowing(
        actor2._id.toHexString(), // Pass string
        actor1._id.toHexString(), // Pass string
      );
      await actorRepository.addFollowing(
        actor3._id.toHexString(), // Pass string
        actor1._id.toHexString(), // Pass string
      );
      // Act
      const followersList = await actorRepository.findFollowers(
        actor1._id.toHexString(), // Pass string
      );
      // Assert
      expect(followersList).toHaveLength(2);
      const followerIds = followersList.map(actor => actor._id.toHexString());
      expect(followerIds).toContain(actor2._id.toHexString());
      expect(followerIds).toContain(actor3._id.toHexString());
    });

    it('should return empty list if no followers', async () => {
      // Act
      const followersList = await actorRepository.findFollowers(
        actor1._id.toHexString(), // Pass string
      );
      // Assert
      expect(followersList).toHaveLength(0);
    });

    it('should return empty list for non-existent actor', async () => {
      // Act
      const followersList = await actorRepository.findFollowers(nonExistentId); // Pass string (already string)
      // Assert
      expect(followersList).toHaveLength(0);
    });

    it('should handle pagination for followers list', async () => {
      // Arrange: actor2, actor3, actor4 follow actor1
      await actorRepository.addFollowing(
        actor2._id.toHexString(), // Pass string
        actor1._id.toHexString(), // Pass string
      );
      await actorRepository.addFollowing(
        actor3._id.toHexString(), // Pass string
        actor1._id.toHexString(), // Pass string
      );
      await actorRepository.addFollowing(
        actor4._id.toHexString(), // Pass string
        actor1._id.toHexString(), // Pass string
      );

      // Act: Get page 1 (limit 2)
      const page1 = await actorRepository.findFollowers(
        actor1._id.toHexString(), // Pass string
        1,
        2,
      );
      // Assert: Page 1
      expect(page1).toHaveLength(2);

      // Act: Get page 2 (limit 2)
      const page2 = await actorRepository.findFollowers(
        actor1._id.toHexString(), // Pass string
        2,
        2,
      );
      // Assert: Page 2
      expect(page2).toHaveLength(1);

      // Act: Get page 3 (limit 2)
      const page3 = await actorRepository.findFollowers(
        actor1._id.toHexString(), // Pass string
        3,
        2,
      );
      // Assert: Page 3
      expect(page3).toHaveLength(0);
    });
  });

  // --- Search ---
  // Tests for searchActors (assuming it replaced searchByUsername)

  describe('searchActors', () => {
    beforeEach(async () => {
      // Add specific users for searching
      await createActor('searchUserA@test.com', 'test.com');
      await createActor('searchUserB@test.com', 'test.com');
      await createActor('anotherUser@test.com', 'test.com');
    });

    it('should find actors matching the query (case-insensitive)', async () => {
      // Act
      const results = await actorRepository.searchActors('searchUser', 10); // Use searchActors
      // Assert
      expect(results).toHaveLength(2);
      // Add type annotation for parameter 'a'
      const usernames = results.map((a: WithId<Actor>) => a.preferredUsername); // Added type
      expect(usernames).toContain('searchUserA');
      expect(usernames).toContain('searchUserB');
      expect(usernames).not.toContain('anotherUser');
    });

    it('should return empty array if no match', async () => {
      // Act
      const results = await actorRepository.searchActors('nomatch', 10); // Use searchActors
      // Assert
      expect(results).toHaveLength(0);
    });

    it('should limit results', async () => {
      // Act
      const results = await actorRepository.searchActors('searchUser', 1); // Use searchActors, limit to 1
      // Assert
      expect(results).toHaveLength(1);
      // Add type annotation for parameter 'a'
      const usernames = results.map((a: WithId<Actor>) => a.preferredUsername); // Added type
      // Can be either A or B depending on default sort order
      expect(['searchUserA', 'searchUserB']).toContain(usernames[0]);
    });

    it('should handle query matching username or name (if applicable)', async () => {
      // Modify an actor's name
      await actorRepository.collection.updateOne(
        { _id: actor1._id },
        { $set: { name: 'Specific Name' } },
      );
      // Act: Search by part of the name
      const results = await actorRepository.searchActors('Specific', 10);
      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]._id.equals(actor1._id)).toBe(true);
    });
  });

  // --- Utility/Edge Cases ---

  describe('getPublicKey', () => {
    it('should retrieve the public key for an actor', async () => {
      // Arrange - actor1 exists with a public key
      // Act
      const publicKey = await actorRepository.getPublicKey(
        actor1._id.toHexString(),
      );
      // Assert
      expect(publicKey).toBe('test-public-key'); // Matches the key set in createActor helper
    });

    it('should return null if actor or public key not found', async () => {
      // Act: Non-existent actor
      const key1 = await actorRepository.getPublicKey(nonExistentId);
      expect(key1).toBeNull();

      // Arrange: Actor without a public key (if possible)
      const actorNoKeyData = {
        username: 'nokey@test.com',
        domain: 'test.com',
        preferredUsername: 'nokey',
        name: 'No Key Name',
        summary: 'No Key Summary',
        type: 'Person' as const,
        inboxUrl: '/inbox/nokey',
        outboxUrl: '/outbox/nokey',
        followersUrl: '/followers/nokey',
        followingUrl: '/following/nokey',
        privateKey: 'test-private-key', // Needs private key
        // No publicKey field
      };
      const actorNoKey = await actorRepository.create(actorNoKeyData);

      // Act: Actor exists but no key field
      const key2 = await actorRepository.getPublicKey(
        actorNoKey._id.toHexString(),
      );
      // Assert
      expect(key2).toBeNull(); // Or undefined, depending on projection
    });
  });
});

// Note: Additional tests could cover:
// - Error handling for invalid ObjectIds passed to methods.
// - Index usage verification (e.g., using explain()).
// - More complex update scenarios (e.g., using $inc, $push with non-existent fields).
// - Concurrency issues (if applicable).
// - Correct handling of different ID types (string vs ObjectId) in all methods.
// - Proper projection in find methods if not all fields are needed.

</rewritten_file>
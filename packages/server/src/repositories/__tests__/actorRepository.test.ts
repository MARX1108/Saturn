import { MongoClient, Db, ObjectId } from "mongodb";
import { ActorRepository } from "../actorRepository";
import { setupTestDb, teardownTestDb } from "../../tests/testUtils";

jest.setTimeout(10000); // Increase timeout to 10 seconds for long-running tests

describe("ActorRepository", () => {
  let client: MongoClient;
  let db: Db;
  let actorRepository: ActorRepository;

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
    // Clean up the collection before each test
    await db.collection("actors").deleteMany({});
  });

  describe("create", () => {
    it("should create a new actor", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "testuser",
        name: "Test User",
        summary: "Test bio",
        type: "Person",
        inbox: "/users/testuser/inbox",
        outbox: "/users/testuser/outbox",
        following: "/users/testuser/following",
        followers: "/users/testuser/followers",
        password: "hashedPassword",
        email: "test@example.com",
      };

      // Act
      const result = await actorRepository.create(actorData);

      // Assert
      expect(result).toBeDefined();
      expect(result.preferredUsername).toBe("testuser");
      expect(result.name).toBe("Test User");
      expect(result.email).toBe("test@example.com");
      expect(result._id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique usernames", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "uniqueuser",
        name: "Test User",
        type: "Person",
        password: "hashedPassword",
        email: "test@example.com",
      };

      // Act - Create first user
      await actorRepository.create(actorData);

      // Assert - Creating a second user with the same username should fail
      await expect(actorRepository.create(actorData)).rejects.toThrow();
    });
  });

  describe("findByUsername", () => {
    it("should find an actor by username", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "finduser",
        name: "Find User",
        type: "Person",
        password: "hashedPassword",
        email: "find@example.com",
      };
      await actorRepository.create(actorData);

      // Act
      const result = await actorRepository.findByUsername("finduser");

      // Assert
      expect(result).toBeDefined();
      expect(result?.preferredUsername).toBe("finduser");
      expect(result?.name).toBe("Find User");
    });

    it("should return null when username not found", async () => {
      // Act
      const result = await actorRepository.findByUsername("nonexistent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find an actor by ID", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "iduser",
        name: "ID User",
        type: "Person",
        password: "hashedPassword",
        email: "id@example.com",
      };
      const created = await actorRepository.create(actorData);
      const id = created._id.toString();

      // Act
      const result = await actorRepository.findById(id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.preferredUsername).toBe("iduser");
      expect(result?._id.toString()).toBe(id);
    });

    it("should return null when ID not found", async () => {
      // Arrange
      const nonExistentId = new ObjectId().toString();

      // Act
      const result = await actorRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update an actor", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "updateuser",
        name: "Update User",
        type: "Person",
        password: "hashedPassword",
        email: "update@example.com",
      };
      const created = await actorRepository.create(actorData);
      const id = created._id.toString();

      // Act
      const updateResult = await actorRepository.update(id, {
        name: "Updated Name",
        summary: "Updated bio",
      });

      // Assert
      expect(updateResult).toBe(true);

      // Verify update took place
      const updated = await actorRepository.findById(id);
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.summary).toBe("Updated bio");
      expect(updated?.preferredUsername).toBe("updateuser"); // Unchanged fields remain
    });

    it("should return false when updating non-existent actor", async () => {
      // Arrange
      const nonExistentId = new ObjectId().toString();

      // Act
      const result = await actorRepository.update(nonExistentId, {
        name: "This Won't Work",
      });

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("delete", () => {
    it("should delete an actor", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "deleteuser",
        name: "Delete User",
        type: "Person",
        password: "hashedPassword",
        email: "delete@example.com",
      };
      const created = await actorRepository.create(actorData);
      const id = created._id.toString();

      // Act
      const deleteResult = await actorRepository.delete(id);

      // Assert
      expect(deleteResult).toBe(true);

      // Verify deletion
      const deleted = await actorRepository.findById(id);
      expect(deleted).toBeNull();
    });

    it("should return false when deleting non-existent actor", async () => {
      // Arrange
      const nonExistentId = new ObjectId().toString();

      // Act
      const result = await actorRepository.delete(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findAll", () => {
    it("should retrieve all actors", async () => {
      // Arrange
      await Promise.all([
        actorRepository.create({
          preferredUsername: "user1",
          name: "User One",
          type: "Person",
          password: "password",
          email: "user1@example.com",
        }),
        actorRepository.create({
          preferredUsername: "user2",
          name: "User Two",
          type: "Person",
          password: "password",
          email: "user2@example.com",
        }),
        actorRepository.create({
          preferredUsername: "user3",
          name: "User Three",
          type: "Person",
          password: "password",
          email: "user3@example.com",
        }),
      ]);

      // Act
      const result = await actorRepository.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      expect(result.some(actor => actor.preferredUsername === "user1")).toBe(true);
      expect(result.some(actor => actor.preferredUsername === "user2")).toBe(true);
      expect(result.some(actor => actor.preferredUsername === "user3")).toBe(true);
    });

    it("should return an empty array when no actors exist", async () => {
      // Arrange - Collection is already cleared in beforeEach

      // Act
      const result = await actorRepository.findAll();

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });

  describe("findByEmail", () => {
    it("should find an actor by email", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "emailuser",
        name: "Email User",
        type: "Person",
        password: "hashedPassword",
        email: "email@example.com",
      };
      await actorRepository.create(actorData);

      // Act
      const result = await actorRepository.findByEmail("email@example.com");

      // Assert
      expect(result).toBeDefined();
      expect(result?.preferredUsername).toBe("emailuser");
      expect(result?.email).toBe("email@example.com");
    });

    it("should return null when email not found", async () => {
      // Act
      const result = await actorRepository.findByEmail("nonexistent@example.com");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("usernameExists", () => {
    it("should return true if username exists", async () => {
      // Arrange
      await db.collection("actors").insertOne({ preferredUsername: "testuser" });

      // Act
      const result = await actorRepository.usernameExists("testuser");

      // Assert
      expect(result).toBe(true);
    });

    it("should return false if username doesn't exist", async () => {
      // Act
      const result = await actorRepository.usernameExists("nonexistentuser");

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("updateProfile", () => {
    it("should update an actor's profile", async () => {
      // Arrange
      const actor = {
        preferredUsername: "testuser",
        name: "Original Name",
        summary: "Original bio",
      };
      const insertResult = await db.collection("actors").insertOne(actor);
      const actorId = insertResult.insertedId.toString();

      // Act
      const updateResult = await actorRepository.updateProfile(actorId, {
        displayName: "Updated Name",
        bio: "Updated bio",
      });

      // Assert
      expect(updateResult).toBe(true);

      // Verify the update
      const updatedActor = await db.collection("actors").findOne({ _id: new ObjectId(actorId) });
      expect(updatedActor).toBeDefined();
      expect(updatedActor?.name).toBe("Updated Name");
      expect(updatedActor?.summary).toBe("Updated bio");
    });

    it("should return false if actor doesn't exist", async () => {
      // Act
      const result = await actorRepository.updateProfile(
        new ObjectId().toString(),
        { displayName: "Updated Name" }
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findFollowers", () => {
    it("should find followers of an actor", async () => {
      // Arrange
      const actorId = new ObjectId();
      await db.collection("actors").insertMany([
        { _id: actorId, preferredUsername: "targetuser" },
        {
          preferredUsername: "follower1",
          following: [actorId],
        },
        {
          preferredUsername: "follower2",
          following: [actorId],
        },
        {
          preferredUsername: "nonfollower",
          following: [new ObjectId()], // Following someone else
        },
      ]);

      // Act
      const followers = await actorRepository.findFollowers(actorId.toString());

      // Assert
      expect(followers).toHaveLength(2);
      expect(followers.map(f => f.preferredUsername).sort()).toEqual([
        "follower1",
        "follower2",
      ].sort());
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      const actorId = new ObjectId();
      
      // Create 25 followers
      const followers = Array(25).fill(0).map((_, i) => ({
        preferredUsername: `follower${i}`,
        following: [actorId]
      }));
      
      await db.collection("actors").insertOne({ _id: actorId, preferredUsername: "targetuser" });
      await db.collection("actors").insertMany(followers);
      
      // Act - Get first page (10 items)
      const firstPage = await actorRepository.findFollowers(actorId.toString(), 1, 10);
      
      // Act - Get second page (10 items)
      const secondPage = await actorRepository.findFollowers(actorId.toString(), 2, 10);
      
      // Act - Get third page (5 items)
      const thirdPage = await actorRepository.findFollowers(actorId.toString(), 3, 10);
      
      // Assert
      expect(firstPage).toHaveLength(10);
      expect(secondPage).toHaveLength(10);
      expect(thirdPage).toHaveLength(5);
    });
  });

  describe("findFollowing", () => {
    it("should find users that an actor is following", async () => {
      // Arrange
      const actorId = new ObjectId();
      const followedUser1 = new ObjectId();
      const followedUser2 = new ObjectId();
      
      await db.collection("actors").insertMany([
        { 
          _id: actorId, 
          preferredUsername: "testuser",
          following: [followedUser1, followedUser2]
        },
        { _id: followedUser1, preferredUsername: "followed1" },
        { _id: followedUser2, preferredUsername: "followed2" },
        { _id: new ObjectId(), preferredUsername: "notfollowed" }
      ]);
      
      // Act
      const following = await actorRepository.findFollowing(actorId.toString());
      
      // Assert
      expect(following).toHaveLength(2);
      expect(following.map(f => f.preferredUsername).sort()).toEqual([
        "followed1", 
        "followed2"
      ].sort());
    });
    
    it("should return empty array if actor isn't following anyone", async () => {
      // Arrange
      const actorId = new ObjectId();
      await db.collection("actors").insertOne({
        _id: actorId,
        preferredUsername: "lonelyuser",
        following: []
      });
      
      // Act
      const following = await actorRepository.findFollowing(actorId.toString());
      
      // Assert
      expect(following).toHaveLength(0);
    });
  });

  describe("addFollowing and removeFollowing", () => {
    it("should add a user to following list", async () => {
      // Arrange
      const actorId = new ObjectId();
      const targetId = new ObjectId();
      
      await db.collection("actors").insertMany([
        { _id: actorId, preferredUsername: "follower", following: [] },
        { _id: targetId, preferredUsername: "target" }
      ]);
      
      // Act
      const result = await actorRepository.addFollowing(
        actorId.toString(), 
        targetId.toString()
      );
      
      // Assert
      expect(result).toBe(true);
      
      // Verify
      const actor = await db.collection("actors").findOne({ _id: actorId });
      expect(actor?.following).toHaveLength(1);
      expect(actor?.following[0].toString()).toBe(targetId.toString());
    });
    
    it("should remove a user from following list", async () => {
      // Arrange
      const actorId = new ObjectId();
      const targetId = new ObjectId();
      
      await db.collection("actors").insertOne({
        _id: actorId,
        preferredUsername: "follower",
        following: [targetId]
      });
      
      // Act
      const result = await actorRepository.removeFollowing(
        actorId.toString(),
        targetId.toString()
      );
      
      // Assert
      expect(result).toBe(true);
      
      // Verify
      const actor = await db.collection("actors").findOne({ _id: actorId });
      expect(actor?.following).toHaveLength(0);
    });
  });
});
import { MongoClient, Db, ObjectId } from "mongodb";
import { ActorService } from "../actorService";
import { setupTestDb, teardownTestDb } from "../../tests/testUtils";
import * as fs from "fs";
import * as path from "path";
import bcryptjs from "bcryptjs"; // Replace bcrypt with bcryptjs

jest.setTimeout(10000); // Increase timeout to 10 seconds for long-running tests

describe("ActorService", () => {
  let client: MongoClient;
  let db: Db;
  let actorService: ActorService;
  const testDomain = "testdomain.com";

  beforeAll(async () => {
    const setup = await setupTestDb();
    client = setup.client;
    db = setup.db;
    actorService = new ActorService(db, testDomain);
  });

  afterAll(async () => {
    await teardownTestDb(client, db);
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await db.collection("actors").deleteMany({});
  });

  describe("createActor", () => {
    it("should create a new actor", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "testuser",
        name: "Test User",
        summary: "Test bio",
        password: "securepassword",
        email: "test@example.com",
      };

      // Act
      const result = await actorService.createActor(actorData);

      // Assert
      expect(result).toBeDefined();
      expect(result.preferredUsername).toBe("testuser");
      expect(result.name).toBe("Test User");
      expect(result.summary).toBe("Test bio");

      // Check default values were set
      expect(result.type).toBe("Person");
      expect(result.inbox).toBe(`https://${testDomain}/users/testuser/inbox`);
      expect(result.outbox).toBe(`https://${testDomain}/users/testuser/outbox`);
      expect(result.following).toBe(`https://${testDomain}/users/testuser/following`);
      expect(result.followers).toBe(`https://${testDomain}/users/testuser/followers`);
    });

    it("should create an actor with a profile picture", async () => {
      // Arrange
      const testImagePath = path.join(__dirname, "test-image.jpg");
      
      // Create a test image if it doesn't exist
      if (!fs.existsSync(testImagePath)) {
        const testDir = path.dirname(testImagePath);
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        fs.writeFileSync(testImagePath, "dummy image data");
      }
      
      const actorData = {
        preferredUsername: "imageuser",
        name: "Image User",
        password: "securepassword",
        email: "image@example.com",
        // Simulating file upload
        profilePicture: {
          path: testImagePath,
          filename: "test-image.jpg",
        },
      };

      // Act
      const result = await actorService.createActor(actorData);

      // Assert
      expect(result).toBeDefined();
      expect(result.icon).toBeDefined();
      expect(result.icon.url).toBe("/avatars/test-image.jpg");
      expect(result.icon.mediaType).toBe("image/jpeg");
      
      // Clean up test image
      fs.unlinkSync(testImagePath);
    });

    it("should reject duplicate usernames", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "uniqueuser",
        name: "Unique User",
        password: "securepassword",
        email: "unique@example.com",
      };

      // Act - Create first user
      await actorService.createActor(actorData);

      // Assert - Second attempt should fail
      await expect(actorService.createActor(actorData)).rejects.toThrow();
    });

    it("should hash the password", async () => {
      // Arrange
      const actorData = {
        preferredUsername: "passworduser",
        name: "Password User",
        password: "plainpassword",
        email: "password@example.com",
      };

      // Act
      const result = await actorService.createActor(actorData);

      // Assert - Password should be hashed
      const actor = await db.collection("actors").findOne({ preferredUsername: "passworduser" });
      expect(actor).toBeDefined();
      expect(actor?.password).not.toBe("plainpassword");
      expect(actor?.password).toMatch(/^\$2[aby]\$\d+\$.{50,}$/); // Bcryptjs pattern remains the same
    });
  });

  describe("getActorByUsername", () => {
    it("should find an actor by username", async () => {
      // Arrange
      await actorService.createActor({
        preferredUsername: "findme",
        name: "Find Me",
        password: "securepassword",
        email: "findme@example.com",
      });

      // Act
      const actor = await actorService.getActorByUsername("findme");

      // Assert
      expect(actor).toBeDefined();
      expect(actor?.preferredUsername).toBe("findme");
      expect(actor?.name).toBe("Find Me");
      expect(actor?.password).toBeUndefined(); // Password should not be returned
    });

    it("should return null for non-existent username", async () => {
      // Act
      const actor = await actorService.getActorByUsername("nonexistent");

      // Assert
      expect(actor).toBeNull();
    });
  });

  describe("getActorById", () => {
    it("should find an actor by ID", async () => {
      // Arrange
      const created = await actorService.createActor({
        preferredUsername: "iduser",
        name: "ID User",
        password: "securepassword",
        email: "id@example.com",
      });

      // Act
      const actor = await actorService.getActorById(created._id.toString());

      // Assert
      expect(actor).toBeDefined();
      expect(actor?.preferredUsername).toBe("iduser");
      expect(actor?._id.toString()).toBe(created._id.toString());
    });

    it("should return null for non-existent ID", async () => {
      // Act
      const actor = await actorService.getActorById(new ObjectId().toString());

      // Assert
      expect(actor).toBeNull();
    });
  });

  describe("updateProfile", () => {
    it("should update an actor's profile", async () => {
      // Arrange
      const actor = await actorService.createActor({
        preferredUsername: "updateme",
        name: "Original Name",
        summary: "Original bio",
        password: "securepassword",
        email: "update@example.com",
      });

      // Act
      const updateResult = await actorService.updateProfile(
        actor._id.toString(),
        {
          displayName: "Updated Name",
          bio: "Updated bio",
        }
      );

      // Assert
      expect(updateResult).toBe(true);

      // Verify changes
      const updated = await actorService.getActorById(actor._id.toString());
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.summary).toBe("Updated bio");
    });

    it("should update profile picture", async () => {
      // Arrange
      const actor = await actorService.createActor({
        preferredUsername: "picuser",
        name: "Picture User",
        password: "securepassword",
        email: "pic@example.com",
      });
      
      const testImagePath = path.join(__dirname, "new-image.jpg");
      if (!fs.existsSync(testImagePath)) {
        const testDir = path.dirname(testImagePath);
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        fs.writeFileSync(testImagePath, "new image data");
      }

      // Act
      const updateResult = await actorService.updateProfile(
        actor._id.toString(),
        {
          profilePicture: {
            path: testImagePath,
            filename: "new-image.jpg",
          }
        }
      );

      // Assert
      expect(updateResult).toBe(true);

      // Verify changes
      const updated = await actorService.getActorById(actor._id.toString());
      expect(updated?.icon).toBeDefined();
      expect(updated?.icon.url).toBe("/avatars/new-image.jpg");
      
      // Cleanup
      fs.unlinkSync(testImagePath);
    });

    it("should return false for non-existent actor", async () => {
      // Act
      const result = await actorService.updateProfile(
        new ObjectId().toString(),
        { displayName: "Won't Update" }
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("authenticateActor", () => {
    it("should authenticate with correct credentials", async () => {
      // Arrange
      await actorService.createActor({
        preferredUsername: "authuser",
        name: "Auth User",
        password: "correctpassword",
        email: "auth@example.com",
      });

      // Act
      const result = await actorService.authenticateActor("authuser", "correctpassword");

      // Assert
      expect(result).toBeDefined();
      expect(result?.preferredUsername).toBe("authuser");
      expect(result?.password).toBeUndefined(); // Password should not be included
    });

    it("should fail with incorrect password", async () => {
      // Arrange
      await actorService.createActor({
        preferredUsername: "authuser",
        name: "Auth User",
        password: "correctpassword",
        email: "auth@example.com",
      });

      // Act
      const result = await actorService.authenticateActor("authuser", "wrongpassword");

      // Assert
      expect(result).toBeNull();
    });

    it("should fail with non-existent username", async () => {
      // Act
      const result = await actorService.authenticateActor("nonexistent", "anypassword");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("listAllActors", () => {
    it("should list all actors", async () => {
      // Arrange
      await Promise.all([
        actorService.createActor({
          preferredUsername: "user1",
          name: "User One",
          password: "pass1",
          email: "user1@example.com",
        }),
        actorService.createActor({
          preferredUsername: "user2",
          name: "User Two",
          password: "pass2",
          email: "user2@example.com",
        }),
        actorService.createActor({
          preferredUsername: "user3",
          name: "User Three",
          password: "pass3",
          email: "user3@example.com",
        }),
      ]);

      // Act
      const results = await actorService.listAllActors();

      // Assert
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(3);
      expect(results.every(actor => actor.password === undefined)).toBe(true);
    });
  });

  // Mock the follow/unfollow methods if they aren't implemented yet
  describe("follow and unfollow", () => {
    let userId: string;
    let targetId: string;

    beforeEach(async () => {
      // Set up two actors
      const user = await actorService.createActor({
        preferredUsername: "follower",
        name: "Follower User",
        password: "password",
        email: "follower@example.com",
      });
      
      const target = await actorService.createActor({
        preferredUsername: "followed",
        name: "Followed User",
        password: "password",
        email: "followed@example.com",
      });
      
      userId = user._id.toString();
      targetId = target._id.toString();
    });

    it("should allow a user to follow another user", async () => {
      // Act
      const result = await actorService.follow(userId, targetId);

      // Assert
      expect(result).toBe(true);

      // Verify following relationship
      const user = await db.collection("actors").findOne({ _id: new ObjectId(userId) });
      expect(user?.following).toBeDefined();
      expect(user?.following.map((id: ObjectId) => id.toString())).toContain(targetId);
    });

    it("should allow a user to unfollow another user", async () => {
      // Arrange - First follow
      await actorService.follow(userId, targetId);

      // Act
      const result = await actorService.unfollow(userId, targetId);

      // Assert
      expect(result).toBe(true);

      // Verify following relationship removed
      const user = await db.collection("actors").findOne({ _id: new ObjectId(userId) });
      const followingIds = user?.following?.map((id: ObjectId) => id.toString()) || [];
      expect(followingIds).not.toContain(targetId);
    });

    it("should do nothing if trying to follow a user that's already followed", async () => {
      // Arrange - First follow
      await actorService.follow(userId, targetId);

      // Act - Try to follow again
      const result = await actorService.follow(userId, targetId);

      // Assert
      expect(result).toBe(true); // Operation should succeed

      // Verify only one entry exists in following array
      const user = await db.collection("actors").findOne({ _id: new ObjectId(userId) });
      const following = user?.following || [];
      expect(following.filter((id: ObjectId) => id.toString() === targetId).length).toBe(1);
    });

    it("should do nothing if trying to unfollow a user that's not being followed", async () => {
      // Act - Unfollow without following first
      const result = await actorService.unfollow(userId, targetId);

      // Assert
      expect(result).toBe(true); // Operation should succeed
    });
  });

  describe("getFollowers and getFollowing", () => {
    let userId: string;
    let follower1Id: string;
    let follower2Id: string;
    
    beforeEach(async () => {
      // Create users
      const user = await actorService.createActor({
        preferredUsername: "mainuser",
        name: "Main User",
        password: "password",
        email: "main@example.com",
      });
      
      const follower1 = await actorService.createActor({
        preferredUsername: "follower1",
        name: "Follower One",
        password: "password",
        email: "follower1@example.com",
      });
      
      const follower2 = await actorService.createActor({
        preferredUsername: "follower2",
        name: "Follower Two",
        password: "password",
        email: "follower2@example.com",
      });
      
      userId = user._id.toString();
      follower1Id = follower1._id.toString();
      follower2Id = follower2._id.toString();
      
      // Set up follower relationships
      await actorService.follow(follower1Id, userId);
      await actorService.follow(follower2Id, userId);
      await actorService.follow(userId, follower1Id);
    });
    
    it("should get followers of a user", async () => {
      // Act
      const followers = await actorService.getFollowers(userId);
      
      // Assert
      expect(followers).toHaveLength(2);
      const followerUsernames = followers.map(f => f.preferredUsername);
      expect(followerUsernames).toContain("follower1");
      expect(followerUsernames).toContain("follower2");
    });
    
    it("should get users that a user is following", async () => {
      // Act
      const following = await actorService.getFollowing(userId);
      
      // Assert
      expect(following).toHaveLength(1);
      expect(following[0].preferredUsername).toBe("follower1");
    });
    
    it("should return empty array for user with no followers", async () => {
      // Create a user with no followers
      const lonelyUser = await actorService.createActor({
        preferredUsername: "lonelyuser",
        name: "Lonely User",
        password: "password",
        email: "lonely@example.com",
      });
      
      // Act
      const followers = await actorService.getFollowers(lonelyUser._id.toString());
      
      // Assert
      expect(followers).toHaveLength(0);
    });
  });
});

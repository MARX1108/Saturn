import request from "supertest";
import express from "express";
import path from "path";
import fs from "fs";
// Replace Jest imports with Vitest
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { ActorService } from "../../src/services/actorService";

// Import the router
import actorsRouter from "../../routes/actors";

// Mock ActorService
jest.mock("../../src/services/actorService");

// Create testing express app
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.app.locals.db = {}; // Mock database connection
  next();
});
app.use("/", actorsRouter);

// Ensure temp upload directory exists for tests
const setupTestEnv = () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  const publicAvatarsDir = path.join(process.cwd(), "public", "avatars");
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(publicAvatarsDir, { recursive: true });
};

// Clean up any test files after tests
const cleanupTestEnv = () => {
  // Clean up could be implemented if needed
};

describe("Actor Routes", () => {
  beforeAll(() => {
    setupTestEnv();
  });

  afterAll(() => {
    cleanupTestEnv();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("POST /actors", () => {
    it("should create a new actor", async () => {
      // Mock implementations
      const mockActor = {
        id: "123",
        username: "testuser",
        displayName: "Test User",
        bio: "Test bio",
      };

      // Fix the type issues by using proper typing for the mocks
      jest
        .spyOn(ActorService.prototype, "usernameExists")
        .mockResolvedValue(false);
      jest
        .spyOn(ActorService.prototype, "createActor")
        .mockResolvedValue(mockActor);

      const response = await request(app)
        .post("/actors")
        .field("username", "testuser")
        .field("displayName", "Test User")
        .field("bio", "Test bio");

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockActor);
      expect(ActorService.prototype.createActor).toHaveBeenCalledWith(
        expect.objectContaining({
          username: "testuser",
          displayName: "Test User",
          bio: "Test bio",
        }),
        undefined
      );
    });

    it("should return 400 if username is missing", async () => {
      const response = await request(app)
        .post("/actors")
        .field("displayName", "Test User")
        .field("bio", "Test bio");

      expect(response.status).toBe(400);
    });

    it("should return 409 if username already exists", async () => {
      jest
        .spyOn(ActorService.prototype, "usernameExists")
        .mockResolvedValue(true);

      const response = await request(app)
        .post("/actors")
        .field("username", "existinguser")
        .field("displayName", "Existing User")
        .field("bio", "Test bio");

      expect(response.status).toBe(409);
    });

    it("should handle avatar file upload", async () => {
      const mockActor = {
        id: "123",
        username: "testuser",
        displayName: "Test User",
        bio: "Test bio",
        icon: {
          url: "https://localhost:4000/avatars/testuser-123456.jpg",
          mediaType: "image/jpeg",
        },
      };

      jest
        .spyOn(ActorService.prototype, "usernameExists")
        .mockResolvedValue(false);
      jest
        .spyOn(ActorService.prototype, "createActor")
        .mockResolvedValue(mockActor);

      // Create a test image file
      const testImagePath = path.join(process.cwd(), "test-avatar.jpg");
      fs.writeFileSync(testImagePath, "test image content");

      const response = await request(app)
        .post("/actors")
        .field("username", "testuser")
        .field("displayName", "Test User")
        .field("bio", "Test bio")
        .attach("avatarFile", testImagePath);

      // Clean up test file
      fs.unlinkSync(testImagePath);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockActor);
      expect(ActorService.prototype.createActor).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          mediaType: expect.any(String),
          url: expect.stringContaining("avatars"),
        })
      );
    });
  });

  describe("GET /actors/:username", () => {
    it("should return actor by username", async () => {
      const mockActor = {
        id: "123",
        username: "testuser",
        displayName: "Test User",
        bio: "Test bio",
      };

      jest
        .spyOn(ActorService.prototype, "getActorByUsername")
        .mockResolvedValue(mockActor);

      const response = await request(app).get("/actors/testuser");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockActor);
      expect(ActorService.prototype.getActorByUsername).toHaveBeenCalledWith(
        "testuser"
      );
    });

    it("should return 404 when actor not found", async () => {
      jest
        .spyOn(ActorService.prototype, "getActorByUsername")
        .mockResolvedValue(null);

      const response = await request(app).get("/actors/nonexistent");

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /actors/:username", () => {
    it("should update an existing actor", async () => {
      const mockUpdatedActor = {
        id: "123",
        username: "testuser",
        displayName: "Updated Name",
        bio: "Updated bio",
      };

      jest
        .spyOn(ActorService.prototype, "usernameExists")
        .mockResolvedValue(true);
      jest
        .spyOn(ActorService.prototype, "updateActor")
        .mockResolvedValue(mockUpdatedActor);

      const response = await request(app)
        .put("/actors/testuser")
        .field("displayName", "Updated Name")
        .field("bio", "Updated bio");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedActor);
      expect(ActorService.prototype.updateActor).toHaveBeenCalledWith(
        "testuser",
        expect.objectContaining({
          displayName: "Updated Name",
          bio: "Updated bio",
        }),
        undefined
      );
    });

    it("should return 404 when actor not found", async () => {
      jest
        .spyOn(ActorService.prototype, "usernameExists")
        .mockResolvedValue(false);

      const response = await request(app)
        .put("/actors/nonexistent")
        .field("displayName", "Updated Name")
        .field("bio", "Updated bio");

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /actors/:username", () => {
    it("should delete an existing actor", async () => {
      jest.spyOn(ActorService.prototype, "deleteActor").mockResolvedValue(true);

      const response = await request(app).delete("/actors/testuser");

      expect(response.status).toBe(204);
      expect(ActorService.prototype.deleteActor).toHaveBeenCalledWith(
        "testuser"
      );
    });

    it("should return 404 when actor not found", async () => {
      jest
        .spyOn(ActorService.prototype, "deleteActor")
        .mockResolvedValue(false);

      const response = await request(app).delete("/actors/nonexistent");

      expect(response.status).toBe(404);
    });
  });

  describe("GET /users/:username", () => {
    it("should return ActivityPub actor when Accept header is correct", async () => {
      const mockActor = {
        id: "https://example.com/users/testuser",
        type: "Person",
        preferredUsername: "testuser",
        name: "Test User",
        summary: "Test bio",
        inbox: "https://example.com/users/testuser/inbox",
        outbox: "https://example.com/users/testuser/outbox",
      };

      jest
        .spyOn(ActorService.prototype, "getFullActorByUsername")
        .mockResolvedValue(mockActor);

      const response = await request(app)
        .get("/users/testuser")
        .set("Accept", "application/activity+json");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          "https://w3id.org/security/v1",
        ],
        ...mockActor,
      });
    });

    it("should redirect to profile page when Accept header is not ActivityPub", async () => {
      const response = await request(app)
        .get("/users/testuser")
        .set("Accept", "text/html");

      expect(response.status).toBe(302); // Redirect status
      expect(response.header.location).toBe("/profile/testuser");
    });

    it("should return 404 when actor not found", async () => {
      jest
        .spyOn(ActorService.prototype, "getFullActorByUsername")
        .mockResolvedValue(null);

      const response = await request(app)
        .get("/users/nonexistent")
        .set("Accept", "application/activity+json");

      expect(response.status).toBe(404);
    });
  });
});

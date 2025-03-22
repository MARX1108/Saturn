import request from "supertest";
import express from "express";
import { MongoClient, Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import actorRoutes from "../routes/actors";

describe("Actor Routes", () => {
  let app: express.Application;
  let db: Db;
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;

  beforeAll(async () => {
    // Set up in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    // Set up Express app
    app = express();
    app.use(express.json());

    // Configure routes
    const domain = "test.domain";
    app.use("/api/actors", actorRoutes(db, domain));
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection("users").deleteMany({});
    await db.collection("actors").deleteMany({});
  });

  describe("POST /api/actors", () => {
    it("should create a new actor", async () => {
      const response = await request(app).post("/api/actors").send({
        username: "testuser",
        displayName: "Test User",
        bio: "This is a test user",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.preferredUsername).toBe("testuser");
      expect(response.body.name).toBe("Test User");
      expect(response.body.summary).toBe("This is a test user");
    });

    it("should return 400 if username is missing", async () => {
      const response = await request(app).post("/api/actors").send({
        displayName: "Test User",
        bio: "This is a test user",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 409 if username already exists", async () => {
      // First create a user
      await request(app).post("/api/actors").send({
        username: "testuser",
        displayName: "Test User",
        bio: "This is a test user",
      });

      // Try to create another user with the same username
      const response = await request(app).post("/api/actors").send({
        username: "testuser",
        displayName: "Another Test User",
        bio: "This is another test user",
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/actors/:username", () => {
    it("should return actor by username", async () => {
      // First create a user
      const createResponse = await request(app).post("/api/actors").send({
        username: "testuser",
        displayName: "Test User",
        bio: "This is a test user",
      });

      // Then fetch the user
      const response = await request(app).get("/api/actors/testuser");

      expect(response.status).toBe(200);
      expect(response.body.preferredUsername).toBe("testuser");
      expect(response.body.name).toBe("Test User");
    });

    it("should return 404 if actor not found", async () => {
      const response = await request(app).get("/api/actors/nonexistentuser");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/actors/:username", () => {
    it("should update actor profile", async () => {
      // First create a user
      await request(app).post("/api/actors").send({
        username: "testuser",
        displayName: "Test User",
        bio: "This is a test user",
      });

      // Then update the user
      const response = await request(app).put("/api/actors/testuser").send({
        displayName: "Updated Test User",
        bio: "This is an updated test user",
      });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Test User");
      expect(response.body.summary).toBe("This is an updated test user");
    });

    it("should return 404 if actor not found", async () => {
      const response = await request(app)
        .put("/api/actors/nonexistentuser")
        .send({
          displayName: "Updated Test User",
          bio: "This is an updated test user",
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });
});

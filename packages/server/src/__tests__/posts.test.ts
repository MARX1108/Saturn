import request from "supertest";
import express from "express";
import { MongoClient, Db } from "mongodb";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import postsRouter from "../routes/posts";
import { ActorService } from "../services/actorService";

let app: express.Application;
let mongoServer: MongoMemoryServer;
let mongoClient: MongoClient;
let db: Db;
let testUserId: string;
let testUserToken: string;
let testPostId: string;

beforeAll(async () => {
  // Set up MongoDB in-memory server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  db = mongoClient.db("test-db");

  // Set up Express app
  app = express();
  app.use(express.json());
  app.set("db", db);
  app.set("domain", "example.com");

  // Create a test user
  const actorService = new ActorService(db, "example.com");
  const actor = await actorService.createActor({
    username: "testuser",
    displayName: "Test User",
    bio: "Test bio",
  });
  testUserId = actor._id.toString();

  // Create a JWT token for the test user
  const jwtSecret = "test-secret";
  process.env.JWT_SECRET = jwtSecret;
  testUserToken = jwt.sign({ id: testUserId, username: "testuser" }, jwtSecret);

  // Add user object to request for testing
  app.use((req, res, next) => {
    // This simulates the authenticateToken middleware
    req.user = { id: testUserId, username: "testuser" };
    next();
  });

  // Use the posts router
  app.use(postsRouter);
});

afterAll(async () => {
  await mongoClient.close();
  await mongoServer.stop();
});

describe("Posts API", () => {
  it("should create a new post", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${testUserToken}`)
      .send({
        content: "This is a test post",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("content", "This is a test post");
    expect(response.body).toHaveProperty("author");
    expect(response.body.author).toHaveProperty("username", "testuser");

    // Save the post ID for later tests
    testPostId = response.body.id;
  });

  it("should get public timeline", async () => {
    const response = await request(app)
      .get("/posts")
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("posts");
    expect(response.body.posts).toBeInstanceOf(Array);
    expect(response.body.posts.length).toBeGreaterThan(0);
  });

  it("should get a single post by ID", async () => {
    const response = await request(app)
      .get(`/posts/${testPostId}`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", testPostId);
    expect(response.body).toHaveProperty("content", "This is a test post");
  });

  it("should get posts by username", async () => {
    const response = await request(app)
      .get("/posts/user/testuser")
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("posts");
    expect(response.body.posts).toBeInstanceOf(Array);
    expect(response.body.posts.length).toBeGreaterThan(0);
    expect(response.body.posts[0].author.username).toBe("testuser");
  });

  it("should update a post", async () => {
    const response = await request(app)
      .put(`/posts/${testPostId}`)
      .set("Authorization", `Bearer ${testUserToken}`)
      .send({
        content: "Updated test post",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("content", "Updated test post");
  });

  it("should like a post", async () => {
    const response = await request(app)
      .post(`/posts/${testPostId}/like`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);

    // Verify the like count increased
    const postResponse = await request(app)
      .get(`/posts/${testPostId}`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(postResponse.body).toHaveProperty("likeCount", 1);
    expect(postResponse.body).toHaveProperty("liked", true);
  });

  it("should unlike a post", async () => {
    const response = await request(app)
      .post(`/posts/${testPostId}/unlike`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);

    // Verify the like count decreased
    const postResponse = await request(app)
      .get(`/posts/${testPostId}`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(postResponse.body).toHaveProperty("likeCount", 0);
    expect(postResponse.body).toHaveProperty("liked", false);
  });

  it("should delete a post", async () => {
    const response = await request(app)
      .delete(`/posts/${testPostId}`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(response.status).toBe(204);

    // Verify the post is deleted
    const postResponse = await request(app)
      .get(`/posts/${testPostId}`)
      .set("Authorization", `Bearer ${testUserToken}`);

    expect(postResponse.status).toBe(404);
  });
});

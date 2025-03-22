import request from "supertest";
import express from "express";
import { MongoClient, Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import configureActorRoutes from "../actors";

describe("Actor Routes", () => {
  let app: express.Application;
  let mongoServer: MongoMemoryServer;
  let connection: MongoClient;
  let db: Db;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    connection = await MongoClient.connect(mongoServer.getUri());
    db = connection.db("test");

    app = express();
    app.use(express.json());
    app.use("/api/actors", configureActorRoutes(db, "test.local"));
  });

  afterAll(async () => {
    if (connection) await connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  test("POST / creates a new actor", async () => {
    const response = await request(app).post("/api/actors").send({
      username: "testuser",
      displayName: "Test User",
      bio: "This is a test",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("username", "testuser");
  });

  // More tests...
});

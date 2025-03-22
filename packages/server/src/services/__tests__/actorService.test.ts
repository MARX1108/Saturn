import { ActorService } from "../actorService";
import { MongoClient, Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("ActorService", () => {
  let mongoServer: MongoMemoryServer;
  let connection: MongoClient;
  let db: Db;
  let actorService: ActorService;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    connection = await MongoClient.connect(mongoServer.getUri());
    db = connection.db("test");
    actorService = new ActorService(db, "test.local");
  });

  afterAll(async () => {
    if (connection) await connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  test("createActor should create a new actor", async () => {
    const actorData = {
      username: "testuser",
      displayName: "Test User",
      bio: "Test bio",
    };

    const result = await actorService.createActor(actorData);

    expect(result).toHaveProperty("id");
    expect(result.username).toBe("testuser");
    expect(result.displayName).toBe("Test User");
    expect(result.bio).toBe("Test bio");
  });

  // More tests...
});

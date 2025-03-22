import { Collection, Db } from "mongodb";
import { Actor } from "../types/actor";

export class ActorRepository {
  private collection: Collection;

  constructor(db: Db) {
    this.collection = db.collection("actors");

    // Create indexes
    this.collection.createIndex({ preferredUsername: 1 }, { unique: true });
    this.collection.createIndex({ id: 1 }, { unique: true });
  }

  async findByUsername(username: string): Promise<Actor | null> {
    return this.collection.findOne({
      preferredUsername: username,
    }) as unknown as Actor | null;
  }

  async create(actor: Actor): Promise<Actor> {
    await this.collection.insertOne(actor);
    return actor;
  }

  // Additional methods...
}

// This would make the ActorService more testable and focused on business logic

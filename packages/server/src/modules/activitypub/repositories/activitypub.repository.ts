import { Db } from "mongodb";
import { MongoRepository } from "../../shared/repositories/baseRepository";

// Define a basic ActivityPub object type - expand this as needed
interface ActivityPubObject {
  id: string;
  type: string;
  [key: string]: any; // Allow for flexible ActivityPub objects
}

export class ActivityPubRepository extends MongoRepository<ActivityPubObject> {
  constructor(db: Db) {
    super(db, "activitypub");
    
    // Create any needed indexes
    this.collection.createIndex({ id: 1 }, { unique: true });
    this.collection.createIndex({ type: 1 });
  }

  async findById(id: string): Promise<ActivityPubObject | null> {
    return this.findOne({ id });
  }

  async findByType(type: string, page = 1, limit = 20): Promise<ActivityPubObject[]> {
    const skip = (page - 1) * limit;
    return this.collection
      .find({ type })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
}
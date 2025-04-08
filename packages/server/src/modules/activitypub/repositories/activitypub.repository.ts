import { Db } from "mongodb";
import { MongoRepository } from "../../shared/repositories/baseRepository";

// Define a basic ActivityPub object type - expand this as needed
interface ActivityPubObject {
  id: string;
  type: string;
  [key: string]: any; // Allow for flexible ActivityPub objects
}

export class ActivityPubRepository extends MongoRepository<ActivityPubObject> {
  private domain: string;

  constructor(db: Db, domain: string) {
    super(db, "activitypub");
    this.domain = domain;

    // Create any needed indexes
    this.collection.createIndex({ id: 1 }, { unique: true });
    this.collection.createIndex({ type: 1 });
  }

  async findById(id: string): Promise<ActivityPubObject | null> {
    return this.findOne({ id });
  }

  async findByType(
    type: string,
    page = 1,
    limit = 20,
  ): Promise<ActivityPubObject[]> {
    const skip = (page - 1) * limit;
    return this.collection
      .find({ type })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  /**
   * Save an ActivityPub activity to the database
   * @param activity The activity object to save
   * @param targetUsername The username of the target actor
   * @returns The saved activity object
   */
  async saveActivity(
    activity: Partial<ActivityPubObject>,
    targetUsername: string,
  ): Promise<ActivityPubObject> {
    // Add metadata to the activity
    const activityToSave = {
      ...activity,
      targetUsername,
      processedAt: new Date(),
    };

    // Generate an ID if not present
    if (!activityToSave.id) {
      activityToSave.id = `https://${this.domain}/activities/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    // Insert or update the activity
    await this.collection.updateOne(
      { id: activityToSave.id },
      { $set: activityToSave },
      { upsert: true },
    );

    return activityToSave;
  }
}

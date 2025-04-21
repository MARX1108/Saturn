'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActivityPubRepository = void 0;
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class ActivityPubRepository extends baseRepository_1.MongoRepository {
  constructor(db, domain) {
    super(db, 'activitypub');
    this.domain = domain;
    // Create any needed indexes
    this.collection.createIndex({ id: 1 }, { unique: true });
    this.collection.createIndex({ type: 1 });
  }
  async findById(id) {
    return this.findOne({ id });
  }
  async findByType(type, page = 1, limit = 20) {
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
  async saveActivity(activity, targetUsername) {
    // Add metadata to the activity
    const activityToSave = {
      ...activity,
      targetUsername,
      processedAt: new Date(),
    };
    // Ensure `id` is always a string
    if (!activityToSave.id) {
      activityToSave.id = `https://${this.domain}/activities/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    } else {
      activityToSave.id = String(activityToSave.id); // Ensure type consistency
    }
    // Insert or update the activity
    await this.collection.updateOne(
      { id: activityToSave.id },
      { $set: activityToSave },
      { upsert: true }
    );
    // Explicitly cast to ActivityPubObject to satisfy TypeScript
    return activityToSave;
  }
}
exports.ActivityPubRepository = ActivityPubRepository;

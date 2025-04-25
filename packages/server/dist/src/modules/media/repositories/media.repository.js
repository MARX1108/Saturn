'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MediaRepository = void 0;
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class MediaRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'media');
    // Create indexes for common media queries
    void this.collection.createIndex({ id: 1 }, { unique: true });
    void this.collection.createIndex({ userId: 1 });
  }
  async findByUserId(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.collection
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
}
exports.MediaRepository = MediaRepository;

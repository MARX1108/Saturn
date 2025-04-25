'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MongoRepository = void 0;
const mongodb_1 = require('mongodb');
class MongoRepository {
  constructor(db, collectionName) {
    this.collection = db.collection(collectionName);
  }
  async findById(id) {
    try {
      const result = await this.collection.findOne({
        _id: new mongodb_1.ObjectId(id),
      });
      return result ? { ...result, _id: undefined } : null; // Map `WithId<T>` to `T`
    } catch (error) {
      console.error(`Error finding document by ID: ${String(error)}`);
      return null;
    }
  }
  async findOne(filter) {
    const result = await this.collection.findOne(filter);
    return result ? { ...result, _id: undefined } : null; // Map `WithId<T>` to `T`
  }
  async findAll(filter = {}) {
    const results = await this.collection.find(filter).toArray();
    return results.map(result => ({ ...result, _id: undefined })); // Map `WithId<T>` to `T`
  }
  async create(data) {
    const result = await this.collection.insertOne(data);
    return { ...data, _id: result.insertedId }; // Ensure `_id` is included in the return type
  }
  async update(id, data) {
    const result = await this.collection.updateOne(
      { _id: new mongodb_1.ObjectId(id) },
      { $set: data }
    );
    return result.modifiedCount > 0;
  }
  async delete(id) {
    const result = await this.collection.deleteOne({
      _id: new mongodb_1.ObjectId(id),
    });
    return result.deletedCount > 0;
  }
}
exports.MongoRepository = MongoRepository;

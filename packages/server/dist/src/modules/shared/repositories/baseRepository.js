'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MongoRepository = void 0;
class MongoRepository {
  constructor(db, collectionName) {
    this.collection = db.collection(collectionName);
  }
  async findById(id) {
    try {
      const result = await this.collection.findOne({ _id: id });
      return result;
    } catch (error) {
      console.error(`Error finding document by ID: ${error}`);
      return null;
    }
  }
  async findOne(filter) {
    const result = await this.collection.findOne(filter);
    return result;
  }
  async findAll(filter = {}) {
    const results = await this.collection.find(filter).toArray();
    return results;
  }
  async create(data) {
    const result = await this.collection.insertOne(data);
    return { ...data, _id: result.insertedId.toString() };
  }
  async update(id, data) {
    const result = await this.collection.updateOne(
      { _id: id },
      {
        $set: data,
      }
    );
    return result.modifiedCount > 0;
  }
  async delete(id) {
    const result = await this.collection.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
exports.MongoRepository = MongoRepository;

'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MongoRepository = void 0;
const mongodb_1 = require('mongodb');
const logger_1 = __importDefault(require('../../../utils/logger'));
class MongoRepository {
  constructor(db, collectionName) {
    this.collection = db.collection(collectionName);
  }
  toObjectId(id) {
    if (typeof id === 'string') {
      try {
        return new mongodb_1.ObjectId(id);
      } catch (error) {
        logger_1.default.error({ id, err: error }, 'Invalid ObjectId format');
        throw new Error(`Invalid ID format: ${id}`);
      }
    } else if (id instanceof mongodb_1.ObjectId) {
      return id;
    } else {
      throw new Error(`Unsupported ID type: ${typeof id}`);
    }
  }
  async findById(id) {
    try {
      const objectId = this.toObjectId(id);
      const result = await this.collection.findOne({
        _id: objectId,
      });
      return result;
    } catch (error) {
      logger_1.default.error(
        { id, err: error },
        'Error finding document by ID'
      );
      return null;
    }
  }
  async findOne(filter) {
    const result = await this.collection.findOne(filter);
    return result;
  }
  async find(filter = {}, options) {
    const cursor = this.collection.find(filter, options);
    return cursor.toArray();
  }
  async create(data) {
    const result = await this.collection.insertOne(data);
    return { ...data, _id: result.insertedId };
  }
  async createWithId(id, data) {
    const objectId = this.toObjectId(id);
    const docToInsert = { ...data, _id: objectId };
    await this.collection.insertOne(docToInsert);
    return docToInsert;
  }
  async updateById(id, data) {
    try {
      const objectId = this.toObjectId(id);
      const isUpdateOperator =
        '$set' in data ||
        '$inc' in data ||
        '$addToSet' in data ||
        '$pull' in data;
      const updateDoc = isUpdateOperator ? data : { $set: data };
      const result = await this.collection.updateOne(
        { _id: objectId },
        updateDoc
      );
      return result.modifiedCount > 0;
    } catch (error) {
      logger_1.default.error(
        { id, err: error },
        'Error updating document by ID'
      );
      return false;
    }
  }
  async findOneAndUpdate(filter, update, options) {
    const result = await this.collection.findOneAndUpdate(
      filter,
      update,
      options || {}
    );
    return result;
  }
  async deleteById(id) {
    const objectId = this.toObjectId(id);
    const result = await this.collection.deleteOne({
      _id: objectId,
    });
    return result.deletedCount > 0;
  }
  async deleteOne(filter, options) {
    try {
      const result = await this.collection.deleteOne(filter, options);
      return result.deletedCount > 0;
    } catch (error) {
      logger_1.default.error({ filter, err: error }, 'Error deleting document');
      return false;
    }
  }
  async countDocuments(filter = {}, options) {
    return this.collection.countDocuments(filter, options);
  }
}
exports.MongoRepository = MongoRepository;

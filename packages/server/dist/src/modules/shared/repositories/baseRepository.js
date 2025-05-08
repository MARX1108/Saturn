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
      console.log(`[BaseRepository] Finding document by ID: ${id}`);
      let objectId;
      try {
        objectId = this.toObjectId(id);
        console.log(`[BaseRepository] Using ObjectId: ${objectId}`);
      } catch (idError) {
        console.error(
          `[BaseRepository] Error converting ID to ObjectId: ${id}`,
          idError
        );
        return null;
      }
      // Check that the ID is actually valid
      if (!objectId || !mongodb_1.ObjectId.isValid(objectId.toString())) {
        console.error(`[BaseRepository] Invalid ObjectId: ${objectId}`);
        return null;
      }
      // Using two separate queries to avoid TypeScript issues
      let result = await this.collection.findOne({
        _id: objectId,
      });
      // If not found by _id, try by id field (string version)
      if (!result) {
        const idField = { id: objectId.toString() };
        result = await this.collection.findOne(idField);
      }
      if (!result) {
        console.error(
          `[BaseRepository] No document found with ID: ${objectId}`
        );
      } else {
        console.log(`[BaseRepository] Found document with ID: ${objectId}`);
      }
      return result;
    } catch (error) {
      console.error(
        `[BaseRepository] Error finding document by ID ${id}:`,
        error
      );
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
    try {
      console.log(`[BaseRepository] Executing findOneAndUpdate`);
      console.log(`[BaseRepository] Filter:`, JSON.stringify(filter));
      console.log(`[BaseRepository] Update:`, JSON.stringify(update));
      console.log(`[BaseRepository] Options:`, JSON.stringify(options || {}));
      // Ensure we have a default options object
      const defaultOptions = {
        returnDocument: 'after',
      };
      const mergedOptions = { ...defaultOptions, ...options };
      // Check for _id in filter and handle properly
      const safeFilter = { ...filter };
      if (safeFilter && '_id' in safeFilter) {
        const id = safeFilter._id;
        console.log(`[BaseRepository] Found _id in filter:`, id);
        // Make sure it's a proper ObjectId
        if (typeof id === 'string' && mongodb_1.ObjectId.isValid(id)) {
          console.log(
            `[BaseRepository] Converting string ID to ObjectId: ${id}`
          );
          // Create a new filter to avoid type issues
          const newFilter = { ...safeFilter };
          delete newFilter._id;
          // @ts-expect-error - We know this is the correct type at runtime
          newFilter._id = new mongodb_1.ObjectId(id);
          // Use the corrected filter for the rest of the operation
          safeFilter._id = newFilter._id;
        } else if (id instanceof mongodb_1.ObjectId) {
          // Already an ObjectId, do nothing
          console.log(`[BaseRepository] Using existing ObjectId: ${id}`);
        } else {
          console.error(`[BaseRepository] Invalid _id format in filter: ${id}`);
          return null;
        }
      }
      // Direct access to MongoDB findOneAndUpdate with explicit options
      const result = await this.collection.findOneAndUpdate(
        safeFilter,
        update,
        mergedOptions
      );
      if (!result) {
        console.error(`[BaseRepository] findOneAndUpdate returned null`);
        return null;
      }
      console.log(
        `[BaseRepository] Successfully updated document with ID: ${result._id}`
      );
      return result;
    } catch (error) {
      console.error(`[BaseRepository] Error in findOneAndUpdate:`, error);
      logger_1.default.error(
        { filter, update, options, err: error },
        'Error in findOneAndUpdate'
      );
      throw error;
    }
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

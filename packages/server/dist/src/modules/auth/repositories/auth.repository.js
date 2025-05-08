'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
const logger_1 = __importDefault(require('../../../utils/logger')); // Assuming logger setup
class AuthRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'actors');
    this.ensureIndexes();
  }
  async ensureIndexes() {
    try {
      // Create indexes for common auth queries
      await this.collection.createIndex({ username: 1 }, { unique: true });
      // Explicitly match the existing index spec (sparse: true)
      await this.collection.createIndex(
        { email: 1 },
        { unique: true, sparse: true }
      );
    } catch (error) {
      // Ignore errors if index already exists or conflicts, log others
      if (
        error instanceof mongodb_1.MongoServerError &&
        (error.codeName === 'IndexOptionsConflict' || // Code 85
          error.codeName === 'IndexKeySpecsConflict' || // Code 86
          error.message.includes('already exists'))
      ) {
        logger_1.default.warn(
          { indexName: error.message.match(/index: (\S+)/)?.[1] },
          `Index creation conflict/exists in AuthRepository, likely harmless: ${error.message}`
        );
      } else {
        logger_1.default.error(
          { err: error },
          'Error creating indexes in AuthRepository'
        );
        // Optional: re-throw if critical
        // throw error;
      }
    }
  }
  async findByUsername(username) {
    return this.findOne({ preferredUsername: username });
  }
  async findByEmail(email) {
    return this.findOne({ email });
  }
  async findById(id) {
    console.log('[AuthRepository] Looking up user by id:', id);
    // Try to find by _id field first
    let result = await this.findOne({ _id: id });
    // If not found, try by id field
    if (!result) {
      result = await this.findOne({ id: id });
    }
    console.log(
      '[AuthRepository] findById result:',
      result ? 'Found' : 'Not found'
    );
    // If not found, try alternative lookups
    if (!result) {
      console.log('[AuthRepository] Trying alternative lookups for id:', id);
      // Try by id property (ActivityPub ID) if the id looks like a URL
      if (id.startsWith('http')) {
        console.log('[AuthRepository] Looking up by AP id');
        const apResult = await this.findOne({ id });
        if (apResult) {
          console.log('[AuthRepository] Found by AP id');
          return apResult;
        }
      }
      // Try string equality match against _id as a fallback
      console.log(
        '[AuthRepository] Looking up with string equality on _id field'
      );
      const stringResult = await this.collection.findOne({
        $expr: { $eq: [{ $toString: '$_id' }, id] },
      });
      if (stringResult) {
        console.log('[AuthRepository] Found with string equality on _id');
        return stringResult;
      }
      console.log('[AuthRepository] Failed all lookup attempts');
    }
    return result;
  }
}
exports.AuthRepository = AuthRepository;

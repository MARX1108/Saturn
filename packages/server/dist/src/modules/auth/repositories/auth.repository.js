'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
const logger_1 = require('../../../utils/logger'); // Assuming logger setup
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
        logger_1.logger.warn(
          { indexName: error.message.match(/index: (\S+)/)?.[1] },
          `Index creation conflict/exists in AuthRepository, likely harmless: ${error.message}`
        );
      } else {
        logger_1.logger.error(
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
    return this.findOne({ _id: id });
  }
}
exports.AuthRepository = AuthRepository;

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AuthRepository = void 0;
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class AuthRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'actors');
    // Create indexes for common auth queries
    void this.collection.createIndex({ username: 1 }, { unique: true });
    void this.collection.createIndex({ email: 1 }, { unique: true });
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

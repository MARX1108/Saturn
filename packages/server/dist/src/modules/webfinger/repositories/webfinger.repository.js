'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.WebfingerRepository = void 0;
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class WebfingerRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'webfinger');
    // Create indexes for common webfinger queries
    this.collection.createIndex({ subject: 1 }, { unique: true });
  }
  async findBySubject(subject) {
    return this.findOne({ subject });
  }
  async findByAlias(alias) {
    return this.findOne({ aliases: alias });
  }
}
exports.WebfingerRepository = WebfingerRepository;

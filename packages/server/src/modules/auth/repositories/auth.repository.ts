import { Db, MongoServerError } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { DbUser } from '../models/user';
import { logger } from '../../../utils/logger'; // Assuming logger setup

export class AuthRepository extends MongoRepository<DbUser> {
  constructor(db: Db) {
    super(db, 'actors');
    this.ensureIndexes();
  }

  private async ensureIndexes(): Promise<void> {
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
        error instanceof MongoServerError &&
        (error.codeName === 'IndexOptionsConflict' || // Code 85
          error.codeName === 'IndexKeySpecsConflict' || // Code 86
          error.message.includes('already exists'))
      ) {
        logger.warn(
          { indexName: error.message.match(/index: (\S+)/)?.[1] },
          `Index creation conflict/exists in AuthRepository, likely harmless: ${error.message}`
        );
      } else {
        logger.error(
          { err: error },
          'Error creating indexes in AuthRepository'
        );
        // Optional: re-throw if critical
        // throw error;
      }
    }
  }

  async findByUsername(username: string): Promise<DbUser | null> {
    return this.findOne({ preferredUsername: username });
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    return this.findOne({ email });
  }

  async findById(id: string): Promise<DbUser | null> {
    return this.findOne({ _id: id });
  }
}

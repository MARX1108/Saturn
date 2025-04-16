import { Db } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { DbUser } from '../models/user';

// Define basic Auth types - expand as needed
interface User {
  id: string;
  username: string;
  password: string; // This should be hashed
  email: string;
  createdAt: Date;
  [key: string]: any;
}

export class AuthRepository extends MongoRepository<DbUser> {
  constructor(db: Db) {
    super(db, 'actors');

    // Create indexes for common auth queries
    this.collection.createIndex({ username: 1 }, { unique: true });
    this.collection.createIndex({ email: 1 }, { unique: true });
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

import { Db } from "mongodb";
import { MongoRepository } from "../../shared/repositories/baseRepository";

// Define basic Auth types - expand as needed
interface User {
  id: string;
  username: string;
  password: string; // This should be hashed
  email: string;
  createdAt: Date;
  [key: string]: any;
}

export class AuthRepository extends MongoRepository<User> {
  constructor(db: Db) {
    super(db, "users");
    
    // Create indexes for common auth queries
    this.collection.createIndex({ username: 1 }, { unique: true });
    this.collection.createIndex({ email: 1 }, { unique: true });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ id });
  }
}
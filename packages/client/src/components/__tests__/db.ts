// Mock database for testing
import { Db, Collection } from "mongodb";

export class MockCollection {
  private documents: any[] = [];
  private indices: Record<string, { unique: boolean }> = {};

  constructor() {
    this.documents = [];
  }

  createIndex(fields: any, options?: any) {
    const fieldName = Object.keys(fields)[0];
    this.indices[fieldName] = options || {};
    return Promise.resolve();
  }

  async findOne(query: any) {
    const key = Object.keys(query)[0];
    const value = query[key];
    return this.documents.find((doc) => doc[key] === value) || null;
  }

  async find(query?: any) {
    if (!query) return { toArray: () => Promise.resolve([...this.documents]) };

    // Simple query matching for tests
    let results = this.documents;
    if (query.$or) {
      results = this.documents.filter((doc) => {
        return query.$or.some((condition: any) => {
          const field = Object.keys(condition)[0];
          const matcher = condition[field];
          if (matcher.$regex) {
            const regex = new RegExp(matcher.$regex, matcher.$options);
            return regex.test(doc[field]);
          }
          return doc[field] === matcher;
        });
      });
    } else {
      // Direct field matching
      results = this.documents.filter((doc) => {
        for (const field in query) {
          if (doc[field] !== query[field]) return false;
        }
        return true;
      });
    }

    return { toArray: () => Promise.resolve(results) };
  }

  async insertOne(document: any) {
    // Check for unique constraints
    for (const field in this.indices) {
      if (this.indices[field].unique) {
        const existingDoc = this.documents.find(
          (doc) => doc[field] === document[field]
        );
        if (existingDoc) {
          throw new Error(`Duplicate key error: ${field}`);
        }
      }
    }

    this.documents.push(document);
    return {
      insertedId: document._id || "mock-id",
      acknowledged: true,
    };
  }

  async deleteMany(query: any = {}) {
    if (Object.keys(query).length === 0) {
      const count = this.documents.length;
      this.documents = [];
      return { deletedCount: count };
    }

    const initialCount = this.documents.length;
    this.documents = this.documents.filter((doc) => {
      for (const field in query) {
        if (doc[field] === query[field]) return false;
      }
      return true;
    });

    return { deletedCount: initialCount - this.documents.length };
  }
}

export class MockDb {
  private collections: Record<string, MockCollection> = {};

  collection(name: string): MockCollection {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection();
    }
    return this.collections[name];
  }
}

export const createMockDb = (): Db => {
  return new MockDb() as unknown as Db;
};

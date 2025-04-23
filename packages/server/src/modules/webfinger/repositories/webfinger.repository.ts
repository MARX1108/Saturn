import { Db } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';

// Define property value types for Webfinger
type WebfingerPropertyValue =
  | string
  | number
  | boolean
  | null
  | WebfingerPropertyObject;

interface WebfingerPropertyObject {
  [key: string]: WebfingerPropertyValue | WebfingerPropertyValue[];
}

// Define basic Webfinger resource type
interface WebfingerResource {
  id: string;
  subject: string;
  aliases?: string[];
  properties?: Record<string, WebfingerPropertyValue>;
  links?: Array<{
    rel: string;
    type?: string;
    href?: string;
    titles?: Record<string, string>;
    properties?: Record<string, WebfingerPropertyValue>;
  }>;
}

export class WebfingerRepository extends MongoRepository<WebfingerResource> {
  constructor(db: Db) {
    super(db, 'webfinger');

    // Create indexes for common webfinger queries
    void this.collection.createIndex({ subject: 1 }, { unique: true });
  }

  async findBySubject(subject: string): Promise<WebfingerResource | null> {
    return this.findOne({ subject });
  }

  async findByAlias(alias: string): Promise<WebfingerResource | null> {
    return this.findOne({ aliases: alias });
  }
}

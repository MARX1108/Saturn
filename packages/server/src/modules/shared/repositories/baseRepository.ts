import {
  Collection,
  Db,
  Filter,
  FindOptions,
  ModifyResult as _ModifyResult,
  OptionalId as _OptionalId,
  Document,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateFilter,
  WithId,
  CountDocumentsOptions,
  DeleteOptions,
  FindOneAndUpdateOptions,
} from 'mongodb';
import logger from '../../../utils/logger';

export interface BaseRepository<T extends Document> {
  findById(id: string | ObjectId): Promise<WithId<T> | null>;
  findOne(filter: Filter<T>): Promise<WithId<T> | null>;
  find(filter?: Filter<T>, options?: FindOptions<T>): Promise<WithId<T>[]>;
  create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>>;
  updateById(
    id: string | ObjectId,
    data: UpdateFilter<T> | Partial<T>
  ): Promise<boolean>;
  deleteById(id: string | ObjectId): Promise<boolean>;
  findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: FindOneAndUpdateOptions
  ): Promise<WithId<T> | null>;
  countDocuments(
    filter?: Filter<T>,
    options?: CountDocumentsOptions
  ): Promise<number>;
  deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<boolean>;
}

export abstract class MongoRepository<T extends Document>
  implements BaseRepository<T>
{
  protected collection: Collection<T>;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }

  private toObjectId(id: string | ObjectId): ObjectId {
    if (typeof id === 'string') {
      try {
        return new ObjectId(id);
      } catch (error) {
        logger.error({ id, err: error }, 'Invalid ObjectId format');
        throw new Error(`Invalid ID format: ${id}`);
      }
    } else if (id instanceof ObjectId) {
      return id;
    } else {
      throw new Error(`Unsupported ID type: ${typeof id}`);
    }
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    try {
      console.log(`[BaseRepository] Finding document by ID: ${id}`);

      let objectId: ObjectId;
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
      if (!objectId || !ObjectId.isValid(objectId.toString())) {
        console.error(`[BaseRepository] Invalid ObjectId: ${objectId}`);
        return null;
      }

      // Using two separate queries to avoid TypeScript issues
      let result = await this.collection.findOne({
        _id: objectId,
      } as Filter<T>);

      // If not found by _id, try by id field (string version)
      if (!result) {
        const idField = { id: objectId.toString() };
        result = await this.collection.findOne(idField as unknown as Filter<T>);
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
      logger.error({ id, err: error }, 'Error finding document by ID');
      return null;
    }
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    const result = await this.collection.findOne(filter);
    return result;
  }

  async find(
    filter: Filter<T> = {},
    options?: FindOptions<T>
  ): Promise<WithId<T>[]> {
    const cursor = this.collection.find(filter, options);
    return cursor.toArray();
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<WithId<T>> {
    const result = await this.collection.insertOne(data);
    return { ...data, _id: result.insertedId } as WithId<T>;
  }

  async createWithId(
    id: string | ObjectId,
    data: Omit<T, '_id'>
  ): Promise<WithId<T>> {
    const objectId = this.toObjectId(id);
    const docToInsert = { ...data, _id: objectId };
    await this.collection.insertOne(
      docToInsert as unknown as OptionalUnlessRequiredId<T>
    );
    return docToInsert as WithId<T>;
  }

  async updateById(
    id: string | ObjectId,
    data: UpdateFilter<T> | Partial<T>
  ): Promise<boolean> {
    try {
      const objectId = this.toObjectId(id);

      const isUpdateOperator =
        '$set' in data ||
        '$inc' in data ||
        '$addToSet' in data ||
        '$pull' in data;

      const updateDoc = isUpdateOperator
        ? (data as UpdateFilter<T>)
        : ({ $set: data } as UpdateFilter<T>);

      const result = await this.collection.updateOne(
        { _id: objectId } as Filter<T>,
        updateDoc
      );
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error({ id, err: error }, 'Error updating document by ID');
      return false;
    }
  }

  async findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    options?: FindOneAndUpdateOptions
  ): Promise<WithId<T> | null> {
    try {
      console.log(`[BaseRepository] Executing findOneAndUpdate`);
      console.log(`[BaseRepository] Filter:`, JSON.stringify(filter));
      console.log(`[BaseRepository] Update:`, JSON.stringify(update));
      console.log(`[BaseRepository] Options:`, JSON.stringify(options || {}));

      // Ensure we have a default options object
      const defaultOptions: FindOneAndUpdateOptions = {
        returnDocument: 'after',
      };
      const mergedOptions = { ...defaultOptions, ...options };

      // Check for _id in filter and handle properly
      const safeFilter = { ...filter };

      if (safeFilter && '_id' in safeFilter) {
        const id = safeFilter._id;
        console.log(`[BaseRepository] Found _id in filter:`, id);

        // Make sure it's a proper ObjectId
        if (typeof id === 'string' && ObjectId.isValid(id)) {
          console.log(
            `[BaseRepository] Converting string ID to ObjectId: ${id}`
          );
          // Create a new filter to avoid type issues
          const newFilter = { ...safeFilter };
          delete newFilter._id;
          // @ts-expect-error - We know this is the correct type at runtime
          newFilter._id = new ObjectId(id);

          // Use the corrected filter for the rest of the operation
          safeFilter._id = newFilter._id;
        } else if (id instanceof ObjectId) {
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
      return result as WithId<T>;
    } catch (error) {
      console.error(`[BaseRepository] Error in findOneAndUpdate:`, error);
      logger.error(
        { filter, update, options, err: error },
        'Error in findOneAndUpdate'
      );
      throw error;
    }
  }

  async deleteById(id: string | ObjectId): Promise<boolean> {
    const objectId = this.toObjectId(id);
    const result = await this.collection.deleteOne({
      _id: objectId,
    } as Filter<T>);
    return result.deletedCount > 0;
  }

  async deleteOne(
    filter: Filter<T>,
    options?: DeleteOptions
  ): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne(filter, options);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error({ filter, err: error }, 'Error deleting document');
      return false;
    }
  }

  async countDocuments(
    filter: Filter<T> = {},
    options?: CountDocumentsOptions
  ): Promise<number> {
    return this.collection.countDocuments(filter, options);
  }
}

'use strict';
/**
 * @deprecated This file is deprecated. Use MongoRepository from modules/shared/repositories/baseRepository.ts instead.
 * This file is kept for backward compatibility but will be removed in a future update.
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.BaseRepository = void 0;
/**
 * @deprecated Use MongoRepository from modules/shared/repositories/baseRepository.ts instead.
 */
class BaseRepository {
  constructor(modelConstructor, modelName) {
    this.modelConstructor = modelConstructor;
    this.modelName = modelName;
  }
  async delete(filter) {
    const model = this.modelConstructor;
    try {
      const result = await model.destroy({
        where: filter,
      });
      return result;
    } catch (_error) {
      console.error(
        `Error deleting ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error deleting ${this.modelName}`);
    }
  }
  async findAll(options = {}) {
    const model = this.modelConstructor;
    try {
      const results = await model.findAll(options);
      return results;
    } catch (_error) {
      console.error(
        `Error finding all ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error finding all ${this.modelName}`);
    }
  }
  async findById(id, options = {}) {
    const model = this.modelConstructor;
    try {
      const result = await model.findByPk(id, options);
      return result;
    } catch (_error) {
      console.error(
        `Error finding ${this.modelName} by ID:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error finding ${this.modelName} by ID`);
    }
  }
  async findOne(options = {}) {
    const model = this.modelConstructor;
    try {
      const result = await model.findOne(options);
      return result;
    } catch (_error) {
      console.error(
        `Error finding one ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error finding one ${this.modelName}`);
    }
  }
  async update(filter, update) {
    const model = this.modelConstructor;
    try {
      const result = await model.update(update, {
        where: filter,
        returning: true,
      });
      return result;
    } catch (_error) {
      console.error(
        `Error updating ${this.modelName}:`,
        JSON.stringify(_error)
      );
      throw new Error(`Error updating ${this.modelName}`);
    }
  }
}
exports.BaseRepository = BaseRepository;

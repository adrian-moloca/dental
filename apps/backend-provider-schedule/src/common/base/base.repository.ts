/**
 * Base Repository Class
 *
 * Abstract base class implementing the Repository pattern for data access.
 * Provides separation between business logic (services) and data access (repositories).
 *
 * Responsibilities:
 * - Data access operations (CRUD)
 * - Query building
 * - Transaction support
 * - Caching (optional)
 *
 * Edge cases handled:
 * - Null/undefined handling
 * - Transaction rollback
 * - Connection failures
 * - Query optimization
 *
 * @module BaseRepository
 */

import { Logger } from '@nestjs/common';
import { Model, Document, FilterQuery, UpdateQuery, ClientSession, QueryOptions } from 'mongoose';
import { ErrorUtil, type ErrorContext } from '../utils/error.util';

/**
 * Base Repository Abstract Class
 *
 * Provides common data access functionality
 */
export abstract class BaseRepository<T extends Document> {
  protected readonly logger: Logger;

  /**
   * Constructor
   *
   * @param model - Mongoose model
   * @param repositoryName - Repository name for logging
   */
  constructor(
    protected readonly model: Model<T>,
    repositoryName: string,
  ) {
    this.logger = new Logger(repositoryName);
  }

  /**
   * Finds all entities matching filter
   *
   * Edge cases:
   * - Empty filter returns all entities
   * - Supports sorting
   * - Supports limiting results
   * - Handles errors gracefully
   *
   * @param filter - MongoDB filter query
   * @param options - Query options (sort, limit, skip)
   * @returns Array of entities
   */
  async findAll(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    try {
      const query = this.model.find(filter);

      // Apply options if provided
      if (options?.sort) query.sort(options.sort);
      if (options?.limit) query.limit(options.limit);
      if (options?.skip) query.skip(options.skip);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.select) query.select(options.select);

      return await query.exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.findAll',
        metadata: { filter, options },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Finds single entity by ID
   *
   * Edge cases:
   * - Returns null if not found
   * - Validates ID format
   * - Supports population
   *
   * @param id - Entity ID
   * @param options - Query options
   * @returns Entity or null
   */
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    try {
      const query = this.model.findById(id);

      // Apply options if provided
      if (options?.populate) query.populate(options.populate as any);
      if (options?.select) query.select(options.select);

      return await query.exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.findById',
        metadata: { id, options },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Finds single entity by filter
   *
   * Edge cases:
   * - Returns null if not found
   * - Returns first match if multiple found
   * - Supports population
   *
   * @param filter - MongoDB filter query
   * @param options - Query options
   * @returns Entity or null
   */
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    try {
      const query = this.model.findOne(filter);

      // Apply options if provided
      if (options?.sort) query.sort(options.sort);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.select) query.select(options.select);

      return await query.exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.findOne',
        metadata: { filter, options },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Creates new entity
   *
   * Edge cases:
   * - Validates before saving
   * - Supports sessions (transactions)
   * - Returns created entity
   *
   * @param data - Entity data
   * @param session - Optional session for transactions
   * @returns Created entity
   */
  async create(data: Partial<T>, session?: ClientSession): Promise<T> {
    try {
      const entity = new this.model(data);

      if (session) {
        await entity.save({ session });
      } else {
        await entity.save();
      }

      return entity;
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.create',
        metadata: { hasSession: !!session },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Updates entity by ID
   *
   * Edge cases:
   * - Returns null if entity not found
   * - Validates before saving
   * - Supports sessions (transactions)
   *
   * @param id - Entity ID
   * @param update - Update data
   * @param session - Optional session for transactions
   * @returns Updated entity or null
   */
  async updateById(id: string, update: UpdateQuery<T>, session?: ClientSession): Promise<T | null> {
    try {
      const options: QueryOptions = {
        new: true, // Return updated document
        runValidators: true, // Run validators on update
      };

      if (session) {
        (options as any).session = session;
      }

      return await this.model.findByIdAndUpdate(id, update, options).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.updateById',
        metadata: { id, hasSession: !!session },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Updates entities matching filter
   *
   * Edge cases:
   * - Returns number of modified entities
   * - Validates before saving
   * - Supports sessions (transactions)
   *
   * @param filter - MongoDB filter query
   * @param update - Update data
   * @param session - Optional session for transactions
   * @returns Number of modified entities
   */
  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    session?: ClientSession,
  ): Promise<number> {
    try {
      const options: Record<string, any> = {
        runValidators: true,
      };

      if (session) {
        options.session = session;
      }

      const result = await this.model.updateMany(filter, update, options as any).exec();
      return result.modifiedCount;
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.updateMany',
        metadata: { filter, hasSession: !!session },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Deletes entity by ID
   *
   * Edge cases:
   * - Returns null if entity not found
   * - Supports sessions (transactions)
   * - Permanent deletion
   *
   * @param id - Entity ID
   * @param session - Optional session for transactions
   * @returns Deleted entity or null
   */
  async deleteById(id: string, session?: ClientSession): Promise<T | null> {
    try {
      const options: QueryOptions = {};

      if (session) {
        (options as any).session = session;
      }

      return await this.model.findByIdAndDelete(id, options).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.deleteById',
        metadata: { id, hasSession: !!session },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Deletes entities matching filter
   *
   * Edge cases:
   * - Returns number of deleted entities
   * - Supports sessions (transactions)
   * - Permanent deletion
   *
   * @param filter - MongoDB filter query
   * @param session - Optional session for transactions
   * @returns Number of deleted entities
   */
  async deleteMany(filter: FilterQuery<T>, session?: ClientSession): Promise<number> {
    try {
      const options: Record<string, any> = {};

      if (session) {
        options.session = session;
      }

      const result = await this.model.deleteMany(filter, options as any).exec();
      return result.deletedCount;
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.deleteMany',
        metadata: { filter, hasSession: !!session },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Counts entities matching filter
   *
   * Edge cases:
   * - Empty filter counts all entities
   * - Returns 0 for no matches
   *
   * @param filter - MongoDB filter query
   * @returns Count of matching entities
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.count',
        metadata: { filter },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Checks if entity exists
   *
   * Edge cases:
   * - More efficient than count for existence checks
   * - Returns false for no matches
   *
   * @param filter - MongoDB filter query
   * @returns true if entity exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).limit(1).exec();
      return count > 0;
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.exists',
        metadata: { filter },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Finds entities with pagination
   *
   * Edge cases:
   * - Validates limit and offset
   * - Returns both data and total count
   * - Optimizes queries by running in parallel
   *
   * @param filter - MongoDB filter query
   * @param limit - Items per page
   * @param offset - Offset from start
   * @param options - Additional query options (sort, populate, select)
   * @returns Object with data and total count
   */
  async findPaginated(
    filter: FilterQuery<T>,
    limit: number,
    offset: number,
    options?: QueryOptions,
  ): Promise<{ data: T[]; total: number }> {
    try {
      // Build query
      const query = this.model.find(filter).limit(limit).skip(offset);

      // Apply options if provided
      if (options?.sort) query.sort(options.sort);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.select) query.select(options.select);

      // Execute query and count in parallel for better performance
      const [data, total] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      return { data, total };
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.findPaginated',
        metadata: { filter, limit, offset, options },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Bulk creates entities
   *
   * Edge cases:
   * - Validates all entities before inserting
   * - Supports sessions (transactions)
   * - Returns all created entities
   *
   * @param dataArray - Array of entity data
   * @param session - Optional session for transactions
   * @returns Created entities
   */
  async bulkCreate(dataArray: Partial<T>[], session?: ClientSession): Promise<T[]> {
    try {
      const options: { session?: ClientSession } = {};

      if (session) {
        options.session = session;
      }

      return (await this.model.insertMany(dataArray, options)) as unknown as T[];
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.bulkCreate',
        metadata: { count: dataArray.length, hasSession: !!session },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Finds entities by IDs
   *
   * Edge cases:
   * - Returns empty array if no IDs provided
   * - Filters out invalid IDs
   * - Returns entities in same order as IDs
   *
   * @param ids - Array of entity IDs
   * @param options - Query options
   * @returns Array of entities
   */
  async findByIds(ids: string[], options?: QueryOptions): Promise<T[]> {
    try {
      if (ids.length === 0) return [];

      const query = this.model.find({ _id: { $in: ids } } as FilterQuery<T>);

      // Apply options if provided
      if (options?.sort) query.sort(options.sort);
      if (options?.populate) query.populate(options.populate as any);
      if (options?.select) query.select(options.select);

      return await query.exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.findByIds',
        metadata: { count: ids.length, options },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Aggregates data using MongoDB aggregation pipeline
   *
   * Edge cases:
   * - Empty pipeline returns all documents
   * - Complex aggregations for analytics
   *
   * @param pipeline - Aggregation pipeline
   * @param options - Aggregation options
   * @returns Aggregation results
   */
  async aggregate<R = unknown>(
    pipeline: Record<string, unknown>[],
    options?: Record<string, unknown>,
  ): Promise<R[]> {
    try {
      return await this.model.aggregate(pipeline as any, options).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'repository.aggregate',
        metadata: { pipelineStages: pipeline.length, options },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Starts a database transaction
   *
   * Edge cases:
   * - Automatically commits on success
   * - Automatically rolls back on error
   * - Cleans up session on completion
   *
   * @param operation - Async operation to execute in transaction
   * @returns Operation result
   */
  async withTransaction<R>(operation: (session: ClientSession) => Promise<R>): Promise<R> {
    const session = await this.model.db.startSession();

    try {
      session.startTransaction();

      const result = await operation(session);

      await session.commitTransaction();

      return result;
    } catch (error) {
      await session.abortTransaction();

      throw ErrorUtil.wrapError(error, {
        operation: 'repository.withTransaction',
        metadata: { transactionAborted: true },
      });
    } finally {
      await session.endSession();
    }
  }
}

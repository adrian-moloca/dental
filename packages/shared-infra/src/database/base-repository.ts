import { Model, Document, UpdateQuery, QueryOptions, ClientSession } from 'mongoose';
import { Logger } from '@nestjs/common';

/**
 * Type alias for MongoDB filter queries
 * Replaces deprecated FilterQuery from mongoose
 */
// @ts-ignore - T is used as a generic parameter for compatibility
export type FilterQuery<T> = Record<string, any>;

/**
 * Pagination options for queries
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Number of items to skip */
  offset?: number;
  /** Sort order (e.g., { createdAt: -1 }) */
  sort?: Record<string, 1 | -1>;
}

/**
 * Paginated response structure
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Query options for repository methods
 */
export interface RepositoryQueryOptions {
  /** MongoDB session for transactions */
  session?: ClientSession;
  /** Fields to select (projection) */
  select?: string | Record<string, 0 | 1>;
  /** Use lean() for read-only operations */
  lean?: boolean;
  /** Populate related documents */
  populate?: string | string[] | Record<string, unknown>;
  /** Include soft-deleted documents */
  showDeleted?: boolean;
}

/**
 * Base repository class with standard CRUD operations
 *
 * Features:
 * - Multi-tenant scoping
 * - Pagination support
 * - Transaction support
 * - Query optimization (lean, select, populate)
 * - Soft delete support
 * - Audit field management
 *
 * @template T - Document type
 */
export abstract class BaseRepository<T extends Document> {
  protected readonly logger: Logger;

  constructor(
    protected readonly model: Model<T>,
    protected readonly modelName: string,
  ) {
    this.logger = new Logger(`${modelName}Repository`);
  }

  /**
   * Create a new document
   *
   * @param data - Document data
   * @param context - User context for audit fields
   * @param options - Query options
   * @returns Created document
   */
  async create(
    data: Partial<T>,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<T> {
    const document = new this.model({
      ...data,
      tenantId: context.tenantId,
      createdBy: context.userId,
      updatedBy: context.userId,
    });

    await document.save({ session: options.session });
    this.logger.log(`Created ${this.modelName} ${document._id}`);

    return document;
  }

  /**
   * Create multiple documents in bulk
   *
   * @param dataArray - Array of document data
   * @param context - User context for audit fields
   * @param options - Query options
   * @returns Created documents
   */
  async createMany(
    dataArray: Partial<T>[],
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<T[]> {
    const documents = dataArray.map((data) => ({
      ...data,
      tenantId: context.tenantId,
      createdBy: context.userId,
      updatedBy: context.userId,
    }));

    const created = await this.model.insertMany(documents, { session: options.session });
    this.logger.log(`Created ${created.length} ${this.modelName} documents`);

    return created as unknown as T[];
  }

  /**
   * Find a document by ID with tenant scoping
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for scoping
   * @param options - Query options
   * @returns Document or null
   */
  async findById(
    id: string,
    tenantId: string,
    options: RepositoryQueryOptions = {},
  ): Promise<T | null> {
    let query = this.model.findOne({ _id: id, tenantId } as FilterQuery<T>);

    query = this.applyQueryOptions(query, options);

    return query.exec();
  }

  /**
   * Find a single document by filter
   *
   * @param filter - Query filter
   * @param tenantId - Tenant ID for scoping
   * @param options - Query options
   * @returns Document or null
   */
  async findOne(
    filter: FilterQuery<T>,
    tenantId: string,
    options: RepositoryQueryOptions = {},
  ): Promise<T | null> {
    const scopedFilter = { ...filter, tenantId } as FilterQuery<T>;
    let query = this.model.findOne(scopedFilter);

    query = this.applyQueryOptions(query, options);

    return query.exec();
  }

  /**
   * Find multiple documents with pagination
   *
   * @param filter - Query filter
   * @param tenantId - Tenant ID for scoping
   * @param pagination - Pagination options
   * @param options - Query options
   * @returns Paginated result
   */
  async findMany(
    filter: FilterQuery<T>,
    tenantId: string,
    pagination: PaginationOptions = {},
    options: RepositoryQueryOptions = {},
  ): Promise<PaginatedResult<T>> {
    const scopedFilter = { ...filter, tenantId } as FilterQuery<T>;

    // Calculate pagination
    const limit = pagination.limit || 20;
    const page = pagination.page || 1;
    const offset = pagination.offset ?? (page - 1) * limit;
    const sort = pagination.sort || { createdAt: -1 };

    // Execute queries in parallel
    let dataQuery = this.model.find(scopedFilter).limit(limit).skip(offset).sort(sort);
    dataQuery = this.applyQueryOptions(dataQuery, options);

    const [data, total] = await Promise.all([
      dataQuery.exec(),
      this.model.countDocuments(scopedFilter).exec(),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Find all documents matching filter (use with caution)
   *
   * @param filter - Query filter
   * @param tenantId - Tenant ID for scoping
   * @param options - Query options
   * @returns Array of documents
   */
  async findAll(
    filter: FilterQuery<T>,
    tenantId: string,
    options: RepositoryQueryOptions = {},
  ): Promise<T[]> {
    const scopedFilter = { ...filter, tenantId } as FilterQuery<T>;
    let query = this.model.find(scopedFilter);

    query = this.applyQueryOptions(query, options);

    return query.exec();
  }

  /**
   * Update a document by ID
   *
   * @param id - Document ID
   * @param update - Update data
   * @param context - User context for audit fields
   * @param options - Query options
   * @returns Updated document or null
   */
  async updateById(
    id: string,
    update: UpdateQuery<T>,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<T | null> {
    const updateData = {
      ...update,
      updatedBy: context.userId,
    };

    const queryOptions: QueryOptions = {
      new: true, // Return updated document
      runValidators: true,
      session: options.session,
    };

    const document = await this.model
      .findOneAndUpdate(
        { _id: id, tenantId: context.tenantId } as FilterQuery<T>,
        updateData,
        queryOptions,
      )
      .exec();

    if (document) {
      this.logger.log(`Updated ${this.modelName} ${id}`);
    }

    return document;
  }

  /**
   * Update a single document by filter
   *
   * @param filter - Query filter
   * @param update - Update data
   * @param context - User context for audit fields
   * @param options - Query options
   * @returns Updated document or null
   */
  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<T | null> {
    const scopedFilter = { ...filter, tenantId: context.tenantId } as FilterQuery<T>;
    const updateData = {
      ...update,
      updatedBy: context.userId,
    };

    const queryOptions: QueryOptions = {
      new: true,
      runValidators: true,
      session: options.session,
    };

    const document = await this.model
      .findOneAndUpdate(scopedFilter, updateData, queryOptions)
      .exec();

    if (document) {
      this.logger.log(`Updated ${this.modelName} ${document._id}`);
    }

    return document;
  }

  /**
   * Update multiple documents
   *
   * @param filter - Query filter
   * @param update - Update data
   * @param context - User context for audit fields
   * @param options - Query options
   * @returns Number of documents updated
   */
  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<number> {
    const scopedFilter = { ...filter, tenantId: context.tenantId } as FilterQuery<T>;
    const updateData = {
      ...update,
      updatedBy: context.userId,
    };

    const result = await this.model
      .updateMany(scopedFilter, updateData, { session: options.session })
      .exec();

    this.logger.log(`Updated ${result.modifiedCount} ${this.modelName} documents`);

    return result.modifiedCount;
  }

  /**
   * Soft delete a document by ID
   *
   * @param id - Document ID
   * @param context - User context for audit fields
   * @param options - Query options
   * @returns Deleted document or null
   */
  async softDeleteById(
    id: string,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<T | null> {
    const updateData = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: context.userId,
      updatedBy: context.userId,
    };

    const document = await this.model
      .findOneAndUpdate(
        { _id: id, tenantId: context.tenantId } as FilterQuery<T>,
        updateData,
        { new: true, session: options.session },
      )
      .exec();

    if (document) {
      this.logger.log(`Soft deleted ${this.modelName} ${id}`);
    }

    return document;
  }

  /**
   * Hard delete a document by ID (use with caution)
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for scoping
   * @param options - Query options
   * @returns Deleted document or null
   */
  async deleteById(
    id: string,
    tenantId: string,
    options: RepositoryQueryOptions = {},
  ): Promise<T | null> {
    const document = await this.model
      .findOneAndDelete({ _id: id, tenantId } as FilterQuery<T>, {
        session: options.session,
      })
      .exec();

    if (document) {
      this.logger.log(`Hard deleted ${this.modelName} ${id}`);
    }

    return document;
  }

  /**
   * Count documents matching filter
   *
   * @param filter - Query filter
   * @param tenantId - Tenant ID for scoping
   * @returns Document count
   */
  async count(filter: FilterQuery<T>, tenantId: string): Promise<number> {
    const scopedFilter = { ...filter, tenantId } as FilterQuery<T>;
    return this.model.countDocuments(scopedFilter).exec();
  }

  /**
   * Check if a document exists
   *
   * @param filter - Query filter
   * @param tenantId - Tenant ID for scoping
   * @returns true if document exists
   */
  async exists(filter: FilterQuery<T>, tenantId: string): Promise<boolean> {
    const scopedFilter = { ...filter, tenantId } as FilterQuery<T>;
    const count = await this.model.countDocuments(scopedFilter).limit(1).exec();
    return count > 0;
  }

  /**
   * Apply query options to a query
   *
   * @param query - Mongoose query
   * @param options - Query options
   * @returns Modified query
   */
  protected applyQueryOptions(query: any, options: RepositoryQueryOptions): any {
    if (options.select) {
      query = query.select(options.select);
    }

    if (options.lean) {
      query = query.lean();
    }

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.session) {
      query = query.session(options.session);
    }

    if (options.showDeleted !== undefined) {
      query = query.setOptions({ showDeleted: options.showDeleted });
    }

    return query;
  }

  /**
   * Execute a function within a transaction
   *
   * @param callback - Function to execute within transaction
   * @returns Result of callback
   */
  async withTransaction<R>(
    callback: (session: ClientSession) => Promise<R>,
  ): Promise<R> {
    const session = await this.model.db.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

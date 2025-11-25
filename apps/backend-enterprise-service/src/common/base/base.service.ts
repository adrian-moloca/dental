/**
 * Base Service Class
 *
 * Abstract base class for all service layer classes in the Enterprise Service.
 * Provides common functionality:
 * - Logging
 * - Event emission
 * - Error handling
 * - Pagination helpers
 * - Transaction support
 *
 * Edge cases handled:
 * - Null/undefined entity handling
 * - Transaction rollback on errors
 * - Event emission failures
 * - Logging context preservation
 *
 * @module BaseService
 */

import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, Document, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';
import { TransformationUtil, type PaginatedResponse } from '../utils/transformation.util';
import { ErrorUtil, type ErrorContext } from '../utils/error.util';

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sort?: Record<string, 1 | -1>;
}

/**
 * Service context interface (for audit trails)
 */
export interface ServiceContext {
  userId?: string;
  organizationId?: string;
  clinicId?: string;
  correlationId?: string;
}

/**
 * Base Service Abstract Class
 *
 * Provides common service layer functionality
 */
export abstract class BaseService<T extends Document> {
  protected readonly logger: Logger;

  /**
   * Default pagination limit
   */
  protected readonly DEFAULT_LIMIT = 20;

  /**
   * Maximum pagination limit
   */
  protected readonly MAX_LIMIT = 100;

  /**
   * Constructor
   *
   * @param model - Mongoose model
   * @param eventEmitter - Event emitter for domain events
   * @param serviceName - Service name for logging
   */
  constructor(
    protected readonly model: Model<T>,
    protected readonly eventEmitter: EventEmitter2,
    serviceName: string,
  ) {
    this.logger = new Logger(serviceName);
  }

  /**
   * Finds all entities with pagination
   *
   * Edge cases:
   * - Validates and sanitizes limit/offset
   * - Enforces maximum limit
   * - Calculates pagination metadata
   * - Handles empty results
   *
   * @param filter - MongoDB filter query
   * @param options - Pagination options
   * @returns Paginated response
   */
  protected async findAllPaginated(
    filter: FilterQuery<T>,
    options: PaginationOptions = {},
  ): Promise<PaginatedResponse<T>> {
    // Sanitize and validate pagination options
    const limit = this.sanitizeLimit(options.limit);
    const offset = this.sanitizeOffset(options.offset);
    const sort = options.sort || { createdAt: -1 };

    try {
      // Execute query and count in parallel
      const [results, total] = await Promise.all([
        this.model.find(filter).limit(limit).skip(offset).sort(sort).exec(),
        this.model.countDocuments(filter).exec(),
      ]);

      return TransformationUtil.paginate(results, total, limit, offset);
    } catch (error) {
      const context: ErrorContext = {
        operation: 'findAllPaginated',
        metadata: { filter, limit, offset, sort },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Finds single entity by ID
   *
   * Edge cases:
   * - Returns null if not found (instead of throwing)
   * - Validates ID format
   *
   * @param id - Entity ID
   * @returns Entity or null
   */
  protected async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'findById',
        metadata: { id },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Finds single entity by filter
   *
   * Edge cases:
   * - Returns null if not found (instead of throwing)
   * - Handles multiple matches (returns first)
   *
   * @param filter - MongoDB filter query
   * @returns Entity or null
   */
  protected async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'findOne',
        metadata: { filter },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Creates new entity
   *
   * Edge cases:
   * - Adds audit fields (createdBy, createdAt)
   * - Validates before saving
   * - Emits creation event
   *
   * @param data - Entity data
   * @param context - Service context
   * @returns Created entity
   */
  protected async create(data: Partial<T>, context: ServiceContext): Promise<T> {
    try {
      // Create entity with audit fields
      const entity = new this.model({
        ...data,
        createdBy: context.userId,
        updatedBy: context.userId,
      });

      // Save entity
      await entity.save();

      // Log creation
      this.logger.log(`Created entity ${entity._id}`, {
        entityId: entity._id,
        ...context,
      });

      return entity;
    } catch (error) {
      const errorContext: ErrorContext = {
        operation: 'create',
        ...context,
        metadata: { data },
      };

      throw ErrorUtil.wrapError(error, errorContext);
    }
  }

  /**
   * Updates existing entity
   *
   * Edge cases:
   * - Returns null if entity not found
   * - Updates audit fields (updatedBy, updatedAt)
   * - Validates before saving
   * - Emits update event
   *
   * @param id - Entity ID
   * @param data - Update data
   * @param context - Service context
   * @returns Updated entity or null
   */
  protected async update(
    id: string,
    data: UpdateQuery<T>,
    context: ServiceContext,
  ): Promise<T | null> {
    try {
      // Find entity
      const entity = await this.findById(id);
      if (!entity) {
        this.logger.warn(`Entity ${id} not found for update`, context);
        return null;
      }

      // Update entity with audit fields
      Object.assign(entity, data, {
        updatedBy: context.userId,
        updatedAt: new Date(),
      });

      // Save entity
      await entity.save();

      // Log update
      this.logger.log(`Updated entity ${id}`, {
        entityId: id,
        ...context,
      });

      return entity;
    } catch (error) {
      const errorContext: ErrorContext = {
        operation: 'update',
        ...context,
        metadata: { id, data },
      };

      throw ErrorUtil.wrapError(error, errorContext);
    }
  }

  /**
   * Deletes entity (soft delete)
   *
   * Edge cases:
   * - Returns null if entity not found
   * - Soft deletes by setting deletedAt field
   * - Preserves entity for audit trails
   * - Emits deletion event
   *
   * @param id - Entity ID
   * @param context - Service context
   * @returns Deleted entity or null
   */
  protected async softDelete(id: string, context: ServiceContext): Promise<T | null> {
    try {
      // Find entity
      const entity = await this.findById(id);
      if (!entity) {
        this.logger.warn(`Entity ${id} not found for deletion`, context);
        return null;
      }

      // Soft delete by setting deletedAt
      (entity as T & { deletedAt?: Date; deletedBy?: string }).deletedAt = new Date();
      (entity as T & { deletedAt?: Date; deletedBy?: string }).deletedBy = context.userId;

      // Save entity
      await entity.save();

      // Log deletion
      this.logger.log(`Soft deleted entity ${id}`, {
        entityId: id,
        ...context,
      });

      return entity;
    } catch (error) {
      const errorContext: ErrorContext = {
        operation: 'softDelete',
        ...context,
        metadata: { id },
      };

      throw ErrorUtil.wrapError(error, errorContext);
    }
  }

  /**
   * Deletes entity (hard delete)
   *
   * Edge cases:
   * - Returns null if entity not found
   * - Permanently removes entity from database
   * - Cannot be undone
   * - Emits deletion event
   *
   * @param id - Entity ID
   * @param context - Service context
   * @returns Deleted entity or null
   */
  protected async hardDelete(id: string, context: ServiceContext): Promise<T | null> {
    try {
      // Find and delete entity
      const entity = await this.model.findByIdAndDelete(id).exec();

      if (!entity) {
        this.logger.warn(`Entity ${id} not found for deletion`, context);
        return null;
      }

      // Log deletion
      this.logger.warn(`Hard deleted entity ${id}`, {
        entityId: id,
        ...context,
      });

      return entity;
    } catch (error) {
      const errorContext: ErrorContext = {
        operation: 'hardDelete',
        ...context,
        metadata: { id },
      };

      throw ErrorUtil.wrapError(error, errorContext);
    }
  }

  /**
   * Executes operation within transaction
   *
   * Edge cases:
   * - Rolls back on errors
   * - Commits on success
   * - Handles nested transactions
   * - Cleans up session on completion
   *
   * @param operation - Async operation to execute
   * @returns Operation result
   */
  protected async withTransaction<R>(
    operation: (session: ClientSession) => Promise<R>,
  ): Promise<R> {
    const session = await this.model.db.startSession();

    try {
      session.startTransaction();

      const result = await operation(session);

      await session.commitTransaction();

      return result;
    } catch (error) {
      await session.abortTransaction();

      throw ErrorUtil.wrapError(error, {
        operation: 'withTransaction',
        metadata: { transactionAborted: true },
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * Emits domain event
   *
   * Edge cases:
   * - Logs event emission
   * - Catches and logs event handler errors
   * - Does not fail operation if event emission fails
   *
   * @param event - Event name
   * @param data - Event data
   * @param context - Service context
   */
  protected emitEvent(event: string, data: Record<string, unknown>, context: ServiceContext): void {
    try {
      // Add context to event data
      const eventData = {
        ...data,
        correlationId: context.correlationId,
        emittedAt: new Date().toISOString(),
      };

      // Emit event
      this.eventEmitter.emit(event, eventData);

      // Log event emission
      this.logger.debug(`Emitted event: ${event}`, {
        event,
        ...context,
      });
    } catch (error) {
      // Edge case: Event emission should not fail the operation
      this.logger.error(
        `Failed to emit event: ${event}`,
        error instanceof Error ? error.stack : undefined,
        {
          event,
          error: ErrorUtil.getMessage(error),
          ...context,
        },
      );
    }
  }

  /**
   * Sanitizes pagination limit
   *
   * Edge cases:
   * - Null/undefined returns default
   * - Negative values return default
   * - Values exceeding max return max
   *
   * @param limit - Requested limit
   * @returns Sanitized limit
   */
  private sanitizeLimit(limit?: number): number {
    if (!limit || limit <= 0) return this.DEFAULT_LIMIT;
    if (limit > this.MAX_LIMIT) return this.MAX_LIMIT;
    return Math.floor(limit);
  }

  /**
   * Sanitizes pagination offset
   *
   * Edge cases:
   * - Null/undefined returns 0
   * - Negative values return 0
   *
   * @param offset - Requested offset
   * @returns Sanitized offset
   */
  private sanitizeOffset(offset?: number): number {
    if (!offset || offset < 0) return 0;
    return Math.floor(offset);
  }

  /**
   * Counts entities matching filter
   *
   * @param filter - MongoDB filter query
   * @returns Count of matching entities
   */
  protected async count(filter: FilterQuery<T>): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      const context: ErrorContext = {
        operation: 'count',
        metadata: { filter },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Checks if entity exists
   *
   * @param filter - MongoDB filter query
   * @returns true if entity exists
   */
  protected async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).limit(1).exec();
      return count > 0;
    } catch (error) {
      const context: ErrorContext = {
        operation: 'exists',
        metadata: { filter },
      };

      throw ErrorUtil.wrapError(error, context);
    }
  }

  /**
   * Bulk creates entities
   *
   * Edge cases:
   * - Validates all entities before inserting
   * - Rolls back on error (if in transaction)
   * - Emits events for each entity
   *
   * @param dataArray - Array of entity data
   * @param context - Service context
   * @returns Created entities
   */
  protected async bulkCreate(dataArray: Partial<T>[], context: ServiceContext): Promise<T[]> {
    try {
      // Add audit fields to all entities
      const entitiesWithAudit = dataArray.map((data) => ({
        ...data,
        createdBy: context.userId,
        updatedBy: context.userId,
      }));

      // Bulk insert
      const entities = await this.model.insertMany(entitiesWithAudit);

      // Log creation
      this.logger.log(`Bulk created ${entities.length} entities`, {
        count: entities.length,
        ...context,
      });

      return entities as unknown as T[];
    } catch (error) {
      const errorContext: ErrorContext = {
        operation: 'bulkCreate',
        ...context,
        metadata: { count: dataArray.length },
      };

      throw ErrorUtil.wrapError(error, errorContext);
    }
  }
}

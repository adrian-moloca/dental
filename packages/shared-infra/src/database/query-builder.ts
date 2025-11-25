import { PipelineStage, SortOrder } from 'mongoose';

/**
 * Type alias for MongoDB filter queries
 * Replaces deprecated FilterQuery from mongoose
 */
// @ts-ignore - T is used as a generic parameter for compatibility
export type FilterQuery<T> = Record<string, any>;

/**
 * Query builder for constructing MongoDB queries
 *
 * Features:
 * - Fluent API for building complex queries
 * - Type-safe query construction
 * - Support for common query patterns
 * - Performance optimization helpers
 */
export class QueryBuilder<T> {
  private filter: Record<string, any> = {};
  private projection: Record<string, 0 | 1> = {};
  private sortOrder: Record<string, SortOrder> = {};
  private limitValue?: number;
  private skipValue?: number;
  private populateFields: string[] = [];
  private leanMode = false;

  /**
   * Add a filter condition
   */
  where(field: keyof T | string, value: unknown): this {
    this.filter[field as string] = value;
    return this;
  }

  /**
   * Add an $in filter
   */
  whereIn(field: keyof T | string, values: unknown[]): this {
    this.filter[field as string] = { $in: values };
    return this;
  }

  /**
   * Add a $nin filter
   */
  whereNotIn(field: keyof T | string, values: unknown[]): this {
    this.filter[field as string] = { $nin: values };
    return this;
  }

  /**
   * Add a greater than filter
   */
  whereGreaterThan(field: keyof T | string, value: unknown): this {
    this.filter[field as string] = { $gt: value };
    return this;
  }

  /**
   * Add a greater than or equal filter
   */
  whereGreaterThanOrEqual(field: keyof T | string, value: unknown): this {
    this.filter[field as string] = { $gte: value };
    return this;
  }

  /**
   * Add a less than filter
   */
  whereLessThan(field: keyof T | string, value: unknown): this {
    this.filter[field as string] = { $lt: value };
    return this;
  }

  /**
   * Add a less than or equal filter
   */
  whereLessThanOrEqual(field: keyof T | string, value: unknown): this {
    this.filter[field as string] = { $lte: value };
    return this;
  }

  /**
   * Add a between filter (inclusive)
   */
  whereBetween(field: keyof T | string, min: unknown, max: unknown): this {
    this.filter[field as string] = { $gte: min, $lte: max };
    return this;
  }

  /**
   * Add a NOT NULL filter (field exists)
   */
  whereNotNull(field: keyof T | string): this {
    this.filter[field as string] = { $ne: null, $exists: true };
    return this;
  }

  /**
   * Add a NULL filter (field doesn't exist or is null)
   */
  whereNull(field: keyof T | string): this {
    this.filter[field as string] = { $eq: null };
    return this;
  }

  /**
   * Add a regex filter for text search
   */
  whereRegex(field: keyof T | string, pattern: string, options = 'i'): this {
    this.filter[field as string] = { $regex: pattern, $options: options };
    return this;
  }

  /**
   * Add a text search filter (requires text index)
   */
  whereText(searchText: string): this {
    this.filter.$text = { $search: searchText };
    return this;
  }

  /**
   * Add a date range filter
   */
  whereDateBetween(field: keyof T | string, startDate: Date, endDate: Date): this {
    this.filter[field as string] = { $gte: startDate, $lte: endDate };
    return this;
  }

  /**
   * Add OR conditions
   */
  whereOr(conditions: FilterQuery<T>[]): this {
    this.filter.$or = conditions;
    return this;
  }

  /**
   * Add AND conditions
   */
  whereAnd(conditions: FilterQuery<T>[]): this {
    this.filter.$and = conditions;
    return this;
  }

  /**
   * Add a raw filter object
   */
  whereRaw(filter: FilterQuery<T>): this {
    this.filter = { ...this.filter, ...filter };
    return this;
  }

  /**
   * Select specific fields (projection)
   */
  select(fields: (keyof T | string)[]): this {
    fields.forEach((field) => {
      this.projection[field as string] = 1;
    });
    return this;
  }

  /**
   * Exclude specific fields
   */
  exclude(fields: (keyof T | string)[]): this {
    fields.forEach((field) => {
      this.projection[field as string] = 0;
    });
    return this;
  }

  /**
   * Sort by field
   */
  sort(field: keyof T | string, order: 'asc' | 'desc' | 1 | -1 = 'asc'): this {
    const sortValue = order === 'asc' || order === 1 ? 1 : -1;
    this.sortOrder[field as string] = sortValue;
    return this;
  }

  /**
   * Sort by multiple fields
   */
  sortBy(sorts: Record<string, 'asc' | 'desc' | 1 | -1>): this {
    Object.entries(sorts).forEach(([field, order]) => {
      this.sort(field, order);
    });
    return this;
  }

  /**
   * Limit number of results
   */
  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  /**
   * Skip number of results (offset)
   */
  skip(value: number): this {
    this.skipValue = value;
    return this;
  }

  /**
   * Paginate results
   */
  paginate(page: number, pageSize: number): this {
    this.limitValue = pageSize;
    this.skipValue = (page - 1) * pageSize;
    return this;
  }

  /**
   * Populate related documents
   */
  populate(field: string): this {
    this.populateFields.push(field);
    return this;
  }

  /**
   * Use lean mode for read-only queries (better performance)
   */
  lean(): this {
    this.leanMode = true;
    return this;
  }

  /**
   * Get the filter object
   */
  getFilter(): FilterQuery<T> {
    return this.filter as FilterQuery<T>;
  }

  /**
   * Get the projection object
   */
  getProjection(): Record<string, 0 | 1> | undefined {
    return Object.keys(this.projection).length > 0 ? this.projection : undefined;
  }

  /**
   * Get the sort object
   */
  getSort(): Record<string, SortOrder> | undefined {
    return Object.keys(this.sortOrder).length > 0 ? this.sortOrder : undefined;
  }

  /**
   * Get the limit value
   */
  getLimit(): number | undefined {
    return this.limitValue;
  }

  /**
   * Get the skip value
   */
  getSkip(): number | undefined {
    return this.skipValue;
  }

  /**
   * Get the populate fields
   */
  getPopulate(): string[] {
    return this.populateFields;
  }

  /**
   * Check if lean mode is enabled
   */
  isLean(): boolean {
    return this.leanMode;
  }

  /**
   * Build the complete query object
   */
  build(): {
    filter: FilterQuery<T>;
    options: {
      projection?: Record<string, 0 | 1>;
      sort?: Record<string, SortOrder>;
      limit?: number;
      skip?: number;
      populate?: string[];
      lean?: boolean;
    };
  } {
    return {
      filter: this.filter as FilterQuery<T>,
      options: {
        projection: this.getProjection(),
        sort: this.getSort(),
        limit: this.limitValue,
        skip: this.skipValue,
        populate: this.populateFields.length > 0 ? this.populateFields : undefined,
        lean: this.leanMode,
      },
    };
  }
}

/**
 * Aggregation pipeline builder
 *
 * Features:
 * - Fluent API for building aggregation pipelines
 * - Type-safe pipeline stage construction
 * - Common aggregation patterns
 */
export class AggregationBuilder<T> {
  private pipeline: PipelineStage[] = [];

  /**
   * Add a $match stage
   */
  match(filter: FilterQuery<T>): this {
    this.pipeline.push({ $match: filter as any });
    return this;
  }

  /**
   * Add a $group stage
   */
  group(groupBy: Record<string, unknown>): this {
    this.pipeline.push({ $group: groupBy as any });
    return this;
  }

  /**
   * Add a $sort stage
   */
  sort(sort: Record<string, 1 | -1>): this {
    this.pipeline.push({ $sort: sort });
    return this;
  }

  /**
   * Add a $limit stage
   */
  limit(value: number): this {
    this.pipeline.push({ $limit: value });
    return this;
  }

  /**
   * Add a $skip stage
   */
  skip(value: number): this {
    this.pipeline.push({ $skip: value });
    return this;
  }

  /**
   * Add a $project stage
   */
  project(projection: Record<string, unknown>): this {
    this.pipeline.push({ $project: projection });
    return this;
  }

  /**
   * Add a $lookup stage (join)
   */
  lookup(options: {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  }): this {
    this.pipeline.push({ $lookup: options });
    return this;
  }

  /**
   * Add an $unwind stage
   */
  unwind(path: string, preserveNullAndEmptyArrays = false): this {
    this.pipeline.push({
      $unwind: {
        path,
        preserveNullAndEmptyArrays,
      },
    });
    return this;
  }

  /**
   * Add a $addFields stage
   */
  addFields(fields: Record<string, unknown>): this {
    this.pipeline.push({ $addFields: fields });
    return this;
  }

  /**
   * Add a $facet stage for multiple aggregations
   */
  facet(facets: Record<string, PipelineStage[]>): this {
    this.pipeline.push({ $facet: facets as any });
    return this;
  }

  /**
   * Add a custom pipeline stage
   */
  addStage(stage: PipelineStage): this {
    this.pipeline.push(stage);
    return this;
  }

  /**
   * Build the aggregation pipeline
   */
  build(): PipelineStage[] {
    return this.pipeline;
  }
}

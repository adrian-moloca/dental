import { Logger } from '@nestjs/common';
import { Model, Query } from 'mongoose';

/**
 * Database Performance Utilities
 * Provides tools for query optimization, explain plans, and performance monitoring
 */

export interface ExplainResult {
  executionTimeMs: number;
  totalDocsExamined: number;
  totalKeysExamined: number;
  executionStages: any;
  indexesUsed: string[];
  needsOptimization: boolean;
  recommendations: string[];
}

export interface QueryPerformanceMetrics {
  queryType: string;
  collection: string;
  executionTimeMs: number;
  docsExamined: number;
  docsReturned: number;
  indexUsed: boolean;
  filter: any;
  timestamp: Date;
}

/**
 * Analyzes query execution plan and provides optimization recommendations
 */
export async function analyzeQueryPerformance<T>(
  query: Query<T, any>,
  logger?: Logger,
): Promise<ExplainResult> {
  const explain = await query.explain('executionStats');
  const stats = (explain as any).executionStats;

  const executionTimeMs = stats.executionTimeMillis;
  const totalDocsExamined = stats.totalDocsExamined;
  const totalKeysExamined = stats.totalKeysExamined;
  const nReturned = stats.nReturned;

  const indexesUsed: string[] = [];
  const recommendations: string[] = [];
  let needsOptimization = false;

  // Check if collection scan is happening
  if (stats.executionStages.stage === 'COLLSCAN') {
    needsOptimization = true;
    recommendations.push('CRITICAL: Collection scan detected - add index for filter fields');
  }

  // Check if too many documents examined vs returned
  if (nReturned > 0 && totalDocsExamined / nReturned > 10) {
    needsOptimization = true;
    recommendations.push(
      `Inefficient query: examined ${totalDocsExamined} docs to return ${nReturned} (ratio: ${(totalDocsExamined / nReturned).toFixed(1)}x)`,
    );
  }

  // Check execution time
  if (executionTimeMs > 100) {
    needsOptimization = true;
    recommendations.push(`Slow query: ${executionTimeMs}ms execution time`);
  }

  // Extract index information
  if (stats.executionStages.indexName) {
    indexesUsed.push(stats.executionStages.indexName);
  }

  // Check for sort without index
  if (stats.executionStages.stage === 'SORT' && !stats.executionStages.inputStage?.indexName) {
    needsOptimization = true;
    recommendations.push('In-memory sort detected - consider adding index for sort fields');
  }

  if (logger && needsOptimization) {
    logger.warn({
      message: 'Query needs optimization',
      executionTimeMs,
      totalDocsExamined,
      totalKeysExamined,
      nReturned,
      recommendations,
    });
  }

  return {
    executionTimeMs,
    totalDocsExamined,
    totalKeysExamined,
    executionStages: stats.executionStages,
    indexesUsed,
    needsOptimization,
    recommendations,
  };
}

/**
 * Wraps a query to track performance metrics
 */
export async function trackQueryPerformance<T>(
  model: Model<any>,
  queryFn: () => Query<T, any>,
  context: { queryType: string; logger?: Logger },
): Promise<{ result: T; metrics: QueryPerformanceMetrics }> {
  const startTime = Date.now();
  const query = queryFn();

  // Execute query
  const result = await query.exec();

  // Get explain for metrics
  const explain = await queryFn().explain('executionStats');
  const stats = (explain as any).executionStats;

  const executionTimeMs = Date.now() - startTime;

  const metrics: QueryPerformanceMetrics = {
    queryType: context.queryType,
    collection: model.collection.name,
    executionTimeMs,
    docsExamined: stats.totalDocsExamined,
    docsReturned: stats.nReturned,
    indexUsed: stats.executionStages.stage !== 'COLLSCAN',
    filter: query.getFilter(),
    timestamp: new Date(),
  };

  // Log slow queries
  if (context.logger && executionTimeMs > 100) {
    context.logger.warn({
      message: 'Slow query detected',
      ...metrics,
    });
  }

  return { result, metrics };
}

/**
 * Creates optimized lean query with field projection
 */
export function createOptimizedQuery<T>(
  model: Model<T>,
  filter: any,
  options: {
    select?: string | string[];
    sort?: any;
    limit?: number;
    skip?: number;
    lean?: boolean;
  } = {},
): Query<any, any> {
  const { select, sort = { createdAt: -1 }, limit, skip, lean = true } = options;

  let query: Query<any, any> = model.find(filter);

  // Always use lean for read-only queries (removes Mongoose overhead)
  if (lean) {
    query = query.lean() as Query<any, any>;
  }

  // Field projection
  if (select) {
    query = query.select(select);
  }

  // Sorting
  if (sort) {
    query = query.sort(sort);
  }

  // Pagination
  if (limit !== undefined) {
    query = query.limit(limit);
  }

  if (skip !== undefined) {
    query = query.skip(skip);
  }

  return query;
}

/**
 * Estimates total count instead of counting (faster for large datasets)
 * Uses MongoDB's estimatedDocumentCount for collections without filters
 */
export async function getOptimizedCount(
  model: Model<any>,
  filter: any = {},
): Promise<{ count: number; isEstimate: boolean }> {
  // If no filter, use estimated count (much faster)
  if (Object.keys(filter).length === 0) {
    const count = await model.estimatedDocumentCount();
    return { count, isEstimate: true };
  }

  // With filter, must use countDocuments
  const count = await model.countDocuments(filter);
  return { count, isEstimate: false };
}

/**
 * Cursor-based pagination (more efficient than offset)
 */
export interface CursorPaginationOptions {
  limit: number;
  cursor?: string; // base64 encoded last document ID
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function cursorPaginate<T>(
  model: Model<T>,
  filter: any,
  options: CursorPaginationOptions,
  select?: string | string[],
): Promise<{
  data: any[];
  nextCursor: string | null;
  hasMore: boolean;
}> {
  const { limit, cursor, sortField = 'createdAt', sortOrder = 'desc' } = options;

  // Build query with cursor
  let query = model.find(filter);

  if (cursor) {
    const lastId = Buffer.from(cursor, 'base64').toString('utf-8');
    const lastDoc = await model.findById(lastId).select(sortField).lean();

    if (lastDoc && (lastDoc as any)[sortField]) {
      query = query
        .where(sortField)
        [sortOrder === 'desc' ? 'lt' : 'gt']((lastDoc as any)[sortField]);
    }
  }

  query = query
    .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit + 1)
    .lean() as Query<any[], any>;

  if (select) {
    query = query.select(select);
  }

  const results = await query.exec();
  const hasMore = results.length > limit;

  if (hasMore) {
    results.pop(); // Remove extra item
  }

  const nextCursor =
    hasMore && results.length > 0
      ? Buffer.from((results[results.length - 1] as any)._id.toString()).toString('base64')
      : null;

  return {
    data: results,
    nextCursor,
    hasMore,
  };
}

/**
 * Batch operations for bulk inserts/updates
 */
export async function batchInsert<T>(
  model: Model<T>,
  documents: any[],
  batchSize = 1000,
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    try {
      await model.insertMany(batch, { ordered: false });
      inserted += batch.length;
    } catch (error) {
      failed += batch.length;
    }
  }

  return { inserted, failed };
}

/**
 * Index verification - ensures required indexes exist
 */
export async function verifyIndexes(
  model: Model<any>,
  requiredIndexes: Array<{ fields: any; options?: any }>,
  logger?: Logger,
): Promise<{ missing: any[]; existing: any[] }> {
  const existingIndexes = await model.collection.getIndexes();
  const missing: any[] = [];
  const existing: any[] = [];

  for (const required of requiredIndexes) {
    const indexKey = JSON.stringify(required.fields);
    const found = Object.values(existingIndexes).some(
      (idx: any) => JSON.stringify(idx.key) === indexKey,
    );

    if (found) {
      existing.push(required);
    } else {
      missing.push(required);
      if (logger) {
        logger.warn(`Missing index: ${indexKey} on ${model.collection.name}`);
      }
    }
  }

  return { missing, existing };
}

/**
 * Aggregation pipeline optimizer
 */
export function optimizeAggregationPipeline(pipeline: any[]): any[] {
  // Move $match stages as early as possible
  const matchStages = pipeline.filter((stage) => stage.$match);
  const otherStages = pipeline.filter((stage) => !stage.$match);

  return [...matchStages, ...otherStages];
}

/**
 * Stream large result sets
 */
export async function* streamQuery<T>(
  model: Model<T>,
  filter: any,
  batchSize = 100,
): AsyncGenerator<T[], void, unknown> {
  const cursor = model.find(filter).lean().cursor({ batchSize });

  const batch: any[] = [];

  for await (const doc of cursor) {
    batch.push(doc);

    if (batch.length >= batchSize) {
      yield batch.splice(0, batch.length);
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}

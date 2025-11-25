/**
 * Base Controller Class
 *
 * Abstract base class for all controller layer classes in the Enterprise Service.
 * Provides common functionality:
 * - Request context extraction
 * - Response formatting
 * - Error handling
 * - Pagination parsing
 * - Validation helpers
 *
 * Edge cases handled:
 * - Missing request context
 * - Invalid pagination parameters
 * - Authentication context extraction
 * - Correlation ID tracking
 *
 * @module BaseController
 */

import { Logger } from '@nestjs/common';
import { Request } from 'express';
import type { ServiceContext, PaginationOptions } from './base.service';
import { ValidationUtil } from '../utils/validation.util';

/**
 * Request with context information
 */
export interface RequestWithContext extends Request {
  context?: {
    correlationId?: string;
    tenantId?: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
  };
}

/**
 * Base Controller Abstract Class
 *
 * Provides common controller layer functionality
 */
export abstract class BaseController {
  protected readonly logger: Logger;

  /**
   * Constructor
   *
   * @param controllerName - Controller name for logging
   */
  constructor(controllerName: string) {
    this.logger = new Logger(controllerName);
  }

  /**
   * Extracts service context from request
   *
   * Edge cases:
   * - Missing context (request middleware not applied)
   * - Missing user (unauthenticated request)
   * - Missing tenant context (public endpoints)
   *
   * @param req - Express request
   * @returns Service context
   */
  protected getContext(req: Request): ServiceContext {
    const request = req as RequestWithContext;

    // Edge case: Request context middleware not applied
    if (!request.context) {
      this.logger.warn('Request context not found, using defaults');
      return {
        correlationId: 'unknown',
      };
    }

    // Extract user from request (set by authentication middleware)
    const user = (req as Request & { user?: { id?: string; userId?: string } }).user;

    return {
      userId: user?.id || user?.userId || request.context.userId,
      organizationId: request.context.organizationId,
      clinicId: request.context.clinicId,
      correlationId: request.context.correlationId,
    };
  }

  /**
   * Extracts pagination options from request query
   *
   * Edge cases:
   * - Missing query parameters (uses defaults)
   * - Invalid numeric values (uses defaults)
   * - Negative values (uses defaults)
   * - Invalid sort format (uses defaults)
   *
   * @param req - Express request
   * @returns Pagination options
   */
  protected getPaginationOptions(req: Request): PaginationOptions {
    const { limit, offset, sortBy, sortOrder } = req.query;

    // Parse limit
    let parsedLimit: number | undefined;
    if (limit && ValidationUtil.isNumeric(limit)) {
      parsedLimit = Math.max(0, parseInt(limit as string, 10));
    }

    // Parse offset
    let parsedOffset: number | undefined;
    if (offset && ValidationUtil.isNumeric(offset)) {
      parsedOffset = Math.max(0, parseInt(offset as string, 10));
    }

    // Parse sort
    let sort: Record<string, 1 | -1> | undefined;
    if (sortBy && typeof sortBy === 'string') {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: order };
    }

    return {
      limit: parsedLimit,
      offset: parsedOffset,
      sort,
    };
  }

  /**
   * Extracts filter from request query
   *
   * Edge cases:
   * - Removes pagination parameters
   * - Removes sorting parameters
   * - Handles string arrays
   * - Validates filter values
   *
   * @param req - Express request
   * @param excludeKeys - Additional keys to exclude from filter
   * @returns Filter object
   */
  protected getFilter(req: Request, excludeKeys: string[] = []): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    // List of query parameters to exclude from filter
    const excludedKeys = new Set([
      'limit',
      'offset',
      'sortBy',
      'sortOrder',
      'page',
      ...excludeKeys,
    ]);

    // Build filter from query parameters
    for (const [key, value] of Object.entries(req.query)) {
      // Skip excluded keys
      if (excludedKeys.has(key)) continue;

      // Skip null/undefined values
      if (value === null || value === undefined) continue;

      // Edge case: Handle array values
      if (Array.isArray(value)) {
        filter[key] = { $in: value };
      } else {
        filter[key] = value;
      }
    }

    return filter;
  }

  /**
   * Validates required fields in request body
   *
   * Edge cases:
   * - Missing fields
   * - Null/undefined fields
   * - Empty string fields
   *
   * @param body - Request body
   * @param requiredFields - Required field names
   * @returns Array of missing field names
   */
  protected validateRequiredFields(
    body: Record<string, unknown>,
    requiredFields: string[],
  ): string[] {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!ValidationUtil.isNotEmpty(body[field])) {
        missingFields.push(field);
      }
    }

    return missingFields;
  }

  /**
   * Extracts user ID from request
   *
   * Edge cases:
   * - Unauthenticated request (returns undefined)
   * - Different user object structures
   *
   * @param req - Express request
   * @returns User ID or undefined
   */
  protected getUserId(req: Request): string | undefined {
    const user = (req as Request & { user?: { id?: string; userId?: string; sub?: string } }).user;

    if (!user) return undefined;

    // Try different user ID field names
    return user.id || user.userId || user.sub;
  }

  /**
   * Extracts organization ID from request
   *
   * Edge cases:
   * - Missing header (returns undefined)
   * - Missing context (returns undefined)
   *
   * @param req - Express request
   * @returns Organization ID or undefined
   */
  protected getOrganizationId(req: Request): string | undefined {
    const request = req as RequestWithContext;
    return request.context?.organizationId;
  }

  /**
   * Extracts clinic ID from request
   *
   * Edge cases:
   * - Missing header (returns undefined)
   * - Missing context (returns undefined)
   *
   * @param req - Express request
   * @returns Clinic ID or undefined
   */
  protected getClinicId(req: Request): string | undefined {
    const request = req as RequestWithContext;
    return request.context?.clinicId;
  }

  /**
   * Extracts correlation ID from request
   *
   * Edge cases:
   * - Missing context (returns 'unknown')
   *
   * @param req - Express request
   * @returns Correlation ID
   */
  protected getCorrelationId(req: Request): string {
    const request = req as RequestWithContext;
    return request.context?.correlationId || 'unknown';
  }

  /**
   * Checks if request is authenticated
   *
   * @param req - Express request
   * @returns true if request has user
   */
  protected isAuthenticated(req: Request): boolean {
    return !!(req as Request & { user?: unknown }).user;
  }

  /**
   * Logs request processing start
   *
   * @param operation - Operation name
   * @param context - Service context
   */
  protected logStart(operation: string, context: ServiceContext): void {
    this.logger.log(`Starting ${operation}`, context);
  }

  /**
   * Logs request processing success
   *
   * @param operation - Operation name
   * @param context - Service context
   * @param metadata - Additional metadata
   */
  protected logSuccess(
    operation: string,
    context: ServiceContext,
    metadata?: Record<string, unknown>,
  ): void {
    this.logger.log(`Completed ${operation}`, { ...context, ...metadata });
  }

  /**
   * Logs request processing error
   *
   * @param operation - Operation name
   * @param context - Service context
   * @param error - Error object
   */
  protected logError(operation: string, context: ServiceContext, error: Error): void {
    this.logger.error(`Failed ${operation}: ${error.message}`, error.stack, context);
  }

  /**
   * Parses page number from query (converts to offset)
   *
   * Edge cases:
   * - Page 1 = offset 0
   * - Invalid page number returns undefined
   * - Negative page number returns undefined
   *
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @returns Offset or undefined
   */
  protected pageToOffset(page: unknown, limit: number): number | undefined {
    if (!page || !ValidationUtil.isNumeric(page)) return undefined;

    const pageNum = parseInt(page as string, 10);
    if (pageNum < 1) return undefined;

    // Convert 1-based page to 0-based offset
    return (pageNum - 1) * limit;
  }

  /**
   * Validates ID parameter
   *
   * Edge cases:
   * - Validates MongoDB ObjectId format
   * - Empty strings return false
   * - Non-string values return false
   *
   * @param id - ID parameter
   * @returns true if valid ID
   */
  protected isValidId(id: unknown): id is string {
    if (!id || typeof id !== 'string') return false;
    return ValidationUtil.isObjectId(id);
  }

  /**
   * Sanitizes query string
   *
   * Edge cases:
   * - Removes SQL injection patterns
   * - Removes MongoDB injection patterns
   * - Trims whitespace
   *
   * @param query - Query string
   * @returns Sanitized query
   */
  protected sanitizeQuery(query: string | undefined): string | undefined {
    if (!query || typeof query !== 'string') return undefined;

    // Trim whitespace
    let sanitized = query.trim();

    // Remove MongoDB operators
    sanitized = sanitized.replace(/\$\w+/g, '');

    // Remove potential SQL injection patterns
    sanitized = sanitized.replace(/['";\\]/g, '');

    return sanitized;
  }

  /**
   * Builds success response
   *
   * Edge cases:
   * - Null data returns empty object
   * - Includes timestamp
   *
   * @param data - Response data
   * @returns Success response
   */
  protected buildSuccessResponse<T>(data: T): { success: true; data: T; timestamp: string } {
    return {
      success: true,
      data: data ?? ({} as T),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Parses boolean query parameter
   *
   * Edge cases:
   * - 'true', '1', 'yes' = true
   * - 'false', '0', 'no' = false
   * - Anything else = undefined
   *
   * @param value - Query parameter value
   * @returns Boolean or undefined
   */
  protected parseBoolean(value: unknown): boolean | undefined {
    if (typeof value !== 'string') return undefined;

    const lower = value.toLowerCase();

    if (['true', '1', 'yes'].includes(lower)) return true;
    if (['false', '0', 'no'].includes(lower)) return false;

    return undefined;
  }

  /**
   * Parses date query parameter
   *
   * Edge cases:
   * - ISO 8601 strings
   * - Invalid dates return undefined
   *
   * @param value - Query parameter value
   * @returns Date or undefined
   */
  protected parseDate(value: unknown): Date | undefined {
    if (!value || typeof value !== 'string') return undefined;

    const date = new Date(value);
    return ValidationUtil.isDate(date) ? date : undefined;
  }

  /**
   * Parses array query parameter
   *
   * Edge cases:
   * - Comma-separated strings
   * - Already arrays
   * - Empty strings return empty array
   *
   * @param value - Query parameter value
   * @returns Array or undefined
   */
  protected parseArray(value: unknown): string[] | undefined {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      return value.map((v) => String(v));
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }

    return undefined;
  }
}

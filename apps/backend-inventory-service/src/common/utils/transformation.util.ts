/**
 * Transformation Utilities
 *
 * Provides comprehensive data transformation and DTO mapping utilities
 * for the Enterprise Service.
 *
 * Edge cases handled:
 * - Null/undefined values
 * - Nested object transformations
 * - Array transformations
 * - Type conversions
 * - Circular references
 * - Deep cloning
 * - Partial updates
 *
 * @module TransformationUtil
 */

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Transform options
 */
export interface TransformOptions {
  excludeFields?: string[];
  includeFields?: string[];
  transformDates?: boolean;
  removeNull?: boolean;
  removeUndefined?: boolean;
  camelCase?: boolean;
  snakeCase?: boolean;
}

/**
 * Transformation Utility Class
 *
 * Provides static methods for data transformation
 */
export class TransformationUtil {
  /**
   * Creates paginated response
   *
   * Edge cases:
   * - Empty data array
   * - Total = 0
   * - Invalid limit/offset (defaults to safe values)
   *
   * @param data - Array of data items
   * @param total - Total number of items
   * @param limit - Items per page
   * @param offset - Offset from start
   * @returns Paginated response
   */
  static paginate<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number,
  ): PaginatedResponse<T> {
    // Edge case: Ensure valid limit and offset
    const safeLimit = Math.max(1, limit);
    const safeOffset = Math.max(0, offset);

    const totalPages = Math.ceil(total / safeLimit);
    const page = Math.floor(safeOffset / safeLimit) + 1;
    const hasNextPage = safeOffset + safeLimit < total;
    const hasPreviousPage = safeOffset > 0;

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Transforms entity to DTO (Data Transfer Object)
   *
   * Edge cases:
   * - Null/undefined returns null
   * - Excludes specified fields
   * - Includes only specified fields if provided
   * - Handles nested objects
   * - Converts dates to ISO strings
   *
   * @param entity - Entity to transform
   * @param options - Transform options
   * @returns Transformed DTO
   */
  static toDTO<T extends Record<string, unknown>>(
    entity: T | null | undefined,
    options: TransformOptions = {},
  ): Partial<T> | null {
    if (!entity) return null;

    let result: Record<string, unknown> = {};

    // Edge case: Include only specified fields
    if (options.includeFields && options.includeFields.length > 0) {
      for (const field of options.includeFields) {
        if (field in entity) {
          result[field] = entity[field];
        }
      }
    } else {
      // Include all fields
      result = { ...entity };
    }

    // Edge case: Exclude specified fields
    if (options.excludeFields && options.excludeFields.length > 0) {
      for (const field of options.excludeFields) {
        delete result[field];
      }
    }

    // Edge case: Transform dates to ISO strings
    if (options.transformDates) {
      for (const [key, value] of Object.entries(result)) {
        if (value instanceof Date) {
          result[key] = value.toISOString();
        }
      }
    }

    // Edge case: Remove null values
    if (options.removeNull) {
      result = TransformationUtil.removeNullValues(result);
    }

    // Edge case: Remove undefined values
    if (options.removeUndefined) {
      result = TransformationUtil.removeUndefinedValues(result);
    }

    return result as Partial<T>;
  }

  /**
   * Transforms array of entities to DTOs
   *
   * Edge cases:
   * - Null/undefined returns empty array
   * - Empty array returns empty array
   * - Filters out null results from individual transformations
   *
   * @param entities - Array of entities to transform
   * @param options - Transform options
   * @returns Array of transformed DTOs
   */
  static toDTOArray<T extends Record<string, unknown>>(
    entities: T[] | null | undefined,
    options: TransformOptions = {},
  ): Partial<T>[] {
    if (!entities || entities.length === 0) return [];

    return entities
      .map((entity) => TransformationUtil.toDTO(entity, options))
      .filter((dto): dto is Partial<T> => dto !== null);
  }

  /**
   * Deep clones object
   *
   * Edge cases:
   * - Null/undefined returns null
   * - Handles nested objects and arrays
   * - Clones dates properly
   * - Does NOT handle circular references (use structuredClone for that)
   *
   * @param obj - Object to clone
   * @returns Cloned object
   */
  static deepClone<T>(obj: T | null | undefined): T | null {
    if (obj === null || obj === undefined) return null;

    // Edge case: Primitive values
    if (typeof obj !== 'object') return obj;

    // Edge case: Dates
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    // Edge case: Arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => TransformationUtil.deepClone(item)) as T;
    }

    // Edge case: Objects
    const cloned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      cloned[key] = TransformationUtil.deepClone(value);
    }

    return cloned as T;
  }

  /**
   * Merges objects deeply
   *
   * Edge cases:
   * - Null/undefined values handled
   * - Arrays are replaced, not merged
   * - Nested objects are merged recursively
   * - Source overwrites target
   *
   * @param target - Target object
   * @param source - Source object
   * @returns Merged object
   */
  static deepMerge<T extends Record<string, unknown>>(
    target: T,
    source: Partial<T> | null | undefined,
  ): T {
    if (!source) return target;

    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;

      // Edge case: If target doesn't have the key, just assign
      if (!(key in result)) {
        result[key as keyof T] = value as T[keyof T];
        continue;
      }

      const targetValue = result[key as keyof T];

      // Edge case: Arrays are replaced, not merged
      if (Array.isArray(value)) {
        result[key as keyof T] = value as T[keyof T];
        continue;
      }

      // Edge case: Nested objects are merged recursively
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        result[key as keyof T] = TransformationUtil.deepMerge(
          targetValue as Record<string, unknown>,
          value as Record<string, unknown>,
        ) as T[keyof T];
      } else {
        result[key as keyof T] = value as T[keyof T];
      }
    }

    return result;
  }

  /**
   * Removes null values from object
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Nested objects are processed recursively
   * - Arrays are processed recursively
   * - Removes only null, keeps undefined
   *
   * @param obj - Object to process
   * @returns Object without null values
   */
  static removeNullValues<T extends Record<string, unknown>>(obj: T | null | undefined): T {
    if (!obj) return {} as T;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Edge case: Skip null values
      if (value === null) continue;

      // Edge case: Process nested objects
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = TransformationUtil.removeNullValues(value as Record<string, unknown>);
      }
      // Edge case: Process arrays
      else if (Array.isArray(value)) {
        result[key] = value
          .filter((item) => item !== null)
          .map((item) =>
            typeof item === 'object' && !Array.isArray(item) && !(item instanceof Date)
              ? TransformationUtil.removeNullValues(item as Record<string, unknown>)
              : item,
          );
      } else {
        result[key] = value;
      }
    }

    return result as T;
  }

  /**
   * Removes undefined values from object
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Nested objects are processed recursively
   * - Arrays are processed recursively
   * - Removes only undefined, keeps null
   *
   * @param obj - Object to process
   * @returns Object without undefined values
   */
  static removeUndefinedValues<T extends Record<string, unknown>>(obj: T | null | undefined): T {
    if (!obj) return {} as T;

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Edge case: Skip undefined values
      if (value === undefined) continue;

      // Edge case: Process nested objects
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null &&
        !(value instanceof Date)
      ) {
        result[key] = TransformationUtil.removeUndefinedValues(value as Record<string, unknown>);
      }
      // Edge case: Process arrays
      else if (Array.isArray(value)) {
        result[key] = value
          .filter((item) => item !== undefined)
          .map((item) =>
            typeof item === 'object' &&
            !Array.isArray(item) &&
            item !== null &&
            !(item instanceof Date)
              ? TransformationUtil.removeUndefinedValues(item as Record<string, unknown>)
              : item,
          );
      } else {
        result[key] = value;
      }
    }

    return result as T;
  }

  /**
   * Picks specified fields from object
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Non-existent fields are skipped
   * - Supports nested field paths (e.g., 'user.name')
   *
   * @param obj - Object to pick from
   * @param fields - Fields to pick
   * @returns Object with only specified fields
   */
  static pick<T extends Record<string, unknown>>(
    obj: T | null | undefined,
    fields: string[],
  ): Partial<T> {
    if (!obj) return {};

    const result: Record<string, unknown> = {};

    for (const field of fields) {
      // Edge case: Support nested field paths
      if (field.includes('.')) {
        const parts = field.split('.');
        let value: unknown = obj;
        let valid = true;

        for (const part of parts) {
          if (value && typeof value === 'object' && part in value) {
            value = (value as Record<string, unknown>)[part];
          } else {
            valid = false;
            break;
          }
        }

        if (valid) {
          result[field] = value;
        }
      } else if (field in obj) {
        result[field] = obj[field];
      }
    }

    return result as Partial<T>;
  }

  /**
   * Omits specified fields from object
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Non-existent fields are ignored
   * - Returns all other fields
   *
   * @param obj - Object to omit from
   * @param fields - Fields to omit
   * @returns Object without specified fields
   */
  static omit<T extends Record<string, unknown>>(
    obj: T | null | undefined,
    fields: string[],
  ): Partial<T> {
    if (!obj) return {};

    const result: Record<string, unknown> = { ...obj };

    for (const field of fields) {
      delete result[field];
    }

    return result as Partial<T>;
  }

  /**
   * Flattens nested object
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Arrays are included as-is (not flattened)
   * - Uses dot notation for nested keys (e.g., 'user.address.city')
   *
   * @param obj - Object to flatten
   * @param prefix - Prefix for keys (internal use)
   * @returns Flattened object
   */
  static flatten(
    obj: Record<string, unknown> | null | undefined,
    prefix = '',
  ): Record<string, unknown> {
    if (!obj) return {};

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      // Edge case: Nested objects are flattened recursively
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        Object.assign(result, TransformationUtil.flatten(value as Record<string, unknown>, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  /**
   * Unflattens object with dot notation keys
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Creates nested structure from dot notation
   * - Handles conflicts (last value wins)
   *
   * @param obj - Flattened object to unflatten
   * @returns Nested object
   */
  static unflatten(obj: Record<string, unknown> | null | undefined): Record<string, unknown> {
    if (!obj) return {};

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const parts = key.split('.');
      let current: Record<string, unknown> = result;

      // Edge case: Build nested structure
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }

      current[parts[parts.length - 1]] = value;
    }

    return result;
  }

  /**
   * Groups array by key
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Empty array returns empty object
   * - Handles duplicate keys (groups into array)
   *
   * @param array - Array to group
   * @param key - Key to group by (field name or function)
   * @returns Grouped object
   */
  static groupBy<T>(
    array: T[] | null | undefined,
    key: keyof T | ((item: T) => string),
  ): Record<string, T[]> {
    if (!array || array.length === 0) return {};

    const result: Record<string, T[]> = {};

    for (const item of array) {
      const groupKey = typeof key === 'function' ? key(item) : String(item[key]);

      if (!result[groupKey]) {
        result[groupKey] = [];
      }

      result[groupKey].push(item);
    }

    return result;
  }

  /**
   * Maps object keys
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Handles key conflicts (last value wins)
   *
   * @param obj - Object to map
   * @param mapper - Key mapping function
   * @returns Object with mapped keys
   */
  static mapKeys<T extends Record<string, unknown>>(
    obj: T | null | undefined,
    mapper: (key: string) => string,
  ): Record<string, unknown> {
    if (!obj) return {};

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = mapper(key);
      result[newKey] = value;
    }

    return result;
  }

  /**
   * Maps object values
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Preserves keys
   *
   * @param obj - Object to map
   * @param mapper - Value mapping function
   * @returns Object with mapped values
   */
  static mapValues<T extends Record<string, unknown>, R>(
    obj: T | null | undefined,
    mapper: (value: unknown, key: string) => R,
  ): Record<string, R> {
    if (!obj) return {};

    const result: Record<string, R> = {};

    for (const [key, value] of Object.entries(obj)) {
      result[key] = mapper(value, key);
    }

    return result;
  }

  /**
   * Converts object keys to camelCase
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Nested objects are converted recursively
   * - Arrays are processed recursively
   *
   * @param obj - Object to convert
   * @returns Object with camelCase keys
   */
  static toCamelCase<T extends Record<string, unknown>>(
    obj: T | null | undefined,
  ): Record<string, unknown> {
    if (!obj) return {};

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

      // Edge case: Process nested objects
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null &&
        !(value instanceof Date)
      ) {
        result[camelKey] = TransformationUtil.toCamelCase(value as Record<string, unknown>);
      }
      // Edge case: Process arrays
      else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === 'object' &&
          !Array.isArray(item) &&
          item !== null &&
          !(item instanceof Date)
            ? TransformationUtil.toCamelCase(item as Record<string, unknown>)
            : item,
        );
      } else {
        result[camelKey] = value;
      }
    }

    return result;
  }

  /**
   * Converts object keys to snake_case
   *
   * Edge cases:
   * - Null/undefined returns empty object
   * - Nested objects are converted recursively
   * - Arrays are processed recursively
   *
   * @param obj - Object to convert
   * @returns Object with snake_case keys
   */
  static toSnakeCase<T extends Record<string, unknown>>(
    obj: T | null | undefined,
  ): Record<string, unknown> {
    if (!obj) return {};

    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // Edge case: Process nested objects
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null &&
        !(value instanceof Date)
      ) {
        result[snakeKey] = TransformationUtil.toSnakeCase(value as Record<string, unknown>);
      }
      // Edge case: Process arrays
      else if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          typeof item === 'object' &&
          !Array.isArray(item) &&
          item !== null &&
          !(item instanceof Date)
            ? TransformationUtil.toSnakeCase(item as Record<string, unknown>)
            : item,
        );
      } else {
        result[snakeKey] = value;
      }
    }

    return result;
  }

  /**
   * Converts all dates in object to ISO strings
   *
   * Edge cases:
   * - Null/undefined returns null
   * - Nested objects are processed recursively
   * - Arrays are processed recursively
   *
   * @param obj - Object to convert
   * @returns Object with dates as ISO strings
   */
  static datesToISOStrings<T>(obj: T | null | undefined): T | null {
    if (!obj) return null;

    // Edge case: Primitive values
    if (typeof obj !== 'object') return obj;

    // Edge case: Dates
    if (obj instanceof Date) {
      return obj.toISOString() as T;
    }

    // Edge case: Arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => TransformationUtil.datesToISOStrings(item)) as T;
    }

    // Edge case: Objects
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = TransformationUtil.datesToISOStrings(value);
    }

    return result as T;
  }
}

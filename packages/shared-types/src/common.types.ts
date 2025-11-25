/**
 * Common utility types and branded types for type safety
 * @module shared-types/common
 */

/**
 * Branded type utility for creating nominal types
 * Prevents accidental mixing of semantically different values of the same primitive type
 */
export type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };

/**
 * Universally unique identifier (UUID v4)
 */
export type UUID = Brand<string, 'UUID'>;

/**
 * ISO 8601 datetime string
 * @example "2025-11-20T14:30:00.000Z"
 */
export type ISODateString = Brand<string, 'ISODateString'>;

/**
 * Email address string
 * @example "user@example.com"
 */
export type Email = Brand<string, 'Email'>;

/**
 * Phone number in E.164 format
 * @example "+14155552671"
 */
export type PhoneNumber = Brand<string, 'PhoneNumber'>;

/**
 * URL string
 * @example "https://example.com/path"
 */
export type URL = Brand<string, 'URL'>;

/**
 * Non-negative integer
 */
export type PositiveInt = Brand<number, 'PositiveInt'>;

/**
 * Utility type to make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type to make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Utility type to make specified keys required
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type to make specified keys optional
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for nullable values
 */
export type Nullable<T> = T | null;

/**
 * Utility type for values that may be null or undefined
 */
export type Maybe<T> = T | null | undefined;

/**
 * Extract non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * ValueOf utility - extracts the union of all property value types
 */
export type ValueOf<T> = T[keyof T];

/**
 * Ensure at least one property is present
 */
export type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Ensure exactly one property is present
 */
export type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

/**
 * Make readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Type-safe omit that only allows existing keys
 */
export type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Type-safe pick that only allows existing keys
 */
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

/**
 * JSON-serializable value types
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * JSON-serializable object
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Metadata object for extensibility
 */
export type Metadata = Record<string, JSONValue>;

/**
 * Sort order enumeration
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig<T = string> {
  /** Field to sort by */
  field: T;
  /** Sort direction */
  order: SortOrder;
}

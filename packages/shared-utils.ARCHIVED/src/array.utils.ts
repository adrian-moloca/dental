/**
 * Array utility functions for manipulation and transformation
 * All functions are pure and handle edge cases gracefully
 */

/**
 * Groups array elements by a key function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[] | null | undefined,
  keyFn: (item: T) => K,
): Record<K, T[]> {
  if (!Array.isArray(array)) return {} as Record<K, T[]>;
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Returns unique elements from an array
 */
export function unique<T>(array: T[] | null | undefined): T[] {
  return Array.isArray(array) ? Array.from(new Set(array)) : [];
}

/**
 * Returns unique elements from an array based on a key function
 */
export function uniqueBy<T, K>(
  array: T[] | null | undefined,
  keyFn: (item: T) => K,
): T[] {
  if (!Array.isArray(array)) return [];
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunk<T>(array: T[] | null | undefined, size: number): T[][] {
  if (!Array.isArray(array) || size <= 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flattens a nested array by one level
 */
export function flatten<T>(array: (T | T[])[] | null | undefined): T[] {
  if (!Array.isArray(array)) return [];
  return array.reduce<T[]>((result, item) => {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
    return result;
  }, []);
}

/**
 * Filters out null and undefined values from an array
 */
export function compact<T>(array: (T | null | undefined)[] | null | undefined): T[] {
  return Array.isArray(array) ? array.filter((item): item is T => item != null) : [];
}

/**
 * Finds the intersection of two arrays
 */
export function intersection<T>(
  array1: T[] | null | undefined,
  array2: T[] | null | undefined,
): T[] {
  if (!Array.isArray(array1) || !Array.isArray(array2)) return [];
  const set2 = new Set(array2);
  return unique(array1.filter((item) => set2.has(item)));
}

/**
 * Finds the difference between two arrays (elements in first but not in second)
 */
export function difference<T>(
  array1: T[] | null | undefined,
  array2: T[] | null | undefined,
): T[] {
  if (!Array.isArray(array1)) return [];
  if (!Array.isArray(array2)) return array1;
  const set2 = new Set(array2);
  return array1.filter((item) => !set2.has(item));
}

/**
 * Partitions an array into two arrays based on a predicate
 */
export function partition<T>(
  array: T[] | null | undefined,
  predicate: (item: T) => boolean,
): [T[], T[]] {
  if (!Array.isArray(array)) return [[], []];
  const matching: T[] = [];
  const notMatching: T[] = [];
  array.forEach((item) => {
    if (predicate(item)) {
      matching.push(item);
    } else {
      notMatching.push(item);
    }
  });
  return [matching, notMatching];
}

/**
 * Sorts an array by a key function
 */
export function sortBy<T, K>(
  array: T[] | null | undefined,
  keyFn: (item: T) => K,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  if (!Array.isArray(array)) return [];
  return [...array].sort((a, b) => {
    const keyA = keyFn(a);
    const keyB = keyFn(b);
    if (keyA < keyB) return order === 'asc' ? -1 : 1;
    if (keyA > keyB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Takes first N elements from an array
 */
export function take<T>(array: T[] | null | undefined, count: number): T[] {
  return Array.isArray(array) && count > 0 ? array.slice(0, count) : [];
}

/**
 * Drops first N elements from an array
 */
export function drop<T>(array: T[] | null | undefined, count: number): T[] {
  if (!Array.isArray(array) || count <= 0) {
    return Array.isArray(array) ? [...array] : [];
  }
  return array.slice(count);
}

/**
 * Creates a map from an array using a key function
 */
export function toMap<T, K extends string | number>(
  array: T[] | null | undefined,
  keyFn: (item: T) => K,
): Map<K, T> {
  const map = new Map<K, T>();
  if (Array.isArray(array)) {
    array.forEach((item) => map.set(keyFn(item), item));
  }
  return map;
}

/**
 * Checks if array is empty
 */
export function isEmpty<T>(array: T[] | null | undefined): boolean {
  return !Array.isArray(array) || array.length === 0;
}

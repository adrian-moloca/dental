/**
 * Compression Middleware Configuration
 *
 * Configures response compression to reduce bandwidth and improve performance.
 *
 * Edge cases handled:
 * - Minimum size threshold (avoid compressing tiny responses)
 * - Content type filtering (only compress compressible types)
 * - Compression level (balance between speed and ratio)
 * - Already compressed content detection
 *
 * @module CompressionMiddleware
 */

// import * as compression from 'compression';
import { Request, Response } from 'express';

/**
 * Compression configuration options
 */
export interface CompressionConfig {
  /**
   * Minimum response size to compress (in bytes)
   * Responses smaller than this won't be compressed
   * Default: 1024 bytes (1 KB)
   */
  threshold?: number;

  /**
   * Compression level (0-9)
   * 0 = no compression, 9 = maximum compression
   * Default: 6 (balanced)
   */
  level?: number;

  /**
   * Memory level (1-9)
   * Higher = more memory, faster compression
   * Default: 8
   */
  memLevel?: number;

  /**
   * Filter function to determine if response should be compressed
   * Default: compresses text-based content types
   */
  filter?: (req: Request, res: Response) => boolean;
}

/**
 * Default compression filter
 *
 * Edge cases:
 * - Checks Content-Type header
 * - Compresses text-based content
 * - Skips already compressed content (images, videos)
 * - Skips if no Content-Type header
 *
 * @param _req - Express request (unused)
 * @param res - Express response
 * @returns true if response should be compressed
 *
 * Note: This function is currently unused as compression is disabled.
 * It is kept for reference when compression is re-enabled.
 */
// @ts-expect-error - Function reserved for future use when compression is re-enabled
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function defaultCompressionFilter(_req: Request, res: Response): boolean {
  // Edge case: If Content-Encoding is already set, don't compress again
  if (res.getHeader('Content-Encoding')) {
    return false;
  }

  // Get Content-Type header
  const contentType = res.getHeader('Content-Type');

  // Edge case: No Content-Type, don't compress
  if (!contentType) {
    return false;
  }

  const contentTypeStr = String(contentType).toLowerCase();

  // Compress text-based content types
  const compressibleTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-yaml',
    'application/x-www-form-urlencoded',
    'application/graphql',
    'application/vnd.api+json',
  ];

  return compressibleTypes.some((type) => contentTypeStr.includes(type));
}

/**
 * Creates compression middleware with custom configuration
 *
 * Edge cases:
 * - Minimum threshold to avoid compressing tiny responses
 * - Balanced compression level for performance
 * - Smart filtering to avoid compressing already compressed content
 *
 * @param config - Compression configuration
 * @returns Compression middleware
 */
export function createCompressionMiddleware(_config: CompressionConfig = {}) {
  // Note: compression middleware disabled - use CompressionInterceptor instead
  return (_req: Request, _res: Response, next: () => void) => next();
}

/**
 * Default compression middleware
 *
 * Note: Disabled - use CompressionInterceptor instead
 */
export const compressionMiddleware = createCompressionMiddleware();

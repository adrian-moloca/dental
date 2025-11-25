/**
 * Public Route Decorator
 *
 * Marks routes as public (no authentication required).
 * Used by JwtAuthGuard and TenantContextInterceptor to skip authentication.
 *
 * @module decorators/public
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public route decorator
 *
 * Marks a route or controller as public, bypassing authentication
 * and tenant context validation.
 *
 * @example
 * ```typescript
 * @Public()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

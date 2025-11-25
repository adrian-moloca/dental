/**
 * Public Route Decorator
 *
 * Marks a route as public, skipping JWT authentication.
 *
 * @module common/decorators/public
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (no authentication required)
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('register')
 * async register(@Body() dto: RegisterDto) {
 *   // ...
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

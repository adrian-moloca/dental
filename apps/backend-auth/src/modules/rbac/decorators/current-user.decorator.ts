/**
 * CurrentUser Decorator
 *
 * Extracts authenticated user context from request.
 * User context is populated by JWT authentication guard.
 *
 * Security requirements:
 * - Must be used after JWT authentication guard
 * - User context includes: sub (userId), organizationId, clinicId, roles, permissions
 * - Type-safe extraction with proper typing
 *
 * Usage:
 * ```typescript
 * @Get('/profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: UserContext) {
 *   return user;
 * }
 * ```
 *
 * @module modules/rbac/decorators
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User context from JWT payload
 * This interface defines what's extracted from the access token
 */
export interface UserContext {
  /**
   * User unique identifier (from JWT 'sub' claim)
   */
  sub: string;

  /**
   * User email address
   */
  email: string;

  /**
   * Organization ID (tenant context)
   */
  organizationId: string;

  /**
   * Optional primary clinic ID
   */
  clinicId?: string;

  /**
   * Array of role names assigned to user
   */
  roles?: string[];

  /**
   * Array of permission codes assigned to user
   * May contain ['*'] for super admin
   */
  permissions?: string[];

  /**
   * Session ID for tracking
   */
  sessionId?: string;

  /**
   * Token issued at timestamp
   */
  iat?: number;

  /**
   * Token expiration timestamp
   */
  exp?: number;
}

/**
 * Decorator to extract current user from request
 *
 * Edge cases handled:
 * - Returns undefined if no user in request (authentication failed)
 * - Can extract specific property from user context
 * - Type-safe with UserContext interface
 *
 * @param data - Optional property name to extract from user context
 * @param ctx - Execution context containing HTTP request
 * @returns Full user context or specific property
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserContext | undefined, ctx: ExecutionContext): UserContext | unknown => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;

    if (!user) {
      // Return undefined if no authenticated user
      // This will be caught by guards if authentication is required
      return undefined;
    }

    // If specific property requested, return that property
    if (data) {
      return user[data];
    }

    // Return full user context
    return user;
  }
);

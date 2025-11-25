/**
 * Current User Parameter Decorator
 *
 * Extracts authenticated user information from request object.
 * User data is populated by JwtAuthGuard after JWT validation.
 *
 * Usage:
 * - Use in controller methods to access current user
 * - Only works on protected routes (non-@Public() routes)
 * - Returns CurrentUser type from @dentalos/shared-auth
 *
 * Edge cases handled:
 * - Public routes (no user in request) → undefined (guard prevents this)
 * - Invalid JWT → handled by JwtAuthGuard before reaching controller
 * - Missing user data → handled by JwtAuthGuard
 *
 * @module decorators/current-user
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUser as CurrentUserType } from '@dentalos/shared-auth';

/**
 * Parameter decorator to extract current user from request
 *
 * Populated by JwtAuthGuard after JWT validation.
 * Contains user ID, organization ID, roles, and permissions.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@CurrentUser() user: CurrentUser) {
 *   return this.service.findProfile(user.userId);
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Post('appointments')
 * async createAppointment(
 *   @CurrentUser() user: CurrentUser,
 *   @Body() dto: CreateAppointmentDto,
 * ) {
 *   // user.organizationId, user.userId, user.roles available
 *   return this.service.create(dto, user);
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

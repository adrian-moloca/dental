import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  tenantId: string;
  organizationId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

/**
 * Current User Decorator
 *
 * Extracts authenticated user from request
 * Usage: @CurrentUser() user: CurrentUserData
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

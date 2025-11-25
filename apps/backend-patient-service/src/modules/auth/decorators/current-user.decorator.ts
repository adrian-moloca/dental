/**
 * Current User Decorator
 *
 * Extracts the current authenticated user from the request.
 *
 * @module modules/auth/decorators
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { CurrentUser as ICurrentUser } from '@dentalos/shared-auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

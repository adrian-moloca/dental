/**
 * Current User Decorator
 * Extracts authenticated user from request
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '@dentalos/shared-auth';

export const GetCurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext): CurrentUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      return null;
    }

    // Return specific field if requested
    if (data) {
      return user[data];
    }

    // Return full user
    return user;
  },
);

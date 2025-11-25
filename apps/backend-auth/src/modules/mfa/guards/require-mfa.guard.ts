/**
 * RequireMfaGuard - NestJS guard to enforce MFA verification
 *
 * Responsibilities:
 * - Check if user has completed MFA for current session
 * - Throw UnauthorizedException if MFA not verified
 * - Extract user context from JWT or session
 * - Integrate with MFA service to check requirements
 *
 * Usage:
 * - Apply to controllers or routes that require MFA
 * - Typically used after JWT authentication guard
 * - Can be combined with RequireMFA decorator
 *
 * @module RequireMfaGuard
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { MfaService } from '../services/mfa.service';
import { REQUIRE_MFA_KEY } from '../decorators/require-mfa.decorator';

/**
 * Extended Request interface with user context
 */
interface RequestWithUser extends Request {
  user?: {
    userId: string;
    organizationId: string;
    mfaVerified?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Guard to enforce MFA verification
 */
@Injectable()
export class RequireMfaGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private mfaService: MfaService
  ) {}

  /**
   * Check if MFA is required and verified
   *
   * @param context - Execution context
   * @returns True if MFA verified or not required
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requireMfa = this.reflector.getAllAndOverride<boolean>(REQUIRE_MFA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireMfa) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = user.userId as UUID;
    const organizationId = user.organizationId as OrganizationId;
    const mfaVerified = user.mfaVerified;

    if (!userId || !organizationId) {
      throw new UnauthorizedException('Invalid user context');
    }

    const userRequiresMfa = await this.mfaService.requiresMfa(userId, organizationId);

    if (!userRequiresMfa) {
      return true;
    }

    if (!mfaVerified) {
      throw new UnauthorizedException('MFA verification required');
    }

    return true;
  }
}

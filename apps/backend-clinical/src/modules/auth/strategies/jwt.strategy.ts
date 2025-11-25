/**
 * JWT Strategy for authentication
 * Validates JWT tokens and extracts user context
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUser } from '@dentalos/shared-auth';
import type {
  UUID,
  Email,
  UserRole,
  Permission,
  OrganizationId,
  ClinicId,
  TenantId,
} from '@dentalos/shared-types';

/**
 * JWT Payload structure from access token
 */
interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: string[];
  permissions: string[];
  organizationId: string;
  clinicId?: string;
  tenantId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'dev-secret-key',
    });
  }

  /**
   * Validates JWT payload and creates CurrentUser context
   */
  async validate(payload: JwtPayload): Promise<CurrentUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Compute tenantId (prefer clinicId if present, otherwise organizationId)
    const tenantId = (payload.clinicId ?? payload.organizationId) as TenantId;

    // Create CurrentUser from JWT payload with proper type casting for branded types
    const currentUser: CurrentUser = {
      userId: payload.sub as UUID,
      email: payload.email as Email,
      roles: payload.roles as unknown as readonly UserRole[],
      permissions: payload.permissions as unknown as readonly Permission[],
      tenantContext: {
        organizationId: payload.organizationId as OrganizationId,
        clinicId: payload.clinicId as ClinicId | undefined,
        tenantId,
      },
      // Backward-compatible fields
      organizationId: payload.organizationId as OrganizationId,
      clinicId: payload.clinicId as ClinicId | undefined,
      tenantId,
    };

    return currentUser;
  }
}

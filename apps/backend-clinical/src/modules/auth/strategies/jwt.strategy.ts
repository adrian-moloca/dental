/**
 * JWT Strategy for Clinical Service authentication
 *
 * Validates JWT tokens and extracts user context.
 *
 * @security CRITICAL: Algorithm Confusion Attack Prevention
 * - ONLY RS256 algorithm is permitted
 * - Uses public key for verification (asymmetric)
 * - Validates JWT signature using RSA public key from auth service
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
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
 * Decode a PEM key from base64 if it appears to be base64-encoded
 */
function decodeKeyIfBase64(key: string | undefined): string | undefined {
  if (!key) return undefined;
  if (key.includes('-----BEGIN')) return key;
  try {
    const decoded = Buffer.from(key, 'base64').toString('utf-8');
    if (decoded.includes('-----BEGIN')) return decoded;
  } catch {
    // Not valid base64
  }
  return key;
}

/**
 * Allowed JWT algorithms
 * SECURITY: Only RS256 is permitted to prevent algorithm confusion attacks
 */
const ALLOWED_JWT_ALGORITHMS: ('RS256')[] = ['RS256'];

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
    // Get the RSA public key for token verification (supports base64-encoded keys)
    const jwtPublicKey = decodeKeyIfBase64(configService.get<string>('JWT_ACCESS_PUBLIC_KEY'));

    if (!jwtPublicKey) {
      throw new Error(
        'JWT_ACCESS_PUBLIC_KEY environment variable is required for RS256 token verification. ' +
          'This is the public key from the auth service used to verify JWT signatures.'
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SECURITY: Use public key for RS256 verification
      secretOrKey: jwtPublicKey,
      // SECURITY CRITICAL: Only allow RS256 algorithm
      // This prevents algorithm confusion attacks (CVE-2015-9235, CVE-2016-10555)
      algorithms: ALLOWED_JWT_ALGORITHMS,
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

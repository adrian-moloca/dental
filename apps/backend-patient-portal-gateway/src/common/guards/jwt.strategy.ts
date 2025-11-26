/**
 * JWT Strategy for Patient Portal Gateway
 *
 * Validates JWT tokens and extracts patient payload.
 *
 * @security CRITICAL: Algorithm Confusion Attack Prevention
 * - ONLY RS256 algorithm is permitted
 * - Uses public key for verification (asymmetric)
 * - Validates JWT signature using RSA public key from auth service
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
 *
 * @module common/guards/jwt-strategy
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { AppConfig } from '@/config/configuration';
import type { CurrentPatientPayload } from '../decorators/current-patient.decorator';

/**
 * Allowed JWT algorithms
 * SECURITY: Only RS256 is permitted to prevent algorithm confusion attacks
 */
const ALLOWED_JWT_ALGORITHMS: ('RS256')[] = ['RS256'];

export interface JwtPayload {
  sub: string; // userId
  email: string;
  patientId?: string;
  tenantId: string;
  organizationId?: string;
  clinicId?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // SECURITY: RSA public key for RS256 verification
      secretOrKey: configService.get('jwt.accessPublicKey', { infer: true }),
      issuer: configService.get('jwt.issuer', { infer: true }),
      audience: configService.get('jwt.audience', { infer: true }),
      // SECURITY CRITICAL: Only allow RS256 algorithm
      // This prevents algorithm confusion attacks (CVE-2015-9235, CVE-2016-10555)
      algorithms: ALLOWED_JWT_ALGORITHMS,
    });
  }

  /**
   * Validate JWT payload
   *
   * Called automatically by Passport after JWT verification.
   */
  async validate(payload: JwtPayload): Promise<CurrentPatientPayload> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return patient payload for request.user
    return {
      userId: payload.sub,
      patientId: payload.patientId || '',
      email: payload.email,
      tenantId: payload.tenantId,
      organizationId: payload.organizationId,
      clinicId: payload.clinicId,
    };
  }
}

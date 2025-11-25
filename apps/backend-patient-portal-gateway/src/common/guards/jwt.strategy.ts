/**
 * JWT Strategy for Passport
 *
 * Validates JWT tokens and extracts patient payload.
 *
 * @module common/guards/jwt-strategy
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { AppConfig } from '@/config/configuration';
import type { CurrentPatientPayload } from '../decorators/current-patient.decorator';

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
      secretOrKey: configService.get('jwt.accessSecret', { infer: true }),
      issuer: configService.get('jwt.issuer', { infer: true }),
      audience: configService.get('jwt.audience', { infer: true }),
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

/**
 * JWT Authentication Guard (Legacy - use guards/jwt-auth.guard.ts instead)
 *
 * @module modules/auth/guards
 * @deprecated Use guards/jwt-auth.guard.ts from the root guards directory
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Placeholder for legacy guard
 * The actual JWT auth guard is in src/guards/jwt-auth.guard.ts
 */
@Injectable()
export class JwtAuthGuard {
  canActivate(): boolean {
    throw new UnauthorizedException('Legacy guard - use JwtAuthGuard from src/guards directory');
  }
}

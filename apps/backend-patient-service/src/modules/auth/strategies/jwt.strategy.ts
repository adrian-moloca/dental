/**
 * JWT Authentication Strategy (Legacy)
 *
 * @module modules/auth/strategies
 * @deprecated This module is not used. JWT auth is handled by src/guards/jwt-auth.guard.ts
 */

import { Injectable } from '@nestjs/common';

/**
 * Legacy JWT strategy placeholder
 * Actual auth is handled by the shared-auth guards in src/guards/
 */
@Injectable()
export class JwtStrategy {
  constructor() {
    // Legacy class - not used
  }
}

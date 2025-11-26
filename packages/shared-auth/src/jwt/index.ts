/**
 * JWT authentication utilities
 * @module shared-auth/jwt
 */

export type {
  AccessTokenPayload,
  RefreshTokenPayload,
  BaseJWTPayload,
  JwtSubscriptionContext,
} from './jwt-payload.types';

export {
  ModuleCode,
  SubscriptionStatus,
} from './jwt-payload.types';

export {
  verifyAccessToken,
  verifyRefreshToken,
  extractPayload,
  JWTError,
  JWTVerificationError,
  ALLOWED_JWT_ALGORITHMS,
} from './jwt-verifier';

export {
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  willExpireWithin,
  getTokenAge,
} from './token-helpers';

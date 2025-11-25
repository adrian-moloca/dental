import { AccessTokenPayload, RefreshTokenPayload } from './jwt-payload.types';
export declare function isTokenExpired(payload: AccessTokenPayload | RefreshTokenPayload): boolean;
export declare function getTokenExpiration(payload: AccessTokenPayload | RefreshTokenPayload): Date;
export declare function getTimeUntilExpiration(payload: AccessTokenPayload | RefreshTokenPayload): number;
export declare function willExpireWithin(payload: AccessTokenPayload | RefreshTokenPayload, thresholdMs: number): boolean;
export declare function getTokenAge(payload: AccessTokenPayload | RefreshTokenPayload): number;

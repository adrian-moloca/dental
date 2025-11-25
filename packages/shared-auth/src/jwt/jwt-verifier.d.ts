import { AccessTokenPayload, RefreshTokenPayload } from './jwt-payload.types';
export declare enum JWTVerificationError {
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    INVALID_SIGNATURE = "INVALID_SIGNATURE",
    MALFORMED_TOKEN = "MALFORMED_TOKEN",
    MISSING_CLAIMS = "MISSING_CLAIMS",
    INVALID_ISSUER = "INVALID_ISSUER",
    VERIFICATION_FAILED = "VERIFICATION_FAILED"
}
export declare class JWTError extends Error {
    readonly code: JWTVerificationError;
    readonly originalError?: Error | undefined;
    constructor(code: JWTVerificationError, message: string, originalError?: Error | undefined);
}
export declare function verifyAccessToken(token: string, secret: string | string[], expectedIssuer?: string): Promise<AccessTokenPayload>;
export declare function verifyRefreshToken(token: string, secret: string | string[], expectedIssuer?: string): Promise<RefreshTokenPayload>;
export declare function extractPayload<T = unknown>(token: string): T;

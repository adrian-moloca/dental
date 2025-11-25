"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTError = exports.JWTVerificationError = void 0;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.extractPayload = extractPayload;
const jwt = require("jsonwebtoken");
var JWTVerificationError;
(function (JWTVerificationError) {
    JWTVerificationError["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    JWTVerificationError["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    JWTVerificationError["MALFORMED_TOKEN"] = "MALFORMED_TOKEN";
    JWTVerificationError["MISSING_CLAIMS"] = "MISSING_CLAIMS";
    JWTVerificationError["INVALID_ISSUER"] = "INVALID_ISSUER";
    JWTVerificationError["VERIFICATION_FAILED"] = "VERIFICATION_FAILED";
})(JWTVerificationError || (exports.JWTVerificationError = JWTVerificationError = {}));
class JWTError extends Error {
    constructor(code, message, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'JWTError';
        Object.setPrototypeOf(this, JWTError.prototype);
    }
}
exports.JWTError = JWTError;
async function verifyAccessToken(token, secret, expectedIssuer) {
    if (!token || typeof token !== 'string') {
        throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, 'Token must be a non-empty string');
    }
    if (!secret || (Array.isArray(secret) && secret.length === 0)) {
        throw new Error('Secret is required for token verification');
    }
    const secrets = Array.isArray(secret) ? secret : [secret];
    let lastError;
    for (const currentSecret of secrets) {
        try {
            const decoded = jwt.verify(token, currentSecret, {
                complete: false,
                algorithms: ['HS256', 'HS384', 'HS512'],
            });
            if (!decoded.sub || !decoded.email || !decoded.roles || !decoded.organizationId) {
                throw new JWTError(JWTVerificationError.MISSING_CLAIMS, 'Access token missing required claims (sub, email, roles, organizationId)');
            }
            if (expectedIssuer && decoded.iss !== expectedIssuer) {
                throw new JWTError(JWTVerificationError.INVALID_ISSUER, `Invalid issuer: expected ${expectedIssuer}, got ${decoded.iss}`);
            }
            return decoded;
        }
        catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            lastError = errorObj;
            if (errorObj instanceof JWTError) {
                throw errorObj;
            }
            if (errorObj instanceof jwt.TokenExpiredError) {
                throw new JWTError(JWTVerificationError.TOKEN_EXPIRED, 'Token has expired', errorObj);
            }
            if (errorObj instanceof jwt.JsonWebTokenError) {
                if (errorObj.message.includes('invalid signature')) {
                    continue;
                }
                throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, `Malformed token: ${errorObj.message}`, errorObj);
            }
            continue;
        }
    }
    throw new JWTError(JWTVerificationError.INVALID_SIGNATURE, 'Token signature verification failed with all provided secrets', lastError);
}
async function verifyRefreshToken(token, secret, expectedIssuer) {
    if (!token || typeof token !== 'string') {
        throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, 'Token must be a non-empty string');
    }
    if (!secret || (Array.isArray(secret) && secret.length === 0)) {
        throw new Error('Secret is required for token verification');
    }
    const secrets = Array.isArray(secret) ? secret : [secret];
    let lastError;
    for (const currentSecret of secrets) {
        try {
            const decoded = jwt.verify(token, currentSecret, {
                complete: false,
                algorithms: ['HS256', 'HS384', 'HS512'],
            });
            if (!decoded.sub || !decoded.sessionId) {
                throw new JWTError(JWTVerificationError.MISSING_CLAIMS, 'Refresh token missing required claims (sub, sessionId)');
            }
            if (expectedIssuer && decoded.iss !== expectedIssuer) {
                throw new JWTError(JWTVerificationError.INVALID_ISSUER, `Invalid issuer: expected ${expectedIssuer}, got ${decoded.iss}`);
            }
            return decoded;
        }
        catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            lastError = errorObj;
            if (errorObj instanceof JWTError) {
                throw errorObj;
            }
            if (errorObj instanceof jwt.TokenExpiredError) {
                throw new JWTError(JWTVerificationError.TOKEN_EXPIRED, 'Token has expired', errorObj);
            }
            if (errorObj instanceof jwt.JsonWebTokenError) {
                if (errorObj.message.includes('invalid signature')) {
                    continue;
                }
                throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, `Malformed token: ${errorObj.message}`, errorObj);
            }
            continue;
        }
    }
    throw new JWTError(JWTVerificationError.INVALID_SIGNATURE, 'Token signature verification failed with all provided secrets', lastError);
}
function extractPayload(token) {
    if (!token || typeof token !== 'string') {
        throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, 'Token must be a non-empty string');
    }
    try {
        const decoded = jwt.decode(token, { complete: false });
        if (!decoded || typeof decoded !== 'object') {
            throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, 'Token payload is not a valid JSON object');
        }
        return decoded;
    }
    catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        throw new JWTError(JWTVerificationError.MALFORMED_TOKEN, `Failed to decode token: ${errorObj.message}`, errorObj);
    }
}
//# sourceMappingURL=jwt-verifier.js.map
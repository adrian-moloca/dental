"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenExpired = isTokenExpired;
exports.getTokenExpiration = getTokenExpiration;
exports.getTimeUntilExpiration = getTimeUntilExpiration;
exports.willExpireWithin = willExpireWithin;
exports.getTokenAge = getTokenAge;
function isTokenExpired(payload) {
    if (!payload.exp || typeof payload.exp !== 'number') {
        throw new Error('Token payload missing valid exp claim');
    }
    const now = Math.floor(Date.now() / 1000);
    const clockSkewToleranceSeconds = 5;
    return payload.exp < now - clockSkewToleranceSeconds;
}
function getTokenExpiration(payload) {
    if (!payload.exp || typeof payload.exp !== 'number') {
        throw new Error('Token payload missing valid exp claim');
    }
    return new Date(payload.exp * 1000);
}
function getTimeUntilExpiration(payload) {
    if (!payload.exp || typeof payload.exp !== 'number') {
        throw new Error('Token payload missing valid exp claim');
    }
    const expirationMs = payload.exp * 1000;
    const nowMs = Date.now();
    return expirationMs - nowMs;
}
function willExpireWithin(payload, thresholdMs) {
    if (thresholdMs < 0) {
        throw new Error('Threshold must be a non-negative number');
    }
    const timeRemaining = getTimeUntilExpiration(payload);
    return timeRemaining <= thresholdMs;
}
function getTokenAge(payload) {
    if (!payload.iat || typeof payload.iat !== 'number') {
        throw new Error('Token payload missing valid iat claim');
    }
    const issuedAtMs = payload.iat * 1000;
    const nowMs = Date.now();
    return nowMs - issuedAtMs;
}
//# sourceMappingURL=token-helpers.js.map
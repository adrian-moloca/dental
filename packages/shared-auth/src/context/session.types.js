"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.isSessionExpired = isSessionExpired;
exports.getSessionTimeRemaining = getSessionTimeRemaining;
function createSession(params) {
    if (!params.sessionId) {
        throw new Error('sessionId is required');
    }
    if (!params.userId) {
        throw new Error('userId is required');
    }
    if (!params.expiresAt) {
        throw new Error('expiresAt is required');
    }
    const now = new Date();
    if (params.expiresAt <= now) {
        throw new Error('expiresAt must be in the future');
    }
    return Object.freeze({
        sessionId: params.sessionId,
        userId: params.userId,
        createdAt: now,
        expiresAt: params.expiresAt,
        lastActivityAt: now,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        deviceId: params.deviceId,
        metadata: params.metadata ? Object.freeze({ ...params.metadata }) : undefined,
    });
}
function isSessionExpired(session) {
    return session.expiresAt <= new Date();
}
function getSessionTimeRemaining(session) {
    return session.expiresAt.getTime() - Date.now();
}
//# sourceMappingURL=session.types.js.map
import { UUID } from '@dentalos/shared-types';
export interface Session {
    readonly sessionId: UUID;
    readonly userId: UUID;
    readonly createdAt: Date;
    readonly expiresAt: Date;
    readonly lastActivityAt: Date;
    readonly ipAddress?: string;
    readonly userAgent?: string;
    readonly deviceId?: string;
    readonly metadata?: Record<string, unknown>;
}
export interface CreateSessionParams {
    sessionId: UUID;
    userId: UUID;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    metadata?: Record<string, unknown>;
}
export declare function createSession(params: CreateSessionParams): Session;
export declare function isSessionExpired(session: Session): boolean;
export declare function getSessionTimeRemaining(session: Session): number;

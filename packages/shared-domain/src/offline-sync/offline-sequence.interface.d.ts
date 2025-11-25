export interface OfflineSequence {
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    currentSequence: number;
    lastUpdated: Date;
}
export interface SyncCheckpoint {
    deviceId: string;
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    lastSyncedSequence: number;
    lastSyncedAt: Date;
    pendingChanges: number;
}

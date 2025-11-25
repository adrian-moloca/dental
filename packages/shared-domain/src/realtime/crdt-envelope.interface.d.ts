export interface CRDTEnvelope {
    id: string;
    resourceType: string;
    resourceId: string;
    actorId: string;
    version: number;
    timestamp: Date;
    patch: Record<string, any>;
    tenantId: string;
    organizationId: string;
    clinicId?: string;
}
export interface CRDTMergeResult {
    merged: Record<string, any>;
    conflicts: CRDTConflict[];
    resolved: boolean;
}
export interface CRDTConflict {
    field: string;
    localValue: any;
    remoteValue: any;
    localVersion: number;
    remoteVersion: number;
    resolution?: 'local' | 'remote' | 'merged' | 'manual';
}
export declare enum CRDTResolutionStrategy {
    LAST_WRITE_WINS = "LAST_WRITE_WINS",
    HIGHEST_VERSION_WINS = "HIGHEST_VERSION_WINS",
    MANUAL = "MANUAL",
    MERGE_OBJECTS = "MERGE_OBJECTS"
}

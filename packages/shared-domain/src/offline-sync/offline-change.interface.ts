export enum ChangeOperation {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum ConflictResolutionStrategy {
  SERVER_WINS = 'SERVER_WINS',
  CLIENT_WINS = 'CLIENT_WINS',
  MERGE = 'MERGE',
}

export interface OfflineChange {
  changeId: string;
  sequenceNumber: number;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  entityType: string;
  entityId: string;
  operation: ChangeOperation;
  data: Record<string, any>;
  previousData?: Record<string, any>;
  timestamp: Date;
  sourceDeviceId?: string;
  eventId?: string;
  eventType?: string;
}

export interface SyncBatch {
  deviceId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  lastSequence: number;
  changes: OfflineChange[];
  timestamp: Date;
}

export interface ConflictResolution {
  changeId: string;
  strategy: ConflictResolutionStrategy;
  serverData: Record<string, any>;
  clientData: Record<string, any>;
  resolvedData: Record<string, any>;
  resolvedAt: Date;
}

import { ConflictResolutionStrategy } from '@dentalos/shared-domain';

export interface ConflictResult {
  changeId: string;
  entityType: string;
  entityId: string;
  strategy: ConflictResolutionStrategy;
  resolvedData: Record<string, any>;
  serverVersion?: Record<string, any>;
  clientVersion?: Record<string, any>;
}

export interface SyncResult {
  accepted: number;
  rejected: number;
  conflicts: ConflictResult[];
  newSequence: number;
  timestamp: Date;
}

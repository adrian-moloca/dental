import { EventEmitter } from 'events';

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

export interface CRDTConflict {
  field: string;
  localValue: any;
  remoteValue: any;
  localVersion: number;
  remoteVersion: number;
  localTimestamp: Date;
  remoteTimestamp: Date;
  resolution?: 'local' | 'remote' | 'manual';
}

export interface CRDTMergeResult {
  merged: Record<string, any>;
  conflicts: CRDTConflict[];
  resolved: boolean;
  needsManualResolution: boolean;
}

export enum CRDTResolutionStrategy {
  LAST_WRITE_WINS = 'LAST_WRITE_WINS',
  HIGHEST_VERSION_WINS = 'HIGHEST_VERSION_WINS',
  MERGE_OBJECTS = 'MERGE_OBJECTS',
  MANUAL = 'MANUAL',
}

export class CRDTMergeEngine extends EventEmitter {
  private defaultStrategy: CRDTResolutionStrategy = CRDTResolutionStrategy.LAST_WRITE_WINS;

  constructor(defaultStrategy?: CRDTResolutionStrategy) {
    super();
    if (defaultStrategy) {
      this.defaultStrategy = defaultStrategy;
    }
  }

  /**
   * Merges a remote CRDT patch with local data.
   * Detects conflicts and resolves them based on the strategy.
   */
  async merge(
    localData: Record<string, any>,
    localMetadata: { version: number; timestamp: Date; actorId: string },
    remotePatch: CRDTEnvelope,
    strategy?: CRDTResolutionStrategy,
  ): Promise<CRDTMergeResult> {
    const resolutionStrategy = strategy || this.defaultStrategy;
    const conflicts: CRDTConflict[] = [];
    let merged: Record<string, any> = { ...localData };
    let needsManualResolution = false;

    // Extract all fields from both local and remote
    const localFields = Object.keys(localData);
    const remoteFields = Object.keys(remotePatch.patch);
    const allFields = Array.from(new Set([...localFields, ...remoteFields]));

    for (const field of allFields) {
      const hasLocal = localFields.includes(field);
      const hasRemote = remoteFields.includes(field);
      const localValue = localData[field];
      const remoteValue = remotePatch.patch[field];

      if (hasLocal && hasRemote && !this.areValuesEqual(localValue, remoteValue)) {
        // Conflict detected
        const conflict: CRDTConflict = {
          field,
          localValue,
          remoteValue,
          localVersion: localMetadata.version,
          remoteVersion: remotePatch.version,
          localTimestamp: localMetadata.timestamp,
          remoteTimestamp: remotePatch.timestamp,
        };

        const resolved = this.resolveConflict(conflict, resolutionStrategy);
        merged[field] = resolved.value;
        conflict.resolution = resolved.resolution;
        conflicts.push(conflict);

        if (resolutionStrategy === CRDTResolutionStrategy.MANUAL) {
          needsManualResolution = true;
        }
      } else if (hasRemote) {
        // Only remote has the field, apply it
        merged[field] = remoteValue;
      }
      // If only local has the field, keep it as is
    }

    const result: CRDTMergeResult = {
      merged,
      conflicts,
      resolved: !needsManualResolution,
      needsManualResolution,
    };

    if (conflicts.length > 0) {
      this.emit('conflicts-detected', { remotePatch, conflicts });
    }

    return result;
  }

  /**
   * Merges multiple remote patches in order.
   * Useful for applying a batch of patches received while offline.
   */
  async mergeMultiple(
    localData: Record<string, any>,
    localMetadata: { version: number; timestamp: Date; actorId: string },
    remotePatches: CRDTEnvelope[],
    strategy?: CRDTResolutionStrategy,
  ): Promise<CRDTMergeResult> {
    // Sort patches by version and timestamp
    const sorted = remotePatches.sort((a, b) => {
      if (a.version !== b.version) {
        return a.version - b.version;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    let currentData = { ...localData };
    let currentMetadata = { ...localMetadata };
    let allConflicts: CRDTConflict[] = [];
    let needsManualResolution = false;

    for (const patch of sorted) {
      const result = await this.merge(currentData, currentMetadata, patch, strategy);
      currentData = result.merged;
      currentMetadata = {
        version: patch.version,
        timestamp: patch.timestamp,
        actorId: patch.actorId,
      };
      allConflicts.push(...result.conflicts);
      if (result.needsManualResolution) {
        needsManualResolution = true;
      }
    }

    return {
      merged: currentData,
      conflicts: allConflicts,
      resolved: !needsManualResolution,
      needsManualResolution,
    };
  }

  /**
   * Resolves a single conflict based on the strategy.
   */
  private resolveConflict(
    conflict: CRDTConflict,
    strategy: CRDTResolutionStrategy,
  ): { value: any; resolution: 'local' | 'remote' | 'manual' } {
    switch (strategy) {
      case CRDTResolutionStrategy.LAST_WRITE_WINS: {
        const localTime = new Date(conflict.localTimestamp).getTime();
        const remoteTime = new Date(conflict.remoteTimestamp).getTime();
        if (remoteTime > localTime) {
          return { value: conflict.remoteValue, resolution: 'remote' };
        } else if (remoteTime < localTime) {
          return { value: conflict.localValue, resolution: 'local' };
        } else {
          // Same timestamp, use version as tiebreaker
          if (conflict.remoteVersion > conflict.localVersion) {
            return { value: conflict.remoteValue, resolution: 'remote' };
          } else {
            return { value: conflict.localValue, resolution: 'local' };
          }
        }
      }

      case CRDTResolutionStrategy.HIGHEST_VERSION_WINS: {
        if (conflict.remoteVersion > conflict.localVersion) {
          return { value: conflict.remoteValue, resolution: 'remote' };
        } else if (conflict.remoteVersion < conflict.localVersion) {
          return { value: conflict.localValue, resolution: 'local' };
        } else {
          // Same version, use timestamp as tiebreaker
          const localTime = new Date(conflict.localTimestamp).getTime();
          const remoteTime = new Date(conflict.remoteTimestamp).getTime();
          if (remoteTime > localTime) {
            return { value: conflict.remoteValue, resolution: 'remote' };
          } else {
            return { value: conflict.localValue, resolution: 'local' };
          }
        }
      }

      case CRDTResolutionStrategy.MERGE_OBJECTS: {
        // If both values are objects, try to merge them
        if (
          typeof conflict.localValue === 'object' &&
          typeof conflict.remoteValue === 'object' &&
          conflict.localValue !== null &&
          conflict.remoteValue !== null &&
          !Array.isArray(conflict.localValue) &&
          !Array.isArray(conflict.remoteValue)
        ) {
          const merged = { ...conflict.localValue, ...conflict.remoteValue };
          return { value: merged, resolution: 'remote' };
        }
        // Otherwise fall back to LAST_WRITE_WINS
        return this.resolveConflict(conflict, CRDTResolutionStrategy.LAST_WRITE_WINS);
      }

      case CRDTResolutionStrategy.MANUAL: {
        // Return remote by default, but mark for manual resolution
        return { value: conflict.remoteValue, resolution: 'manual' };
      }

      default: {
        return { value: conflict.remoteValue, resolution: 'remote' };
      }
    }
  }

  /**
   * Deep equality check for values.
   */
  private areValuesEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.areValuesEqual(a[i], b[i])) return false;
        }
        return true;
      }

      if (Array.isArray(a) || Array.isArray(b)) return false;

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.areValuesEqual(a[key], b[key])) return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Creates a CRDT patch from local changes.
   */
  createPatch(
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    metadata: {
      actorId: string;
      version: number;
      tenantId: string;
      organizationId: string;
      clinicId?: string;
    },
  ): CRDTEnvelope {
    return {
      id: `patch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      resourceType,
      resourceId,
      actorId: metadata.actorId,
      version: metadata.version,
      timestamp: new Date(),
      patch: changes,
      tenantId: metadata.tenantId,
      organizationId: metadata.organizationId,
      clinicId: metadata.clinicId,
    };
  }
}

let mergeEngineInstance: CRDTMergeEngine | null = null;

export function getCRDTMergeEngine(): CRDTMergeEngine {
  if (!mergeEngineInstance) {
    mergeEngineInstance = new CRDTMergeEngine();
  }
  return mergeEngineInstance;
}

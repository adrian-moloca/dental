import { Injectable } from '@nestjs/common';
import {
  CRDTEnvelope,
  CRDTMergeResult,
  CRDTConflict,
  CRDTResolutionStrategy,
} from '@dentalos/shared-domain';

@Injectable()
export class CRDTResolverService {
  constructor() {}

  async mergePatches(
    _tenantId: string,
    _resourceType: string,
    _resourceId: string,
    localPatch: CRDTEnvelope,
    remotePatch: CRDTEnvelope,
    strategy: CRDTResolutionStrategy = CRDTResolutionStrategy.LAST_WRITE_WINS,
  ): Promise<CRDTMergeResult> {
    const conflicts: CRDTConflict[] = [];
    const merged: Record<string, any> = {};

    const localFields = Object.keys(localPatch.patch);
    const remoteFields = Object.keys(remotePatch.patch);
    const allFields = Array.from(new Set([...localFields, ...remoteFields]));

    for (const field of allFields) {
      const hasLocal = localFields.includes(field);
      const hasRemote = remoteFields.includes(field);

      if (hasLocal && hasRemote) {
        const localValue = localPatch.patch[field];
        const remoteValue = remotePatch.patch[field];

        if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          const conflict: CRDTConflict = {
            field,
            localValue,
            remoteValue,
            localVersion: localPatch.version,
            remoteVersion: remotePatch.version,
          };

          const resolvedValue = this.resolveConflict(conflict, strategy, localPatch, remotePatch);
          conflict.resolution = resolvedValue.resolution;
          merged[field] = resolvedValue.value;
          conflicts.push(conflict);
        } else {
          merged[field] = localValue;
        }
      } else if (hasLocal) {
        merged[field] = localPatch.patch[field];
      } else {
        merged[field] = remotePatch.patch[field];
      }
    }

    const resolved = conflicts.every((c) => c.resolution !== 'manual');

    return { merged, conflicts, resolved };
  }

  private resolveConflict(
    conflict: CRDTConflict,
    strategy: CRDTResolutionStrategy,
    localPatch: CRDTEnvelope,
    remotePatch: CRDTEnvelope,
  ): { value: any; resolution: 'local' | 'remote' | 'merged' | 'manual' } {
    switch (strategy) {
      case CRDTResolutionStrategy.LAST_WRITE_WINS:
        if (localPatch.timestamp > remotePatch.timestamp) {
          return { value: conflict.localValue, resolution: 'local' };
        } else {
          return { value: conflict.remoteValue, resolution: 'remote' };
        }

      case CRDTResolutionStrategy.HIGHEST_VERSION_WINS:
        if (localPatch.version > remotePatch.version) {
          return { value: conflict.localValue, resolution: 'local' };
        } else {
          return { value: conflict.remoteValue, resolution: 'remote' };
        }

      case CRDTResolutionStrategy.MERGE_OBJECTS:
        if (typeof conflict.localValue === 'object' && typeof conflict.remoteValue === 'object') {
          const merged = { ...conflict.remoteValue, ...conflict.localValue };
          return { value: merged, resolution: 'merged' };
        }
        return { value: conflict.remoteValue, resolution: 'remote' };

      case CRDTResolutionStrategy.MANUAL:
      default:
        return { value: conflict.localValue, resolution: 'manual' };
    }
  }
}

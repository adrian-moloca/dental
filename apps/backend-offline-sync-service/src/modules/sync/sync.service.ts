import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ChangeLogService } from '../changelog/changelog.service';
import { DeviceRegistryService } from '../device-registry/device-registry.service';
import { UploadChangesDto } from './dto/upload-changes.dto';
import { SyncResult, ConflictResult } from './dto/sync-result.dto';
import {
  OfflineChange,
  ChangeOperation,
  ConflictResolutionStrategy,
} from '@dentalos/shared-domain';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly changeLogService: ChangeLogService,
    private readonly deviceRegistryService: DeviceRegistryService,
  ) {}

  async uploadChanges(dto: UploadChangesDto, deviceId: string): Promise<SyncResult> {
    // Verify device is active and belongs to tenant
    const device = await this.deviceRegistryService.verifyDeviceToken(deviceId, dto.tenantId);

    if (!device) {
      throw new BadRequestException('Invalid device or device not active');
    }

    const accepted: string[] = [];
    const rejected: string[] = [];
    const conflicts: ConflictResult[] = [];

    // Process each change in the batch
    for (const change of dto.changes) {
      try {
        // Check for conflicts by looking at recent changes to the same entity
        const recentChanges = await this.changeLogService.getChangesByEntity(
          dto.tenantId,
          change.entityType,
          change.entityId,
          5,
        );

        const hasConflict = this.detectConflict(
          change as OfflineChange,
          recentChanges,
          dto.lastSequence,
        );

        if (hasConflict) {
          // Resolve conflict using SERVER_WINS strategy by default
          const conflictResult = await this.resolveConflict(
            change as OfflineChange,
            recentChanges[0],
            ConflictResolutionStrategy.SERVER_WINS,
          );

          conflicts.push(conflictResult);

          // Log the server version as the authoritative change
          await this.changeLogService.createChangeLog({
            tenantId: dto.tenantId,
            organizationId: dto.organizationId,
            clinicId: dto.clinicId,
            entityType: change.entityType,
            entityId: change.entityId,
            operation: change.operation as ChangeOperation,
            data: conflictResult.resolvedData,
            previousData: change.previousData,
            timestamp: new Date(),
            sourceDeviceId: deviceId,
            eventId: change.changeId,
            eventType: `sync.conflict.${change.operation.toLowerCase()}`,
          });

          accepted.push(change.changeId);
        } else {
          // No conflict, accept the change
          await this.changeLogService.createChangeLog({
            tenantId: dto.tenantId,
            organizationId: dto.organizationId,
            clinicId: dto.clinicId,
            entityType: change.entityType,
            entityId: change.entityId,
            operation: change.operation as ChangeOperation,
            data: change.data,
            previousData: change.previousData,
            timestamp: change.timestamp,
            sourceDeviceId: deviceId,
            eventId: change.changeId,
            eventType: `sync.${change.operation.toLowerCase()}`,
          });

          accepted.push(change.changeId);
        }
      } catch (error) {
        this.logger.error(
          `Failed to process change ${change.changeId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        rejected.push(change.changeId);
      }
    }

    const newSequence = await this.changeLogService.getCurrentSequence(dto.tenantId);

    this.logger.log(
      `Sync completed for device ${deviceId}: ${accepted.length} accepted, ${rejected.length} rejected, ${conflicts.length} conflicts`,
    );

    return {
      accepted: accepted.length,
      rejected: rejected.length,
      conflicts,
      newSequence,
      timestamp: new Date(),
    };
  }

  private detectConflict(
    clientChange: OfflineChange,
    serverChanges: OfflineChange[],
    clientLastSequence: number,
  ): boolean {
    if (serverChanges.length === 0) {
      return false;
    }

    // Check if there are server changes after the client's last known sequence
    const conflictingChanges = serverChanges.filter(
      (sc) =>
        sc.sequenceNumber > clientLastSequence && sc.sourceDeviceId !== clientChange.sourceDeviceId,
    );

    return conflictingChanges.length > 0;
  }

  private async resolveConflict(
    clientChange: OfflineChange,
    serverChange: OfflineChange,
    strategy: ConflictResolutionStrategy,
  ): Promise<ConflictResult> {
    let resolvedData: Record<string, any>;

    switch (strategy) {
      case ConflictResolutionStrategy.SERVER_WINS:
        resolvedData = serverChange.data;
        break;

      case ConflictResolutionStrategy.CLIENT_WINS:
        resolvedData = clientChange.data;
        break;

      case ConflictResolutionStrategy.MERGE:
        // Simple merge: server data takes precedence for overlapping keys
        resolvedData = {
          ...clientChange.data,
          ...serverChange.data,
        };
        break;

      default:
        resolvedData = serverChange.data;
    }

    return {
      changeId: clientChange.changeId,
      entityType: clientChange.entityType,
      entityId: clientChange.entityId,
      strategy,
      resolvedData,
      serverVersion: serverChange.data,
      clientVersion: clientChange.data,
    };
  }

  async downloadChanges(
    tenantId: string,
    organizationId: string,
    clinicId: string | undefined,
    sinceSequence: number,
    limit: number = 100,
    entityType?: string,
  ): Promise<{ changes: OfflineChange[]; currentSequence: number; hasMore: boolean }> {
    const changes = await this.changeLogService.getChangesSince(
      tenantId,
      organizationId,
      clinicId,
      sinceSequence,
      limit,
      entityType,
    );

    const currentSequence = await this.changeLogService.getCurrentSequence(tenantId);

    return {
      changes,
      currentSequence,
      hasMore: changes.length === limit,
    };
  }
}

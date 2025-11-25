import { getDatabase } from '../localdb/indexeddb';
import { ChangeLogRecord } from '../localdb/schema';
import axios from 'axios';
import { ConflictResolver } from './conflict-resolution';

export class DownloadProcessor {
  private apiBaseUrl: string;
  private conflictResolver: ConflictResolver;

  constructor(apiBaseUrl: string, _encryptionKey: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.conflictResolver = new ConflictResolver();
  }

  async downloadDeltas(tenantId: string, organizationId: string, clinicId: string | undefined, deviceAccessToken: string): Promise<{ applied: number; conflicts: number }> {
    const db = getDatabase();

    const sequenceState = await db.sequenceState
      .where('tenantId')
      .equals(tenantId)
      .first();

    const sinceSequence = sequenceState?.lastSyncedSequence || 0;

    const response = await axios.get(
      `${this.apiBaseUrl}/api/v1/sync/download`,
      {
        params: {
          sinceSequence,
          limit: 100
        },
        headers: {
          'Authorization': `Bearer ${deviceAccessToken}`,
          'x-tenant-id': tenantId,
          'x-organization-id': organizationId,
          'x-clinic-id': clinicId || ''
        }
      }
    );

    const { changes, currentSequence } = response.data;

    let applied = 0;
    let conflicts = 0;

    for (const change of changes) {
      try {
        const hasConflict = await this.detectLocalConflict(change);

        if (hasConflict) {
          await this.conflictResolver.resolve(change, 'SERVER_WINS');
          conflicts++;
        }

        await this.applyChange(change);
        applied++;
      } catch (error) {
        console.error(`Failed to apply change ${change.changeId}:`, error);
      }
    }

    if (changes.length > 0) {
      await db.sequenceState.put({
        id: sequenceState?.id || 1,
        tenantId,
        lastSyncedSequence: currentSequence,
        lastSyncedAt: new Date()
      });
    }

    return { applied, conflicts };
  }

  private async detectLocalConflict(change: ChangeLogRecord): Promise<boolean> {
    const db = getDatabase();

    const pending = await db.pendingChanges
      .where('[tenantId+synced]')
      .equals([change.tenantId, 0])
      .and(p => p.entityType === change.entityType && p.entityId === change.entityId)
      .first();

    return !!pending;
  }

  private async applyChange(change: ChangeLogRecord): Promise<void> {
    const db = getDatabase();

    await db.changelog.add({
      ...change,
      syncedAt: new Date()
    });

    const tableName = this.getTableName(change.entityType);

    if (change.operation === 'INSERT' || change.operation === 'UPDATE') {
      const record = {
        ...change.data,
        [this.getPrimaryKey(change.entityType)]: change.entityId,
        tenantId: change.tenantId,
        organizationId: change.organizationId,
        clinicId: change.clinicId,
        updatedAt: new Date(change.timestamp)
      };

      await (db as any)[tableName].put(record);
    } else if (change.operation === 'DELETE') {
      await (db as any)[tableName].delete(change.entityId);
    }
  }

  private getTableName(entityType: string): string {
    const parts = entityType.split('.');
    const table = parts[parts.length - 1];

    const tableMap: Record<string, string> = {
      'patient': 'patients',
      'appointment': 'appointments',
      'clinical': 'clinical',
      'image': 'imaging',
      'invoice': 'billing',
      'item': 'inventory',
      'employee': 'hr',
      'cycle': 'sterilization',
      'organization': 'enterprise',
      'clinic': 'enterprise'
    };

    return tableMap[table] || 'enterprise';
  }

  private getPrimaryKey(entityType: string): string {
    const keyMap: Record<string, string> = {
      'patient': 'patientId',
      'appointment': 'appointmentId',
      'clinical': 'recordId',
      'image': 'imageId',
      'invoice': 'invoiceId',
      'item': 'itemId',
      'employee': 'employeeId',
      'cycle': 'cycleId'
    };

    const parts = entityType.split('.');
    const entity = parts[parts.length - 1];

    return keyMap[entity] || 'entityId';
  }
}

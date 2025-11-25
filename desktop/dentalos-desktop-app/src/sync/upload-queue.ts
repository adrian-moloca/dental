import { getDatabase } from '../localdb/indexeddb';
import { PendingChangeRecord } from '../localdb/schema';
import axios from 'axios';

export class UploadQueue {
  private apiBaseUrl: string;
  private isProcessing: boolean = false;

  constructor(apiBaseUrl: string, _encryptionKey: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async addChange(change: Omit<PendingChangeRecord, 'localId' | 'createdAt' | 'retryCount' | 'synced'>): Promise<void> {
    const db = getDatabase();

    const pendingChange: PendingChangeRecord = {
      ...change,
      localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      retryCount: 0,
      synced: false
    };

    await db.pendingChanges.add(pendingChange);
  }

  async processBatch(deviceId: string, deviceAccessToken: string): Promise<{ uploaded: number; failed: number }> {
    if (this.isProcessing) {
      return { uploaded: 0, failed: 0 };
    }

    this.isProcessing = true;

    try {
      const db = getDatabase();
      const pending = await db.pendingChanges
        .where('synced')
        .equals(0)
        .limit(50)
        .toArray();

      if (pending.length === 0) {
        return { uploaded: 0, failed: 0 };
      }

      const tenantId = pending[0].tenantId;
      const organizationId = pending[0].organizationId;
      const clinicId = pending[0].clinicId;

      const sequenceState = await db.sequenceState
        .where('tenantId')
        .equals(tenantId)
        .first();

      const lastSequence = sequenceState?.lastSyncedSequence || 0;

      const changes = pending.map(p => ({
        changeId: p.localId,
        sequenceNumber: 0,
        tenantId: p.tenantId,
        organizationId: p.organizationId,
        clinicId: p.clinicId,
        entityType: p.entityType,
        entityId: p.entityId,
        operation: p.operation,
        data: p.data,
        previousData: p.previousData,
        timestamp: p.createdAt
      }));

      const response = await axios.post(
        `${this.apiBaseUrl}/api/v1/sync/upload`,
        {
          deviceId,
          tenantId,
          organizationId,
          clinicId,
          lastSequence,
          changes,
          timestamp: new Date()
        },
        {
          headers: {
            'Authorization': `Bearer ${deviceAccessToken}`,
            'x-device-id': deviceId,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;

      const uploadedIds = pending.slice(0, result.accepted).map(p => p.localId);
      await db.pendingChanges.bulkDelete(uploadedIds);

      const failedChanges = pending.slice(result.accepted);
      for (const change of failedChanges) {
        await db.pendingChanges.update(change.localId, {
          retryCount: change.retryCount + 1,
          lastError: 'Upload rejected by server'
        });
      }

      if (result.newSequence) {
        await db.sequenceState.put({
          id: sequenceState?.id || 1,
          tenantId,
          lastSyncedSequence: result.newSequence,
          lastSyncedAt: new Date()
        });
      }

      return { uploaded: result.accepted, failed: result.rejected };
    } catch (error) {
      console.error('Upload batch failed:', error);
      return { uploaded: 0, failed: 0 };
    } finally {
      this.isProcessing = false;
    }
  }

  async getPendingCount(): Promise<number> {
    const db = getDatabase();
    return db.pendingChanges.where('synced').equals(0).count();
  }

  async clearSynced(): Promise<void> {
    const db = getDatabase();
    const synced = await db.pendingChanges.where('synced').equals(1).toArray();
    await db.pendingChanges.bulkDelete(synced.map(s => s.localId));
  }
}

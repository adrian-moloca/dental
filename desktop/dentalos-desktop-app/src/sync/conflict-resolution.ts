import { getDatabase } from '../localdb/indexeddb';
import { ChangeLogRecord, PendingChangeRecord } from '../localdb/schema';

export type ConflictStrategy = 'SERVER_WINS' | 'CLIENT_WINS' | 'MERGE';

export class ConflictResolver {
  async resolve(serverChange: ChangeLogRecord, strategy: ConflictStrategy = 'SERVER_WINS'): Promise<void> {
    const db = getDatabase();

    const localPending = await db.pendingChanges
      .where('[tenantId+synced]')
      .equals([serverChange.tenantId, 0])
      .and(p => p.entityType === serverChange.entityType && p.entityId === serverChange.entityId)
      .first();

    if (!localPending) {
      return;
    }

    switch (strategy) {
      case 'SERVER_WINS':
        await this.applyServerWins(localPending, serverChange);
        break;

      case 'CLIENT_WINS':
        await this.applyClientWins(localPending, serverChange);
        break;

      case 'MERGE':
        await this.applyMerge(localPending, serverChange);
        break;
    }
  }

  private async applyServerWins(localPending: PendingChangeRecord, serverChange: ChangeLogRecord): Promise<void> {
    const db = getDatabase();

    await db.pendingChanges.update(localPending.localId, {
      data: serverChange.data,
      synced: true,
      lastError: 'Conflict resolved: SERVER_WINS'
    });
  }

  private async applyClientWins(localPending: PendingChangeRecord, _serverChange: ChangeLogRecord): Promise<void> {
    const db = getDatabase();

    await db.pendingChanges.update(localPending.localId, {
      retryCount: localPending.retryCount + 1
    });
  }

  private async applyMerge(localPending: PendingChangeRecord, serverChange: ChangeLogRecord): Promise<void> {
    const db = getDatabase();

    const mergedData = this.mergeObjects(localPending.data, serverChange.data);

    await db.pendingChanges.update(localPending.localId, {
      data: mergedData,
      retryCount: localPending.retryCount + 1
    });
  }

  private mergeObjects(client: any, server: any): any {
    if (typeof client !== 'object' || typeof server !== 'object') {
      return server;
    }

    const merged = { ...client };

    for (const key in server) {
      if (server.hasOwnProperty(key)) {
        if (typeof server[key] === 'object' && server[key] !== null && !Array.isArray(server[key])) {
          merged[key] = this.mergeObjects(client[key] || {}, server[key]);
        } else {
          merged[key] = server[key];
        }
      }
    }

    return merged;
  }

  async getConflicts(tenantId: string): Promise<PendingChangeRecord[]> {
    const db = getDatabase();

    return db.pendingChanges
      .where('tenantId')
      .equals(tenantId)
      .and(p => !!p.lastError && p.lastError.includes('Conflict'))
      .toArray();
  }

  async clearResolvedConflicts(tenantId: string): Promise<void> {
    const db = getDatabase();

    const resolved = await db.pendingChanges
      .where('tenantId')
      .equals(tenantId)
      .and(p => p.synced === true)
      .toArray();

    await db.pendingChanges.bulkDelete(resolved.map(r => r.localId));
  }
}

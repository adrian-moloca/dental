import { getDatabase } from '../localdb/indexeddb';
import { UploadQueue } from './upload-queue';
import { DownloadProcessor } from './download-processor';
import { loadDeviceCredentials } from '../auth/load-device-credentials';
import { getWebSocketClient } from '../realtime/websocket-client';
import { getCRDTMergeEngine, CRDTEnvelope } from '../realtime/crdt-merge';

export interface SyncStatus {
  isRunning: boolean;
  lastSyncAt: Date | null;
  lastSequence: number;
  pendingChanges: number;
  errors: string[];
  uploaded: number;
  downloaded: number;
  conflicts: number;
}

export class SyncManager {
  private uploadQueue: UploadQueue | null = null;
  private downloadProcessor: DownloadProcessor | null = null;
  private status: SyncStatus;
  private isPaused: boolean = false;
  private isInitialized: boolean = false;
  private rateLimitTimer: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private readonly RATE_LIMIT_MS = 10000;

  constructor() {
    this.status = {
      isRunning: false,
      lastSyncAt: null,
      lastSequence: 0,
      pendingChanges: 0,
      errors: [],
      uploaded: 0,
      downloaded: 0,
      conflicts: 0
    };
  }

  async initialize(): Promise<void> {
    const credentials = await loadDeviceCredentials();

    if (!credentials) {
      throw new Error('Device not registered. Cannot initialize sync manager.');
    }

    const apiBaseUrl = process.env.SYNC_API_URL || 'http://localhost:3019';
    const realtimeUrl = process.env.REALTIME_URL || 'http://localhost:3020';

    this.uploadQueue = new UploadQueue(apiBaseUrl, credentials.encryptionKey);
    this.downloadProcessor = new DownloadProcessor(apiBaseUrl, credentials.encryptionKey);

    const db = getDatabase();
    const sequenceState = await db.sequenceState
      .where('tenantId')
      .equals(credentials.tenantId)
      .first();

    this.status.lastSequence = sequenceState?.lastSyncedSequence || 0;
    this.status.lastSyncAt = sequenceState?.lastSyncedAt || null;

    // Initialize realtime WebSocket connection
    const wsClient = getWebSocketClient();
    wsClient.connect({
      url: realtimeUrl,
      token: credentials.deviceAccessToken,
      tenantId: credentials.tenantId,
      organizationId: credentials.organizationId,
      clinicId: credentials.clinicId,
    });

    // Subscribe to realtime events for CRDT patches
    wsClient.on('realtime-event', this.handleRealtimeEvent.bind(this));

    // Start heartbeat to maintain presence
    wsClient.startHeartbeat(20000);

    this.isInitialized = true;
  }

  async triggerSync(): Promise<SyncStatus> {
    if (!this.isInitialized) {
      throw new Error('Sync manager not initialized');
    }

    if (this.isPaused) {
      console.log('Sync is paused');
      return this.status;
    }

    if (this.status.isRunning) {
      console.log('Sync already running');
      return this.status;
    }

    const now = Date.now();
    if (now - this.lastSyncTime < this.RATE_LIMIT_MS) {
      console.log('Rate limit: sync called too frequently');
      return this.status;
    }

    this.lastSyncTime = now;
    this.status.isRunning = true;
    this.status.errors = [];

    try {
      const credentials = await loadDeviceCredentials();
      if (!credentials) {
        throw new Error('Device credentials not found');
      }

      const uploadResult = await this.uploadQueue!.processBatch(
        credentials.deviceId,
        credentials.deviceAccessToken
      );

      this.status.uploaded = uploadResult.uploaded;

      const downloadResult = await this.downloadProcessor!.downloadDeltas(
        credentials.tenantId,
        credentials.organizationId,
        credentials.clinicId,
        credentials.deviceAccessToken
      );

      this.status.downloaded = downloadResult.applied;
      this.status.conflicts = downloadResult.conflicts;

      const db = getDatabase();
      const sequenceState = await db.sequenceState
        .where('tenantId')
        .equals(credentials.tenantId)
        .first();

      this.status.lastSequence = sequenceState?.lastSyncedSequence || 0;
      this.status.lastSyncAt = new Date();
      this.status.pendingChanges = await this.uploadQueue!.getPendingCount();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      this.status.errors.push(errorMessage);
      console.error('Sync failed:', error);
    } finally {
      this.status.isRunning = false;
    }

    return this.status;
  }

  pause(): void {
    this.isPaused = true;
    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
      this.rateLimitTimer = null;
    }
  }

  resume(): void {
    this.isPaused = false;
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  async shutdown(): Promise<void> {
    this.pause();
    const wsClient = getWebSocketClient();
    wsClient.disconnect();
    this.isInitialized = false;
  }

  /**
   * Handles realtime events containing CRDT patches.
   * Applies patches to local IndexedDB data with conflict resolution.
   */
  private async handleRealtimeEvent(event: any): Promise<void> {
    try {
      // Check if event contains a CRDT patch
      if (event.eventType && event.eventType.includes('.updated') && event.payload?.patch) {
        const patch = event.payload.patch as CRDTEnvelope;
        await this.applyCRDTPatch(patch);
      }
    } catch (error) {
      console.error('Failed to handle realtime event:', error);
      this.status.errors.push(`Realtime event error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  /**
   * Applies a CRDT patch to local data with conflict resolution.
   */
  private async applyCRDTPatch(patch: CRDTEnvelope): Promise<void> {
    const db = getDatabase();
    const mergeEngine = getCRDTMergeEngine();

    // Determine which table to update based on resourceType
    let table: any;
    switch (patch.resourceType) {
      case 'patient':
        table = db.patients;
        break;
      case 'appointment':
        table = db.appointments;
        break;
      case 'treatment':
        table = db.treatments;
        break;
      case 'invoice':
        table = db.invoices;
        break;
      default:
        console.warn(`Unknown resource type: ${patch.resourceType}`);
        return;
    }

    // Fetch local data
    const localRecord = await table.get(patch.resourceId);
    if (!localRecord) {
      console.warn(`Resource not found locally: ${patch.resourceType}:${patch.resourceId}`);
      return;
    }

    const localMetadata = {
      version: localRecord._version || 0,
      timestamp: localRecord._updatedAt ? new Date(localRecord._updatedAt) : new Date(0),
      actorId: localRecord._actorId || 'unknown',
    };

    // Merge the patch with local data
    const result = await mergeEngine.merge(localRecord, localMetadata, patch);

    if (result.conflicts.length > 0) {
      this.status.conflicts += result.conflicts.length;
      console.log(`Detected ${result.conflicts.length} conflicts for ${patch.resourceType}:${patch.resourceId}`);
    }

    if (result.resolved) {
      // Update local record with merged data
      await table.update(patch.resourceId, {
        ...result.merged,
        _version: patch.version,
        _updatedAt: patch.timestamp,
        _actorId: patch.actorId,
      });
      console.log(`Applied CRDT patch to ${patch.resourceType}:${patch.resourceId}`);
    } else {
      // Manual resolution needed - store in conflicts table for UI to handle
      await db.conflicts.add({
        id: `conflict-${Date.now()}-${patch.resourceId}`,
        resourceType: patch.resourceType,
        resourceId: patch.resourceId,
        conflicts: result.conflicts,
        localData: localRecord,
        remotePatch: patch,
        createdAt: new Date(),
        resolved: false,
      });
      console.log(`Conflict requires manual resolution for ${patch.resourceType}:${patch.resourceId}`);
    }
  }
}

import axios from 'axios';
import { TelemetryEvent, TelemetryEventType, BaseTelemetryEvent } from './usage-events';
import { v4 as uuidv4 } from 'uuid';

interface TelemetryClientConfig {
  aiEngineUrl: string;
  deviceId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  enabled: boolean;
  flushIntervalMs: number;
  maxBatchSize: number;
}

export class TelemetryClient {
  private config: TelemetryClientConfig;
  private eventQueue: TelemetryEvent[] = [];
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: TelemetryClientConfig) {
    this.config = config;
    this.sessionId = uuidv4();

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  trackEvent(
    eventType: TelemetryEventType,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.enabled) {
      return;
    }

    const event: BaseTelemetryEvent = {
      eventType,
      timestamp: new Date(),
      deviceId: this.config.deviceId,
      tenantId: this.config.tenantId,
      organizationId: this.config.organizationId,
      clinicId: this.config.clinicId,
      sessionId: this.sessionId,
      metadata: metadata || {},
    };

    this.eventQueue.push(event as TelemetryEvent);

    if (this.eventQueue.length >= this.config.maxBatchSize) {
      this.flush();
    }
  }

  trackDeviceRegistered(metadata: { platform: string; osVersion: string; appVersion: string; deviceName: string }): void {
    this.trackEvent(TelemetryEventType.DEVICE_REGISTERED, metadata);
  }

  trackSessionStarted(): void {
    this.sessionId = uuidv4();
    this.trackEvent(TelemetryEventType.SESSION_STARTED);
  }

  trackSessionEnded(): void {
    this.trackEvent(TelemetryEventType.SESSION_ENDED);
    this.flush();
  }

  trackSessionLocked(lockReason: string): void {
    this.trackEvent(TelemetryEventType.SESSION_LOCKED, { lockReason });
  }

  trackSessionUnlocked(unlockMethod: 'pin' | 'biometric'): void {
    this.trackEvent(TelemetryEventType.SESSION_UNLOCKED, { unlockMethod });
  }

  trackSyncStarted(): void {
    this.trackEvent(TelemetryEventType.SYNC_STARTED);
  }

  trackSyncCompleted(uploaded: number, downloaded: number, conflicts: number, durationMs: number): void {
    this.trackEvent(TelemetryEventType.SYNC_COMPLETED, {
      uploaded,
      downloaded,
      conflicts,
      durationMs,
    });
  }

  trackSyncFailed(error: string, durationMs: number): void {
    this.trackEvent(TelemetryEventType.SYNC_FAILED, { error, durationMs });
  }

  trackDataUploaded(entityType: string, operation: string, count: number): void {
    this.trackEvent(TelemetryEventType.DATA_UPLOADED, { entityType, operation, count });
  }

  trackDataDownloaded(entityType: string, operation: string, count: number): void {
    this.trackEvent(TelemetryEventType.DATA_DOWNLOADED, { entityType, operation, count });
  }

  trackUserAction(action: string, screen: string, target?: string, value?: any): void {
    this.trackEvent(TelemetryEventType.USER_ACTION, { action, screen, target, value });
  }

  trackScreenViewed(screen: string, previousScreen?: string): void {
    this.trackEvent(TelemetryEventType.SCREEN_VIEWED, { screen, previousScreen });
  }

  trackError(errorType: string, errorMessage: string, stack?: string, context?: string): void {
    this.trackEvent(TelemetryEventType.ERROR_OCCURRED, {
      errorType,
      errorMessage,
      stack,
      context,
    });
  }

  trackNetworkOnline(): void {
    this.trackEvent(TelemetryEventType.NETWORK_ONLINE);
  }

  trackNetworkOffline(): void {
    this.trackEvent(TelemetryEventType.NETWORK_OFFLINE);
  }

  trackUpdateAvailable(version: string, releaseNotes?: string): void {
    this.trackEvent(TelemetryEventType.UPDATE_AVAILABLE, { version, releaseNotes });
  }

  trackUpdateDownloaded(version: string): void {
    this.trackEvent(TelemetryEventType.UPDATE_DOWNLOADED, { version });
  }

  trackUpdateInstalled(version: string): void {
    this.trackEvent(TelemetryEventType.UPDATE_INSTALLED, { version });
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await axios.post(
        `${this.config.aiEngineUrl}/api/v1/telemetry/events`,
        {
          events: eventsToSend,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': this.config.tenantId,
            'x-organization-id': this.config.organizationId,
            'x-device-id': this.config.deviceId,
          },
          timeout: 5000,
        }
      );
    } catch (error) {
      console.error('Failed to send telemetry events:', error);
      // Re-queue events if send failed (up to max batch size to prevent memory leak)
      this.eventQueue.unshift(...eventsToSend.slice(0, this.config.maxBatchSize));
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flush();
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;

    if (enabled) {
      this.startFlushTimer();
    } else if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getQueueSize(): number {
    return this.eventQueue.length;
  }
}

let telemetryInstance: TelemetryClient | null = null;

export function initTelemetryClient(config: TelemetryClientConfig): TelemetryClient {
  telemetryInstance = new TelemetryClient(config);
  return telemetryInstance;
}

export function getTelemetryClient(): TelemetryClient | null {
  return telemetryInstance;
}

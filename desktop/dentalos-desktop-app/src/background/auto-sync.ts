import { SyncManager } from '../sync/sync-manager';
import { NetworkMonitor } from './network-monitor';

export class AutoSync {
  private syncManager: SyncManager;
  private networkMonitor: NetworkMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 10000;
  private isRunning: boolean = false;

  constructor(syncManager: SyncManager, networkMonitor: NetworkMonitor) {
    this.syncManager = syncManager;
    this.networkMonitor = networkMonitor;
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.networkMonitor.on('online', () => this.resume());
    this.networkMonitor.on('offline', () => this.pause());

    if (this.networkMonitor.getStatus()) {
      this.resume();
    }

    console.log('Auto-sync started');
  }

  stop(): void {
    this.pause();
    this.isRunning = false;
    console.log('Auto-sync stopped');
  }

  private resume(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(async () => {
      try {
        await this.syncManager.triggerSync();
      } catch (error) {
        console.error('Auto-sync cycle failed:', error);
      }
    }, this.SYNC_INTERVAL_MS);

    this.syncManager.resume();
  }

  private pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.syncManager.pause();
  }
}

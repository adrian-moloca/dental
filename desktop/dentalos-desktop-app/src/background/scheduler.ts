import { SyncManager } from '../sync/sync-manager';

export class BackgroundScheduler {
  private syncManager: SyncManager;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 10000;

  constructor(syncManager: SyncManager) {
    this.syncManager = syncManager;
  }

  start(): void {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(async () => {
      try {
        await this.syncManager.triggerSync();
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, this.SYNC_INTERVAL_MS);

    console.log('Background scheduler started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Background scheduler stopped');
  }

  async runNow(): Promise<void> {
    await this.syncManager.triggerSync();
  }
}

import { EventEmitter } from 'events';

export class NetworkMonitor extends EventEmitter {
  private isOnline: boolean = navigator.onLine;

  constructor() {
    super();
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      console.log('Network: Online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
      console.log('Network: Offline');
    });
  }

  getStatus(): boolean {
    return this.isOnline;
  }
}

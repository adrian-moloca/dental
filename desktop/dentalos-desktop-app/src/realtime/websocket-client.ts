import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface RealtimeConfig {
  url: string;
  token: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
}

export interface RealtimeEvent {
  eventId: string;
  eventType: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  payload: Record<string, any>;
  timestamp: Date;
}

export class WebSocketClient extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private subscribedChannels: Set<string> = new Set();

  connect(config: RealtimeConfig): void {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.socket = io(`${config.url}/ws`, {
      auth: {
        token: config.token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
    });

    this.setupEventHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscribedChannels.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  subscribe(channels: string[]): void {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: not connected');
      return;
    }

    this.socket.emit('subscribe', { channels }, (response: any) => {
      if (response?.success) {
        channels.forEach((ch) => this.subscribedChannels.add(ch));
        this.emit('subscribed', channels);
      }
    });
  }

  unsubscribe(channels: string[]): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('unsubscribe', { channels }, (response: any) => {
      if (response?.success) {
        channels.forEach((ch) => this.subscribedChannels.delete(ch));
        this.emit('unsubscribed', channels);
      }
    });
  }

  updatePresence(status?: string, activeResource?: { type: string; id: string } | null): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('presence:update', { status, activeResource }, (response: any) => {
      if (response?.success) {
        this.emit('presence-updated', { status, activeResource });
      }
    });
  }

  startHeartbeat(intervalMs: number = 20000): void {
    if (!this.socket?.connected) {
      return;
    }

    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('presence:heartbeat', {}, () => {
          // Heartbeat acknowledged
        });
      }
    }, intervalMs);
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.resubscribeToChannels();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.emit('disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.emit('error', error);
    });

    this.socket.on('connection:established', (data) => {
      console.log('Connection established:', data);
      this.emit('connection-established', data);
    });

    this.socket.on('realtime:event', (event: RealtimeEvent) => {
      this.emit('realtime-event', event);
    });

    this.socket.on('presence:user_joined', (data) => {
      this.emit('presence-user-joined', data);
    });

    this.socket.on('presence:user_left', (data) => {
      this.emit('presence-user-left', data);
    });

    this.socket.on('presence:user_updated', (data) => {
      this.emit('presence-user-updated', data);
    });
  }

  private resubscribeToChannels(): void {
    if (this.subscribedChannels.size > 0) {
      const channels = Array.from(this.subscribedChannels);
      this.subscribe(channels);
    }
  }
}

let clientInstance: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!clientInstance) {
    clientInstance = new WebSocketClient();
  }
  return clientInstance;
}

import { EventEmitter } from 'events';
import { getWebSocketClient } from './websocket-client';

export interface PresenceUser {
  actorId: string;
  userId?: string;
  deviceId?: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  role: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY';
  activeResource?: {
    type: string;
    id: string;
  };
}

export class PresenceManager extends EventEmitter {
  private users: Map<string, PresenceUser> = new Map();
  private currentResource: { type: string; id: string } | null = null;

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const wsClient = getWebSocketClient();

    wsClient.on('presence-user-joined', (data) => {
      this.handleUserJoined(data);
    });

    wsClient.on('presence-user-left', (data) => {
      this.handleUserLeft(data);
    });

    wsClient.on('presence-user-updated', (data) => {
      this.handleUserUpdated(data);
    });

    wsClient.on('connected', () => {
      if (this.currentResource) {
        this.setActiveResource(this.currentResource.type, this.currentResource.id);
      }
    });
  }

  setActiveResource(resourceType: string, resourceId: string): void {
    this.currentResource = { type: resourceType, id: resourceId };

    const wsClient = getWebSocketClient();
    if (wsClient.isConnected()) {
      wsClient.updatePresence(undefined, this.currentResource);
    }
  }

  clearActiveResource(): void {
    this.currentResource = null;

    const wsClient = getWebSocketClient();
    if (wsClient.isConnected()) {
      wsClient.updatePresence(undefined, null);
    }
  }

  setStatus(status: 'ONLINE' | 'OFFLINE' | 'AWAY' | 'BUSY'): void {
    const wsClient = getWebSocketClient();
    if (wsClient.isConnected()) {
      wsClient.updatePresence(status, undefined);
    }
  }

  getUsersViewingResource(resourceType: string, resourceId: string): PresenceUser[] {
    return Array.from(this.users.values()).filter(
      (user) =>
        user.activeResource?.type === resourceType && user.activeResource?.id === resourceId,
    );
  }

  getAllOnlineUsers(): PresenceUser[] {
    return Array.from(this.users.values());
  }

  private handleUserJoined(data: any): void {
    const user: PresenceUser = {
      actorId: data.actorId,
      userId: data.userId,
      deviceId: data.deviceId,
      tenantId: data.tenantId,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
      role: data.role,
      name: data.name,
      status: 'ONLINE',
    };

    this.users.set(user.actorId, user);
    this.emit('user-joined', user);
  }

  private handleUserLeft(data: any): void {
    const user = this.users.get(data.actorId);
    if (user) {
      this.users.delete(data.actorId);
      this.emit('user-left', user);
    }
  }

  private handleUserUpdated(data: any): void {
    const user = this.users.get(data.actorId);
    if (user) {
      if (data.status) {
        user.status = data.status;
      }
      if (data.activeResource !== undefined) {
        user.activeResource = data.activeResource;
      }
      this.emit('user-updated', user);
    }
  }
}

let managerInstance: PresenceManager | null = null;

export function getPresenceManager(): PresenceManager {
  if (!managerInstance) {
    managerInstance = new PresenceManager();
  }
  return managerInstance;
}

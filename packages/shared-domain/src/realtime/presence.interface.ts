export enum PresenceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY',
}

export enum UserRole {
  PROVIDER = 'PROVIDER',
  ASSISTANT = 'ASSISTANT',
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  DEVICE = 'DEVICE',
}

export interface PresenceUser {
  userId?: string;
  deviceId?: string;
  actorId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  role: UserRole;
  name: string;
  status: PresenceStatus;
  activeResource?: {
    type: string;
    id: string;
  };
  lastHeartbeat: Date;
  connectedAt: Date;
  socketId: string;
}

export interface PresenceUpdate {
  actorId: string;
  status?: PresenceStatus;
  activeResource?: {
    type: string;
    id: string;
  } | null;
}

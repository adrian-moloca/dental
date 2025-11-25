export interface PresenceRecord {
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
  lastHeartbeat: Date;
  connectedAt: Date;
  socketId: string;
}

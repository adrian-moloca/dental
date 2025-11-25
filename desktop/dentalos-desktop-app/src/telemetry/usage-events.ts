export enum TelemetryEventType {
  // Device lifecycle
  DEVICE_REGISTERED = 'device.registered',
  DEVICE_LOGIN = 'device.login',
  DEVICE_LOGOUT = 'device.logout',

  // Session management
  SESSION_STARTED = 'session.started',
  SESSION_ENDED = 'session.ended',
  SESSION_LOCKED = 'session.locked',
  SESSION_UNLOCKED = 'session.unlocked',

  // Sync operations
  SYNC_STARTED = 'sync.started',
  SYNC_COMPLETED = 'sync.completed',
  SYNC_FAILED = 'sync.failed',
  SYNC_CONFLICT_RESOLVED = 'sync.conflict_resolved',

  // Data operations
  DATA_UPLOADED = 'data.uploaded',
  DATA_DOWNLOADED = 'data.downloaded',

  // User interactions
  USER_ACTION = 'user.action',
  SCREEN_VIEWED = 'screen.viewed',

  // Errors
  ERROR_OCCURRED = 'error.occurred',

  // Network
  NETWORK_ONLINE = 'network.online',
  NETWORK_OFFLINE = 'network.offline',

  // Updates
  UPDATE_AVAILABLE = 'update.available',
  UPDATE_DOWNLOADED = 'update.downloaded',
  UPDATE_INSTALLED = 'update.installed',
}

export interface BaseTelemetryEvent {
  eventType: TelemetryEventType;
  timestamp: Date;
  deviceId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface DeviceRegisteredEvent extends BaseTelemetryEvent {
  eventType: TelemetryEventType.DEVICE_REGISTERED;
  metadata: {
    platform: string;
    osVersion: string;
    appVersion: string;
    deviceName: string;
  };
}

export interface SessionEvent extends BaseTelemetryEvent {
  eventType:
    | TelemetryEventType.SESSION_STARTED
    | TelemetryEventType.SESSION_ENDED
    | TelemetryEventType.SESSION_LOCKED
    | TelemetryEventType.SESSION_UNLOCKED;
  metadata: {
    lockReason?: string;
    unlockMethod?: 'pin' | 'biometric';
  };
}

export interface SyncEvent extends BaseTelemetryEvent {
  eventType:
    | TelemetryEventType.SYNC_STARTED
    | TelemetryEventType.SYNC_COMPLETED
    | TelemetryEventType.SYNC_FAILED;
  metadata: {
    uploaded?: number;
    downloaded?: number;
    conflicts?: number;
    durationMs?: number;
    error?: string;
  };
}

export interface DataOperationEvent extends BaseTelemetryEvent {
  eventType: TelemetryEventType.DATA_UPLOADED | TelemetryEventType.DATA_DOWNLOADED;
  metadata: {
    entityType: string;
    operation: string;
    count: number;
    sizeBytes?: number;
  };
}

export interface UserActionEvent extends BaseTelemetryEvent {
  eventType: TelemetryEventType.USER_ACTION;
  metadata: {
    action: string;
    screen: string;
    target?: string;
    value?: any;
  };
}

export interface ScreenViewedEvent extends BaseTelemetryEvent {
  eventType: TelemetryEventType.SCREEN_VIEWED;
  metadata: {
    screen: string;
    previousScreen?: string;
  };
}

export interface ErrorEvent extends BaseTelemetryEvent {
  eventType: TelemetryEventType.ERROR_OCCURRED;
  metadata: {
    errorType: string;
    errorMessage: string;
    stack?: string;
    context?: string;
  };
}

export interface NetworkEvent extends BaseTelemetryEvent {
  eventType: TelemetryEventType.NETWORK_ONLINE | TelemetryEventType.NETWORK_OFFLINE;
  metadata: {
    previousState?: string;
  };
}

export interface UpdateEvent extends BaseTelemetryEvent {
  eventType:
    | TelemetryEventType.UPDATE_AVAILABLE
    | TelemetryEventType.UPDATE_DOWNLOADED
    | TelemetryEventType.UPDATE_INSTALLED;
  metadata: {
    version: string;
    releaseNotes?: string;
  };
}

export type TelemetryEvent =
  | DeviceRegisteredEvent
  | SessionEvent
  | SyncEvent
  | DataOperationEvent
  | UserActionEvent
  | ScreenViewedEvent
  | ErrorEvent
  | NetworkEvent
  | UpdateEvent;

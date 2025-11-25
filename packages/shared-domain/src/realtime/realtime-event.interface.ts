export interface RealtimeEvent {
  eventId: string;
  eventType: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  channels: string[];
  payload: Record<string, any>;
  timestamp: Date;
  actorId: string;
}

export interface PublishEventDto {
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  channels: string[];
  eventType: string;
  payload: Record<string, any>;
}

export enum RealtimeEventType {
  APPOINTMENT_UPDATED = 'scheduling.appointment.updated',
  CLINICAL_RECORD_UPDATED = 'clinical.record.updated',
  INVENTORY_STOCK_UPDATED = 'inventory.stock.updated',
  BILLING_INVOICE_UPDATED = 'billing.invoice.updated',
  IMAGING_STUDY_UPDATED = 'imaging.study.updated',
  MARKETING_LOYALTY_UPDATED = 'marketing.loyalty.updated',
  AI_PREDICTION_GENERATED = 'ai.prediction.generated',
  OFFLINE_SYNC_CHANGE_APPLIED = 'offline-sync.change.applied',
  HR_TASK_UPDATED = 'hr.task.updated',
  ENTERPRISE_CLINIC_UPDATED = 'enterprise.clinic.updated',
  PRESENCE_USER_JOINED = 'presence.user.joined',
  PRESENCE_USER_LEFT = 'presence.user.left',
  PRESENCE_USER_UPDATED = 'presence.user.updated',
}

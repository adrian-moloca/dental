export interface ReminderScheduledEvent {
  eventType: 'scheduling.reminder.scheduled';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'sms' | 'whatsapp' | 'email' | 'push';
  scheduledAt: string;

  correlationId: string;
  timestamp: string;
}

export interface ReminderSentEvent {
  eventType: 'scheduling.reminder.sent';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'sms' | 'whatsapp' | 'email' | 'push';
  sentAt: string;

  messageId?: string;
  cost?: number;
  currency?: string;

  correlationId: string;
  timestamp: string;
}

export interface ReminderDeliveredEvent {
  eventType: 'scheduling.reminder.delivered';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'sms' | 'whatsapp' | 'email' | 'push';
  deliveredAt: string;

  correlationId: string;
  timestamp: string;
}

export interface ReminderReadEvent {
  eventType: 'scheduling.reminder.read';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'whatsapp'; // Only WhatsApp supports read receipts
  readAt: string;

  correlationId: string;
  timestamp: string;
}

export interface ReminderFailedEvent {
  eventType: 'scheduling.reminder.failed';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'sms' | 'whatsapp' | 'email' | 'push';

  errorCode: string;
  errorMessage: string;
  retries: number;

  correlationId: string;
  timestamp: string;
}

export interface PatientConfirmedViaReminderEvent {
  eventType: 'scheduling.reminder.patient_confirmed';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'sms' | 'whatsapp';
  responseText: string;
  confirmedAt: string;

  correlationId: string;
  timestamp: string;
}

export interface PatientCancelledViaReminderEvent {
  eventType: 'scheduling.reminder.patient_cancelled';
  tenantId: string;
  organizationId: string;
  clinicId: string;

  jobId: string;
  appointmentId: string;
  patientId: string;

  channel: 'sms' | 'whatsapp';
  responseText: string;
  cancelledAt: string;

  correlationId: string;
  timestamp: string;
}

/**
 * Intervention Domain Events
 *
 * Events emitted by the interventions module for integration with other services.
 * These events enable loose coupling between modules while maintaining data consistency.
 *
 * Downstream consumers:
 * - Billing service: Billable interventions trigger invoice line items
 * - Scheduling service: Intervention completion updates appointment status
 * - Odontogram service: Tooth-specific interventions update tooth history
 * - Analytics platform: All events are logged for clinical reporting
 * - Automation engine: Follow-up required events trigger reminders
 *
 * @module interventions/events
 */

// ============================================================================
// EVENT NAMES
// ============================================================================

export const INTERVENTION_EVENTS = {
  CREATED: 'clinical.intervention.created',
  UPDATED: 'clinical.intervention.updated',
  CANCELLED: 'clinical.intervention.cancelled',
  DELETED: 'clinical.intervention.deleted',
  BILLED: 'clinical.intervention.billed',
  FOLLOW_UP_REQUIRED: 'clinical.intervention.follow_up_required',
  BATCH_CREATED: 'clinical.intervention.batch_created',
} as const;

// ============================================================================
// BASE EVENT INTERFACE
// ============================================================================

/**
 * Base interface for all intervention events
 */
export interface InterventionEventBase {
  /** Unique event ID for idempotency */
  eventId: string;

  /** Event timestamp */
  timestamp: Date;

  /** Tenant context */
  tenantId: string;
  organizationId: string;
  clinicId: string;

  /** User who triggered the event */
  triggeredBy: string;
  triggeredByName?: string;

  /** Request context */
  correlationId?: string;
  ipAddress?: string;
}

// ============================================================================
// INTERVENTION CREATED EVENT
// ============================================================================

/**
 * Event emitted when a clinical intervention is created
 */
export interface InterventionCreatedEvent extends InterventionEventBase {
  interventionId: string;
  patientId: string;
  type: string;
  title: string;
  providerId: string;
  providerName: string;
  appointmentId?: string;
  teeth: string[];
  surfaces: string[];
  procedureCode?: string;
  performedAt: Date;
  isBillable: boolean;
  billedAmount?: number;
  followUpRequired: boolean;
  followUpDate?: Date;
  /** Whether this was created via quick intervention flow */
  isQuickIntervention: boolean;
}

// ============================================================================
// INTERVENTION UPDATED EVENT
// ============================================================================

/**
 * Event emitted when a clinical intervention is updated
 */
export interface InterventionUpdatedEvent extends InterventionEventBase {
  interventionId: string;
  patientId: string;
  type: string;
  version: number;
  previousVersion: number;
  fieldsChanged: string[];
  /** Summary of what changed for downstream systems */
  changesSummary?: {
    billingChanged?: boolean;
    followUpChanged?: boolean;
    teethChanged?: boolean;
  };
}

// ============================================================================
// INTERVENTION CANCELLED EVENT
// ============================================================================

/**
 * Event emitted when a clinical intervention is cancelled
 */
export interface InterventionCancelledEvent extends InterventionEventBase {
  interventionId: string;
  patientId: string;
  type: string;
  appointmentId?: string;
  cancellationReason: string;
  cancelledBy: string;
  /** If intervention was billed, billing needs to handle reversal */
  wasBilled: boolean;
  invoiceId?: string;
}

// ============================================================================
// INTERVENTION DELETED EVENT
// ============================================================================

/**
 * Event emitted when a clinical intervention is soft-deleted
 *
 * IMPORTANT: Interventions are never hard-deleted for compliance.
 * This event indicates the intervention is no longer active but preserved.
 */
export interface InterventionDeletedEvent extends InterventionEventBase {
  interventionId: string;
  patientId: string;
  type: string;
  deleteReason: string;
  deletedBy: string;
  appointmentId?: string;
}

// ============================================================================
// INTERVENTION BILLED EVENT
// ============================================================================

/**
 * Event emitted when an intervention is linked to an invoice
 */
export interface InterventionBilledEvent extends InterventionEventBase {
  interventionId: string;
  patientId: string;
  type: string;
  procedureCode?: string;
  invoiceId: string;
  billedAmount: number;
  currency: string;
  billedAt: Date;
  billedBy: string;
}

// ============================================================================
// FOLLOW-UP REQUIRED EVENT
// ============================================================================

/**
 * Event emitted when an intervention requires follow-up
 * Used by automation engine to schedule reminders
 */
export interface InterventionFollowUpRequiredEvent extends InterventionEventBase {
  interventionId: string;
  patientId: string;
  type: string;
  followUpDate: Date;
  followUpNotes?: string;
  providerId: string;
  providerName: string;
}

// ============================================================================
// BATCH CREATED EVENT
// ============================================================================

/**
 * Event emitted when multiple interventions are created in batch
 */
export interface InterventionBatchCreatedEvent extends InterventionEventBase {
  appointmentId: string;
  patientId: string;
  interventionIds: string[];
  interventionCount: number;
  types: string[];
  /** Summary of billable items */
  billableSummary: {
    count: number;
    totalAmount: number;
  };
}

// ============================================================================
// EVENT FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a unique event ID
 */
function createEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create base event payload
 */
function createBaseEvent(
  tenantId: string,
  organizationId: string,
  clinicId: string,
  triggeredBy: string,
  triggeredByName?: string,
  correlationId?: string,
  ipAddress?: string,
): InterventionEventBase {
  return {
    eventId: createEventId(),
    timestamp: new Date(),
    tenantId,
    organizationId,
    clinicId,
    triggeredBy,
    triggeredByName,
    correlationId,
    ipAddress,
  };
}

/**
 * Context for event creation
 */
export interface EventContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  triggeredBy: string;
  triggeredByName?: string;
  correlationId?: string;
  ipAddress?: string;
}

/**
 * Factory for InterventionCreatedEvent
 */
export function createInterventionCreatedEvent(
  data: {
    interventionId: string;
    patientId: string;
    type: string;
    title: string;
    providerId: string;
    providerName: string;
    appointmentId?: string;
    teeth: string[];
    surfaces: string[];
    procedureCode?: string;
    performedAt: Date;
    isBillable: boolean;
    billedAmount?: number;
    followUpRequired: boolean;
    followUpDate?: Date;
    isQuickIntervention: boolean;
  },
  context: EventContext,
): InterventionCreatedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

/**
 * Factory for InterventionUpdatedEvent
 */
export function createInterventionUpdatedEvent(
  data: {
    interventionId: string;
    patientId: string;
    type: string;
    version: number;
    previousVersion: number;
    fieldsChanged: string[];
    changesSummary?: {
      billingChanged?: boolean;
      followUpChanged?: boolean;
      teethChanged?: boolean;
    };
  },
  context: EventContext,
): InterventionUpdatedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

/**
 * Factory for InterventionCancelledEvent
 */
export function createInterventionCancelledEvent(
  data: {
    interventionId: string;
    patientId: string;
    type: string;
    appointmentId?: string;
    cancellationReason: string;
    cancelledBy: string;
    wasBilled: boolean;
    invoiceId?: string;
  },
  context: EventContext,
): InterventionCancelledEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

/**
 * Factory for InterventionDeletedEvent
 */
export function createInterventionDeletedEvent(
  data: {
    interventionId: string;
    patientId: string;
    type: string;
    deleteReason: string;
    deletedBy: string;
    appointmentId?: string;
  },
  context: EventContext,
): InterventionDeletedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

/**
 * Factory for InterventionBilledEvent
 */
export function createInterventionBilledEvent(
  data: {
    interventionId: string;
    patientId: string;
    type: string;
    procedureCode?: string;
    invoiceId: string;
    billedAmount: number;
    currency: string;
    billedAt: Date;
    billedBy: string;
  },
  context: EventContext,
): InterventionBilledEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

/**
 * Factory for InterventionFollowUpRequiredEvent
 */
export function createInterventionFollowUpRequiredEvent(
  data: {
    interventionId: string;
    patientId: string;
    type: string;
    followUpDate: Date;
    followUpNotes?: string;
    providerId: string;
    providerName: string;
  },
  context: EventContext,
): InterventionFollowUpRequiredEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

/**
 * Factory for InterventionBatchCreatedEvent
 */
export function createInterventionBatchCreatedEvent(
  data: {
    appointmentId: string;
    patientId: string;
    interventionIds: string[];
    interventionCount: number;
    types: string[];
    billableSummary: {
      count: number;
      totalAmount: number;
    };
  },
  context: EventContext,
): InterventionBatchCreatedEvent {
  return {
    ...createBaseEvent(
      context.tenantId,
      context.organizationId,
      context.clinicId,
      context.triggeredBy,
      context.triggeredByName,
      context.correlationId,
      context.ipAddress,
    ),
    ...data,
  };
}

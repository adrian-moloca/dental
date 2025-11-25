/**
 * Patient Merged Event
 *
 * Published when duplicate patient records are merged into a single master record.
 * This event triggers data consolidation, appointment reassignment, and index updates.
 *
 * Critical for maintaining data integrity when duplicate patient records are identified.
 *
 * @module shared-events/patient
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

/**
 * Patient merged event type constant
 */
export const PATIENT_MERGED_EVENT = 'dental.patient.merged' as const;

/**
 * Patient merged event version
 */
export const PATIENT_MERGED_EVENT_VERSION = 1;

/**
 * Merge strategy enumeration
 * Defines how data from duplicate record is handled
 */
export type MergeStrategy =
  | 'MASTER_WINS'
  | 'DUPLICATE_WINS'
  | 'MANUAL_SELECTION'
  | 'MERGE_ALL'
  | 'CUSTOM';

/**
 * Merge conflict resolution
 * Describes how conflicting fields were resolved
 */
export interface MergeConflictResolution {
  /** Field name that had conflicting values */
  fieldName: string;
  /** Value from master record */
  masterValue: unknown;
  /** Value from duplicate record */
  duplicateValue: unknown;
  /** Value selected for final merged record */
  selectedValue: unknown;
  /** How the conflict was resolved */
  resolutionStrategy: 'MASTER' | 'DUPLICATE' | 'MANUAL' | 'CONCATENATED' | 'OTHER';
  /** Notes about the resolution */
  notes?: string;
}

/**
 * Merged data summary
 * Tracks what data was consolidated
 */
export interface MergedDataSummary {
  /** Number of appointments transferred */
  appointmentsCount?: number;
  /** Number of treatment records transferred */
  treatmentRecordsCount?: number;
  /** Number of billing records transferred */
  billingRecordsCount?: number;
  /** Number of documents transferred */
  documentsCount?: number;
  /** Number of notes transferred */
  notesCount?: number;
  /** Number of prescriptions transferred */
  prescriptionsCount?: number;
  /** List of related entity types that were merged */
  mergedEntities?: readonly string[];
}

/**
 * Patient merged event payload
 *
 * Contains all information about the merge operation including master and duplicate identifiers,
 * merge strategy, conflict resolutions, and data consolidation summary.
 */
export interface PatientMergedPayload {
  /** ID of the master (surviving) patient record */
  masterId: UUID;

  /** ID of the duplicate (merged) patient record */
  duplicateId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where merge occurred */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Master patient full name (for display) */
  masterPatientName: string;

  /** Duplicate patient full name (for display) */
  duplicatePatientName: string;

  /** Master patient chart number */
  masterChartNumber?: string;

  /** Duplicate patient chart number */
  duplicateChartNumber?: string;

  /** Merge strategy used */
  mergeStrategy: MergeStrategy;

  /** User who performed the merge */
  mergedBy: UUID;

  /** User display name who performed the merge */
  mergedByName?: string;

  /** Timestamp when merge was performed */
  mergedAt: ISODateString;

  /** Reason for the merge */
  mergeReason?: string;

  /** Detailed explanation or justification */
  mergeJustification?: string;

  /** List of fields that had conflicts */
  conflictingFields?: readonly string[];

  /** How conflicts were resolved */
  conflictResolutions?: readonly MergeConflictResolution[];

  /** Summary of merged data */
  dataSummary?: MergedDataSummary;

  /** Whether the merge can be undone */
  isReversible: boolean;

  /** Merge operation ID for tracking and potential reversal */
  mergeOperationId?: UUID;

  /** Additional patient IDs if merging more than 2 records */
  additionalDuplicateIds?: readonly UUID[];

  /** Confidence score for merge (if auto-detected duplicates) */
  mergeConfidenceScore?: number;

  /** Whether this was a manual or automated merge */
  mergeType: 'MANUAL' | 'AUTOMATED' | 'SEMI_AUTOMATED';

  /** Approval status if merge required approval */
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';

  /** User who approved the merge (if different from mergedBy) */
  approvedBy?: UUID;

  /** Timestamp when merge was approved */
  approvedAt?: ISODateString;

  /** Notes or comments about the merge */
  notes?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Patient merged event envelope
 *
 * Complete event with payload and metadata.
 *
 * @example
 * ```typescript
 * const event: PatientMergedEvent = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.patient.merged',
 *   version: 1,
 *   occurredAt: new Date('2025-11-20T16:30:00Z'),
 *   payload: {
 *     masterId: '123e4567-e89b-12d3-a456-426614174000',
 *     duplicateId: '987f6543-e21b-12d3-a456-426614174111',
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *     masterPatientName: 'John Doe',
 *     duplicatePatientName: 'John D.',
 *     mergeStrategy: 'MANUAL_SELECTION',
 *     mergedBy: 'user-admin-123',
 *     mergedByName: 'Admin Smith',
 *     mergedAt: '2025-11-20T16:30:00Z',
 *     mergeReason: 'Duplicate record found with matching DOB and phone',
 *     dataSummary: {
 *       appointmentsCount: 5,
 *       treatmentRecordsCount: 3,
 *       billingRecordsCount: 8,
 *     },
 *     isReversible: true,
 *     mergeOperationId: 'merge-op-456',
 *     mergeType: 'MANUAL',
 *   },
 *   metadata: {
 *     correlationId: 'merge-corr-123',
 *     userId: 'user-admin-123',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-789',
 *     clinicId: 'clinic-101',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export type PatientMergedEvent = EventEnvelope<PatientMergedPayload>;

/**
 * Type guard to check if an event is a PatientMergedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a PatientMergedEvent
 */
export function isPatientMergedEvent(
  event: EventEnvelope<unknown>
): event is PatientMergedEvent {
  return event.type === PATIENT_MERGED_EVENT;
}

/**
 * Factory function to create a PatientMergedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createPatientMergedEvent(
  payload: PatientMergedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): PatientMergedEvent {
  // Validate critical required fields
  if (!payload.masterId) {
    throw new Error('PatientMergedEvent: masterId is required');
  }
  if (!payload.duplicateId) {
    throw new Error('PatientMergedEvent: duplicateId is required');
  }
  if (payload.masterId === payload.duplicateId) {
    throw new Error('PatientMergedEvent: masterId and duplicateId cannot be the same');
  }
  if (!payload.organizationId) {
    throw new Error('PatientMergedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('PatientMergedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('PatientMergedEvent: tenantId is required');
  }
  if (!payload.masterPatientName || payload.masterPatientName.trim().length === 0) {
    throw new Error('PatientMergedEvent: masterPatientName is required and cannot be empty');
  }
  if (!payload.duplicatePatientName || payload.duplicatePatientName.trim().length === 0) {
    throw new Error('PatientMergedEvent: duplicatePatientName is required and cannot be empty');
  }
  if (!payload.mergeStrategy) {
    throw new Error('PatientMergedEvent: mergeStrategy is required');
  }
  if (!payload.mergedBy) {
    throw new Error('PatientMergedEvent: mergedBy is required');
  }
  if (!payload.mergedAt) {
    throw new Error('PatientMergedEvent: mergedAt is required');
  }
  if (!payload.mergeType) {
    throw new Error('PatientMergedEvent: mergeType is required');
  }

  // Validate additional duplicate IDs don't include master or primary duplicate
  if (payload.additionalDuplicateIds && payload.additionalDuplicateIds.length > 0) {
    const invalidIds = payload.additionalDuplicateIds.filter(
      (id) => id === payload.masterId || id === payload.duplicateId
    );
    if (invalidIds.length > 0) {
      throw new Error(
        'PatientMergedEvent: additionalDuplicateIds cannot include masterId or duplicateId'
      );
    }
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PATIENT_MERGED_EVENT,
    version: PATIENT_MERGED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

/**
 * Appointment Test Fixtures
 * STRICT NO PHI: All data is obviously fake and for testing only
 *
 * @module shared-testing/fixtures
 */

import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { AppointmentStatus } from '@dentalos/shared-types';

/**
 * Test appointment data structure with tenant isolation
 */
export interface TestAppointment {
  id: UUID;
  patientId: UUID;
  providerId: UUID;
  organizationId: OrganizationId;
  clinicId: ClinicId;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
}

/**
 * Pre-built test appointments with tenant isolation
 *
 * @remarks
 * - Appointments 1-2: org-test-001, clinic-test-001 (same clinic)
 * - Appointment 3: org-test-001, clinic-test-002 (different clinic, same org)
 * - Appointment 4: org-test-002, clinic-test-003 (different org)
 */
export const TEST_APPOINTMENTS: readonly TestAppointment[] = Object.freeze([
  {
    id: 'appointment-test-001' as UUID,
    patientId: 'patient-test-001' as UUID,
    providerId: 'provider-test-001' as UUID,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-001' as ClinicId,
    startTime: new Date('2024-01-15T09:00:00Z'),
    endTime: new Date('2024-01-15T10:00:00Z'),
    status: AppointmentStatus.SCHEDULED,
    reason: 'Routine Checkup',
    notes: 'Test appointment notes',
  },
  {
    id: 'appointment-test-002' as UUID,
    patientId: 'patient-test-002' as UUID,
    providerId: 'provider-test-001' as UUID,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-001' as ClinicId,
    startTime: new Date('2024-01-15T10:30:00Z'),
    endTime: new Date('2024-01-15T11:30:00Z'),
    status: AppointmentStatus.CONFIRMED,
    reason: 'Cleaning',
  },
  {
    id: 'appointment-test-003' as UUID,
    patientId: 'patient-test-003' as UUID,
    providerId: 'provider-test-002' as UUID,
    organizationId: 'org-test-001' as OrganizationId,
    clinicId: 'clinic-test-002' as ClinicId,
    startTime: new Date('2024-01-15T14:00:00Z'),
    endTime: new Date('2024-01-15T15:00:00Z'),
    status: AppointmentStatus.COMPLETED,
    reason: 'Follow-up',
    notes: 'Completed successfully',
  },
  {
    id: 'appointment-test-004' as UUID,
    patientId: 'patient-test-004' as UUID,
    providerId: 'provider-test-003' as UUID,
    organizationId: 'org-test-002' as OrganizationId,
    clinicId: 'clinic-test-003' as ClinicId,
    startTime: new Date('2024-01-16T09:00:00Z'),
    endTime: new Date('2024-01-16T10:00:00Z'),
    status: AppointmentStatus.SCHEDULED,
    reason: 'New Patient Exam',
    notes: 'Cross-tenant test appointment',
  },
]);

/**
 * Get a test appointment by index
 */
export function getTestAppointment(index: number = 0): TestAppointment {
  if (index < 0 || index >= TEST_APPOINTMENTS.length) {
    throw new Error(`Test appointment index ${index} out of range`);
  }
  return TEST_APPOINTMENTS[index];
}

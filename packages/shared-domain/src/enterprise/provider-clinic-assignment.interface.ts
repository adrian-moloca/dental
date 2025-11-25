import type { ClinicId, ProviderClinicAssignmentId } from './enterprise-types';

export interface ProviderClinicAssignment {
  id: ProviderClinicAssignmentId;
  providerId: string;
  clinicId: ClinicId;
  organizationId: string;

  roles: string[];

  workingHoursOverride?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };

  isActive: boolean;
  isPrimaryClinic: boolean;

  assignedAt: Date;
  assignedBy: string;
  unassignedAt?: Date;
  unassignedBy?: string;
}

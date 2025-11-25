import type { StaffId, AbsenceId } from './staff-types';
import type { AbsenceType, AbsenceStatus } from '../scheduling/provider-schedule.types';

export interface Absence {
  id: AbsenceId;
  staffId: StaffId;
  tenantId: string;
  organizationId: string;
  clinicId?: string;

  type: AbsenceType;
  status: AbsenceStatus;

  startDate: Date;
  endDate: Date;
  totalDays: number;

  reason?: string;
  notes?: string;

  requestedAt: Date;
  requestedBy: string;

  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;

  documentUrls?: string[];

  createdAt: Date;
  updatedAt: Date;
}

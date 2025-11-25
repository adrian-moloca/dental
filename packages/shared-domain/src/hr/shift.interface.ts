import type { StaffId, ShiftId, ShiftTemplateId } from './staff-types';

export interface Shift {
  id: ShiftId;
  tenantId: string;
  organizationId: string;
  clinicId: string;

  templateId?: ShiftTemplateId;

  title: string;
  description?: string;

  startTime: Date;
  endTime: Date;

  assignedStaffIds: StaffId[];
  requiredRole?: string;
  minStaffCount?: number;
  maxStaffCount?: number;

  isRecurring: boolean;
  recurrenceRule?: string;
  parentShiftId?: ShiftId;

  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ShiftTemplate {
  id: ShiftTemplateId;
  tenantId: string;
  organizationId: string;
  clinicId?: string;

  name: string;
  description?: string;

  startTime: string;
  endTime: string;
  duration: number;

  daysOfWeek: number[];

  requiredRole?: string;
  minStaffCount?: number;
  maxStaffCount?: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  id: string;
  staffId: StaffId;
  tenantId: string;
  organizationId: string;
  clinicId?: string;

  startTime: Date;
  endTime: Date;

  isAvailable: boolean;
  isRecurring: boolean;
  recurrenceRule?: string;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

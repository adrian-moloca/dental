export type StaffId = string & { readonly __brand: 'StaffId' };
export type ContractId = string & { readonly __brand: 'ContractId' };
export type ShiftId = string & { readonly __brand: 'ShiftId' };
export type ShiftTemplateId = string & { readonly __brand: 'ShiftTemplateId' };
export type AvailabilitySlotId = string & { readonly __brand: 'AvailabilitySlotId' };
export type AbsenceId = string & { readonly __brand: 'AbsenceId' };
export type TaskId = string & { readonly __brand: 'TaskId' };
export type TaskTemplateId = string & { readonly __brand: 'TaskTemplateId' };

export enum StaffRole {
  DENTIST = 'DENTIST',
  HYGIENIST = 'HYGIENIST',
  DENTAL_ASSISTANT = 'DENTAL_ASSISTANT',
  RECEPTIONIST = 'RECEPTIONIST',
  OFFICE_MANAGER = 'OFFICE_MANAGER',
  STERILIZATION_TECH = 'STERILIZATION_TECH',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  BILLING_SPECIALIST = 'BILLING_SPECIALIST',
  MARKETING_COORDINATOR = 'MARKETING_COORDINATOR',
  IT_SUPPORT = 'IT_SUPPORT',
  OTHER = 'OTHER',
}

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ONBOARDING = 'ONBOARDING',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN',
  PER_DIEM = 'PER_DIEM',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskCategory {
  CLINICAL_SUPPORT = 'CLINICAL_SUPPORT',
  STERILIZATION = 'STERILIZATION',
  INVENTORY = 'INVENTORY',
  MAINTENANCE = 'MAINTENANCE',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  PATIENT_CARE = 'PATIENT_CARE',
  EQUIPMENT = 'EQUIPMENT',
  OTHER = 'OTHER',
}

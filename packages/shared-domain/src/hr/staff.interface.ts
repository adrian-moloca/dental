import type { StaffId, ContractId, StaffRole, StaffStatus, ContractType } from './staff-types';

export interface StaffMember {
  id: StaffId;
  userId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;

  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  role: StaffRole;
  status: StaffStatus;

  licenseNumber?: string;
  specialty?: string;
  skills: string[];

  hireDate: Date;
  terminationDate?: Date;

  emergencyContactName?: string;
  emergencyContactPhone?: string;

  profilePictureUrl?: string;
  bio?: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface StaffContract {
  id: ContractId;
  staffId: StaffId;
  tenantId: string;
  organizationId: string;
  clinicId?: string;

  contractType: ContractType;
  startDate: Date;
  endDate?: Date;

  hoursPerWeek?: number;
  hourlyRate?: number;
  salary?: number;
  currency: string;

  benefits?: string[];
  terms?: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

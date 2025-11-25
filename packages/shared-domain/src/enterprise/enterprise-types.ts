export type OrganizationId = string & { readonly __brand: 'OrganizationId' };
export type ClinicId = string & { readonly __brand: 'ClinicId' };
export type ClinicLocationId = string & { readonly __brand: 'ClinicLocationId' };
export type ProviderClinicAssignmentId = string & { readonly __brand: 'ProviderClinicAssignmentId' };

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum ClinicStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  PENDING_SETUP = 'PENDING_SETUP',
}

export enum EnterpriseRole {
  ORG_ADMIN = 'ORG_ADMIN',
  ORG_MANAGER = 'ORG_MANAGER',
  MULTI_CLINIC_MANAGER = 'MULTI_CLINIC_MANAGER',
  AUDITOR = 'AUDITOR',
  SYSTEM_OWNER = 'SYSTEM_OWNER',
}

export enum ClinicRole {
  CLINIC_MANAGER = 'CLINIC_MANAGER',
  CLINIC_OWNER = 'CLINIC_OWNER',
  CLINIC_FINANCE = 'CLINIC_FINANCE',
  CLINIC_STAFF_ADMIN = 'CLINIC_STAFF_ADMIN',
}

export enum ClinicLocationType {
  FLOOR = 'FLOOR',
  AREA = 'AREA',
  ROOM = 'ROOM',
  EQUIPMENT = 'EQUIPMENT',
}

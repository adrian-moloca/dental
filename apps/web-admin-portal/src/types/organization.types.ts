export type OrganizationStatus = 'active' | 'suspended' | 'inactive' | 'trial';

export interface OrganizationSettings {
  defaultCurrency: string;
  defaultTimezone: string;
  defaultLanguage: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  legalName: string;
  taxId?: string;
  email: string;
  phone?: string;
  status: OrganizationStatus;
  settings: OrganizationSettings;
  clinicCount: number;
  userCount: number;
  subscriptionId?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Clinic {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
  email?: string;
  status: 'active' | 'suspended' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  legalName: string;
  email: string;
  taxId?: string;
  phone?: string;
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganizationDto {
  name?: string;
  legalName?: string;
  email?: string;
  taxId?: string;
  phone?: string;
  status?: OrganizationStatus;
  settings?: Partial<OrganizationSettings>;
}

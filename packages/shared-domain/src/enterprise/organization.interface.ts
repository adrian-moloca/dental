import type { OrganizationId, OrganizationStatus } from './enterprise-types';

export interface Organization {
  id: OrganizationId;
  name: string;
  legalName: string;
  taxId: string;
  status: OrganizationStatus;

  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;

  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  website?: string;
  logoUrl?: string;

  subscriptionTier: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;

  maxClinics: number;
  maxUsers: number;
  maxStorageGB: number;

  billingAccountId?: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface OrganizationSettings {
  organizationId: OrganizationId;

  // Branding
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  customDomain?: string;

  // Features
  enableMultiClinic: boolean;
  enableAdvancedAnalytics: boolean;
  enableAIPredictions: boolean;
  enableMarketingAutomation: boolean;
  enableInventoryManagement: boolean;
  enableSterilizationTracking: boolean;
  enableLabIntegration: boolean;

  // Security
  requireMFA: boolean;
  passwordMinLength: number;
  sessionTimeoutMinutes: number;
  allowedIPRanges?: string[];

  // Compliance
  enableHIPAAMode: boolean;
  enableGDPRMode: boolean;
  dataRetentionDays: number;
  requireConsentForMarketing: boolean;

  // Notifications
  defaultTimezone: string;
  defaultLanguage: string;
  notificationEmail: string;

  updatedAt: Date;
  updatedBy: string;
}

export interface OrganizationAdminUser {
  id: string;
  organizationId: OrganizationId;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  assignedAt: Date;
  assignedBy: string;
}

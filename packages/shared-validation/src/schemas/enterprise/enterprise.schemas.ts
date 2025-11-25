// @ts-nocheck
import { z } from 'zod';
import {
  OrganizationStatus,
  ClinicStatus,
  EnterpriseRole,
  ClinicLocationType,
} from '@dentalos/shared-domain';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
} from '../common.schemas';

// ============================================================================
// Organization Schemas
// ============================================================================

export const EnterpriseAddressSchema = z.object({
  street: NonEmptyStringSchema.max(200),
  city: NonEmptyStringSchema.max(100),
  state: NonEmptyStringSchema.max(100),
  postalCode: NonEmptyStringSchema.max(20),
  country: NonEmptyStringSchema.max(100),
});

export const EnterpriseCreateOrganizationDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200),
  legalName: NonEmptyStringSchema.max(200),
  taxId: NonEmptyStringSchema.max(50),

  primaryContactName: NonEmptyStringSchema.max(200),
  primaryContactEmail: z.string().email(),
  primaryContactPhone: NonEmptyStringSchema.max(50),

  address: EnterpriseAddressSchema,

  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),

  subscriptionTier: z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']),
  subscriptionStartDate: ISODateStringSchema,
  subscriptionEndDate: ISODateStringSchema.optional(),

  maxClinics: z.number().int().positive(),
  maxUsers: z.number().int().positive(),
  maxStorageGB: z.number().positive(),
});

export type CreateOrganizationDto = z.infer<typeof EnterpriseCreateOrganizationDtoSchema>;

export const EnterpriseUpdateOrganizationDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200).optional(),
  legalName: NonEmptyStringSchema.max(200).optional(),
  taxId: NonEmptyStringSchema.max(50).optional(),
  status: z.nativeEnum(OrganizationStatus).optional(),

  primaryContactName: NonEmptyStringSchema.max(200).optional(),
  primaryContactEmail: z.string().email().optional(),
  primaryContactPhone: NonEmptyStringSchema.max(50).optional(),

  address: EnterpriseAddressSchema.optional(),

  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),

  subscriptionTier: z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']).optional(),
  subscriptionEndDate: ISODateStringSchema.optional(),

  maxClinics: z.number().int().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
  maxStorageGB: z.number().positive().optional(),
});

export type UpdateOrganizationDto = z.infer<typeof EnterpriseUpdateOrganizationDtoSchema>;

export const UpdateOrganizationSettingsDtoSchema = z.object({
  // Branding
  brandPrimaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  brandSecondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  customDomain: z.string().optional(),

  // Features
  enableMultiClinic: z.boolean().optional(),
  enableAdvancedAnalytics: z.boolean().optional(),
  enableAIPredictions: z.boolean().optional(),
  enableMarketingAutomation: z.boolean().optional(),
  enableInventoryManagement: z.boolean().optional(),
  enableSterilizationTracking: z.boolean().optional(),
  enableLabIntegration: z.boolean().optional(),

  // Security
  requireMFA: z.boolean().optional(),
  passwordMinLength: z.number().int().min(8).max(128).optional(),
  sessionTimeoutMinutes: z.number().int().positive().optional(),
  allowedIPRanges: z.array(z.string()).optional(),

  // Compliance
  enableHIPAAMode: z.boolean().optional(),
  enableGDPRMode: z.boolean().optional(),
  dataRetentionDays: z.number().int().positive().optional(),
  requireConsentForMarketing: z.boolean().optional(),

  // Notifications
  defaultTimezone: z.string().optional(),
  defaultLanguage: z.string().optional(),
  notificationEmail: z.string().email().optional(),
});

export type UpdateOrganizationSettingsDto = z.infer<typeof UpdateOrganizationSettingsDtoSchema>;

export const AddOrganizationAdminDtoSchema = z.object({
  userId: UUIDSchema,
  email: z.string().email(),
  fullName: NonEmptyStringSchema.max(200),
  role: z.nativeEnum(EnterpriseRole),
});

export type AddOrganizationAdminDto = z.infer<typeof AddOrganizationAdminDtoSchema>;

// ============================================================================
// Clinic Schemas
// ============================================================================

export const OperatingHoursSchema = z.object({
  monday: z.object({ open: z.string(), close: z.string() }).optional(),
  tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
  wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
  thursday: z.object({ open: z.string(), close: z.string() }).optional(),
  friday: z.object({ open: z.string(), close: z.string() }).optional(),
  saturday: z.object({ open: z.string(), close: z.string() }).optional(),
  sunday: z.object({ open: z.string(), close: z.string() }).optional(),
}).optional();

export const EnterpriseCreateClinicDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200),
  code: NonEmptyStringSchema.max(50),

  address: EnterpriseAddressSchema,

  phone: NonEmptyStringSchema.max(50),
  email: z.string().email(),
  website: z.string().url().optional(),

  managerUserId: UUIDSchema.optional(),
  managerName: NonEmptyStringSchema.max(200).optional(),
  managerEmail: z.string().email().optional(),

  timezone: z.string(),
  locale: z.string().default('en-US'),

  operatingHours: OperatingHoursSchema,

  licenseNumber: z.string().optional(),
  accreditationDetails: z.string().optional(),
});

export type CreateClinicDto = z.infer<typeof EnterpriseCreateClinicDtoSchema>;

export const EnterpriseUpdateClinicDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200).optional(),
  code: NonEmptyStringSchema.max(50).optional(),
  status: z.nativeEnum(ClinicStatus).optional(),

  address: EnterpriseAddressSchema.optional(),

  phone: NonEmptyStringSchema.max(50).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),

  managerUserId: UUIDSchema.optional(),
  managerName: NonEmptyStringSchema.max(200).optional(),
  managerEmail: z.string().email().optional(),

  timezone: z.string().optional(),
  locale: z.string().optional(),

  operatingHours: OperatingHoursSchema,

  licenseNumber: z.string().optional(),
  accreditationDetails: z.string().optional(),
});

export type UpdateClinicDto = z.infer<typeof EnterpriseUpdateClinicDtoSchema>;

export const UpdateClinicSettingsDtoSchema = z.object({
  // Scheduling
  defaultAppointmentDurationMinutes: z.number().int().positive().optional(),
  allowOnlineBooking: z.boolean().optional(),
  requireDepositForBooking: z.boolean().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  cancellationPolicyHours: z.number().int().nonnegative().optional(),

  // Billing
  defaultCurrency: z.string().length(3).optional(),
  acceptedPaymentMethods: z.array(z.string()).optional(),
  invoicePrefix: z.string().max(10).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  sendAutomaticReminders: z.boolean().optional(),

  // Clinical
  useElectronicRecords: z.boolean().optional(),
  requireConsentForTreatment: z.boolean().optional(),
  defaultConsentFormIds: z.array(UUIDSchema).optional(),

  // Inventory
  enableInventoryTracking: z.boolean().optional(),
  lowStockThreshold: z.number().int().positive().optional(),
  autoReorderEnabled: z.boolean().optional(),

  // Sterilization
  enableSterilizationTracking: z.boolean().optional(),
  requireBiologicalIndicators: z.boolean().optional(),
  sterilizationCyclePrefix: z.string().max(10).optional(),

  // Marketing
  enableLoyaltyProgram: z.boolean().optional(),
  loyaltyPointsPerDollar: z.number().nonnegative().optional(),
  enableReferralRewards: z.boolean().optional(),

  // Notifications
  sendAppointmentReminders: z.boolean().optional(),
  reminderHoursBefore: z.array(z.number().int().positive()).optional(),
  sendPostTreatmentFollowup: z.boolean().optional(),
  followupDaysAfter: z.number().int().positive().optional(),
});

export type UpdateClinicSettingsDto = z.infer<typeof UpdateClinicSettingsDtoSchema>;

export const CreateClinicLocationDtoSchema = z.object({
  type: z.nativeEnum(ClinicLocationType),
  name: NonEmptyStringSchema.max(200),
  code: NonEmptyStringSchema.max(50),
  parentLocationId: UUIDSchema.optional(),

  floor: z.number().int().optional(),
  area: z.string().max(100).optional(),
  capacity: z.number().int().positive().optional(),

  notes: z.string().optional(),

  equipmentIds: z.array(UUIDSchema).optional(),
  assignedStaffIds: z.array(UUIDSchema).optional(),
});

export type CreateClinicLocationDto = z.infer<typeof CreateClinicLocationDtoSchema>;

// ============================================================================
// Provider-Clinic Assignment Schemas
// ============================================================================

export const WorkingHoursOverrideSchema = z.object({
  monday: z.object({ start: z.string(), end: z.string() }).optional(),
  tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
  wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
  thursday: z.object({ start: z.string(), end: z.string() }).optional(),
  friday: z.object({ start: z.string(), end: z.string() }).optional(),
  saturday: z.object({ start: z.string(), end: z.string() }).optional(),
  sunday: z.object({ start: z.string(), end: z.string() }).optional(),
}).optional();

export const AssignProviderDtoSchema = z.object({
  clinicId: UUIDSchema,
  roles: z.array(z.string()).min(1),
  isPrimaryClinic: z.boolean().default(false),
  workingHoursOverride: WorkingHoursOverrideSchema,
});

export type AssignProviderDto = z.infer<typeof AssignProviderDtoSchema>;

// ============================================================================
// Filter Schemas
// ============================================================================

export const OrganizationFilterDtoSchema = z.object({
  status: z.nativeEnum(OrganizationStatus).optional(),
  subscriptionTier: z.enum(['FREE', 'BASIC', 'PRO', 'ENTERPRISE']).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type OrganizationFilterDto = z.infer<typeof OrganizationFilterDtoSchema>;

export const ClinicFilterDtoSchema = z.object({
  organizationId: UUIDSchema.optional(),
  status: z.nativeEnum(ClinicStatus).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type ClinicFilterDto = z.infer<typeof ClinicFilterDtoSchema>;
// @ts-nocheck

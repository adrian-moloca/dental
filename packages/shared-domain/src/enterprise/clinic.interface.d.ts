import type { OrganizationId, ClinicId, ClinicStatus, ClinicLocationId, ClinicLocationType } from './enterprise-types';
export interface Clinic {
    id: ClinicId;
    organizationId: OrganizationId;
    name: string;
    code: string;
    status: ClinicStatus;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    phone: string;
    email: string;
    website?: string;
    managerUserId?: string;
    managerName?: string;
    managerEmail?: string;
    timezone: string;
    locale: string;
    operatingHours: {
        monday?: {
            open: string;
            close: string;
        };
        tuesday?: {
            open: string;
            close: string;
        };
        wednesday?: {
            open: string;
            close: string;
        };
        thursday?: {
            open: string;
            close: string;
        };
        friday?: {
            open: string;
            close: string;
        };
        saturday?: {
            open: string;
            close: string;
        };
        sunday?: {
            open: string;
            close: string;
        };
    };
    licenseNumber?: string;
    accreditationDetails?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
export interface ClinicSettings {
    clinicId: ClinicId;
    defaultAppointmentDurationMinutes: number;
    allowOnlineBooking: boolean;
    requireDepositForBooking: boolean;
    depositPercentage?: number;
    cancellationPolicyHours: number;
    defaultCurrency: string;
    acceptedPaymentMethods: string[];
    invoicePrefix: string;
    taxRate: number;
    sendAutomaticReminders: boolean;
    useElectronicRecords: boolean;
    requireConsentForTreatment: boolean;
    defaultConsentFormIds?: string[];
    enableInventoryTracking: boolean;
    lowStockThreshold: number;
    autoReorderEnabled: boolean;
    enableSterilizationTracking: boolean;
    requireBiologicalIndicators: boolean;
    sterilizationCyclePrefix: string;
    enableLoyaltyProgram: boolean;
    loyaltyPointsPerDollar: number;
    enableReferralRewards: boolean;
    sendAppointmentReminders: boolean;
    reminderHoursBefore: number[];
    sendPostTreatmentFollowup: boolean;
    followupDaysAfter: number;
    updatedAt: Date;
    updatedBy: string;
}
export interface ClinicLocation {
    id: ClinicLocationId;
    clinicId: ClinicId;
    type: ClinicLocationType;
    name: string;
    code: string;
    parentLocationId?: ClinicLocationId;
    floor?: number;
    area?: string;
    capacity?: number;
    isActive: boolean;
    notes?: string;
    equipmentIds?: string[];
    assignedStaffIds?: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}

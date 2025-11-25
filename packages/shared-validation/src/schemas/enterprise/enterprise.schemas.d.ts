import { z } from 'zod';
import { OrganizationStatus, ClinicStatus, EnterpriseRole, ClinicLocationType } from '@dentalos/shared-domain';
export declare const EnterpriseAddressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    state: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}, {
    state: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}>;
export declare const EnterpriseCreateOrganizationDtoSchema: z.ZodObject<{
    name: z.ZodString;
    legalName: z.ZodString;
    taxId: z.ZodString;
    primaryContactName: z.ZodString;
    primaryContactEmail: z.ZodString;
    primaryContactPhone: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }>;
    website: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    subscriptionTier: z.ZodEnum<["FREE", "BASIC", "PRO", "ENTERPRISE"]>;
    subscriptionStartDate: z.ZodString;
    subscriptionEndDate: z.ZodOptional<z.ZodString>;
    maxClinics: z.ZodNumber;
    maxUsers: z.ZodNumber;
    maxStorageGB: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    address: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    legalName: string;
    taxId: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    subscriptionTier: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
    subscriptionStartDate: string;
    maxClinics: number;
    maxUsers: number;
    maxStorageGB: number;
    logoUrl?: string | undefined;
    website?: string | undefined;
    subscriptionEndDate?: string | undefined;
}, {
    name: string;
    address: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    legalName: string;
    taxId: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    subscriptionTier: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
    subscriptionStartDate: string;
    maxClinics: number;
    maxUsers: number;
    maxStorageGB: number;
    logoUrl?: string | undefined;
    website?: string | undefined;
    subscriptionEndDate?: string | undefined;
}>;
export type CreateOrganizationDto = z.infer<typeof EnterpriseCreateOrganizationDtoSchema>;
export declare const EnterpriseUpdateOrganizationDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    legalName: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof OrganizationStatus>>;
    primaryContactName: z.ZodOptional<z.ZodString>;
    primaryContactEmail: z.ZodOptional<z.ZodString>;
    primaryContactPhone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }>>;
    website: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    subscriptionTier: z.ZodOptional<z.ZodEnum<["FREE", "BASIC", "PRO", "ENTERPRISE"]>>;
    subscriptionEndDate: z.ZodOptional<z.ZodString>;
    maxClinics: z.ZodOptional<z.ZodNumber>;
    maxUsers: z.ZodOptional<z.ZodNumber>;
    maxStorageGB: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: OrganizationStatus | undefined;
    name?: string | undefined;
    logoUrl?: string | undefined;
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    website?: string | undefined;
    legalName?: string | undefined;
    taxId?: string | undefined;
    primaryContactName?: string | undefined;
    primaryContactEmail?: string | undefined;
    primaryContactPhone?: string | undefined;
    subscriptionTier?: "FREE" | "BASIC" | "PRO" | "ENTERPRISE" | undefined;
    subscriptionEndDate?: string | undefined;
    maxClinics?: number | undefined;
    maxUsers?: number | undefined;
    maxStorageGB?: number | undefined;
}, {
    status?: OrganizationStatus | undefined;
    name?: string | undefined;
    logoUrl?: string | undefined;
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    website?: string | undefined;
    legalName?: string | undefined;
    taxId?: string | undefined;
    primaryContactName?: string | undefined;
    primaryContactEmail?: string | undefined;
    primaryContactPhone?: string | undefined;
    subscriptionTier?: "FREE" | "BASIC" | "PRO" | "ENTERPRISE" | undefined;
    subscriptionEndDate?: string | undefined;
    maxClinics?: number | undefined;
    maxUsers?: number | undefined;
    maxStorageGB?: number | undefined;
}>;
export type UpdateOrganizationDto = z.infer<typeof EnterpriseUpdateOrganizationDtoSchema>;
export declare const UpdateOrganizationSettingsDtoSchema: z.ZodObject<{
    brandPrimaryColor: z.ZodOptional<z.ZodString>;
    brandSecondaryColor: z.ZodOptional<z.ZodString>;
    customDomain: z.ZodOptional<z.ZodString>;
    enableMultiClinic: z.ZodOptional<z.ZodBoolean>;
    enableAdvancedAnalytics: z.ZodOptional<z.ZodBoolean>;
    enableAIPredictions: z.ZodOptional<z.ZodBoolean>;
    enableMarketingAutomation: z.ZodOptional<z.ZodBoolean>;
    enableInventoryManagement: z.ZodOptional<z.ZodBoolean>;
    enableSterilizationTracking: z.ZodOptional<z.ZodBoolean>;
    enableLabIntegration: z.ZodOptional<z.ZodBoolean>;
    requireMFA: z.ZodOptional<z.ZodBoolean>;
    passwordMinLength: z.ZodOptional<z.ZodNumber>;
    sessionTimeoutMinutes: z.ZodOptional<z.ZodNumber>;
    allowedIPRanges: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    enableHIPAAMode: z.ZodOptional<z.ZodBoolean>;
    enableGDPRMode: z.ZodOptional<z.ZodBoolean>;
    dataRetentionDays: z.ZodOptional<z.ZodNumber>;
    requireConsentForMarketing: z.ZodOptional<z.ZodBoolean>;
    defaultTimezone: z.ZodOptional<z.ZodString>;
    defaultLanguage: z.ZodOptional<z.ZodString>;
    notificationEmail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    brandPrimaryColor?: string | undefined;
    brandSecondaryColor?: string | undefined;
    customDomain?: string | undefined;
    enableMultiClinic?: boolean | undefined;
    enableAdvancedAnalytics?: boolean | undefined;
    enableAIPredictions?: boolean | undefined;
    enableMarketingAutomation?: boolean | undefined;
    enableInventoryManagement?: boolean | undefined;
    enableSterilizationTracking?: boolean | undefined;
    enableLabIntegration?: boolean | undefined;
    requireMFA?: boolean | undefined;
    passwordMinLength?: number | undefined;
    sessionTimeoutMinutes?: number | undefined;
    allowedIPRanges?: string[] | undefined;
    enableHIPAAMode?: boolean | undefined;
    enableGDPRMode?: boolean | undefined;
    dataRetentionDays?: number | undefined;
    requireConsentForMarketing?: boolean | undefined;
    defaultTimezone?: string | undefined;
    defaultLanguage?: string | undefined;
    notificationEmail?: string | undefined;
}, {
    brandPrimaryColor?: string | undefined;
    brandSecondaryColor?: string | undefined;
    customDomain?: string | undefined;
    enableMultiClinic?: boolean | undefined;
    enableAdvancedAnalytics?: boolean | undefined;
    enableAIPredictions?: boolean | undefined;
    enableMarketingAutomation?: boolean | undefined;
    enableInventoryManagement?: boolean | undefined;
    enableSterilizationTracking?: boolean | undefined;
    enableLabIntegration?: boolean | undefined;
    requireMFA?: boolean | undefined;
    passwordMinLength?: number | undefined;
    sessionTimeoutMinutes?: number | undefined;
    allowedIPRanges?: string[] | undefined;
    enableHIPAAMode?: boolean | undefined;
    enableGDPRMode?: boolean | undefined;
    dataRetentionDays?: number | undefined;
    requireConsentForMarketing?: boolean | undefined;
    defaultTimezone?: string | undefined;
    defaultLanguage?: string | undefined;
    notificationEmail?: string | undefined;
}>;
export type UpdateOrganizationSettingsDto = z.infer<typeof UpdateOrganizationSettingsDtoSchema>;
export declare const AddOrganizationAdminDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodString;
    fullName: z.ZodString;
    role: z.ZodNativeEnum<typeof EnterpriseRole>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    email: string;
    role: EnterpriseRole;
    fullName: string;
}, {
    userId: string;
    email: string;
    role: EnterpriseRole;
    fullName: string;
}>;
export type AddOrganizationAdminDto = z.infer<typeof AddOrganizationAdminDtoSchema>;
export declare const OperatingHoursSchema: z.ZodOptional<z.ZodObject<{
    monday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
    tuesday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
    wednesday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
    thursday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
    friday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
    saturday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
    sunday: z.ZodOptional<z.ZodObject<{
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close: string;
        open: string;
    }, {
        close: string;
        open: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    monday?: {
        close: string;
        open: string;
    } | undefined;
    tuesday?: {
        close: string;
        open: string;
    } | undefined;
    wednesday?: {
        close: string;
        open: string;
    } | undefined;
    thursday?: {
        close: string;
        open: string;
    } | undefined;
    friday?: {
        close: string;
        open: string;
    } | undefined;
    saturday?: {
        close: string;
        open: string;
    } | undefined;
    sunday?: {
        close: string;
        open: string;
    } | undefined;
}, {
    monday?: {
        close: string;
        open: string;
    } | undefined;
    tuesday?: {
        close: string;
        open: string;
    } | undefined;
    wednesday?: {
        close: string;
        open: string;
    } | undefined;
    thursday?: {
        close: string;
        open: string;
    } | undefined;
    friday?: {
        close: string;
        open: string;
    } | undefined;
    saturday?: {
        close: string;
        open: string;
    } | undefined;
    sunday?: {
        close: string;
        open: string;
    } | undefined;
}>>;
export declare const EnterpriseCreateClinicDtoSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }>;
    phone: z.ZodString;
    email: z.ZodString;
    website: z.ZodOptional<z.ZodString>;
    managerUserId: z.ZodOptional<z.ZodString>;
    managerName: z.ZodOptional<z.ZodString>;
    managerEmail: z.ZodOptional<z.ZodString>;
    timezone: z.ZodString;
    locale: z.ZodDefault<z.ZodString>;
    operatingHours: z.ZodOptional<z.ZodObject<{
        monday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        tuesday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        wednesday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        thursday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        friday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        saturday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        sunday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    }, {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    }>>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    accreditationDetails: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    timezone: string;
    email: string;
    locale: string;
    address: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    phone: string;
    website?: string | undefined;
    operatingHours?: {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    } | undefined;
    licenseNumber?: string | undefined;
    managerUserId?: string | undefined;
    managerName?: string | undefined;
    managerEmail?: string | undefined;
    accreditationDetails?: string | undefined;
}, {
    code: string;
    name: string;
    timezone: string;
    email: string;
    address: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    phone: string;
    locale?: string | undefined;
    website?: string | undefined;
    operatingHours?: {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    } | undefined;
    licenseNumber?: string | undefined;
    managerUserId?: string | undefined;
    managerName?: string | undefined;
    managerEmail?: string | undefined;
    accreditationDetails?: string | undefined;
}>;
export type CreateClinicDto = z.infer<typeof EnterpriseCreateClinicDtoSchema>;
export declare const EnterpriseUpdateClinicDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ClinicStatus>>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }>>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    managerUserId: z.ZodOptional<z.ZodString>;
    managerName: z.ZodOptional<z.ZodString>;
    managerEmail: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
    operatingHours: z.ZodOptional<z.ZodObject<{
        monday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        tuesday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        wednesday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        thursday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        friday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        saturday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
        sunday: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    }, {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    }>>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    accreditationDetails: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    status?: ClinicStatus | undefined;
    name?: string | undefined;
    timezone?: string | undefined;
    email?: string | undefined;
    locale?: string | undefined;
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    operatingHours?: {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    } | undefined;
    licenseNumber?: string | undefined;
    managerUserId?: string | undefined;
    managerName?: string | undefined;
    managerEmail?: string | undefined;
    accreditationDetails?: string | undefined;
}, {
    code?: string | undefined;
    status?: ClinicStatus | undefined;
    name?: string | undefined;
    timezone?: string | undefined;
    email?: string | undefined;
    locale?: string | undefined;
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    phone?: string | undefined;
    website?: string | undefined;
    operatingHours?: {
        monday?: {
            close: string;
            open: string;
        } | undefined;
        tuesday?: {
            close: string;
            open: string;
        } | undefined;
        wednesday?: {
            close: string;
            open: string;
        } | undefined;
        thursday?: {
            close: string;
            open: string;
        } | undefined;
        friday?: {
            close: string;
            open: string;
        } | undefined;
        saturday?: {
            close: string;
            open: string;
        } | undefined;
        sunday?: {
            close: string;
            open: string;
        } | undefined;
    } | undefined;
    licenseNumber?: string | undefined;
    managerUserId?: string | undefined;
    managerName?: string | undefined;
    managerEmail?: string | undefined;
    accreditationDetails?: string | undefined;
}>;
export type UpdateClinicDto = z.infer<typeof EnterpriseUpdateClinicDtoSchema>;
export declare const UpdateClinicSettingsDtoSchema: z.ZodObject<{
    defaultAppointmentDurationMinutes: z.ZodOptional<z.ZodNumber>;
    allowOnlineBooking: z.ZodOptional<z.ZodBoolean>;
    requireDepositForBooking: z.ZodOptional<z.ZodBoolean>;
    depositPercentage: z.ZodOptional<z.ZodNumber>;
    cancellationPolicyHours: z.ZodOptional<z.ZodNumber>;
    defaultCurrency: z.ZodOptional<z.ZodString>;
    acceptedPaymentMethods: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    invoicePrefix: z.ZodOptional<z.ZodString>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    sendAutomaticReminders: z.ZodOptional<z.ZodBoolean>;
    useElectronicRecords: z.ZodOptional<z.ZodBoolean>;
    requireConsentForTreatment: z.ZodOptional<z.ZodBoolean>;
    defaultConsentFormIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    enableInventoryTracking: z.ZodOptional<z.ZodBoolean>;
    lowStockThreshold: z.ZodOptional<z.ZodNumber>;
    autoReorderEnabled: z.ZodOptional<z.ZodBoolean>;
    enableSterilizationTracking: z.ZodOptional<z.ZodBoolean>;
    requireBiologicalIndicators: z.ZodOptional<z.ZodBoolean>;
    sterilizationCyclePrefix: z.ZodOptional<z.ZodString>;
    enableLoyaltyProgram: z.ZodOptional<z.ZodBoolean>;
    loyaltyPointsPerDollar: z.ZodOptional<z.ZodNumber>;
    enableReferralRewards: z.ZodOptional<z.ZodBoolean>;
    sendAppointmentReminders: z.ZodOptional<z.ZodBoolean>;
    reminderHoursBefore: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    sendPostTreatmentFollowup: z.ZodOptional<z.ZodBoolean>;
    followupDaysAfter: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    enableSterilizationTracking?: boolean | undefined;
    defaultAppointmentDurationMinutes?: number | undefined;
    allowOnlineBooking?: boolean | undefined;
    requireDepositForBooking?: boolean | undefined;
    depositPercentage?: number | undefined;
    cancellationPolicyHours?: number | undefined;
    defaultCurrency?: string | undefined;
    acceptedPaymentMethods?: string[] | undefined;
    invoicePrefix?: string | undefined;
    taxRate?: number | undefined;
    sendAutomaticReminders?: boolean | undefined;
    useElectronicRecords?: boolean | undefined;
    requireConsentForTreatment?: boolean | undefined;
    defaultConsentFormIds?: string[] | undefined;
    enableInventoryTracking?: boolean | undefined;
    lowStockThreshold?: number | undefined;
    autoReorderEnabled?: boolean | undefined;
    requireBiologicalIndicators?: boolean | undefined;
    sterilizationCyclePrefix?: string | undefined;
    enableLoyaltyProgram?: boolean | undefined;
    loyaltyPointsPerDollar?: number | undefined;
    enableReferralRewards?: boolean | undefined;
    sendAppointmentReminders?: boolean | undefined;
    reminderHoursBefore?: number[] | undefined;
    sendPostTreatmentFollowup?: boolean | undefined;
    followupDaysAfter?: number | undefined;
}, {
    enableSterilizationTracking?: boolean | undefined;
    defaultAppointmentDurationMinutes?: number | undefined;
    allowOnlineBooking?: boolean | undefined;
    requireDepositForBooking?: boolean | undefined;
    depositPercentage?: number | undefined;
    cancellationPolicyHours?: number | undefined;
    defaultCurrency?: string | undefined;
    acceptedPaymentMethods?: string[] | undefined;
    invoicePrefix?: string | undefined;
    taxRate?: number | undefined;
    sendAutomaticReminders?: boolean | undefined;
    useElectronicRecords?: boolean | undefined;
    requireConsentForTreatment?: boolean | undefined;
    defaultConsentFormIds?: string[] | undefined;
    enableInventoryTracking?: boolean | undefined;
    lowStockThreshold?: number | undefined;
    autoReorderEnabled?: boolean | undefined;
    requireBiologicalIndicators?: boolean | undefined;
    sterilizationCyclePrefix?: string | undefined;
    enableLoyaltyProgram?: boolean | undefined;
    loyaltyPointsPerDollar?: number | undefined;
    enableReferralRewards?: boolean | undefined;
    sendAppointmentReminders?: boolean | undefined;
    reminderHoursBefore?: number[] | undefined;
    sendPostTreatmentFollowup?: boolean | undefined;
    followupDaysAfter?: number | undefined;
}>;
export type UpdateClinicSettingsDto = z.infer<typeof UpdateClinicSettingsDtoSchema>;
export declare const CreateClinicLocationDtoSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof ClinicLocationType>;
    name: z.ZodString;
    code: z.ZodString;
    parentLocationId: z.ZodOptional<z.ZodString>;
    floor: z.ZodOptional<z.ZodNumber>;
    area: z.ZodOptional<z.ZodString>;
    capacity: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    equipmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignedStaffIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    type: ClinicLocationType;
    name: string;
    notes?: string | undefined;
    parentLocationId?: string | undefined;
    floor?: number | undefined;
    area?: string | undefined;
    capacity?: number | undefined;
    equipmentIds?: string[] | undefined;
    assignedStaffIds?: string[] | undefined;
}, {
    code: string;
    type: ClinicLocationType;
    name: string;
    notes?: string | undefined;
    parentLocationId?: string | undefined;
    floor?: number | undefined;
    area?: string | undefined;
    capacity?: number | undefined;
    equipmentIds?: string[] | undefined;
    assignedStaffIds?: string[] | undefined;
}>;
export type CreateClinicLocationDto = z.infer<typeof CreateClinicLocationDtoSchema>;
export declare const WorkingHoursOverrideSchema: z.ZodOptional<z.ZodObject<{
    monday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    tuesday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    wednesday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    thursday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    friday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    saturday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
    sunday: z.ZodOptional<z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        start: string;
        end: string;
    }, {
        start: string;
        end: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    monday?: {
        start: string;
        end: string;
    } | undefined;
    tuesday?: {
        start: string;
        end: string;
    } | undefined;
    wednesday?: {
        start: string;
        end: string;
    } | undefined;
    thursday?: {
        start: string;
        end: string;
    } | undefined;
    friday?: {
        start: string;
        end: string;
    } | undefined;
    saturday?: {
        start: string;
        end: string;
    } | undefined;
    sunday?: {
        start: string;
        end: string;
    } | undefined;
}, {
    monday?: {
        start: string;
        end: string;
    } | undefined;
    tuesday?: {
        start: string;
        end: string;
    } | undefined;
    wednesday?: {
        start: string;
        end: string;
    } | undefined;
    thursday?: {
        start: string;
        end: string;
    } | undefined;
    friday?: {
        start: string;
        end: string;
    } | undefined;
    saturday?: {
        start: string;
        end: string;
    } | undefined;
    sunday?: {
        start: string;
        end: string;
    } | undefined;
}>>;
export declare const AssignProviderDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    roles: z.ZodArray<z.ZodString, "many">;
    isPrimaryClinic: z.ZodDefault<z.ZodBoolean>;
    workingHoursOverride: z.ZodOptional<z.ZodObject<{
        monday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        tuesday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        wednesday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        thursday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        friday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        saturday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
        sunday: z.ZodOptional<z.ZodObject<{
            start: z.ZodString;
            end: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            start: string;
            end: string;
        }, {
            start: string;
            end: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        monday?: {
            start: string;
            end: string;
        } | undefined;
        tuesday?: {
            start: string;
            end: string;
        } | undefined;
        wednesday?: {
            start: string;
            end: string;
        } | undefined;
        thursday?: {
            start: string;
            end: string;
        } | undefined;
        friday?: {
            start: string;
            end: string;
        } | undefined;
        saturday?: {
            start: string;
            end: string;
        } | undefined;
        sunday?: {
            start: string;
            end: string;
        } | undefined;
    }, {
        monday?: {
            start: string;
            end: string;
        } | undefined;
        tuesday?: {
            start: string;
            end: string;
        } | undefined;
        wednesday?: {
            start: string;
            end: string;
        } | undefined;
        thursday?: {
            start: string;
            end: string;
        } | undefined;
        friday?: {
            start: string;
            end: string;
        } | undefined;
        saturday?: {
            start: string;
            end: string;
        } | undefined;
        sunday?: {
            start: string;
            end: string;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    roles: string[];
    isPrimaryClinic: boolean;
    workingHoursOverride?: {
        monday?: {
            start: string;
            end: string;
        } | undefined;
        tuesday?: {
            start: string;
            end: string;
        } | undefined;
        wednesday?: {
            start: string;
            end: string;
        } | undefined;
        thursday?: {
            start: string;
            end: string;
        } | undefined;
        friday?: {
            start: string;
            end: string;
        } | undefined;
        saturday?: {
            start: string;
            end: string;
        } | undefined;
        sunday?: {
            start: string;
            end: string;
        } | undefined;
    } | undefined;
}, {
    clinicId: string;
    roles: string[];
    isPrimaryClinic?: boolean | undefined;
    workingHoursOverride?: {
        monday?: {
            start: string;
            end: string;
        } | undefined;
        tuesday?: {
            start: string;
            end: string;
        } | undefined;
        wednesday?: {
            start: string;
            end: string;
        } | undefined;
        thursday?: {
            start: string;
            end: string;
        } | undefined;
        friday?: {
            start: string;
            end: string;
        } | undefined;
        saturday?: {
            start: string;
            end: string;
        } | undefined;
        sunday?: {
            start: string;
            end: string;
        } | undefined;
    } | undefined;
}>;
export type AssignProviderDto = z.infer<typeof AssignProviderDtoSchema>;
export declare const OrganizationFilterDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof OrganizationStatus>>;
    subscriptionTier: z.ZodOptional<z.ZodEnum<["FREE", "BASIC", "PRO", "ENTERPRISE"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: OrganizationStatus | undefined;
    subscriptionTier?: "FREE" | "BASIC" | "PRO" | "ENTERPRISE" | undefined;
}, {
    status?: OrganizationStatus | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    subscriptionTier?: "FREE" | "BASIC" | "PRO" | "ENTERPRISE" | undefined;
}>;
export type OrganizationFilterDto = z.infer<typeof OrganizationFilterDtoSchema>;
export declare const ClinicFilterDtoSchema: z.ZodObject<{
    organizationId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ClinicStatus>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: ClinicStatus | undefined;
    organizationId?: string | undefined;
}, {
    status?: ClinicStatus | undefined;
    organizationId?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ClinicFilterDto = z.infer<typeof ClinicFilterDtoSchema>;

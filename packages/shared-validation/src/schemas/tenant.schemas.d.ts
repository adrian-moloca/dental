import { z } from 'zod';
export declare const AddressSchema: z.ZodObject<{
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    state?: string | undefined;
    street?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
}, {
    state?: string | undefined;
    street?: string | undefined;
    city?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
}>;
export declare const ContactInfoSchema: z.ZodObject<{
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    website?: string | undefined;
}>;
export declare const OrganizationStatusSchema: z.ZodEnum<["active", "inactive", "suspended"]>;
export declare const OrganizationSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    logoUrl: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodString>;
    updatedBy: z.ZodOptional<z.ZodString>;
    deletedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    version: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    name: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    logoUrl?: string | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    logoUrl?: string | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>;
export declare const ClinicStatusSchema: z.ZodEnum<["active", "inactive", "suspended"]>;
export declare const ClinicSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    status: z.ZodEnum<["active", "inactive", "suspended"]>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }, {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    }>>;
    contact: z.ZodOptional<z.ZodObject<{
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }, {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodString>;
    updatedBy: z.ZodOptional<z.ZodString>;
    deletedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    version: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    organizationId: string;
    name: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    organizationId: string;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>, {
    status: "active" | "inactive" | "suspended";
    organizationId: string;
    name: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: "active" | "inactive" | "suspended";
    organizationId: string;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    address?: {
        state?: string | undefined;
        street?: string | undefined;
        city?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
    contact?: {
        email?: string | undefined;
        phone?: string | undefined;
        website?: string | undefined;
    } | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>;
export declare const TenantScopedSchema: z.ZodObject<{
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    clinicId?: string | undefined;
}>;
export declare const TenantContextSchema: z.ZodObject<{
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    tenantType: z.ZodNativeEnum<typeof import("@dentalos/shared-types").TenantType>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    tenantType: import("@dentalos/shared-types").TenantType;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    tenantType: import("@dentalos/shared-types").TenantType;
    clinicId?: string | undefined;
}>;
export declare const TenantScopeFilterSchema: z.ZodObject<{
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    includeChildren: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    includeChildren: boolean;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    clinicId?: string | undefined;
    includeChildren?: boolean | undefined;
}>;
export declare const MultiTenantQueryOptionsSchema: z.ZodObject<{
    scope: z.ZodObject<{
        organizationId: z.ZodString;
        clinicId: z.ZodOptional<z.ZodString>;
        includeChildren: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        includeChildren: boolean;
        clinicId?: string | undefined;
    }, {
        organizationId: string;
        clinicId?: string | undefined;
        includeChildren?: boolean | undefined;
    }>;
    isolationPolicy: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").TenantIsolationPolicy>>;
}, "strip", z.ZodTypeAny, {
    scope: {
        organizationId: string;
        includeChildren: boolean;
        clinicId?: string | undefined;
    };
    isolationPolicy?: import("@dentalos/shared-types").TenantIsolationPolicy | undefined;
}, {
    scope: {
        organizationId: string;
        clinicId?: string | undefined;
        includeChildren?: boolean | undefined;
    };
    isolationPolicy?: import("@dentalos/shared-types").TenantIsolationPolicy | undefined;
}>;
export declare const OrganizationSettingsSchema: z.ZodObject<{
    timezone: z.ZodDefault<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    dateFormat: z.ZodDefault<z.ZodString>;
    timeFormat: z.ZodDefault<z.ZodEnum<["12h", "24h"]>>;
    weekStartsOn: z.ZodDefault<z.ZodNumber>;
    features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    branding: z.ZodOptional<z.ZodObject<{
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        logoUrl: z.ZodOptional<z.ZodString>;
        faviconUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        faviconUrl?: string | undefined;
    }, {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        faviconUrl?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    locale: string;
    currency: string;
    dateFormat: string;
    timeFormat: "12h" | "24h";
    weekStartsOn: number;
    features: Record<string, boolean>;
    branding?: {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        faviconUrl?: string | undefined;
    } | undefined;
}, {
    timezone?: string | undefined;
    locale?: string | undefined;
    currency?: string | undefined;
    dateFormat?: string | undefined;
    timeFormat?: "12h" | "24h" | undefined;
    weekStartsOn?: number | undefined;
    features?: Record<string, boolean> | undefined;
    branding?: {
        logoUrl?: string | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        faviconUrl?: string | undefined;
    } | undefined;
}>;
export declare const ClinicSettingsSchema: z.ZodObject<{
    timezone: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
    appointmentDuration: z.ZodDefault<z.ZodNumber>;
    operatingHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        openTime: z.ZodString;
        closeTime: z.ZodString;
        isClosed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }, {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed?: boolean | undefined;
    }>, "many">>;
    features: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    features: Record<string, boolean>;
    appointmentDuration: number;
    timezone?: string | undefined;
    locale?: string | undefined;
    operatingHours?: {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed: boolean;
    }[] | undefined;
}, {
    timezone?: string | undefined;
    locale?: string | undefined;
    features?: Record<string, boolean> | undefined;
    appointmentDuration?: number | undefined;
    operatingHours?: {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        isClosed?: boolean | undefined;
    }[] | undefined;
}>;
export type AddressInput = z.input<typeof AddressSchema>;
export type AddressOutput = z.output<typeof AddressSchema>;
export type ContactInfoInput = z.input<typeof ContactInfoSchema>;
export type ContactInfoOutput = z.output<typeof ContactInfoSchema>;
export type OrganizationInput = z.input<typeof OrganizationSchema>;
export type OrganizationOutput = z.output<typeof OrganizationSchema>;
export type ClinicInput = z.input<typeof ClinicSchema>;
export type ClinicOutput = z.output<typeof ClinicSchema>;
export type TenantScopedInput = z.input<typeof TenantScopedSchema>;
export type TenantScopedOutput = z.output<typeof TenantScopedSchema>;
export type TenantContextInput = z.input<typeof TenantContextSchema>;
export type TenantContextOutput = z.output<typeof TenantContextSchema>;
export type TenantScopeFilterInput = z.input<typeof TenantScopeFilterSchema>;
export type TenantScopeFilterOutput = z.output<typeof TenantScopeFilterSchema>;
export type MultiTenantQueryOptionsInput = z.input<typeof MultiTenantQueryOptionsSchema>;
export type MultiTenantQueryOptionsOutput = z.output<typeof MultiTenantQueryOptionsSchema>;
export type OrganizationSettingsInput = z.input<typeof OrganizationSettingsSchema>;
export type OrganizationSettingsOutput = z.output<typeof OrganizationSettingsSchema>;
export type ClinicSettingsInput = z.input<typeof ClinicSettingsSchema>;
export type ClinicSettingsOutput = z.output<typeof ClinicSettingsSchema>;

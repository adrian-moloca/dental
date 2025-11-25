import type { Brand } from './common.types';
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type ClinicId = Brand<string, 'ClinicId'>;
export type TenantId = Brand<string, 'TenantId'>;
export declare enum TenantType {
    ORGANIZATION = "ORGANIZATION",
    CLINIC = "CLINIC"
}
export interface TenantScoped {
    organizationId: OrganizationId;
    clinicId?: ClinicId;
}
export interface TenantContext {
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    tenantType: TenantType;
}
export interface Organization {
    id: OrganizationId;
    name: string;
    slug: string;
    status: 'active' | 'inactive' | 'suspended';
    logoUrl?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
export interface Clinic {
    id: ClinicId;
    organizationId: OrganizationId;
    name: string;
    slug: string;
    status: 'active' | 'inactive' | 'suspended';
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    contact?: {
        phone?: string;
        email?: string;
        website?: string;
    };
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
export declare enum TenantIsolationPolicy {
    STRICT = "STRICT",
    RELAXED = "RELAXED",
    SHARED = "SHARED"
}
export interface TenantScopeFilter {
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    includeChildren?: boolean;
}
export interface MultiTenantQueryOptions {
    scope: TenantScopeFilter;
    isolationPolicy?: TenantIsolationPolicy;
}

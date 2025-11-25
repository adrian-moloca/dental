/**
 * Multi-tenant type definitions for organizational hierarchy
 * @module shared-types/multi-tenant
 */

import type { Brand } from './common.types';

/**
 * Unique identifier for an organization (top-level tenant)
 * An organization can contain multiple clinics
 */
export type OrganizationId = Brand<string, 'OrganizationId'>;

/**
 * Unique identifier for a clinic (sub-tenant)
 * A clinic belongs to exactly one organization
 */
export type ClinicId = Brand<string, 'ClinicId'>;

/**
 * Unique identifier for a tenant (generic)
 * Can refer to either organization or clinic depending on context
 */
export type TenantId = Brand<string, 'TenantId'>;

/**
 * Tenant type discriminator
 */
export enum TenantType {
  /** Top-level organization */
  ORGANIZATION = 'ORGANIZATION',
  /** Clinic within an organization */
  CLINIC = 'CLINIC',
}

/**
 * Base interface for tenant-scoped entities
 * All entities in a multi-tenant system should extend this
 */
export interface TenantScoped {
  /** Organization to which this entity belongs */
  organizationId: OrganizationId;
  /** Optional clinic scope for clinic-specific data */
  clinicId?: ClinicId;
}

/**
 * Tenant context for request processing
 * Carries tenant information through the application layers
 */
export interface TenantContext {
  /** Current organization ID */
  organizationId: OrganizationId;
  /** Current clinic ID (if operating at clinic level) */
  clinicId?: ClinicId;
  /** Type of tenant context */
  tenantType: TenantType;
}

/**
 * Organization entity
 */
export interface Organization {
  /** Unique organization identifier */
  id: OrganizationId;
  /** Organization display name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Organization status */
  status: 'active' | 'inactive' | 'suspended';
  /** Optional organization logo URL */
  logoUrl?: string;
  /** Organization metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Clinic entity
 */
export interface Clinic {
  /** Unique clinic identifier */
  id: ClinicId;
  /** Parent organization */
  organizationId: OrganizationId;
  /** Clinic display name */
  name: string;
  /** URL-friendly slug (unique within organization) */
  slug: string;
  /** Clinic status */
  status: 'active' | 'inactive' | 'suspended';
  /** Physical address */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Contact information */
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  /** Clinic metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Tenant isolation policy
 * Defines how strict tenant isolation should be enforced
 */
export enum TenantIsolationPolicy {
  /** Strict isolation - no cross-tenant access allowed */
  STRICT = 'STRICT',
  /** Relaxed isolation - allow cross-tenant read with explicit permission */
  RELAXED = 'RELAXED',
  /** Shared - allow cross-tenant access for specific resources */
  SHARED = 'SHARED',
}

/**
 * Tenant scope filter for queries
 * Used to filter data by tenant scope
 */
export interface TenantScopeFilter {
  /** Organization filter */
  organizationId: OrganizationId;
  /** Optional clinic filter */
  clinicId?: ClinicId;
  /** Include child tenants in results */
  includeChildren?: boolean;
}

/**
 * Multi-tenant query options
 */
export interface MultiTenantQueryOptions {
  /** Tenant scope filter */
  scope: TenantScopeFilter;
  /** Isolation policy to apply */
  isolationPolicy?: TenantIsolationPolicy;
}

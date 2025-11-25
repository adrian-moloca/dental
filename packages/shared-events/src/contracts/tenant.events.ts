/**
 * Tenant Domain Events
 *
 * Events related to organization and clinic lifecycle in multi-tenant contexts.
 * These events ensure proper tenant provisioning, updates, and decommissioning.
 *
 * @module shared-events/contracts
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';

/**
 * Published when a new tenant (organization) is created
 *
 * Triggers:
 * - New organization registration
 * - Admin creates organization
 *
 * Consumers:
 * - Provisioning service (create tenant databases/schemas)
 * - Billing service (setup subscription)
 * - Notification service (send welcome email)
 */
export class TenantCreated extends DomainEvent {
  public readonly tenantId: TenantId;
  public readonly organizationId: OrganizationId;
  public readonly organizationName: string;
  public readonly ownerId: UUID;

  constructor(params: {
    aggregateId: UUID;
    tenantId: TenantId;
    organizationId: OrganizationId;
    organizationName: string;
    ownerId: UUID;
  }) {
    super('TenantCreated', params.aggregateId, 1);
    this.tenantId = params.tenantId;
    this.organizationId = params.organizationId;
    this.organizationName = params.organizationName;
    this.ownerId = params.ownerId;
  }
}

/**
 * Published when tenant (organization) information is updated
 *
 * Triggers:
 * - Organization profile update
 * - Configuration changes
 *
 * Consumers:
 * - Search index (update tenant data)
 * - Cache invalidation service
 */
export class TenantUpdated extends DomainEvent {
  public readonly tenantId: TenantId;
  public readonly organizationId: OrganizationId;
  public readonly organizationName?: string;
  public readonly updatedFields: readonly string[];

  constructor(params: {
    aggregateId: UUID;
    tenantId: TenantId;
    organizationId: OrganizationId;
    organizationName?: string;
    updatedFields: readonly string[];
  }) {
    super('TenantUpdated', params.aggregateId, 1);
    this.tenantId = params.tenantId;
    this.organizationId = params.organizationId;
    this.organizationName = params.organizationName;
    this.updatedFields = params.updatedFields;
  }
}

/**
 * Published when a tenant (organization) is deleted
 *
 * Triggers:
 * - Organization closure
 * - Admin deletes organization
 *
 * Consumers:
 * - Provisioning service (cleanup tenant resources)
 * - Billing service (cancel subscription)
 * - Data retention service (archive/delete data)
 */
export class TenantDeleted extends DomainEvent {
  public readonly tenantId: TenantId;
  public readonly organizationId: OrganizationId;
  public readonly deletedBy: UUID;
  public readonly reason?: string;

  constructor(params: {
    aggregateId: UUID;
    tenantId: TenantId;
    organizationId: OrganizationId;
    deletedBy: UUID;
    reason?: string;
  }) {
    super('TenantDeleted', params.aggregateId, 1);
    this.tenantId = params.tenantId;
    this.organizationId = params.organizationId;
    this.deletedBy = params.deletedBy;
    this.reason = params.reason;
  }
}

/**
 * Published when a new clinic is created within an organization
 *
 * Triggers:
 * - Organization adds new clinic location
 * - Multi-clinic setup
 *
 * Consumers:
 * - Provisioning service (setup clinic resources)
 * - User service (assign clinic permissions)
 */
export class ClinicCreated extends DomainEvent {
  public readonly clinicId: ClinicId;
  public readonly organizationId: OrganizationId;
  public readonly clinicName: string;
  public readonly address?: string;

  constructor(params: {
    aggregateId: UUID;
    clinicId: ClinicId;
    organizationId: OrganizationId;
    clinicName: string;
    address?: string;
  }) {
    super('ClinicCreated', params.aggregateId, 1);
    this.clinicId = params.clinicId;
    this.organizationId = params.organizationId;
    this.clinicName = params.clinicName;
    this.address = params.address;
  }
}

/**
 * Published when clinic information is updated
 *
 * Triggers:
 * - Clinic profile update
 * - Address or contact information change
 *
 * Consumers:
 * - Search index (update clinic data)
 * - Cache invalidation service
 */
export class ClinicUpdated extends DomainEvent {
  public readonly clinicId: ClinicId;
  public readonly organizationId: OrganizationId;
  public readonly clinicName?: string;
  public readonly address?: string;
  public readonly updatedFields: readonly string[];

  constructor(params: {
    aggregateId: UUID;
    clinicId: ClinicId;
    organizationId: OrganizationId;
    clinicName?: string;
    address?: string;
    updatedFields: readonly string[];
  }) {
    super('ClinicUpdated', params.aggregateId, 1);
    this.clinicId = params.clinicId;
    this.organizationId = params.organizationId;
    this.clinicName = params.clinicName;
    this.address = params.address;
    this.updatedFields = params.updatedFields;
  }
}

/**
 * Published when a clinic is deleted or closed
 *
 * Triggers:
 * - Clinic closure
 * - Organization consolidation
 *
 * Consumers:
 * - Provisioning service (cleanup clinic resources)
 * - User service (revoke clinic permissions)
 * - Appointment service (cancel future appointments)
 */
export class ClinicDeleted extends DomainEvent {
  public readonly clinicId: ClinicId;
  public readonly organizationId: OrganizationId;
  public readonly deletedBy: UUID;
  public readonly reason?: string;

  constructor(params: {
    aggregateId: UUID;
    clinicId: ClinicId;
    organizationId: OrganizationId;
    deletedBy: UUID;
    reason?: string;
  }) {
    super('ClinicDeleted', params.aggregateId, 1);
    this.clinicId = params.clinicId;
    this.organizationId = params.organizationId;
    this.deletedBy = params.deletedBy;
    this.reason = params.reason;
  }
}

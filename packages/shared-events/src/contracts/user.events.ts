/**
 * User Domain Events
 *
 * Events related to user lifecycle and authentication in the Dental OS system.
 * These events are published when users are created, updated, or deleted.
 *
 * @module shared-events/contracts
 */

import { DomainEvent } from '@dentalos/shared-domain';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Published when a new user is created in the system
 *
 * Triggers:
 * - User registration flow
 * - Admin creates a new user
 * - Invitation acceptance
 *
 * Consumers:
 * - Notification service (send welcome email)
 * - Analytics service (track user growth)
 * - Audit service (log user creation)
 */
export class UserCreated extends DomainEvent {
  public readonly userId: UUID;
  public readonly email: string;
  public readonly roles: readonly string[];
  public readonly organizationId: OrganizationId;
  public readonly clinicId?: ClinicId;

  constructor(params: {
    aggregateId: UUID;
    userId: UUID;
    email: string;
    roles: readonly string[];
    organizationId: OrganizationId;
    clinicId?: ClinicId;
  }) {
    super('UserCreated', params.aggregateId, 1);
    this.userId = params.userId;
    this.email = params.email;
    this.roles = params.roles;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
  }
}

/**
 * Published when a user's information is updated
 *
 * Triggers:
 * - User profile update
 * - Admin updates user details
 * - Role assignment changes
 *
 * Consumers:
 * - Search index (update user data)
 * - Cache invalidation service
 * - Audit service (log changes)
 */
export class UserUpdated extends DomainEvent {
  public readonly userId: UUID;
  public readonly email?: string;
  public readonly roles?: readonly string[];
  public readonly organizationId: OrganizationId;
  public readonly clinicId?: ClinicId;
  public readonly updatedFields: readonly string[];

  constructor(params: {
    aggregateId: UUID;
    userId: UUID;
    email?: string;
    roles?: readonly string[];
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    updatedFields: readonly string[];
  }) {
    super('UserUpdated', params.aggregateId, 1);
    this.userId = params.userId;
    this.email = params.email;
    this.roles = params.roles;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.updatedFields = params.updatedFields;
  }
}

/**
 * Published when a user is deleted from the system
 *
 * Triggers:
 * - Admin deletes user
 * - User account closure
 * - Data retention policy enforcement
 *
 * Consumers:
 * - Session service (invalidate sessions)
 * - Search index (remove user data)
 * - Audit service (log deletion)
 *
 * Note: This may be a soft delete in the database but published
 * as a deletion event for downstream consumers.
 */
export class UserDeleted extends DomainEvent {
  public readonly userId: UUID;
  public readonly email: string;
  public readonly organizationId: OrganizationId;
  public readonly clinicId?: ClinicId;
  public readonly deletedBy?: UUID;
  public readonly reason?: string;

  constructor(params: {
    aggregateId: UUID;
    userId: UUID;
    email: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    deletedBy?: UUID;
    reason?: string;
  }) {
    super('UserDeleted', params.aggregateId, 1);
    this.userId = params.userId;
    this.email = params.email;
    this.organizationId = params.organizationId;
    this.clinicId = params.clinicId;
    this.deletedBy = params.deletedBy;
    this.reason = params.reason;
  }
}

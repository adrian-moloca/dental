import { UUID, UserRole, Permission, OrganizationId, ClinicId, TenantId, Email } from '@dentalos/shared-types';
import type { JwtSubscriptionContext } from '../jwt/jwt-payload.types';
export interface CurrentUser {
    readonly userId: UUID;
    readonly email: Email;
    readonly roles: readonly UserRole[];
    readonly permissions: readonly Permission[];
    readonly cabinetId?: UUID;
    readonly subscription?: JwtSubscriptionContext;
    readonly tenantContext: {
        readonly organizationId: OrganizationId;
        readonly clinicId?: ClinicId;
        readonly cabinetId?: UUID;
        readonly tenantId: TenantId;
    };
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly tenantId: TenantId;
}
export declare function createCurrentUser(params: {
    userId: UUID;
    email: Email;
    roles: UserRole[];
    permissions: Permission[];
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    cabinetId?: UUID;
    subscription?: JwtSubscriptionContext;
}): CurrentUser;

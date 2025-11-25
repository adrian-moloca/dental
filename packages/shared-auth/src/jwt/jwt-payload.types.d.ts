import { UUID, UserRole, OrganizationId, ClinicId, Email } from '@dentalos/shared-types';
export declare enum SubscriptionStatus {
    TRIAL = "TRIAL",
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    SUSPENDED = "SUSPENDED",
    CANCELLED = "CANCELLED"
}
export declare enum ModuleCode {
    SCHEDULING = "scheduling",
    PATIENT_MANAGEMENT = "patient_management",
    CLINICAL_BASIC = "clinical_basic",
    BILLING_BASIC = "billing_basic",
    CLINICAL_ADVANCED = "clinical_advanced",
    IMAGING = "imaging",
    INVENTORY = "inventory",
    MARKETING = "marketing",
    INSURANCE = "insurance",
    TELEDENTISTRY = "teledentistry",
    ANALYTICS_ADVANCED = "analytics_advanced",
    MULTI_LOCATION = "multi_location"
}
export interface JwtSubscriptionContext {
    readonly status: SubscriptionStatus;
    readonly modules: readonly ModuleCode[];
}
export interface AccessTokenPayload {
    readonly sub: UUID;
    readonly email: Email;
    readonly roles: readonly UserRole[];
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly sessionId: UUID;
    readonly jti: string;
    readonly cabinetId?: UUID;
    readonly subscription?: JwtSubscriptionContext;
    readonly iat: number;
    readonly exp: number;
    readonly iss: string;
    readonly aud?: string | string[];
}
export interface RefreshTokenPayload {
    readonly sub: UUID;
    readonly sessionId: UUID;
    readonly iat: number;
    readonly exp: number;
    readonly iss: string;
    readonly aud?: string | string[];
    readonly jti?: string;
}
export interface BaseJWTPayload {
    readonly iat: number;
    readonly exp: number;
    readonly iss: string;
}

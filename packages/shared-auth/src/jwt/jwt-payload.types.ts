/**
 * JWT payload type definitions for authentication tokens
 * @module shared-auth/jwt/payload-types
 */

import {
  UUID,
  UserRole,
  OrganizationId,
  ClinicId,
  Email,
} from '@dentalos/shared-types';

/**
 * Subscription status enumeration (mirrored from backend-subscription-service)
 */
export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

/**
 * Module code enumeration (mirrored from backend-subscription-service)
 */
export enum ModuleCode {
  // Core Modules
  SCHEDULING = 'scheduling',
  PATIENT_MANAGEMENT = 'patient_management',
  CLINICAL_BASIC = 'clinical_basic',
  BILLING_BASIC = 'billing_basic',
  // Premium Modules
  CLINICAL_ADVANCED = 'clinical_advanced',
  IMAGING = 'imaging',
  INVENTORY = 'inventory',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TELEDENTISTRY = 'teledentistry',
  ANALYTICS_ADVANCED = 'analytics_advanced',
  MULTI_LOCATION = 'multi_location',
}

/**
 * Subscription context embedded in JWT payload
 * Provides quick access to subscription status and enabled modules
 */
export interface JwtSubscriptionContext {
  /** Current subscription status */
  readonly status: SubscriptionStatus;

  /** Array of enabled module codes for quick permission checks */
  readonly modules: readonly ModuleCode[];
}

/**
 * Access token payload
 * Contains user identity, roles, tenant context, and subscription information
 * Used for authenticating API requests
 */
export interface AccessTokenPayload {
  /** User ID (JWT standard 'sub' claim) */
  readonly sub: UUID;

  /** User email address */
  readonly email: Email;

  /** User roles in the system */
  readonly roles: readonly UserRole[];

  /** User permissions (string array like ["*:*", "patients:read"]) */
  readonly permissions?: readonly string[];

  /** Organization ID (tenant context) */
  readonly organizationId: OrganizationId;

  /** Optional clinic ID (clinic-level tenant context) */
  readonly clinicId?: ClinicId;

  /**
   * Session identifier for token revocation support
   * REQUIRED for session validation and revocation
   * Allows immediate token invalidation when user logs out or switches context
   */
  readonly sessionId: UUID;

  /**
   * JWT ID (unique identifier for this specific token)
   * REQUIRED for token blacklisting during cabinet switches
   * Format: UUID v4
   */
  readonly jti: string;

  /**
   * Cabinet ID (dental practice/location identifier) - OPTIONAL for backward compatibility
   * Represents the primary cabinet this user belongs to
   */
  readonly cabinetId?: UUID;

  /**
   * Subscription context for quick access control
   * Contains subscription status and enabled module codes
   * OPTIONAL for backward compatibility
   */
  readonly subscription?: JwtSubscriptionContext;

  /** Issued at timestamp (Unix epoch seconds) */
  readonly iat: number;

  /** Expiration timestamp (Unix epoch seconds) */
  readonly exp: number;

  /** Issuer identifier */
  readonly iss: string;

  /** Optional audience claim */
  readonly aud?: string | string[];
}

/**
 * Refresh token payload
 * Minimal payload for session refresh
 * Does not contain sensitive user data
 */
export interface RefreshTokenPayload {
  /** User ID (JWT standard 'sub' claim) */
  readonly sub: UUID;

  /** Session identifier for tracking and revocation */
  readonly sessionId: UUID;

  /** Issued at timestamp (Unix epoch seconds) */
  readonly iat: number;

  /** Expiration timestamp (Unix epoch seconds) */
  readonly exp: number;

  /** Issuer identifier */
  readonly iss: string;

  /** Optional audience claim */
  readonly aud?: string | string[];

  /** Optional JWT ID for tracking */
  readonly jti?: string;
}

/**
 * Base JWT payload interface
 * Common fields across all token types
 */
export interface BaseJWTPayload {
  /** Issued at timestamp (Unix epoch seconds) */
  readonly iat: number;

  /** Expiration timestamp (Unix epoch seconds) */
  readonly exp: number;

  /** Issuer identifier */
  readonly iss: string;
}

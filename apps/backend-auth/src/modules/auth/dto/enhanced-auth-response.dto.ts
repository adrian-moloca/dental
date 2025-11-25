/**
 * Enhanced Authentication Response DTOs
 *
 * DTOs for authentication responses that include cabinet and subscription context.
 * Used in Phase 2 login flow where users select a cabinet and subscription data
 * is included in the JWT token.
 *
 * @module modules/auth/dto
 */

import { z } from 'zod';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Cabinet summary included in login response
 */
export const CabinetSummarySchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  code: z.string().optional(),
  isDefault: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'PENDING']),
});

export type CabinetSummaryDto = z.infer<typeof CabinetSummarySchema>;

/**
 * Subscription module summary included in login response
 */
export const SubscriptionModuleSummarySchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  moduleCode: z.string().optional(),
  moduleName: z.string().optional(),
  isActive: z.boolean(),
  isCore: z.boolean(),
});

export type SubscriptionModuleSummaryDto = z.infer<typeof SubscriptionModuleSummarySchema>;

/**
 * Subscription summary included in login response
 */
export const SubscriptionSummarySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  isTrial: z.boolean().optional(),
  isTrialExpired: z.boolean().optional(),
  trialEndsAt: z.date().optional(),
  activeModuleCount: z.number().optional(),
  modules: z.array(SubscriptionModuleSummarySchema).optional(),
});

export type SubscriptionSummaryDto = z.infer<typeof SubscriptionSummarySchema>;

/**
 * Enhanced login response with cabinet and subscription
 * Used when user successfully logs in and has selected/been assigned a cabinet
 */
export interface EnhancedAuthResponseDto {
  /** Access token (JWT) - includes subscription context */
  readonly accessToken: string;

  /** Refresh token for obtaining new access tokens */
  readonly refreshToken: string;

  /** Access token expiration timestamp (ISO 8601) */
  readonly expiresAt: Date;

  /** User information */
  readonly user: {
    readonly id: UUID;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly roles: readonly string[];
    readonly organizationId: OrganizationId;
  };

  /** Selected cabinet information */
  readonly cabinet: CabinetSummaryDto;

  /** Subscription information for the selected cabinet */
  readonly subscription: SubscriptionSummaryDto | null;
}

/**
 * Login response when user needs to select a cabinet
 * Used when user has multiple cabinets and hasn't selected one yet
 */
export interface CabinetSelectionRequiredDto {
  /** Temporary token for cabinet selection (short-lived) */
  readonly selectionToken: string;

  /** Token expiration time */
  readonly expiresAt: Date;

  /** User information */
  readonly user: {
    readonly id: UUID;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly organizationId: OrganizationId;
  };

  /** Available cabinets user can select from */
  readonly cabinets: readonly CabinetSummaryDto[];

  /** Indicator that cabinet selection is required */
  readonly requiresCabinetSelection: true;
}

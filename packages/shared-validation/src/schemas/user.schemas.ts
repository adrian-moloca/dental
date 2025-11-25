/**
 * User entity validation schemas
 * @module shared-validation/schemas/user
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  PasswordSchema,
  UserRoleSchema,
  UserStatusSchema,
  PermissionSchema,
} from './common.schemas';

// ============================================================================
// User Profile Schema
// ============================================================================

/**
 * User profile information schema
 */
export const UserProfileSchema = z.object({
  firstName: NonEmptyStringSchema.max(100, 'First name must be 100 characters or less'),
  lastName: NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less'),
  displayName: z.string().max(200, 'Display name must be 200 characters or less').optional(),
  photoUrl: z.string().url('Must be a valid photo URL').optional(),
  title: z.string().max(100, 'Title must be 100 characters or less').optional(),
  licenseNumber: z.string().max(50, 'License number must be 50 characters or less').optional(),
  licenseExpiresAt: ISODateStringSchema.optional(),
  phoneNumber: PhoneNumberSchema.optional(),
  dateOfBirth: ISODateStringSchema.optional(),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
});

// ============================================================================
// User Authentication Schema
// ============================================================================

/**
 * User authentication information schema
 */
export const UserAuthSchema = z.object({
  email: EmailSchema,
  emailVerified: z.boolean().default(false),
  passwordHash: z.string().optional(),
  mfaEnabled: z.boolean().default(false),
  mfaSecret: z.string().optional(),
  lastLoginAt: ISODateStringSchema.nullable().optional(),
  failedLoginAttempts: z.number().int().nonnegative().default(0),
  lockedUntil: ISODateStringSchema.nullable().optional(),
  passwordChangedAt: ISODateStringSchema.optional(),
});

// ============================================================================
// User Entity Schema
// ============================================================================

/**
 * Complete user entity schema
 * Validates full user object with profile, auth, and tenant context
 */
export const UserSchema = z.object({
  id: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.nullable().optional(),
  profile: UserProfileSchema,
  auth: UserAuthSchema,
  role: UserRoleSchema,
  additionalRoles: z.array(UserRoleSchema).optional(),
  status: UserStatusSchema,
  clinicIds: z.array(UUIDSchema).default([]),
  preferences: z.record(z.unknown()).optional(),
  customPermissions: z.array(PermissionSchema).optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  deletedAt: ISODateStringSchema.nullable().optional(),
  createdBy: UUIDSchema.optional(),
  updatedBy: UUIDSchema.optional(),
  deletedBy: UUIDSchema.nullable().optional(),
  version: z.number().int().nonnegative().default(1),
});

// ============================================================================
// User Session Schema
// ============================================================================

/**
 * User session information schema
 */
export const UserSessionSchema = z.object({
  sessionId: UUIDSchema,
  userId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  role: UserRoleSchema,
  createdAt: ISODateStringSchema,
  expiresAt: ISODateStringSchema,
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
});

// ============================================================================
// User Invitation Schema
// ============================================================================

/**
 * User invitation schema
 */
export const UserInvitationSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  role: UserRoleSchema,
  organizationId: UUIDSchema,
  clinicIds: z.array(UUIDSchema),
  invitedBy: UUIDSchema,
  invitedAt: ISODateStringSchema,
  expiresAt: ISODateStringSchema,
  acceptedAt: ISODateStringSchema.nullable().optional(),
  status: z.enum(['pending', 'accepted', 'expired', 'revoked'], {
    errorMap: (): { message: string } => ({ message: 'Invalid invitation status' }),
  }),
});

// ============================================================================
// Password Validation Schemas
// ============================================================================

/**
 * Change password request schema
 * Validates current and new password for password change
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data): boolean => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data): boolean => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

/**
 * Reset password request schema
 * Validates password reset with token
 */
export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data): boolean => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Login credentials schema
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().length(6, 'MFA code must be 6 digits').optional(),
  organizationId: UUIDSchema.optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type UserProfileInput = z.input<typeof UserProfileSchema>;
export type UserProfileOutput = z.output<typeof UserProfileSchema>;
export type UserAuthInput = z.input<typeof UserAuthSchema>;
export type UserAuthOutput = z.output<typeof UserAuthSchema>;
export type UserInput = z.input<typeof UserSchema>;
export type UserOutput = z.output<typeof UserSchema>;
export type UserSessionInput = z.input<typeof UserSessionSchema>;
export type UserSessionOutput = z.output<typeof UserSessionSchema>;
export type UserInvitationInput = z.input<typeof UserInvitationSchema>;
export type UserInvitationOutput = z.output<typeof UserInvitationSchema>;
export type ChangePasswordInput = z.input<typeof ChangePasswordSchema>;
export type ChangePasswordOutput = z.output<typeof ChangePasswordSchema>;
export type ResetPasswordInput = z.input<typeof ResetPasswordSchema>;
export type ResetPasswordOutput = z.output<typeof ResetPasswordSchema>;
export type LoginInput = z.input<typeof LoginSchema>;
export type LoginOutput = z.output<typeof LoginSchema>;

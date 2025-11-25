/**
 * User DTO validation schemas
 * @module shared-validation/dto/user
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  PasswordSchema,
  UserRoleSchema,
  UserStatusSchema,
  PermissionSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
} from '../schemas/common.schemas';

// ============================================================================
// Create User DTO
// ============================================================================

/**
 * Create user DTO schema
 * Required fields for creating a new user
 */
export const CreateUserDtoSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  firstName: NonEmptyStringSchema.max(100, 'First name must be 100 characters or less'),
  lastName: NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less'),
  role: UserRoleSchema,
  organizationId: UUIDSchema,
  clinicIds: z.array(UUIDSchema).default([]),
  phoneNumber: PhoneNumberSchema.optional(),
  title: z.string().max(100, 'Title must be 100 characters or less').optional(),
  sendInvitation: z.boolean().default(true),
});

// ============================================================================
// Update User DTO
// ============================================================================

/**
 * Update user DTO schema
 * Partial update - all fields optional except those being updated
 */
export const UpdateUserDtoSchema = z.object({
  firstName: NonEmptyStringSchema.max(100, 'First name must be 100 characters or less').optional(),
  lastName: NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less').optional(),
  displayName: z.string().max(200, 'Display name must be 200 characters or less').optional(),
  phoneNumber: PhoneNumberSchema.optional(),
  title: z.string().max(100, 'Title must be 100 characters or less').optional(),
  photoUrl: z.string().url('Must be a valid photo URL').optional(),
  licenseNumber: z.string().max(50, 'License number must be 50 characters or less').optional(),
  licenseExpiresAt: ISODateStringSchema.optional(),
  dateOfBirth: ISODateStringSchema.optional(),
  bio: z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
  role: UserRoleSchema.optional(),
  additionalRoles: z.array(UserRoleSchema).optional(),
  status: UserStatusSchema.optional(),
  clinicIds: z.array(UUIDSchema).optional(),
  preferences: z.record(z.unknown()).optional(),
  customPermissions: z.array(PermissionSchema).optional(),
});

// ============================================================================
// User Response DTO
// ============================================================================

/**
 * User response DTO schema
 * Excludes sensitive authentication data
 */
export const UserResponseDtoSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema,
  emailVerified: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string().optional(),
  photoUrl: z.string().optional(),
  title: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: UserRoleSchema,
  additionalRoles: z.array(UserRoleSchema).optional(),
  status: UserStatusSchema,
  organizationId: UUIDSchema,
  clinicIds: z.array(UUIDSchema),
  mfaEnabled: z.boolean(),
  lastLoginAt: ISODateStringSchema.nullable().optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

// ============================================================================
// Change Password DTO
// ============================================================================

/**
 * Change password DTO schema
 */
export const ChangePasswordDtoSchema = z
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

// ============================================================================
// Reset Password DTO
// ============================================================================

/**
 * Request password reset DTO schema
 */
export const RequestPasswordResetDtoSchema = z.object({
  email: EmailSchema,
  organizationId: UUIDSchema.optional(),
});

/**
 * Reset password DTO schema
 */
export const ResetPasswordDtoSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data): boolean => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// Login DTO
// ============================================================================

/**
 * Login credentials DTO schema
 */
export const LoginDtoSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().length(6, 'MFA code must be 6 digits').optional(),
  organizationId: UUIDSchema.optional(),
  rememberMe: z.boolean().default(false),
});

/**
 * Login response DTO schema
 */
export const LoginResponseDtoSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
  user: UserResponseDtoSchema,
});

// ============================================================================
// Refresh Token DTO
// ============================================================================

/**
 * Refresh token DTO schema
 */
export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================================================
// Verify Email DTO
// ============================================================================

/**
 * Verify email DTO schema
 */
export const VerifyEmailDtoSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Resend verification email DTO schema
 */
export const ResendVerificationEmailDtoSchema = z.object({
  email: EmailSchema,
});

// ============================================================================
// Invite User DTO
// ============================================================================

/**
 * Invite user DTO schema
 */
export const InviteUserDtoSchema = z.object({
  email: EmailSchema,
  role: UserRoleSchema,
  clinicIds: z.array(UUIDSchema).default([]),
  firstName: z.string().max(100, 'First name must be 100 characters or less').optional(),
  lastName: z.string().max(100, 'Last name must be 100 characters or less').optional(),
  message: z.string().max(500, 'Message must be 500 characters or less').optional(),
});

/**
 * Accept invitation DTO schema
 */
export const AcceptInvitationDtoSchema = z
  .object({
    token: z.string().min(1, 'Invitation token is required'),
    firstName: NonEmptyStringSchema.max(100, 'First name must be 100 characters or less'),
    lastName: NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less'),
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data): boolean => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// User Query DTO
// ============================================================================

/**
 * User query parameters DTO schema
 */
export const UserQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['email', 'firstName', 'lastName', 'createdAt', 'lastLoginAt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  clinicId: UUIDSchema.optional(),
  search: z.string().trim().optional(),
});

// ============================================================================
// Update User Status DTO
// ============================================================================

/**
 * Update user status DTO schema
 */
export const UpdateUserStatusDtoSchema = z.object({
  status: UserStatusSchema,
  reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type CreateUserDtoInput = z.input<typeof CreateUserDtoSchema>;
export type CreateUserDtoOutput = z.output<typeof CreateUserDtoSchema>;
export type UpdateUserDtoInput = z.input<typeof UpdateUserDtoSchema>;
export type UpdateUserDtoOutput = z.output<typeof UpdateUserDtoSchema>;
export type UserResponseDtoInput = z.input<typeof UserResponseDtoSchema>;
export type UserResponseDtoOutput = z.output<typeof UserResponseDtoSchema>;
export type ChangePasswordDtoInput = z.input<typeof ChangePasswordDtoSchema>;
export type ChangePasswordDtoOutput = z.output<typeof ChangePasswordDtoSchema>;
export type RequestPasswordResetDtoInput = z.input<typeof RequestPasswordResetDtoSchema>;
export type RequestPasswordResetDtoOutput = z.output<typeof RequestPasswordResetDtoSchema>;
export type ResetPasswordDtoInput = z.input<typeof ResetPasswordDtoSchema>;
export type ResetPasswordDtoOutput = z.output<typeof ResetPasswordDtoSchema>;
export type LoginDtoInput = z.input<typeof LoginDtoSchema>;
export type LoginDtoOutput = z.output<typeof LoginDtoSchema>;
export type LoginResponseDtoInput = z.input<typeof LoginResponseDtoSchema>;
export type LoginResponseDtoOutput = z.output<typeof LoginResponseDtoSchema>;
export type RefreshTokenDtoInput = z.input<typeof RefreshTokenDtoSchema>;
export type RefreshTokenDtoOutput = z.output<typeof RefreshTokenDtoSchema>;
export type VerifyEmailDtoInput = z.input<typeof VerifyEmailDtoSchema>;
export type VerifyEmailDtoOutput = z.output<typeof VerifyEmailDtoSchema>;
export type ResendVerificationEmailDtoInput = z.input<typeof ResendVerificationEmailDtoSchema>;
export type ResendVerificationEmailDtoOutput = z.output<typeof ResendVerificationEmailDtoSchema>;
export type InviteUserDtoInput = z.input<typeof InviteUserDtoSchema>;
export type InviteUserDtoOutput = z.output<typeof InviteUserDtoSchema>;
export type AcceptInvitationDtoInput = z.input<typeof AcceptInvitationDtoSchema>;
export type AcceptInvitationDtoOutput = z.output<typeof AcceptInvitationDtoSchema>;
export type UserQueryParamsInput = z.input<typeof UserQueryParamsSchema>;
export type UserQueryParamsOutput = z.output<typeof UserQueryParamsSchema>;
export type UpdateUserStatusDtoInput = z.input<typeof UpdateUserStatusDtoSchema>;
export type UpdateUserStatusDtoOutput = z.output<typeof UpdateUserStatusDtoSchema>;

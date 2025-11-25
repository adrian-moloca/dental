"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserStatusDtoSchema = exports.UserQueryParamsSchema = exports.AcceptInvitationDtoSchema = exports.InviteUserDtoSchema = exports.ResendVerificationEmailDtoSchema = exports.VerifyEmailDtoSchema = exports.RefreshTokenDtoSchema = exports.LoginResponseDtoSchema = exports.LoginDtoSchema = exports.ResetPasswordDtoSchema = exports.RequestPasswordResetDtoSchema = exports.ChangePasswordDtoSchema = exports.UserResponseDtoSchema = exports.UpdateUserDtoSchema = exports.CreateUserDtoSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../schemas/common.schemas");
exports.CreateUserDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    password: common_schemas_1.PasswordSchema,
    firstName: common_schemas_1.NonEmptyStringSchema.max(100, 'First name must be 100 characters or less'),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less'),
    role: common_schemas_1.UserRoleSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).default([]),
    phoneNumber: common_schemas_1.PhoneNumberSchema.optional(),
    title: zod_1.z.string().max(100, 'Title must be 100 characters or less').optional(),
    sendInvitation: zod_1.z.boolean().default(true),
});
exports.UpdateUserDtoSchema = zod_1.z.object({
    firstName: common_schemas_1.NonEmptyStringSchema.max(100, 'First name must be 100 characters or less').optional(),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less').optional(),
    displayName: zod_1.z.string().max(200, 'Display name must be 200 characters or less').optional(),
    phoneNumber: common_schemas_1.PhoneNumberSchema.optional(),
    title: zod_1.z.string().max(100, 'Title must be 100 characters or less').optional(),
    photoUrl: zod_1.z.string().url('Must be a valid photo URL').optional(),
    licenseNumber: zod_1.z.string().max(50, 'License number must be 50 characters or less').optional(),
    licenseExpiresAt: common_schemas_1.ISODateStringSchema.optional(),
    dateOfBirth: common_schemas_1.ISODateStringSchema.optional(),
    bio: zod_1.z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
    role: common_schemas_1.UserRoleSchema.optional(),
    additionalRoles: zod_1.z.array(common_schemas_1.UserRoleSchema).optional(),
    status: common_schemas_1.UserStatusSchema.optional(),
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    preferences: zod_1.z.record(zod_1.z.unknown()).optional(),
    customPermissions: zod_1.z.array(common_schemas_1.PermissionSchema).optional(),
});
exports.UserResponseDtoSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    email: common_schemas_1.EmailSchema,
    emailVerified: zod_1.z.boolean(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    displayName: zod_1.z.string().optional(),
    photoUrl: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    role: common_schemas_1.UserRoleSchema,
    additionalRoles: zod_1.z.array(common_schemas_1.UserRoleSchema).optional(),
    status: common_schemas_1.UserStatusSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema),
    mfaEnabled: zod_1.z.boolean(),
    lastLoginAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
});
exports.ChangePasswordDtoSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: common_schemas_1.PasswordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
});
exports.RequestPasswordResetDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    organizationId: common_schemas_1.UUIDSchema.optional(),
});
exports.ResetPasswordDtoSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: common_schemas_1.PasswordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.LoginDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
    mfaCode: zod_1.z.string().length(6, 'MFA code must be 6 digits').optional(),
    organizationId: common_schemas_1.UUIDSchema.optional(),
    rememberMe: zod_1.z.boolean().default(false),
});
exports.LoginResponseDtoSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.number().int().positive(),
    tokenType: zod_1.z.literal('Bearer'),
    user: exports.UserResponseDtoSchema,
});
exports.RefreshTokenDtoSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.VerifyEmailDtoSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Verification token is required'),
});
exports.ResendVerificationEmailDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
});
exports.InviteUserDtoSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    role: common_schemas_1.UserRoleSchema,
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).default([]),
    firstName: zod_1.z.string().max(100, 'First name must be 100 characters or less').optional(),
    lastName: zod_1.z.string().max(100, 'Last name must be 100 characters or less').optional(),
    message: zod_1.z.string().max(500, 'Message must be 500 characters or less').optional(),
});
exports.AcceptInvitationDtoSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Invitation token is required'),
    firstName: common_schemas_1.NonEmptyStringSchema.max(100, 'First name must be 100 characters or less'),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less'),
    password: common_schemas_1.PasswordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.UserQueryParamsSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    sortBy: zod_1.z.enum(['email', 'firstName', 'lastName', 'createdAt', 'lastLoginAt']).default('createdAt').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
    role: common_schemas_1.UserRoleSchema.optional(),
    status: common_schemas_1.UserStatusSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    search: zod_1.z.string().trim().optional(),
});
exports.UpdateUserStatusDtoSchema = zod_1.z.object({
    status: common_schemas_1.UserStatusSchema,
    reason: zod_1.z.string().max(500, 'Reason must be 500 characters or less').optional(),
});
//# sourceMappingURL=user.dto.js.map
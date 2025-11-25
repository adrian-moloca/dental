"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.ResetPasswordSchema = exports.ChangePasswordSchema = exports.UserInvitationSchema = exports.UserSessionSchema = exports.UserSchema = exports.UserAuthSchema = exports.UserProfileSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("./common.schemas");
exports.UserProfileSchema = zod_1.z.object({
    firstName: common_schemas_1.NonEmptyStringSchema.max(100, 'First name must be 100 characters or less'),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100, 'Last name must be 100 characters or less'),
    displayName: zod_1.z.string().max(200, 'Display name must be 200 characters or less').optional(),
    photoUrl: zod_1.z.string().url('Must be a valid photo URL').optional(),
    title: zod_1.z.string().max(100, 'Title must be 100 characters or less').optional(),
    licenseNumber: zod_1.z.string().max(50, 'License number must be 50 characters or less').optional(),
    licenseExpiresAt: common_schemas_1.ISODateStringSchema.optional(),
    phoneNumber: common_schemas_1.PhoneNumberSchema.optional(),
    dateOfBirth: common_schemas_1.ISODateStringSchema.optional(),
    bio: zod_1.z.string().max(1000, 'Bio must be 1000 characters or less').optional(),
});
exports.UserAuthSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    emailVerified: zod_1.z.boolean().default(false),
    passwordHash: zod_1.z.string().optional(),
    mfaEnabled: zod_1.z.boolean().default(false),
    mfaSecret: zod_1.z.string().optional(),
    lastLoginAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    failedLoginAttempts: zod_1.z.number().int().nonnegative().default(0),
    lockedUntil: common_schemas_1.ISODateStringSchema.nullable().optional(),
    passwordChangedAt: common_schemas_1.ISODateStringSchema.optional(),
});
exports.UserSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.nullable().optional(),
    profile: exports.UserProfileSchema,
    auth: exports.UserAuthSchema,
    role: common_schemas_1.UserRoleSchema,
    additionalRoles: zod_1.z.array(common_schemas_1.UserRoleSchema).optional(),
    status: common_schemas_1.UserStatusSchema,
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).default([]),
    preferences: zod_1.z.record(zod_1.z.unknown()).optional(),
    customPermissions: zod_1.z.array(common_schemas_1.PermissionSchema).optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    deletedAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    createdBy: common_schemas_1.UUIDSchema.optional(),
    updatedBy: common_schemas_1.UUIDSchema.optional(),
    deletedBy: common_schemas_1.UUIDSchema.nullable().optional(),
    version: zod_1.z.number().int().nonnegative().default(1),
});
exports.UserSessionSchema = zod_1.z.object({
    sessionId: common_schemas_1.UUIDSchema,
    userId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    role: common_schemas_1.UserRoleSchema,
    createdAt: common_schemas_1.ISODateStringSchema,
    expiresAt: common_schemas_1.ISODateStringSchema,
    ipAddress: zod_1.z.string().ip().optional(),
    userAgent: zod_1.z.string().optional(),
});
exports.UserInvitationSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    email: common_schemas_1.EmailSchema,
    role: common_schemas_1.UserRoleSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema),
    invitedBy: common_schemas_1.UUIDSchema,
    invitedAt: common_schemas_1.ISODateStringSchema,
    expiresAt: common_schemas_1.ISODateStringSchema,
    acceptedAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    status: zod_1.z.enum(['pending', 'accepted', 'expired', 'revoked'], {
        errorMap: () => ({ message: 'Invalid invitation status' }),
    }),
});
exports.ChangePasswordSchema = zod_1.z
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
exports.ResetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: common_schemas_1.PasswordSchema,
    confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required'),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.LoginSchema = zod_1.z.object({
    email: common_schemas_1.EmailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
    mfaCode: zod_1.z.string().length(6, 'MFA code must be 6 digits').optional(),
    organizationId: common_schemas_1.UUIDSchema.optional(),
});
//# sourceMappingURL=user.schemas.js.map
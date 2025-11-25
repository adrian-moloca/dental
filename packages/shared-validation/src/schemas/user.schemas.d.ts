import { z } from 'zod';
export declare const UserProfileSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseExpiresAt: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phoneNumber?: string | undefined;
    title?: string | undefined;
    displayName?: string | undefined;
    photoUrl?: string | undefined;
    licenseNumber?: string | undefined;
    licenseExpiresAt?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    phoneNumber?: string | undefined;
    title?: string | undefined;
    displayName?: string | undefined;
    photoUrl?: string | undefined;
    licenseNumber?: string | undefined;
    licenseExpiresAt?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
}>;
export declare const UserAuthSchema: z.ZodObject<{
    email: z.ZodString;
    emailVerified: z.ZodDefault<z.ZodBoolean>;
    passwordHash: z.ZodOptional<z.ZodString>;
    mfaEnabled: z.ZodDefault<z.ZodBoolean>;
    mfaSecret: z.ZodOptional<z.ZodString>;
    lastLoginAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    failedLoginAttempts: z.ZodDefault<z.ZodNumber>;
    lockedUntil: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    passwordChangedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    emailVerified: boolean;
    mfaEnabled: boolean;
    failedLoginAttempts: number;
    lastLoginAt?: string | null | undefined;
    passwordHash?: string | undefined;
    mfaSecret?: string | undefined;
    lockedUntil?: string | null | undefined;
    passwordChangedAt?: string | undefined;
}, {
    email: string;
    emailVerified?: boolean | undefined;
    mfaEnabled?: boolean | undefined;
    lastLoginAt?: string | null | undefined;
    passwordHash?: string | undefined;
    mfaSecret?: string | undefined;
    failedLoginAttempts?: number | undefined;
    lockedUntil?: string | null | undefined;
    passwordChangedAt?: string | undefined;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    profile: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        licenseNumber: z.ZodOptional<z.ZodString>;
        licenseExpiresAt: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        licenseNumber?: string | undefined;
        licenseExpiresAt?: string | undefined;
        dateOfBirth?: string | undefined;
        bio?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        licenseNumber?: string | undefined;
        licenseExpiresAt?: string | undefined;
        dateOfBirth?: string | undefined;
        bio?: string | undefined;
    }>;
    auth: z.ZodObject<{
        email: z.ZodString;
        emailVerified: z.ZodDefault<z.ZodBoolean>;
        passwordHash: z.ZodOptional<z.ZodString>;
        mfaEnabled: z.ZodDefault<z.ZodBoolean>;
        mfaSecret: z.ZodOptional<z.ZodString>;
        lastLoginAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        failedLoginAttempts: z.ZodDefault<z.ZodNumber>;
        lockedUntil: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        passwordChangedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        emailVerified: boolean;
        mfaEnabled: boolean;
        failedLoginAttempts: number;
        lastLoginAt?: string | null | undefined;
        passwordHash?: string | undefined;
        mfaSecret?: string | undefined;
        lockedUntil?: string | null | undefined;
        passwordChangedAt?: string | undefined;
    }, {
        email: string;
        emailVerified?: boolean | undefined;
        mfaEnabled?: boolean | undefined;
        lastLoginAt?: string | null | undefined;
        passwordHash?: string | undefined;
        mfaSecret?: string | undefined;
        failedLoginAttempts?: number | undefined;
        lockedUntil?: string | null | undefined;
        passwordChangedAt?: string | undefined;
    }>;
    role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
    additionalRoles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>, "many">>;
    status: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserStatus>;
    clinicIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    customPermissions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        resource: z.ZodNativeEnum<typeof import("@dentalos/shared-types").ResourceType>;
        action: z.ZodNativeEnum<typeof import("@dentalos/shared-types").PermissionAction>;
        constraints: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        resource: import("@dentalos/shared-types").ResourceType;
        action: import("@dentalos/shared-types").PermissionAction;
        constraints?: Record<string, unknown> | undefined;
    }, {
        resource: import("@dentalos/shared-types").ResourceType;
        action: import("@dentalos/shared-types").PermissionAction;
        constraints?: Record<string, unknown> | undefined;
    }>, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodOptional<z.ZodString>;
    updatedBy: z.ZodOptional<z.ZodString>;
    deletedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    version: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: import("@dentalos/shared-types").UserStatus;
    auth: {
        email: string;
        emailVerified: boolean;
        mfaEnabled: boolean;
        failedLoginAttempts: number;
        lastLoginAt?: string | null | undefined;
        passwordHash?: string | undefined;
        mfaSecret?: string | undefined;
        lockedUntil?: string | null | undefined;
        passwordChangedAt?: string | undefined;
    };
    organizationId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    profile: {
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        licenseNumber?: string | undefined;
        licenseExpiresAt?: string | undefined;
        dateOfBirth?: string | undefined;
        bio?: string | undefined;
    };
    clinicId?: string | null | undefined;
    additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
    preferences?: Record<string, unknown> | undefined;
    customPermissions?: {
        resource: import("@dentalos/shared-types").ResourceType;
        action: import("@dentalos/shared-types").PermissionAction;
        constraints?: Record<string, unknown> | undefined;
    }[] | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: import("@dentalos/shared-types").UserStatus;
    auth: {
        email: string;
        emailVerified?: boolean | undefined;
        mfaEnabled?: boolean | undefined;
        lastLoginAt?: string | null | undefined;
        passwordHash?: string | undefined;
        mfaSecret?: string | undefined;
        failedLoginAttempts?: number | undefined;
        lockedUntil?: string | null | undefined;
        passwordChangedAt?: string | undefined;
    };
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    role: import("@dentalos/shared-types").UserRole;
    profile: {
        firstName: string;
        lastName: string;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        licenseNumber?: string | undefined;
        licenseExpiresAt?: string | undefined;
        dateOfBirth?: string | undefined;
        bio?: string | undefined;
    };
    clinicId?: string | null | undefined;
    version?: number | undefined;
    clinicIds?: string[] | undefined;
    additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
    preferences?: Record<string, unknown> | undefined;
    customPermissions?: {
        resource: import("@dentalos/shared-types").ResourceType;
        action: import("@dentalos/shared-types").PermissionAction;
        constraints?: Record<string, unknown> | undefined;
    }[] | undefined;
    updatedBy?: string | undefined;
    createdBy?: string | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>;
export declare const UserSessionSchema: z.ZodObject<{
    sessionId: z.ZodString;
    userId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
    createdAt: z.ZodString;
    expiresAt: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    userId: string;
    createdAt: string;
    sessionId: string;
    expiresAt: string;
    role: import("@dentalos/shared-types").UserRole;
    userAgent?: string | undefined;
    clinicId?: string | undefined;
    ipAddress?: string | undefined;
}, {
    organizationId: string;
    userId: string;
    createdAt: string;
    sessionId: string;
    expiresAt: string;
    role: import("@dentalos/shared-types").UserRole;
    userAgent?: string | undefined;
    clinicId?: string | undefined;
    ipAddress?: string | undefined;
}>;
export declare const UserInvitationSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
    organizationId: z.ZodString;
    clinicIds: z.ZodArray<z.ZodString, "many">;
    invitedBy: z.ZodString;
    invitedAt: z.ZodString;
    expiresAt: z.ZodString;
    acceptedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<["pending", "accepted", "expired", "revoked"]>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "accepted" | "expired" | "revoked";
    organizationId: string;
    id: string;
    expiresAt: string;
    email: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    invitedBy: string;
    invitedAt: string;
    acceptedAt?: string | null | undefined;
}, {
    status: "pending" | "accepted" | "expired" | "revoked";
    organizationId: string;
    id: string;
    expiresAt: string;
    email: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    invitedBy: string;
    invitedAt: string;
    acceptedAt?: string | null | undefined;
}>;
export declare const ChangePasswordSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const ResetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}>, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}, {
    token: string;
    newPassword: string;
    confirmPassword: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    mfaCode: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    organizationId?: string | undefined;
    mfaCode?: string | undefined;
}, {
    password: string;
    email: string;
    organizationId?: string | undefined;
    mfaCode?: string | undefined;
}>;
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

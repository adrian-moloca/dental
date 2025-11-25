import { z } from 'zod';
export declare const CreateUserDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
    organizationId: z.ZodString;
    clinicIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    sendInvitation: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    password: string;
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    sendInvitation: boolean;
    phoneNumber?: string | undefined;
    title?: string | undefined;
}, {
    password: string;
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: import("@dentalos/shared-types").UserRole;
    phoneNumber?: string | undefined;
    clinicIds?: string[] | undefined;
    title?: string | undefined;
    sendInvitation?: boolean | undefined;
}>;
export declare const UpdateUserDtoSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    licenseExpiresAt: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>>;
    additionalRoles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>, "many">>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserStatus>>;
    clinicIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
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
}, "strip", z.ZodTypeAny, {
    status?: import("@dentalos/shared-types").UserStatus | undefined;
    phoneNumber?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: import("@dentalos/shared-types").UserRole | undefined;
    clinicIds?: string[] | undefined;
    title?: string | undefined;
    displayName?: string | undefined;
    photoUrl?: string | undefined;
    licenseNumber?: string | undefined;
    licenseExpiresAt?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
    additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
    preferences?: Record<string, unknown> | undefined;
    customPermissions?: {
        resource: import("@dentalos/shared-types").ResourceType;
        action: import("@dentalos/shared-types").PermissionAction;
        constraints?: Record<string, unknown> | undefined;
    }[] | undefined;
}, {
    status?: import("@dentalos/shared-types").UserStatus | undefined;
    phoneNumber?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: import("@dentalos/shared-types").UserRole | undefined;
    clinicIds?: string[] | undefined;
    title?: string | undefined;
    displayName?: string | undefined;
    photoUrl?: string | undefined;
    licenseNumber?: string | undefined;
    licenseExpiresAt?: string | undefined;
    dateOfBirth?: string | undefined;
    bio?: string | undefined;
    additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
    preferences?: Record<string, unknown> | undefined;
    customPermissions?: {
        resource: import("@dentalos/shared-types").ResourceType;
        action: import("@dentalos/shared-types").PermissionAction;
        constraints?: Record<string, unknown> | undefined;
    }[] | undefined;
}>;
export declare const UserResponseDtoSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    emailVerified: z.ZodBoolean;
    firstName: z.ZodString;
    lastName: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
    additionalRoles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>, "many">>;
    status: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserStatus>;
    organizationId: z.ZodString;
    clinicIds: z.ZodArray<z.ZodString, "many">;
    mfaEnabled: z.ZodBoolean;
    lastLoginAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: import("@dentalos/shared-types").UserStatus;
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    emailVerified: boolean;
    mfaEnabled: boolean;
    phoneNumber?: string | undefined;
    title?: string | undefined;
    displayName?: string | undefined;
    photoUrl?: string | undefined;
    additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
    lastLoginAt?: string | null | undefined;
}, {
    status: import("@dentalos/shared-types").UserStatus;
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    emailVerified: boolean;
    mfaEnabled: boolean;
    phoneNumber?: string | undefined;
    title?: string | undefined;
    displayName?: string | undefined;
    photoUrl?: string | undefined;
    additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
    lastLoginAt?: string | null | undefined;
}>;
export declare const ChangePasswordDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
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
export declare const RequestPasswordResetDtoSchema: z.ZodObject<{
    email: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    organizationId?: string | undefined;
}, {
    email: string;
    organizationId?: string | undefined;
}>;
export declare const ResetPasswordDtoSchema: z.ZodEffects<z.ZodObject<{
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
export declare const LoginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    mfaCode: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    rememberMe: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    rememberMe: boolean;
    organizationId?: string | undefined;
    mfaCode?: string | undefined;
}, {
    password: string;
    email: string;
    organizationId?: string | undefined;
    mfaCode?: string | undefined;
    rememberMe?: boolean | undefined;
}>;
export declare const LoginResponseDtoSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    expiresIn: z.ZodNumber;
    tokenType: z.ZodLiteral<"Bearer">;
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        emailVerified: z.ZodBoolean;
        firstName: z.ZodString;
        lastName: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
        role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
        additionalRoles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>, "many">>;
        status: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserStatus>;
        organizationId: z.ZodString;
        clinicIds: z.ZodArray<z.ZodString, "many">;
        mfaEnabled: z.ZodBoolean;
        lastLoginAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: import("@dentalos/shared-types").UserStatus;
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@dentalos/shared-types").UserRole;
        clinicIds: string[];
        emailVerified: boolean;
        mfaEnabled: boolean;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
        lastLoginAt?: string | null | undefined;
    }, {
        status: import("@dentalos/shared-types").UserStatus;
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@dentalos/shared-types").UserRole;
        clinicIds: string[];
        emailVerified: boolean;
        mfaEnabled: boolean;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
        lastLoginAt?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    user: {
        status: import("@dentalos/shared-types").UserStatus;
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@dentalos/shared-types").UserRole;
        clinicIds: string[];
        emailVerified: boolean;
        mfaEnabled: boolean;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
        lastLoginAt?: string | null | undefined;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}, {
    user: {
        status: import("@dentalos/shared-types").UserStatus;
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@dentalos/shared-types").UserRole;
        clinicIds: string[];
        emailVerified: boolean;
        mfaEnabled: boolean;
        phoneNumber?: string | undefined;
        title?: string | undefined;
        displayName?: string | undefined;
        photoUrl?: string | undefined;
        additionalRoles?: import("@dentalos/shared-types").UserRole[] | undefined;
        lastLoginAt?: string | null | undefined;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: "Bearer";
}>;
export declare const RefreshTokenDtoSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const VerifyEmailDtoSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const ResendVerificationEmailDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const InviteUserDtoSchema: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>;
    clinicIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: import("@dentalos/shared-types").UserRole;
    clinicIds: string[];
    message?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
}, {
    email: string;
    role: import("@dentalos/shared-types").UserRole;
    message?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    clinicIds?: string[] | undefined;
}>;
export declare const AcceptInvitationDtoSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    password: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
}, {
    password: string;
    token: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
}>, {
    password: string;
    token: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
}, {
    password: string;
    token: string;
    firstName: string;
    lastName: string;
    confirmPassword: string;
}>;
export declare const UserQueryParamsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<["email", "firstName", "lastName", "createdAt", "lastLoginAt"]>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserRole>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserStatus>>;
    clinicId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: import("@dentalos/shared-types").UserStatus | undefined;
    clinicId?: string | undefined;
    search?: string | undefined;
    sortBy?: "createdAt" | "email" | "firstName" | "lastName" | "lastLoginAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    role?: import("@dentalos/shared-types").UserRole | undefined;
}, {
    status?: import("@dentalos/shared-types").UserStatus | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "email" | "firstName" | "lastName" | "lastLoginAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    role?: import("@dentalos/shared-types").UserRole | undefined;
}>;
export declare const UpdateUserStatusDtoSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof import("@dentalos/shared-types").UserStatus>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: import("@dentalos/shared-types").UserStatus;
    reason?: string | undefined;
}, {
    status: import("@dentalos/shared-types").UserStatus;
    reason?: string | undefined;
}>;
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

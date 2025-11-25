"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataSchema = exports.SortOrderSchema = exports.PermissionSchema = exports.EntityStatusSchema = exports.TenantIsolationPolicySchema = exports.TenantTypeSchema = exports.TimeZoneSchema = exports.LanguageCodeSchema = exports.CurrencyCodeSchema = exports.DayOfWeekSchema = exports.RecurrencePatternSchema = exports.DocumentTypeSchema = exports.NotificationChannelSchema = exports.NotificationTypeSchema = exports.ContactMethodSchema = exports.MaritalStatusSchema = exports.GenderSchema = exports.PrioritySchema = exports.PaymentStatusSchema = exports.ApprovalStatusSchema = exports.StatusSchema = exports.TreatmentStatusSchema = exports.AppointmentStatusSchema = exports.UserStatusSchema = exports.ResourceTypeSchema = exports.PermissionActionSchema = exports.UserRoleSchema = exports.PasswordSchema = exports.SlugSchema = exports.TrimmedStringSchema = exports.NonEmptyStringSchema = exports.NonNegativeIntSchema = exports.PositiveIntSchema = exports.URLSchema = exports.DateOnlySchema = exports.DateSchema = exports.ISODateStringSchema = exports.PhoneNumberSchema = exports.EmailSchema = exports.UUIDSchema = void 0;
const zod_1 = require("zod");
const shared_types_1 = require("@dentalos/shared-types");
exports.UUIDSchema = zod_1.z.string().uuid({
    message: 'Must be a valid UUID',
});
exports.EmailSchema = zod_1.z
    .string()
    .min(1, 'Email is required')
    .email('Must be a valid email address')
    .toLowerCase()
    .trim();
exports.PhoneNumberSchema = zod_1.z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, {
    message: 'Must be a valid phone number in E.164 format (e.g., +14155552671)',
})
    .trim();
exports.ISODateStringSchema = zod_1.z.string().datetime({
    message: 'Must be a valid ISO 8601 datetime string',
});
exports.DateSchema = zod_1.z.string().datetime().transform((str) => new Date(str));
exports.DateOnlySchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Must be a valid date in YYYY-MM-DD format',
})
    .refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Must be a valid date',
});
exports.URLSchema = zod_1.z.string().url({
    message: 'Must be a valid URL',
});
exports.PositiveIntSchema = zod_1.z
    .number()
    .int('Must be an integer')
    .positive('Must be a positive number');
exports.NonNegativeIntSchema = zod_1.z
    .number()
    .int('Must be an integer')
    .nonnegative('Must be a non-negative number');
exports.NonEmptyStringSchema = zod_1.z.string().min(1, 'Cannot be empty').trim();
exports.TrimmedStringSchema = zod_1.z.string().trim().min(1, 'Cannot be empty after trimming');
exports.SlugSchema = zod_1.z
    .string()
    .regex(/^[a-z0-9-]+$/, {
    message: 'Must contain only lowercase letters, numbers, and hyphens',
})
    .min(1, 'Slug cannot be empty')
    .max(100, 'Slug must be 100 characters or less');
exports.PasswordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less')
    .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
})
    .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
})
    .refine((val) => /\d/.test(val), {
    message: 'Password must contain at least one number',
})
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: 'Password must contain at least one special character',
});
exports.UserRoleSchema = zod_1.z.nativeEnum(shared_types_1.UserRole, {
    errorMap: () => ({ message: 'Invalid user role' }),
});
exports.PermissionActionSchema = zod_1.z.nativeEnum(shared_types_1.PermissionAction, {
    errorMap: () => ({ message: 'Invalid permission action' }),
});
exports.ResourceTypeSchema = zod_1.z.nativeEnum(shared_types_1.ResourceType, {
    errorMap: () => ({ message: 'Invalid resource type' }),
});
exports.UserStatusSchema = zod_1.z.nativeEnum(shared_types_1.UserStatus, {
    errorMap: () => ({ message: 'Invalid user status' }),
});
exports.AppointmentStatusSchema = zod_1.z.nativeEnum(shared_types_1.AppointmentStatus, {
    errorMap: () => ({ message: 'Invalid appointment status' }),
});
exports.TreatmentStatusSchema = zod_1.z.nativeEnum(shared_types_1.TreatmentStatus, {
    errorMap: () => ({ message: 'Invalid treatment status' }),
});
exports.StatusSchema = zod_1.z.nativeEnum(shared_types_1.Status, {
    errorMap: () => ({ message: 'Invalid status' }),
});
exports.ApprovalStatusSchema = zod_1.z.nativeEnum(shared_types_1.ApprovalStatus, {
    errorMap: () => ({ message: 'Invalid approval status' }),
});
exports.PaymentStatusSchema = zod_1.z.nativeEnum(shared_types_1.PaymentStatus, {
    errorMap: () => ({ message: 'Invalid payment status' }),
});
exports.PrioritySchema = zod_1.z.nativeEnum(shared_types_1.Priority, {
    errorMap: () => ({ message: 'Invalid priority' }),
});
exports.GenderSchema = zod_1.z.nativeEnum(shared_types_1.Gender, {
    errorMap: () => ({ message: 'Invalid gender' }),
});
exports.MaritalStatusSchema = zod_1.z.nativeEnum(shared_types_1.MaritalStatus, {
    errorMap: () => ({ message: 'Invalid marital status' }),
});
exports.ContactMethodSchema = zod_1.z.nativeEnum(shared_types_1.ContactMethod, {
    errorMap: () => ({ message: 'Invalid contact method' }),
});
exports.NotificationTypeSchema = zod_1.z.nativeEnum(shared_types_1.NotificationType, {
    errorMap: () => ({ message: 'Invalid notification type' }),
});
exports.NotificationChannelSchema = zod_1.z.nativeEnum(shared_types_1.NotificationChannel, {
    errorMap: () => ({ message: 'Invalid notification channel' }),
});
exports.DocumentTypeSchema = zod_1.z.nativeEnum(shared_types_1.DocumentType, {
    errorMap: () => ({ message: 'Invalid document type' }),
});
exports.RecurrencePatternSchema = zod_1.z.nativeEnum(shared_types_1.RecurrencePattern, {
    errorMap: () => ({ message: 'Invalid recurrence pattern' }),
});
exports.DayOfWeekSchema = zod_1.z.nativeEnum(shared_types_1.DayOfWeek, {
    errorMap: () => ({ message: 'Invalid day of week' }),
});
exports.CurrencyCodeSchema = zod_1.z.nativeEnum(shared_types_1.CurrencyCode, {
    errorMap: () => ({ message: 'Invalid currency code' }),
});
exports.LanguageCodeSchema = zod_1.z.nativeEnum(shared_types_1.LanguageCode, {
    errorMap: () => ({ message: 'Invalid language code' }),
});
exports.TimeZoneSchema = zod_1.z.nativeEnum(shared_types_1.TimeZone, {
    errorMap: () => ({ message: 'Invalid time zone' }),
});
exports.TenantTypeSchema = zod_1.z.nativeEnum(shared_types_1.TenantType, {
    errorMap: () => ({ message: 'Invalid tenant type' }),
});
exports.TenantIsolationPolicySchema = zod_1.z.nativeEnum(shared_types_1.TenantIsolationPolicy, {
    errorMap: () => ({ message: 'Invalid tenant isolation policy' }),
});
exports.EntityStatusSchema = zod_1.z.nativeEnum(shared_types_1.EntityStatus, {
    errorMap: () => ({ message: 'Invalid entity status' }),
});
exports.PermissionSchema = zod_1.z.object({
    resource: exports.ResourceTypeSchema,
    action: exports.PermissionActionSchema,
    constraints: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.SortOrderSchema = zod_1.z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: 'Sort order must be "asc" or "desc"' }),
});
exports.MetadataSchema = zod_1.z.record(zod_1.z.unknown());
//# sourceMappingURL=common.schemas.js.map
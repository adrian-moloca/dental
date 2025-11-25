"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicSettingsSchema = exports.OrganizationSettingsSchema = exports.MultiTenantQueryOptionsSchema = exports.TenantScopeFilterSchema = exports.TenantContextSchema = exports.TenantScopedSchema = exports.ClinicSchema = exports.ClinicStatusSchema = exports.OrganizationSchema = exports.OrganizationStatusSchema = exports.ContactInfoSchema = exports.AddressSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("./common.schemas");
exports.AddressSchema = zod_1.z.object({
    street: zod_1.z.string().max(200, 'Street must be 200 characters or less').optional(),
    city: zod_1.z.string().max(100, 'City must be 100 characters or less').optional(),
    state: zod_1.z.string().max(100, 'State must be 100 characters or less').optional(),
    postalCode: zod_1.z.string().max(20, 'Postal code must be 20 characters or less').optional(),
    country: zod_1.z.string().max(100, 'Country must be 100 characters or less').optional(),
});
exports.ContactInfoSchema = zod_1.z.object({
    phone: common_schemas_1.PhoneNumberSchema.optional(),
    email: common_schemas_1.EmailSchema.optional(),
    website: common_schemas_1.URLSchema.optional(),
});
exports.OrganizationStatusSchema = zod_1.z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Invalid organization status' }),
});
exports.OrganizationSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Organization name must be 200 characters or less'),
    slug: common_schemas_1.SlugSchema,
    status: exports.OrganizationStatusSchema,
    logoUrl: common_schemas_1.URLSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    deletedAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    createdBy: common_schemas_1.UUIDSchema.optional(),
    updatedBy: common_schemas_1.UUIDSchema.optional(),
    deletedBy: common_schemas_1.UUIDSchema.nullable().optional(),
    version: zod_1.z.number().int().nonnegative().default(1),
});
exports.ClinicStatusSchema = zod_1.z.enum(['active', 'inactive', 'suspended'], {
    errorMap: () => ({ message: 'Invalid clinic status' }),
});
exports.ClinicSchema = zod_1.z
    .object({
    id: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Clinic name must be 200 characters or less'),
    slug: common_schemas_1.SlugSchema,
    status: exports.ClinicStatusSchema,
    address: exports.AddressSchema.optional(),
    contact: exports.ContactInfoSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    deletedAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    createdBy: common_schemas_1.UUIDSchema.optional(),
    updatedBy: common_schemas_1.UUIDSchema.optional(),
    deletedBy: common_schemas_1.UUIDSchema.nullable().optional(),
    version: zod_1.z.number().int().nonnegative().default(1),
})
    .refine((data) => {
    return data.slug.length > 0;
}, {
    message: 'Clinic slug must be unique within the organization',
    path: ['slug'],
});
exports.TenantScopedSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.TenantContextSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    tenantType: common_schemas_1.TenantTypeSchema,
});
exports.TenantScopeFilterSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    includeChildren: zod_1.z.boolean().default(false),
});
exports.MultiTenantQueryOptionsSchema = zod_1.z.object({
    scope: exports.TenantScopeFilterSchema,
    isolationPolicy: common_schemas_1.TenantIsolationPolicySchema.optional(),
});
exports.OrganizationSettingsSchema = zod_1.z.object({
    timezone: zod_1.z.string().default('UTC'),
    locale: zod_1.z.string().default('en-US'),
    currency: zod_1.z.string().length(3, 'Currency code must be 3 characters').default('USD'),
    dateFormat: zod_1.z.string().default('YYYY-MM-DD'),
    timeFormat: zod_1.z.enum(['12h', '24h']).default('12h'),
    weekStartsOn: zod_1.z.number().int().min(0).max(6).default(0),
    features: zod_1.z.record(zod_1.z.boolean()).default({}),
    branding: zod_1.z
        .object({
        primaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        secondaryColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        logoUrl: common_schemas_1.URLSchema.optional(),
        faviconUrl: common_schemas_1.URLSchema.optional(),
    })
        .optional(),
});
exports.ClinicSettingsSchema = zod_1.z.object({
    timezone: zod_1.z.string().optional(),
    locale: zod_1.z.string().optional(),
    appointmentDuration: zod_1.z.number().int().positive().default(30),
    operatingHours: zod_1.z
        .array(zod_1.z.object({
        dayOfWeek: zod_1.z.number().int().min(0).max(6),
        openTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
        closeTime: zod_1.z.string().regex(/^\d{2}:\d{2}$/),
        isClosed: zod_1.z.boolean().default(false),
    }))
        .optional(),
    features: zod_1.z.record(zod_1.z.boolean()).default({}),
});
//# sourceMappingURL=tenant.schemas.js.map
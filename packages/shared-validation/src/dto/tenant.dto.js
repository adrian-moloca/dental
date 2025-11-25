"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClinicStatusDtoSchema = exports.UpdateOrganizationStatusDtoSchema = exports.ClinicQueryParamsSchema = exports.OrganizationQueryParamsSchema = exports.ClinicResponseDtoSchema = exports.UpdateClinicDtoSchema = exports.CreateClinicDtoSchema = exports.OrganizationResponseDtoSchema = exports.UpdateOrganizationDtoSchema = exports.CreateOrganizationDtoSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../schemas/common.schemas");
const tenant_schemas_1 = require("../schemas/tenant.schemas");
exports.CreateOrganizationDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Organization name must be 200 characters or less'),
    slug: common_schemas_1.SlugSchema,
    logoUrl: common_schemas_1.URLSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    settings: tenant_schemas_1.OrganizationSettingsSchema.optional(),
});
exports.UpdateOrganizationDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Organization name must be 200 characters or less').optional(),
    slug: common_schemas_1.SlugSchema.optional(),
    status: tenant_schemas_1.OrganizationStatusSchema.optional(),
    logoUrl: common_schemas_1.URLSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    settings: tenant_schemas_1.OrganizationSettingsSchema.optional(),
});
exports.OrganizationResponseDtoSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    status: tenant_schemas_1.OrganizationStatusSchema,
    logoUrl: zod_1.z.string().optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    settings: tenant_schemas_1.OrganizationSettingsSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
});
exports.CreateClinicDtoSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Clinic name must be 200 characters or less'),
    slug: common_schemas_1.SlugSchema,
    address: tenant_schemas_1.AddressSchema.optional(),
    contact: tenant_schemas_1.ContactInfoSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    settings: tenant_schemas_1.ClinicSettingsSchema.optional(),
});
exports.UpdateClinicDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Clinic name must be 200 characters or less').optional(),
    slug: common_schemas_1.SlugSchema.optional(),
    status: tenant_schemas_1.ClinicStatusSchema.optional(),
    address: tenant_schemas_1.AddressSchema.optional(),
    contact: tenant_schemas_1.ContactInfoSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    settings: tenant_schemas_1.ClinicSettingsSchema.optional(),
});
exports.ClinicResponseDtoSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    status: tenant_schemas_1.ClinicStatusSchema,
    address: tenant_schemas_1.AddressSchema.optional(),
    contact: tenant_schemas_1.ContactInfoSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
    settings: tenant_schemas_1.ClinicSettingsSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
});
exports.OrganizationQueryParamsSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'slug', 'createdAt']).default('createdAt').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
    status: tenant_schemas_1.OrganizationStatusSchema.optional(),
    search: zod_1.z.string().trim().optional(),
});
exports.ClinicQueryParamsSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'slug', 'createdAt']).default('createdAt').optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc').optional(),
    organizationId: common_schemas_1.UUIDSchema.optional(),
    status: tenant_schemas_1.ClinicStatusSchema.optional(),
    search: zod_1.z.string().trim().optional(),
});
exports.UpdateOrganizationStatusDtoSchema = zod_1.z.object({
    status: tenant_schemas_1.OrganizationStatusSchema,
    reason: zod_1.z.string().max(500, 'Reason must be 500 characters or less').optional(),
});
exports.UpdateClinicStatusDtoSchema = zod_1.z.object({
    status: tenant_schemas_1.ClinicStatusSchema,
    reason: zod_1.z.string().max(500, 'Reason must be 500 characters or less').optional(),
});
//# sourceMappingURL=tenant.dto.js.map
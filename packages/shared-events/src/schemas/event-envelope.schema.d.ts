import { z } from 'zod';
import { UUIDSchema } from '@dentalos/shared-validation';
export declare const EventMetadataSchema: z.ZodObject<{
    correlationId: z.ZodOptional<z.ZodString>;
    causationId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId?: string | undefined;
    organizationId?: string | undefined;
    clinicId?: string | undefined;
    correlationId?: string | undefined;
    userId?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    causationId?: string | undefined;
}, {
    tenantId?: string | undefined;
    organizationId?: string | undefined;
    clinicId?: string | undefined;
    correlationId?: string | undefined;
    userId?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    causationId?: string | undefined;
}>;
export type EventMetadataSchemaType = z.infer<typeof EventMetadataSchema>;
export declare const TenantContextSchema: z.ZodObject<{
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    organizationId: string;
    clinicId?: string | undefined;
}, {
    tenantId: string;
    organizationId: string;
    clinicId?: string | undefined;
}>;
export type TenantContextSchemaType = z.infer<typeof TenantContextSchema>;
export declare function EventEnvelopeSchema<T extends z.ZodTypeAny>(payloadSchema: T): z.ZodObject<{
    id: typeof UUIDSchema;
    type: z.ZodString;
    version: z.ZodNumber;
    occurredAt: z.ZodDate;
    payload: T;
    metadata: typeof EventMetadataSchema;
    tenantContext: typeof TenantContextSchema;
}>;
export declare const BaseEventEnvelopeSchema: z.ZodObject<{
    id: typeof UUIDSchema;
    type: z.ZodString;
    version: z.ZodNumber;
    occurredAt: z.ZodDate;
    payload: z.ZodUnknown;
    metadata: typeof EventMetadataSchema;
    tenantContext: typeof TenantContextSchema;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    id: string;
    type: string;
    version: number;
    metadata: {
        tenantId?: string | undefined;
        organizationId?: string | undefined;
        clinicId?: string | undefined;
        correlationId?: string | undefined;
        userId?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        causationId?: string | undefined;
    };
    tenantContext: {
        tenantId: string;
        organizationId: string;
        clinicId?: string | undefined;
    };
    occurredAt: Date;
    payload?: unknown;
}, {
    id: string;
    type: string;
    version: number;
    metadata: {
        tenantId?: string | undefined;
        organizationId?: string | undefined;
        clinicId?: string | undefined;
        correlationId?: string | undefined;
        userId?: string | undefined;
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        causationId?: string | undefined;
    };
    tenantContext: {
        tenantId: string;
        organizationId: string;
        clinicId?: string | undefined;
    };
    occurredAt: Date;
    payload?: unknown;
}>;
export type BaseEventEnvelopeSchemaType = z.infer<typeof BaseEventEnvelopeSchema>;

import { z } from 'zod';
export declare const OutgoingWebhookRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodEnum<["appointment.booked", "appointment.canceled", "patient.created", "invoice.issued", "payment.received", "treatment.completed", "lab_case.submitted", "imaging_study.completed", "custom"]>;
    payload: z.ZodAny;
    correlationId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    eventType: "custom" | "appointment.booked" | "appointment.canceled" | "patient.created" | "invoice.issued" | "payment.received" | "treatment.completed" | "lab_case.submitted" | "imaging_study.completed";
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    payload?: any;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    eventType: "custom" | "appointment.booked" | "appointment.canceled" | "patient.created" | "invoice.issued" | "payment.received" | "treatment.completed" | "lab_case.submitted" | "imaging_study.completed";
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    payload?: any;
}>;
export type OutgoingWebhookRequest = z.infer<typeof OutgoingWebhookRequestSchema>;
export declare const IncomingWebhookEventSchema: z.ZodObject<{
    webhookId: z.ZodString;
    provider: z.ZodString;
    eventType: z.ZodString;
    payload: z.ZodAny;
    signature: z.ZodString;
    receivedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    webhookId: string;
    provider: string;
    signature: string;
    receivedAt: string;
    payload?: any;
}, {
    eventType: string;
    webhookId: string;
    provider: string;
    signature: string;
    receivedAt: string;
    payload?: any;
}>;
export type IncomingWebhookEvent = z.infer<typeof IncomingWebhookEventSchema>;
export declare const GetWebhookDeliveryLogsSchema: z.ZodObject<{
    webhookId: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    webhookId: string;
}, {
    webhookId: string;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type GetWebhookDeliveryLogs = z.infer<typeof GetWebhookDeliveryLogsSchema>;
export declare const GetWebhookConfigSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    tenantId: string;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    tenantId: string;
    clinicId?: string | undefined;
}>;
export type GetWebhookConfig = z.infer<typeof GetWebhookConfigSchema>;
export declare const CreateWebhookConfigSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    direction: z.ZodEnum<["OUTGOING", "INCOMING"]>;
    targetUrl: z.ZodOptional<z.ZodString>;
    secret: z.ZodString;
    eventTypes: z.ZodArray<z.ZodEnum<["appointment.booked", "appointment.canceled", "patient.created", "invoice.issued", "payment.received", "treatment.completed", "lab_case.submitted", "imaging_study.completed", "custom"]>, "many">;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    maxRetries: z.ZodNumber;
    retryDelayMs: z.ZodNumber;
    backoffMultiplier: z.ZodNumber;
    isEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    tenantId: string;
    secret: string;
    maxRetries: number;
    isEnabled: boolean;
    direction: "OUTGOING" | "INCOMING";
    eventTypes: ("custom" | "appointment.booked" | "appointment.canceled" | "patient.created" | "invoice.issued" | "payment.received" | "treatment.completed" | "lab_case.submitted" | "imaging_study.completed")[];
    retryDelayMs: number;
    backoffMultiplier: number;
    clinicId?: string | undefined;
    headers?: Record<string, string> | undefined;
    targetUrl?: string | undefined;
}, {
    organizationId: string;
    tenantId: string;
    secret: string;
    maxRetries: number;
    isEnabled: boolean;
    direction: "OUTGOING" | "INCOMING";
    eventTypes: ("custom" | "appointment.booked" | "appointment.canceled" | "patient.created" | "invoice.issued" | "payment.received" | "treatment.completed" | "lab_case.submitted" | "imaging_study.completed")[];
    retryDelayMs: number;
    backoffMultiplier: number;
    clinicId?: string | undefined;
    headers?: Record<string, string> | undefined;
    targetUrl?: string | undefined;
}>;
export type CreateWebhookConfig = z.infer<typeof CreateWebhookConfigSchema>;
export declare const UpdateWebhookConfigSchema: z.ZodObject<{
    headers: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    secret: z.ZodOptional<z.ZodString>;
    maxRetries: z.ZodOptional<z.ZodNumber>;
    isEnabled: z.ZodOptional<z.ZodBoolean>;
    direction: z.ZodOptional<z.ZodEnum<["OUTGOING", "INCOMING"]>>;
    targetUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    eventTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["appointment.booked", "appointment.canceled", "patient.created", "invoice.issued", "payment.received", "treatment.completed", "lab_case.submitted", "imaging_study.completed", "custom"]>, "many">>;
    retryDelayMs: z.ZodOptional<z.ZodNumber>;
    backoffMultiplier: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    headers?: Record<string, string> | undefined;
    secret?: string | undefined;
    maxRetries?: number | undefined;
    isEnabled?: boolean | undefined;
    direction?: "OUTGOING" | "INCOMING" | undefined;
    targetUrl?: string | undefined;
    eventTypes?: ("custom" | "appointment.booked" | "appointment.canceled" | "patient.created" | "invoice.issued" | "payment.received" | "treatment.completed" | "lab_case.submitted" | "imaging_study.completed")[] | undefined;
    retryDelayMs?: number | undefined;
    backoffMultiplier?: number | undefined;
}, {
    headers?: Record<string, string> | undefined;
    secret?: string | undefined;
    maxRetries?: number | undefined;
    isEnabled?: boolean | undefined;
    direction?: "OUTGOING" | "INCOMING" | undefined;
    targetUrl?: string | undefined;
    eventTypes?: ("custom" | "appointment.booked" | "appointment.canceled" | "patient.created" | "invoice.issued" | "payment.received" | "treatment.completed" | "lab_case.submitted" | "imaging_study.completed")[] | undefined;
    retryDelayMs?: number | undefined;
    backoffMultiplier?: number | undefined;
}>;
export type UpdateWebhookConfig = z.infer<typeof UpdateWebhookConfigSchema>;

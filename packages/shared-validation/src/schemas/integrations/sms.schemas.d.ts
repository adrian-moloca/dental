import { z } from 'zod';
export declare const SendSmsRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    to: z.ZodString;
    message: z.ZodString;
    fromNumber: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    correlationId: string;
    organizationId: string;
    tenantId: string;
    to: string;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    fromNumber?: string | undefined;
}, {
    message: string;
    correlationId: string;
    organizationId: string;
    tenantId: string;
    to: string;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    fromNumber?: string | undefined;
}>;
export type SendSmsRequest = z.infer<typeof SendSmsRequestSchema>;
export declare const GetSmsConfigSchema: z.ZodObject<{
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
export type GetSmsConfig = z.infer<typeof GetSmsConfigSchema>;
export declare const UpdateSmsProviderConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["TWILIO", "NEXMO"]>;
    fromNumber: z.ZodString;
    enableDeliveryReports: z.ZodBoolean;
    maxMessageLength: z.ZodNumber;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
    fallbackProviderId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    provider: "TWILIO" | "NEXMO";
    fromNumber: string;
    enableDeliveryReports: boolean;
    maxMessageLength: number;
    fallbackProviderId?: string | undefined;
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    provider: "TWILIO" | "NEXMO";
    fromNumber: string;
    enableDeliveryReports: boolean;
    maxMessageLength: number;
    fallbackProviderId?: string | undefined;
}>;
export type UpdateSmsProviderConfig = z.infer<typeof UpdateSmsProviderConfigSchema>;

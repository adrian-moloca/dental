import { z } from 'zod';
export declare const WhatsAppTemplateParameterSchema: z.ZodObject<{
    type: z.ZodEnum<["text", "currency", "date_time"]>;
    text: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodObject<{
        fallback_value: z.ZodString;
        code: z.ZodString;
        amount_1000: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: string;
        fallback_value: string;
        amount_1000: number;
    }, {
        code: string;
        fallback_value: string;
        amount_1000: number;
    }>>;
    date_time: z.ZodOptional<z.ZodObject<{
        fallback_value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fallback_value: string;
    }, {
        fallback_value: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "text" | "currency" | "date_time";
    text?: string | undefined;
    currency?: {
        code: string;
        fallback_value: string;
        amount_1000: number;
    } | undefined;
    date_time?: {
        fallback_value: string;
    } | undefined;
}, {
    type: "text" | "currency" | "date_time";
    text?: string | undefined;
    currency?: {
        code: string;
        fallback_value: string;
        amount_1000: number;
    } | undefined;
    date_time?: {
        fallback_value: string;
    } | undefined;
}>;
export declare const SendWhatsAppMessageRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    to: z.ZodString;
    messageType: z.ZodEnum<["TEXT", "TEMPLATE", "IMAGE", "DOCUMENT"]>;
    templateName: z.ZodOptional<z.ZodString>;
    templateLanguage: z.ZodOptional<z.ZodString>;
    templateParameters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["text", "currency", "date_time"]>;
        text: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodObject<{
            fallback_value: z.ZodString;
            code: z.ZodString;
            amount_1000: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            code: string;
            fallback_value: string;
            amount_1000: number;
        }, {
            code: string;
            fallback_value: string;
            amount_1000: number;
        }>>;
        date_time: z.ZodOptional<z.ZodObject<{
            fallback_value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            fallback_value: string;
        }, {
            fallback_value: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "text" | "currency" | "date_time";
        text?: string | undefined;
        currency?: {
            code: string;
            fallback_value: string;
            amount_1000: number;
        } | undefined;
        date_time?: {
            fallback_value: string;
        } | undefined;
    }, {
        type: "text" | "currency" | "date_time";
        text?: string | undefined;
        currency?: {
            code: string;
            fallback_value: string;
            amount_1000: number;
        } | undefined;
        date_time?: {
            fallback_value: string;
        } | undefined;
    }>, "many">>;
    textMessage: z.ZodOptional<z.ZodString>;
    mediaUrl: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    to: string;
    messageType: "IMAGE" | "DOCUMENT" | "TEXT" | "TEMPLATE";
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    templateName?: string | undefined;
    templateLanguage?: string | undefined;
    templateParameters?: {
        type: "text" | "currency" | "date_time";
        text?: string | undefined;
        currency?: {
            code: string;
            fallback_value: string;
            amount_1000: number;
        } | undefined;
        date_time?: {
            fallback_value: string;
        } | undefined;
    }[] | undefined;
    textMessage?: string | undefined;
    mediaUrl?: string | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    to: string;
    messageType: "IMAGE" | "DOCUMENT" | "TEXT" | "TEMPLATE";
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    templateName?: string | undefined;
    templateLanguage?: string | undefined;
    templateParameters?: {
        type: "text" | "currency" | "date_time";
        text?: string | undefined;
        currency?: {
            code: string;
            fallback_value: string;
            amount_1000: number;
        } | undefined;
        date_time?: {
            fallback_value: string;
        } | undefined;
    }[] | undefined;
    textMessage?: string | undefined;
    mediaUrl?: string | undefined;
}>;
export type SendWhatsAppMessageRequest = z.infer<typeof SendWhatsAppMessageRequestSchema>;
export declare const GetWhatsAppTemplatesSchema: z.ZodObject<{
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
export type GetWhatsAppTemplates = z.infer<typeof GetWhatsAppTemplatesSchema>;
export declare const GetWhatsAppConfigSchema: z.ZodObject<{
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
export type GetWhatsAppConfig = z.infer<typeof GetWhatsAppConfigSchema>;
export declare const UpdateWhatsAppProviderConfigSchema: z.ZodObject<{
    phoneNumberId: z.ZodString;
    businessAccountId: z.ZodString;
    apiVersion: z.ZodString;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    phoneNumberId: string;
    businessAccountId: string;
    apiVersion: string;
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    phoneNumberId: string;
    businessAccountId: string;
    apiVersion: string;
}>;
export type UpdateWhatsAppProviderConfig = z.infer<typeof UpdateWhatsAppProviderConfigSchema>;

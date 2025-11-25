import { z } from 'zod';
export declare const EmailAttachmentSchema: z.ZodObject<{
    filename: z.ZodString;
    content: z.ZodUnion<[z.ZodString, z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>]>;
    contentType: z.ZodString;
    encoding: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string | Buffer<ArrayBufferLike>;
    filename: string;
    contentType: string;
    encoding?: string | undefined;
}, {
    content: string | Buffer<ArrayBufferLike>;
    filename: string;
    contentType: string;
    encoding?: string | undefined;
}>;
export declare const SendEmailRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodString;
    htmlBody: z.ZodString;
    textBody: z.ZodOptional<z.ZodString>;
    fromEmail: z.ZodOptional<z.ZodString>;
    fromName: z.ZodOptional<z.ZodString>;
    replyTo: z.ZodOptional<z.ZodString>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodUnion<[z.ZodString, z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>]>;
        contentType: z.ZodString;
        encoding: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content: string | Buffer<ArrayBufferLike>;
        filename: string;
        contentType: string;
        encoding?: string | undefined;
    }, {
        content: string | Buffer<ArrayBufferLike>;
        filename: string;
        contentType: string;
        encoding?: string | undefined;
    }>, "many">>;
    templateId: z.ZodOptional<z.ZodString>;
    templateData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    correlationId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    to: string[];
    subject: string;
    htmlBody: string;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    textBody?: string | undefined;
    fromEmail?: string | undefined;
    fromName?: string | undefined;
    replyTo?: string | undefined;
    attachments?: {
        content: string | Buffer<ArrayBufferLike>;
        filename: string;
        contentType: string;
        encoding?: string | undefined;
    }[] | undefined;
    templateId?: string | undefined;
    templateData?: Record<string, any> | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    to: string[];
    subject: string;
    htmlBody: string;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    cc?: string[] | undefined;
    bcc?: string[] | undefined;
    textBody?: string | undefined;
    fromEmail?: string | undefined;
    fromName?: string | undefined;
    replyTo?: string | undefined;
    attachments?: {
        content: string | Buffer<ArrayBufferLike>;
        filename: string;
        contentType: string;
        encoding?: string | undefined;
    }[] | undefined;
    templateId?: string | undefined;
    templateData?: Record<string, any> | undefined;
}>;
export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;
export declare const GetEmailConfigSchema: z.ZodObject<{
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
export type GetEmailConfig = z.infer<typeof GetEmailConfigSchema>;
export declare const UpdateEmailProviderConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["SENDGRID", "SMTP"]>;
    fromEmail: z.ZodString;
    fromName: z.ZodString;
    replyToEmail: z.ZodOptional<z.ZodString>;
    enableTracking: z.ZodBoolean;
    enableClickTracking: z.ZodBoolean;
    smtpHost: z.ZodOptional<z.ZodString>;
    smtpPort: z.ZodOptional<z.ZodNumber>;
    smtpSecure: z.ZodOptional<z.ZodBoolean>;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
    fallbackProviderId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    provider: "SENDGRID" | "SMTP";
    fromEmail: string;
    fromName: string;
    enableTracking: boolean;
    enableClickTracking: boolean;
    replyToEmail?: string | undefined;
    smtpHost?: string | undefined;
    smtpPort?: number | undefined;
    smtpSecure?: boolean | undefined;
    fallbackProviderId?: string | undefined;
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    provider: "SENDGRID" | "SMTP";
    fromEmail: string;
    fromName: string;
    enableTracking: boolean;
    enableClickTracking: boolean;
    replyToEmail?: string | undefined;
    smtpHost?: string | undefined;
    smtpPort?: number | undefined;
    smtpSecure?: boolean | undefined;
    fallbackProviderId?: string | undefined;
}>;
export type UpdateEmailProviderConfig = z.infer<typeof UpdateEmailProviderConfigSchema>;

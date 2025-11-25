import { z } from 'zod';
export declare const CreatePaymentIntentRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    currency: z.ZodString;
    paymentMethod: z.ZodEnum<["CARD", "BANK_TRANSFER", "CASH", "SEPA_DEBIT"]>;
    customerId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    invoiceId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    currency: string;
    paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "SEPA_DEBIT";
    amount: number;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
    patientId?: string | undefined;
    customerId?: string | undefined;
    invoiceId?: string | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    currency: string;
    paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "SEPA_DEBIT";
    amount: number;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
    patientId?: string | undefined;
    customerId?: string | undefined;
    invoiceId?: string | undefined;
}>;
export type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentRequestSchema>;
export declare const ConfirmPaymentRequestSchema: z.ZodObject<{
    intentId: z.ZodString;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    returnUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    intentId: string;
    paymentMethodId?: string | undefined;
    returnUrl?: string | undefined;
}, {
    intentId: string;
    paymentMethodId?: string | undefined;
    returnUrl?: string | undefined;
}>;
export type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentRequestSchema>;
export declare const RefundPaymentRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    transactionId: z.ZodString;
    amount: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    transactionId: string;
    clinicId?: string | undefined;
    reason?: string | undefined;
    amount?: number | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    transactionId: string;
    clinicId?: string | undefined;
    reason?: string | undefined;
    amount?: number | undefined;
}>;
export type RefundPaymentRequest = z.infer<typeof RefundPaymentRequestSchema>;
export declare const StripeWebhookEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    data: z.ZodAny;
    created: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    created: number;
    data?: any;
}, {
    type: string;
    id: string;
    created: number;
    data?: any;
}>;
export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;
export declare const GetPaymentConfigSchema: z.ZodObject<{
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
export type GetPaymentConfig = z.infer<typeof GetPaymentConfigSchema>;
export declare const UpdatePaymentProviderConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["STRIPE", "EUPLATESC", "MOBILPAY"]>;
    merchantId: z.ZodString;
    publicKey: z.ZodOptional<z.ZodString>;
    webhookSecret: z.ZodString;
    currency: z.ZodString;
    supportedPaymentMethods: z.ZodArray<z.ZodEnum<["CARD", "BANK_TRANSFER", "CASH", "SEPA_DEBIT"]>, "many">;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    currency: string;
    provider: "STRIPE" | "EUPLATESC" | "MOBILPAY";
    merchantId: string;
    webhookSecret: string;
    supportedPaymentMethods: ("CARD" | "BANK_TRANSFER" | "CASH" | "SEPA_DEBIT")[];
    publicKey?: string | undefined;
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    currency: string;
    provider: "STRIPE" | "EUPLATESC" | "MOBILPAY";
    merchantId: string;
    webhookSecret: string;
    supportedPaymentMethods: ("CARD" | "BANK_TRANSFER" | "CASH" | "SEPA_DEBIT")[];
    publicKey?: string | undefined;
}>;
export type UpdatePaymentProviderConfig = z.infer<typeof UpdatePaymentProviderConfigSchema>;

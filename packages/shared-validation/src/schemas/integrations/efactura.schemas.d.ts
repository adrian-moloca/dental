import { z } from 'zod';
export declare const EFacturaAddressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    county: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    county: string;
}, {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    county: string;
}>;
export declare const EFacturaPartySchema: z.ZodObject<{
    cui: z.ZodString;
    name: z.ZodString;
    registrationNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        county: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        county: string;
    }, {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        county: string;
    }>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    bankAccount: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        county: string;
    };
    cui: string;
    email?: string | undefined;
    phone?: string | undefined;
    registrationNumber?: string | undefined;
    bankAccount?: string | undefined;
    bankName?: string | undefined;
}, {
    name: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
        county: string;
    };
    cui: string;
    email?: string | undefined;
    phone?: string | undefined;
    registrationNumber?: string | undefined;
    bankAccount?: string | undefined;
    bankName?: string | undefined;
}>;
export declare const EFacturaLineItemSchema: z.ZodObject<{
    lineNumber: z.ZodNumber;
    itemCode: z.ZodOptional<z.ZodString>;
    itemName: z.ZodString;
    quantity: z.ZodNumber;
    unitOfMeasure: z.ZodString;
    unitPrice: z.ZodNumber;
    vatRate: z.ZodNumber;
    vatAmount: z.ZodNumber;
    totalAmount: z.ZodNumber;
    discountAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lineNumber: number;
    itemName: string;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    itemCode?: string | undefined;
    discountAmount?: number | undefined;
}, {
    lineNumber: number;
    itemName: string;
    quantity: number;
    unitOfMeasure: string;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    itemCode?: string | undefined;
    discountAmount?: number | undefined;
}>;
export declare const SubmitEFacturaRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    documentType: z.ZodEnum<["INVOICE", "CREDIT_NOTE", "DEBIT_NOTE"]>;
    invoiceNumber: z.ZodString;
    invoiceDate: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    supplier: z.ZodObject<{
        cui: z.ZodString;
        name: z.ZodString;
        registrationNumber: z.ZodOptional<z.ZodString>;
        address: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            county: z.ZodString;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        }, {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        }>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        bankAccount: z.ZodOptional<z.ZodString>;
        bankName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    }, {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    }>;
    customer: z.ZodObject<{
        cui: z.ZodString;
        name: z.ZodString;
        registrationNumber: z.ZodOptional<z.ZodString>;
        address: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            county: z.ZodString;
            postalCode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        }, {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        }>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        bankAccount: z.ZodOptional<z.ZodString>;
        bankName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    }, {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    }>;
    lineItems: z.ZodArray<z.ZodObject<{
        lineNumber: z.ZodNumber;
        itemCode: z.ZodOptional<z.ZodString>;
        itemName: z.ZodString;
        quantity: z.ZodNumber;
        unitOfMeasure: z.ZodString;
        unitPrice: z.ZodNumber;
        vatRate: z.ZodNumber;
        vatAmount: z.ZodNumber;
        totalAmount: z.ZodNumber;
        discountAmount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        lineNumber: number;
        itemName: string;
        quantity: number;
        unitOfMeasure: string;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        itemCode?: string | undefined;
        discountAmount?: number | undefined;
    }, {
        lineNumber: number;
        itemName: string;
        quantity: number;
        unitOfMeasure: string;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        itemCode?: string | undefined;
        discountAmount?: number | undefined;
    }>, "many">;
    totalAmountWithoutVat: z.ZodNumber;
    totalVatAmount: z.ZodNumber;
    totalAmount: z.ZodNumber;
    currency: z.ZodString;
    paymentMethod: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    currency: string;
    totalAmount: number;
    documentType: "INVOICE" | "CREDIT_NOTE" | "DEBIT_NOTE";
    invoiceNumber: string;
    invoiceDate: string;
    supplier: {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    };
    customer: {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    };
    lineItems: {
        lineNumber: number;
        itemName: string;
        quantity: number;
        unitOfMeasure: string;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        itemCode?: string | undefined;
        discountAmount?: number | undefined;
    }[];
    totalAmountWithoutVat: number;
    totalVatAmount: number;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    dueDate?: string | undefined;
    paymentMethod?: string | undefined;
    notes?: string | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    currency: string;
    totalAmount: number;
    documentType: "INVOICE" | "CREDIT_NOTE" | "DEBIT_NOTE";
    invoiceNumber: string;
    invoiceDate: string;
    supplier: {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    };
    customer: {
        name: string;
        address: {
            street: string;
            city: string;
            postalCode: string;
            country: string;
            county: string;
        };
        cui: string;
        email?: string | undefined;
        phone?: string | undefined;
        registrationNumber?: string | undefined;
        bankAccount?: string | undefined;
        bankName?: string | undefined;
    };
    lineItems: {
        lineNumber: number;
        itemName: string;
        quantity: number;
        unitOfMeasure: string;
        unitPrice: number;
        vatRate: number;
        vatAmount: number;
        totalAmount: number;
        itemCode?: string | undefined;
        discountAmount?: number | undefined;
    }[];
    totalAmountWithoutVat: number;
    totalVatAmount: number;
    clinicId?: string | undefined;
    metadata?: Record<string, any> | undefined;
    dueDate?: string | undefined;
    paymentMethod?: string | undefined;
    notes?: string | undefined;
}>;
export type SubmitEFacturaRequest = z.infer<typeof SubmitEFacturaRequestSchema>;
export declare const GetEFacturaStatusSchema: z.ZodObject<{
    submissionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    submissionId: string;
}, {
    submissionId: string;
}>;
export type GetEFacturaStatus = z.infer<typeof GetEFacturaStatusSchema>;
export declare const CancelEFacturaSchema: z.ZodObject<{
    submissionId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    submissionId: string;
}, {
    reason: string;
    submissionId: string;
}>;
export type CancelEFactura = z.infer<typeof CancelEFacturaSchema>;
export declare const DownloadEFacturaXmlSchema: z.ZodObject<{
    downloadId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    downloadId: string;
}, {
    downloadId: string;
}>;
export type DownloadEFacturaXml = z.infer<typeof DownloadEFacturaXmlSchema>;
export declare const GetEFacturaConfigSchema: z.ZodObject<{
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
export type GetEFacturaConfig = z.infer<typeof GetEFacturaConfigSchema>;
export declare const UpdateEFacturaProviderConfigSchema: z.ZodObject<{
    anafUrl: z.ZodString;
    cui: z.ZodString;
    certificatePath: z.ZodOptional<z.ZodString>;
    testMode: z.ZodBoolean;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    cui: string;
    anafUrl: string;
    testMode: boolean;
    certificatePath?: string | undefined;
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    cui: string;
    anafUrl: string;
    testMode: boolean;
    certificatePath?: string | undefined;
}>;
export type UpdateEFacturaProviderConfig = z.infer<typeof UpdateEFacturaProviderConfigSchema>;

import { z } from 'zod';
export declare const PatientPasswordSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
export type PatientPassword = z.infer<typeof PatientPasswordSchema>;
export declare const PatientDateOfBirthSchema: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export type PatientDateOfBirth = z.infer<typeof PatientDateOfBirthSchema>;
export declare const FutureDateSchema: z.ZodEffects<z.ZodString, string, string>;
export type FutureDate = z.infer<typeof FutureDateSchema>;
export declare const TimeSchema: z.ZodEffects<z.ZodString, string, string>;
export type Time = z.infer<typeof TimeSchema>;
export declare const NameSchema: z.ZodString;
export type Name = z.infer<typeof NameSchema>;
export declare const SanitizedTextSchema: (maxLength: number, fieldName: string) => z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
export declare const PatientAddressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    state: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}, {
    state: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}>;
export type PatientAddress = z.infer<typeof PatientAddressSchema>;
export declare const PatientEmergencyContactSchema: z.ZodObject<{
    name: z.ZodString;
    relationship: z.ZodString;
    phone: z.ZodString;
    alternatePhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    relationship: string;
    alternatePhone?: string | undefined;
}, {
    name: string;
    phone: string;
    relationship: string;
    alternatePhone?: string | undefined;
}>;
export type PatientEmergencyContact = z.infer<typeof PatientEmergencyContactSchema>;
export declare const MfaMethodSchema: z.ZodEnum<["SMS", "EMAIL", "TOTP"]>;
export type MfaMethod = z.infer<typeof MfaMethodSchema>;
export declare const PatientRegisterDtoSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    confirmPassword: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    dateOfBirth: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    phone: z.ZodString;
    acceptedTerms: z.ZodLiteral<true>;
    marketingConsent: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    acceptedTerms: true;
    marketingConsent: boolean;
}, {
    password: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    acceptedTerms: true;
    marketingConsent?: boolean | undefined;
}>, {
    password: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    acceptedTerms: true;
    marketingConsent: boolean;
}, {
    password: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    confirmPassword: string;
    acceptedTerms: true;
    marketingConsent?: boolean | undefined;
}>;
export type PatientRegisterDto = z.infer<typeof PatientRegisterDtoSchema>;
export declare const PatientLoginDtoSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    rememberMe: boolean;
}, {
    password: string;
    email: string;
    rememberMe?: boolean | undefined;
}>;
export type PatientLoginDto = z.infer<typeof PatientLoginDtoSchema>;
export declare const PatientMfaChallengeRequestSchema: z.ZodObject<{
    method: z.ZodEnum<["SMS", "EMAIL", "TOTP"]>;
}, "strip", z.ZodTypeAny, {
    method: "EMAIL" | "SMS" | "TOTP";
}, {
    method: "EMAIL" | "SMS" | "TOTP";
}>;
export type PatientMfaChallengeRequest = z.infer<typeof PatientMfaChallengeRequestSchema>;
export declare const PatientMfaVerifyRequestSchema: z.ZodObject<{
    challengeId: z.ZodString;
    code: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    challengeId: string;
}, {
    code: string;
    challengeId: string;
}>;
export type PatientMfaVerifyRequest = z.infer<typeof PatientMfaVerifyRequestSchema>;
export declare const UpdatePatientProfileDtoSchema: z.ZodEffects<z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }>>;
    emergencyContact: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
        alternatePhone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        relationship: string;
        alternatePhone?: string | undefined;
    }, {
        name: string;
        phone: string;
        relationship: string;
        alternatePhone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
        alternatePhone?: string | undefined;
    } | undefined;
}, {
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
        alternatePhone?: string | undefined;
    } | undefined;
}>, {
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
        alternatePhone?: string | undefined;
    } | undefined;
}, {
    address?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
        alternatePhone?: string | undefined;
    } | undefined;
}>;
export type UpdatePatientProfileDto = z.infer<typeof UpdatePatientProfileDtoSchema>;
export declare const UpdatePatientPreferencesDtoSchema: z.ZodObject<{
    emailEnabled: z.ZodOptional<z.ZodBoolean>;
    smsEnabled: z.ZodOptional<z.ZodBoolean>;
    pushEnabled: z.ZodOptional<z.ZodBoolean>;
    marketingConsent: z.ZodOptional<z.ZodBoolean>;
    appointmentReminders: z.ZodOptional<z.ZodBoolean>;
    treatmentUpdates: z.ZodOptional<z.ZodBoolean>;
    billingAlerts: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    marketingConsent?: boolean | undefined;
    emailEnabled?: boolean | undefined;
    smsEnabled?: boolean | undefined;
    pushEnabled?: boolean | undefined;
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    billingAlerts?: boolean | undefined;
}, {
    marketingConsent?: boolean | undefined;
    emailEnabled?: boolean | undefined;
    smsEnabled?: boolean | undefined;
    pushEnabled?: boolean | undefined;
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    billingAlerts?: boolean | undefined;
}>;
export type UpdatePatientPreferencesDto = z.infer<typeof UpdatePatientPreferencesDtoSchema>;
export declare const PatientAppointmentStatusSchema: z.ZodEnum<["UPCOMING", "COMPLETED", "CANCELLED"]>;
export type PatientAppointmentStatus = z.infer<typeof PatientAppointmentStatusSchema>;
export declare const BookAppointmentDtoSchema: z.ZodEffects<z.ZodObject<{
    providerId: z.ZodString;
    serviceCode: z.ZodString;
    appointmentDate: z.ZodEffects<z.ZodString, string, string>;
    appointmentTime: z.ZodEffects<z.ZodString, string, string>;
    notes: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    isEmergency: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    providerId: string;
    serviceCode: string;
    appointmentDate: string;
    appointmentTime: string;
    isEmergency: boolean;
    notes?: string | undefined;
}, {
    providerId: string;
    serviceCode: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string | undefined;
    isEmergency?: boolean | undefined;
}>, {
    providerId: string;
    serviceCode: string;
    appointmentDate: string;
    appointmentTime: string;
    isEmergency: boolean;
    notes?: string | undefined;
}, {
    providerId: string;
    serviceCode: string;
    appointmentDate: string;
    appointmentTime: string;
    notes?: string | undefined;
    isEmergency?: boolean | undefined;
}>;
export type BookAppointmentDto = z.infer<typeof BookAppointmentDtoSchema>;
export declare const PatientRescheduleAppointmentDtoSchema: z.ZodObject<{
    newDate: z.ZodEffects<z.ZodString, string, string>;
    newTime: z.ZodEffects<z.ZodString, string, string>;
    reason: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
}, "strip", z.ZodTypeAny, {
    newDate: string;
    newTime: string;
    reason?: string | undefined;
}, {
    newDate: string;
    newTime: string;
    reason?: string | undefined;
}>;
export type PatientRescheduleAppointmentDto = z.infer<typeof PatientRescheduleAppointmentDtoSchema>;
export declare const PatientCancelAppointmentDtoSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
}, "strip", z.ZodTypeAny, {
    reason?: string | undefined;
}, {
    reason?: string | undefined;
}>;
export type PatientCancelAppointmentDto = z.infer<typeof PatientCancelAppointmentDtoSchema>;
export declare const QueryAppointmentsDtoSchema: z.ZodEffects<z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["UPCOMING", "COMPLETED", "CANCELLED"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    status?: "CANCELLED" | "COMPLETED" | "UPCOMING" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    status?: "CANCELLED" | "COMPLETED" | "UPCOMING" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>, {
    page: number;
    pageSize: number;
    status?: "CANCELLED" | "COMPLETED" | "UPCOMING" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    status?: "CANCELLED" | "COMPLETED" | "UPCOMING" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}>;
export type QueryAppointmentsDto = z.infer<typeof QueryAppointmentsDtoSchema>;
export declare const PatientPaymentMethodSchema: z.ZodEnum<["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CASH"]>;
export type PatientPaymentMethod = z.infer<typeof PatientPaymentMethodSchema>;
export declare const PatientInvoiceStatusSchema: z.ZodEnum<["OUTSTANDING", "OVERDUE", "PAID"]>;
export type PatientInvoiceStatus = z.infer<typeof PatientInvoiceStatusSchema>;
export declare const PatientPaymentDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    invoiceId: z.ZodString;
    amount: z.ZodEffects<z.ZodNumber, number, number>;
    paymentMethod: z.ZodEnum<["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CASH"]>;
    cardToken: z.ZodOptional<z.ZodString>;
    saveCard: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    saveCard: boolean;
    cardToken?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    cardToken?: string | undefined;
    saveCard?: boolean | undefined;
    idempotencyKey?: string | undefined;
}>, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    saveCard: boolean;
    cardToken?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    cardToken?: string | undefined;
    saveCard?: boolean | undefined;
    idempotencyKey?: string | undefined;
}>, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    saveCard: boolean;
    cardToken?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    cardToken?: string | undefined;
    saveCard?: boolean | undefined;
    idempotencyKey?: string | undefined;
}>, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    saveCard: boolean;
    cardToken?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    paymentMethod: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD";
    amount: number;
    invoiceId: string;
    cardToken?: string | undefined;
    saveCard?: boolean | undefined;
    idempotencyKey?: string | undefined;
}>;
export type PatientPaymentDto = z.infer<typeof PatientPaymentDtoSchema>;
export declare const PatientQueryInvoicesDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["OUTSTANDING", "OVERDUE", "PAID"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    minAmount: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    maxAmount: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    status?: "PAID" | "OVERDUE" | "OUTSTANDING" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    status?: "PAID" | "OVERDUE" | "OUTSTANDING" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>, {
    page: number;
    pageSize: number;
    status?: "PAID" | "OVERDUE" | "OUTSTANDING" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    status?: "PAID" | "OVERDUE" | "OUTSTANDING" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>, {
    page: number;
    pageSize: number;
    status?: "PAID" | "OVERDUE" | "OUTSTANDING" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    status?: "PAID" | "OVERDUE" | "OUTSTANDING" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>;
export type PatientQueryInvoicesDto = z.infer<typeof PatientQueryInvoicesDtoSchema>;
export declare const PatientFeedbackCategorySchema: z.ZodEnum<["SERVICE", "TREATMENT", "FACILITY", "STAFF", "OVERALL"]>;
export type PatientFeedbackCategory = z.infer<typeof PatientFeedbackCategorySchema>;
export declare const NpsSourceSchema: z.ZodEnum<["EMAIL", "SMS", "PORTAL", "MOBILE_APP"]>;
export type NpsSource = z.infer<typeof NpsSourceSchema>;
export declare const PatientSubmitFeedbackDtoSchema: z.ZodObject<{
    appointmentId: z.ZodOptional<z.ZodString>;
    rating: z.ZodNumber;
    category: z.ZodEnum<["SERVICE", "TREATMENT", "FACILITY", "STAFF", "OVERALL"]>;
    comment: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    isAnonymous: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    category: "TREATMENT" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL";
    rating: number;
    isAnonymous: boolean;
    comment?: string | undefined;
    appointmentId?: string | undefined;
}, {
    category: "TREATMENT" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL";
    rating: number;
    comment?: string | undefined;
    appointmentId?: string | undefined;
    isAnonymous?: boolean | undefined;
}>;
export type PatientSubmitFeedbackDto = z.infer<typeof PatientSubmitFeedbackDtoSchema>;
export declare const PatientSubmitNpsDtoSchema: z.ZodObject<{
    score: z.ZodNumber;
    comment: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    source: z.ZodOptional<z.ZodEnum<["EMAIL", "SMS", "PORTAL", "MOBILE_APP"]>>;
}, "strip", z.ZodTypeAny, {
    score: number;
    source?: "EMAIL" | "SMS" | "PORTAL" | "MOBILE_APP" | undefined;
    comment?: string | undefined;
}, {
    score: number;
    source?: "EMAIL" | "SMS" | "PORTAL" | "MOBILE_APP" | undefined;
    comment?: string | undefined;
}>;
export type PatientSubmitNpsDto = z.infer<typeof PatientSubmitNpsDtoSchema>;
export declare const DataExportFormatSchema: z.ZodEnum<["JSON", "PDF", "CSV"]>;
export type DataExportFormat = z.infer<typeof DataExportFormatSchema>;
export declare const RequestDataExportDtoSchema: z.ZodObject<{
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["JSON", "PDF", "CSV"]>>>;
    includeAppointments: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeMedicalRecords: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeBillingRecords: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeDocuments: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    format: "JSON" | "PDF" | "CSV";
    includeAppointments: boolean;
    includeMedicalRecords: boolean;
    includeBillingRecords: boolean;
    includeDocuments: boolean;
}, {
    format?: "JSON" | "PDF" | "CSV" | undefined;
    includeAppointments?: boolean | undefined;
    includeMedicalRecords?: boolean | undefined;
    includeBillingRecords?: boolean | undefined;
    includeDocuments?: boolean | undefined;
}>;
export type RequestDataExportDto = z.infer<typeof RequestDataExportDtoSchema>;
export declare const RequestDeletionDtoSchema: z.ZodEffects<z.ZodObject<{
    reason: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    confirmationText: z.ZodString;
    acknowledgeDataLoss: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    confirmationText: string;
    acknowledgeDataLoss: true;
    reason?: string | undefined;
}, {
    confirmationText: string;
    acknowledgeDataLoss: true;
    reason?: string | undefined;
}>, {
    confirmationText: string;
    acknowledgeDataLoss: true;
    reason?: string | undefined;
}, {
    confirmationText: string;
    acknowledgeDataLoss: true;
    reason?: string | undefined;
}>;
export type RequestDeletionDto = z.infer<typeof RequestDeletionDtoSchema>;
export declare const PatientPaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type PatientPagination = z.infer<typeof PatientPaginationSchema>;
export declare const PatientDateRangeSchema: z.ZodEffects<z.ZodObject<{
    from: z.ZodString;
    to: z.ZodString;
}, "strip", z.ZodTypeAny, {
    from: string;
    to: string;
}, {
    from: string;
    to: string;
}>, {
    from: string;
    to: string;
}, {
    from: string;
    to: string;
}>;
export type PatientDateRange = z.infer<typeof PatientDateRangeSchema>;
export declare const PatientSortSchema: z.ZodObject<{
    sortBy: z.ZodEnum<["date", "amount", "status", "name", "createdAt"]>;
    sortOrder: z.ZodEnum<["ASC", "DESC"]>;
}, "strip", z.ZodTypeAny, {
    sortBy: "status" | "date" | "name" | "createdAt" | "amount";
    sortOrder: "ASC" | "DESC";
}, {
    sortBy: "status" | "date" | "name" | "createdAt" | "amount";
    sortOrder: "ASC" | "DESC";
}>;
export type PatientSort = z.infer<typeof PatientSortSchema>;
export declare const PatientChangePasswordDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    confirmNewPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}>;
export type PatientChangePasswordDto = z.infer<typeof PatientChangePasswordDtoSchema>;
export declare const PatientRequestPasswordResetDtoSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type PatientRequestPasswordResetDto = z.infer<typeof PatientRequestPasswordResetDtoSchema>;
export declare const PatientResetPasswordDtoSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>, string, string>;
    confirmNewPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}>, {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}, {
    token: string;
    newPassword: string;
    confirmNewPassword: string;
}>;
export type PatientResetPasswordDto = z.infer<typeof PatientResetPasswordDtoSchema>;
export declare const PatientVerifyEmailDtoSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export type PatientVerifyEmailDto = z.infer<typeof PatientVerifyEmailDtoSchema>;
export declare const QueryAvailabilityDtoSchema: z.ZodEffects<z.ZodObject<{
    providerId: z.ZodString;
    date: z.ZodString;
    serviceCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    providerId: string;
    serviceCode?: string | undefined;
}, {
    date: string;
    providerId: string;
    serviceCode?: string | undefined;
}>, {
    date: string;
    providerId: string;
    serviceCode?: string | undefined;
}, {
    date: string;
    providerId: string;
    serviceCode?: string | undefined;
}>;
export type QueryAvailabilityDto = z.infer<typeof QueryAvailabilityDtoSchema>;
export declare const QueryPaymentHistoryDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    minAmount: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    maxAmount: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    paymentMethod: z.ZodOptional<z.ZodEnum<["CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "CASH"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    paymentMethod?: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    page?: number | undefined;
    paymentMethod?: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>, {
    page: number;
    pageSize: number;
    paymentMethod?: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    page?: number | undefined;
    paymentMethod?: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>, {
    page: number;
    pageSize: number;
    paymentMethod?: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}, {
    page?: number | undefined;
    paymentMethod?: "BANK_TRANSFER" | "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
}>;
export type QueryPaymentHistoryDto = z.infer<typeof QueryPaymentHistoryDtoSchema>;
export declare const PatientDocumentTypeSchema: z.ZodEnum<["MEDICAL_RECORD", "XRAY", "PRESCRIPTION", "LAB_RESULT", "CONSENT_FORM", "INVOICE", "RECEIPT", "OTHER"]>;
export type PatientDocumentType = z.infer<typeof PatientDocumentTypeSchema>;
export declare const QueryDocumentsDtoSchema: z.ZodEffects<z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["MEDICAL_RECORD", "XRAY", "PRESCRIPTION", "LAB_RESULT", "CONSENT_FORM", "INVOICE", "RECEIPT", "OTHER"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    searchTerm: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    type?: "INVOICE" | "PRESCRIPTION" | "MEDICAL_RECORD" | "OTHER" | "CONSENT_FORM" | "LAB_RESULT" | "XRAY" | "RECEIPT" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    searchTerm?: string | undefined;
}, {
    type?: "INVOICE" | "PRESCRIPTION" | "MEDICAL_RECORD" | "OTHER" | "CONSENT_FORM" | "LAB_RESULT" | "XRAY" | "RECEIPT" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    searchTerm?: string | undefined;
}>, {
    page: number;
    pageSize: number;
    type?: "INVOICE" | "PRESCRIPTION" | "MEDICAL_RECORD" | "OTHER" | "CONSENT_FORM" | "LAB_RESULT" | "XRAY" | "RECEIPT" | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    searchTerm?: string | undefined;
}, {
    type?: "INVOICE" | "PRESCRIPTION" | "MEDICAL_RECORD" | "OTHER" | "CONSENT_FORM" | "LAB_RESULT" | "XRAY" | "RECEIPT" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    searchTerm?: string | undefined;
}>;
export type QueryDocumentsDto = z.infer<typeof QueryDocumentsDtoSchema>;
export declare const UpdateNotificationSettingsDtoSchema: z.ZodObject<{
    emailNotifications: z.ZodOptional<z.ZodBoolean>;
    smsNotifications: z.ZodOptional<z.ZodBoolean>;
    pushNotifications: z.ZodOptional<z.ZodBoolean>;
    appointmentReminders: z.ZodOptional<z.ZodBoolean>;
    appointmentConfirmations: z.ZodOptional<z.ZodBoolean>;
    appointmentChanges: z.ZodOptional<z.ZodBoolean>;
    treatmentUpdates: z.ZodOptional<z.ZodBoolean>;
    billingAlerts: z.ZodOptional<z.ZodBoolean>;
    paymentConfirmations: z.ZodOptional<z.ZodBoolean>;
    marketingMessages: z.ZodOptional<z.ZodBoolean>;
    promotionalOffers: z.ZodOptional<z.ZodBoolean>;
    surveyRequests: z.ZodOptional<z.ZodBoolean>;
    reminderLeadTimeHours: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    billingAlerts?: boolean | undefined;
    emailNotifications?: boolean | undefined;
    smsNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    appointmentConfirmations?: boolean | undefined;
    appointmentChanges?: boolean | undefined;
    paymentConfirmations?: boolean | undefined;
    marketingMessages?: boolean | undefined;
    promotionalOffers?: boolean | undefined;
    surveyRequests?: boolean | undefined;
    reminderLeadTimeHours?: number | undefined;
}, {
    appointmentReminders?: boolean | undefined;
    treatmentUpdates?: boolean | undefined;
    billingAlerts?: boolean | undefined;
    emailNotifications?: boolean | undefined;
    smsNotifications?: boolean | undefined;
    pushNotifications?: boolean | undefined;
    appointmentConfirmations?: boolean | undefined;
    appointmentChanges?: boolean | undefined;
    paymentConfirmations?: boolean | undefined;
    marketingMessages?: boolean | undefined;
    promotionalOffers?: boolean | undefined;
    surveyRequests?: boolean | undefined;
    reminderLeadTimeHours?: number | undefined;
}>;
export type UpdateNotificationSettingsDto = z.infer<typeof UpdateNotificationSettingsDtoSchema>;
export declare const AddInsuranceDtoSchema: z.ZodEffects<z.ZodObject<{
    insuranceProviderId: z.ZodString;
    policyNumber: z.ZodString;
    groupNumber: z.ZodOptional<z.ZodString>;
    policyHolderName: z.ZodString;
    policyHolderDateOfBirth: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    relationshipToPolicyHolder: z.ZodDefault<z.ZodEnum<["SELF", "SPOUSE", "CHILD", "OTHER"]>>;
    effectiveDate: z.ZodString;
    expirationDate: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isPrimary: boolean;
    insuranceProviderId: string;
    policyNumber: string;
    policyHolderName: string;
    policyHolderDateOfBirth: string;
    relationshipToPolicyHolder: "OTHER" | "SELF" | "SPOUSE" | "CHILD";
    effectiveDate: string;
    groupNumber?: string | undefined;
    expirationDate?: string | undefined;
}, {
    insuranceProviderId: string;
    policyNumber: string;
    policyHolderName: string;
    policyHolderDateOfBirth: string;
    effectiveDate: string;
    isPrimary?: boolean | undefined;
    groupNumber?: string | undefined;
    relationshipToPolicyHolder?: "OTHER" | "SELF" | "SPOUSE" | "CHILD" | undefined;
    expirationDate?: string | undefined;
}>, {
    isPrimary: boolean;
    insuranceProviderId: string;
    policyNumber: string;
    policyHolderName: string;
    policyHolderDateOfBirth: string;
    relationshipToPolicyHolder: "OTHER" | "SELF" | "SPOUSE" | "CHILD";
    effectiveDate: string;
    groupNumber?: string | undefined;
    expirationDate?: string | undefined;
}, {
    insuranceProviderId: string;
    policyNumber: string;
    policyHolderName: string;
    policyHolderDateOfBirth: string;
    effectiveDate: string;
    isPrimary?: boolean | undefined;
    groupNumber?: string | undefined;
    relationshipToPolicyHolder?: "OTHER" | "SELF" | "SPOUSE" | "CHILD" | undefined;
    expirationDate?: string | undefined;
}>;
export type AddInsuranceDto = z.infer<typeof AddInsuranceDtoSchema>;
export declare const UpdateInsuranceDtoSchema: z.ZodObject<{
    policyNumber: z.ZodOptional<z.ZodString>;
    groupNumber: z.ZodOptional<z.ZodString>;
    expirationDate: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isPrimary?: boolean | undefined;
    policyNumber?: string | undefined;
    groupNumber?: string | undefined;
    expirationDate?: string | undefined;
}, {
    isPrimary?: boolean | undefined;
    policyNumber?: string | undefined;
    groupNumber?: string | undefined;
    expirationDate?: string | undefined;
}>;
export type UpdateInsuranceDto = z.infer<typeof UpdateInsuranceDtoSchema>;

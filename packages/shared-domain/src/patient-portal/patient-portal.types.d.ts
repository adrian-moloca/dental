import type { UUID, ISODateString } from '@dentalos/shared-types';
export type PatientPortalUserId = UUID & {
    readonly __brand: 'PatientPortalUserId';
};
export type PatientAppointmentId = UUID & {
    readonly __brand: 'PatientAppointmentId';
};
export type PatientInvoiceId = UUID & {
    readonly __brand: 'PatientInvoiceId';
};
export type PatientReferralCode = string & {
    readonly __brand: 'PatientReferralCode';
};
export type PatientImagingStudyId = UUID & {
    readonly __brand: 'PatientImagingStudyId';
};
export type PatientTreatmentPlanId = UUID & {
    readonly __brand: 'PatientTreatmentPlanId';
};
export type PatientPaymentId = UUID & {
    readonly __brand: 'PatientPaymentId';
};
export interface PatientLoginRequest {
    email: string;
    password: string;
    deviceId?: string;
    rememberMe?: boolean;
}
export interface PatientLoginResponse {
    accessToken: string;
    refreshToken: string;
    patient: PatientProfileSummary;
    mfaRequired?: boolean;
    mfaChallenge?: PatientMfaChallenge;
    expiresAt: ISODateString;
}
export interface PatientRegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: ISODateString;
    phone: string;
    marketingConsent?: boolean;
    referralCode?: string;
}
export declare enum PatientMfaMethod {
    SMS = "SMS",
    EMAIL = "EMAIL",
    TOTP = "TOTP"
}
export interface PatientMfaChallenge {
    challengeId: string;
    method: PatientMfaMethod;
    maskedContact: string;
    expiresAt: ISODateString;
    remainingResendAttempts: number;
}
export interface PatientMfaVerification {
    challengeId: string;
    code: string;
    trustDevice?: boolean;
}
export interface PatientProfile {
    id: PatientPortalUserId;
    email: string;
    emailVerified: boolean;
    phone: string;
    phoneVerified: boolean;
    isActive: boolean;
    mfaEnabled: boolean;
    preferredMfaMethod?: PatientMfaMethod;
    profile: PatientProfileSummary;
    contactInfo: PatientContactInfo;
    communicationPreferences: PatientCommunicationPreferences;
    notificationPreferences: PatientNotificationPreferences;
}
export interface PatientProfileSummary {
    id: PatientPortalUserId;
    firstName: string;
    lastName: string;
    preferredName?: string;
    fullName: string;
    dateOfBirth: ISODateString;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    email: string;
    phone: string;
    avatarUrl?: string;
}
export interface PatientContactInfo {
    email: string;
    emailVerified: boolean;
    phone: string;
    phoneVerified: boolean;
    address?: PatientAddress;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
}
export interface PatientAddress {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export interface PatientCommunicationPreferences {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    marketingConsent: boolean;
    marketingConsentDate?: ISODateString;
}
export interface PatientNotificationPreferences {
    appointmentReminders: boolean;
    treatmentUpdates: boolean;
    billingAlerts: boolean;
    recallReminders: boolean;
    loyaltyUpdates: boolean;
    promotionalOffers: boolean;
}
export declare enum PatientAppointmentStatus {
    UPCOMING = "UPCOMING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export interface PatientAppointment {
    id: PatientAppointmentId;
    date: string;
    time: string;
    durationMinutes: number;
    durationFormatted: string;
    providerName: string;
    providerTitle?: string;
    providerAvatarUrl?: string;
    locationName: string;
    locationAddress: string;
    locationPhone: string;
    status: PatientAppointmentStatus;
    reason: string;
    reasonDescription?: string;
    notes?: string;
    canCancel: boolean;
    canReschedule: boolean;
    cancellationDeadline?: ISODateString;
    confirmationRequired: boolean;
    isConfirmed: boolean;
}
export interface PatientAppointmentBooking {
    providerId?: string;
    serviceCode: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
    isNewPatient?: boolean;
    reasonForVisit?: string;
}
export interface PatientAppointmentReschedule {
    newDate: string;
    newTime: string;
    reason?: string;
}
export interface PatientAppointmentCancellation {
    reason: string;
}
export interface PatientClinicalSummary {
    conditions: string[];
    allergies: PatientAllergy[];
    alerts: string[];
    lastVisit?: ISODateString;
    lastVisitProvider?: string;
    nextRecommendedVisit?: ISODateString;
    recallOverdue: boolean;
}
export interface PatientVisit {
    id: string;
    date: ISODateString;
    providerName: string;
    procedures: PatientProcedure[];
    notes?: string;
    nextSteps?: string;
    attachments?: PatientVisitAttachment[];
}
export interface PatientVisitAttachment {
    id: string;
    fileName: string;
    fileType: string;
    thumbnailUrl?: string;
    fileUrl: string;
    sizeBytes: number;
    uploadedAt: ISODateString;
}
export declare enum PatientTreatmentPlanStatus {
    PROPOSED = "PROPOSED",
    ACCEPTED = "ACCEPTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DECLINED = "DECLINED"
}
export interface PatientTreatmentPlan {
    id: PatientTreatmentPlanId;
    name: string;
    description: string;
    providerName: string;
    procedures: PatientTreatmentPlanProcedure[];
    estimatedCost: number;
    currency: string;
    estimatedCostFormatted: string;
    insuranceCoverage?: number;
    patientResponsibility?: number;
    patientResponsibilityFormatted?: string;
    status: PatientTreatmentPlanStatus;
    createdDate: ISODateString;
    acceptedDate?: ISODateString;
    estimatedCompletionDate?: ISODateString;
    paymentPlanAvailable: boolean;
    paymentPlanOptions?: PatientPaymentPlanOption[];
}
export interface PatientTreatmentPlanProcedure {
    id: string;
    name: string;
    description: string;
    toothNumbers?: number[];
    surface?: string;
    estimatedCost: number;
    estimatedCostFormatted: string;
    priority: number;
    isUrgent: boolean;
    status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
    scheduledAppointment?: PatientAppointment;
}
export interface PatientPaymentPlanOption {
    id: string;
    name: string;
    months: number;
    monthlyPayment: number;
    monthlyPaymentFormatted: string;
    interestRate: number;
    interestFree: boolean;
    downPayment?: number;
    downPaymentFormatted?: string;
    totalAmount: number;
    totalAmountFormatted: string;
}
export interface PatientProcedure {
    name: string;
    description: string;
    toothNumber?: number;
    date: ISODateString;
    providerName: string;
    cost?: number;
    costFormatted?: string;
}
export declare enum PatientConditionStatus {
    ACTIVE = "ACTIVE",
    RESOLVED = "RESOLVED"
}
export interface PatientCondition {
    name: string;
    diagnosedDate: ISODateString;
    status: PatientConditionStatus;
    notes?: string;
}
export declare enum PatientAllergySeverity {
    MILD = "MILD",
    MODERATE = "MODERATE",
    SEVERE = "SEVERE"
}
export interface PatientAllergy {
    substance: string;
    severity: PatientAllergySeverity;
    reaction: string;
    diagnosedDate: ISODateString;
}
export declare enum PatientImagingType {
    XRAY = "XRAY",
    CBCT = "CBCT",
    INTRAORAL_SCAN = "INTRAORAL_SCAN",
    PHOTO = "PHOTO"
}
export interface PatientImagingStudy {
    id: PatientImagingStudyId;
    date: ISODateString;
    type: PatientImagingType;
    typeDisplayName: string;
    region: string;
    teethInvolved?: number[];
    viewerUrl: string;
    thumbnailUrl?: string;
    orderedBy: string;
    interpretation?: string;
    imageCount: number;
}
export declare enum PatientInvoiceStatus {
    OUTSTANDING = "OUTSTANDING",
    OVERDUE = "OVERDUE",
    PAID = "PAID",
    CANCELLED = "CANCELLED"
}
export interface PatientInvoice {
    id: PatientInvoiceId;
    invoiceNumber: string;
    date: ISODateString;
    dueDate: ISODateString;
    daysOverdue?: number;
    status: PatientInvoiceStatus;
    items: PatientInvoiceItem[];
    subtotal: number;
    subtotalFormatted: string;
    tax: number;
    taxFormatted: string;
    total: number;
    totalFormatted: string;
    amountPaid: number;
    amountPaidFormatted: string;
    amountDue: number;
    amountDueFormatted: string;
    insuranceCoverage?: number;
    insuranceCoverageFormatted?: string;
    patientResponsibility?: number;
    patientResponsibilityFormatted?: string;
    currency: string;
    pdfUrl?: string;
    canPayOnline: boolean;
    paymentMethodsAccepted: string[];
}
export interface PatientInvoiceItem {
    description: string;
    toothNumber?: number;
    quantity: number;
    unitPrice: number;
    unitPriceFormatted: string;
    total: number;
    totalFormatted: string;
    serviceDate?: ISODateString;
    providerName?: string;
}
export interface PatientPayment {
    id: PatientPaymentId;
    date: ISODateString;
    amount: number;
    amountFormatted: string;
    paymentMethod: string;
    invoiceNumber: string;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    receiptUrl?: string;
    currency: string;
    confirmationNumber?: string;
}
export interface PatientBalance {
    total: number;
    totalFormatted: string;
    overdue: number;
    overdueFormatted: string;
    nextDueDate?: ISODateString;
    nextDueAmount?: number;
    nextDueAmountFormatted?: string;
    creditBalance?: number;
    creditBalanceFormatted?: string;
    hasPaymentPlan: boolean;
    paymentPlan?: PatientActivePaymentPlan;
    currency: string;
}
export interface PatientActivePaymentPlan {
    id: string;
    name: string;
    monthlyPayment: number;
    monthlyPaymentFormatted: string;
    nextPaymentDate: ISODateString;
    remainingBalance: number;
    remainingBalanceFormatted: string;
    remainingPayments: number;
}
export interface PatientPaymentRequest {
    invoiceId: PatientInvoiceId;
    amount: number;
    paymentMethod: 'card' | 'bank' | 'paypal' | 'other';
    paymentMethodToken: string;
    savePaymentMethod?: boolean;
    billingAddress?: PatientAddress;
}
export declare enum PatientLoyaltyTier {
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD",
    PLATINUM = "PLATINUM"
}
export interface PatientLoyaltyAccount {
    currentPoints: number;
    tier: PatientLoyaltyTier;
    tierDisplayName: string;
    tierBenefits: string[];
    pointsToNextTier: number;
    nextTierName?: string;
    lifetimePoints: number;
    pointsExpiringSoon?: number;
    expirationDate?: ISODateString;
    isActive: boolean;
}
export interface PatientLoyaltyTransaction {
    date: ISODateString;
    amount: number;
    description: string;
    balanceAfter: number;
    type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
}
export declare enum PatientReferralStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    REDEEMED = "REDEEMED",
    EXPIRED = "EXPIRED"
}
export interface PatientReferral {
    code: PatientReferralCode;
    status: PatientReferralStatus;
    referralsSent: number;
    referralsCompleted: number;
    rewardsEarned: number;
    rewardsEarnedFormatted: string;
    rewardType: string;
    pendingReferrals: PatientPendingReferral[];
    completedReferrals: PatientCompletedReferral[];
}
export interface PatientPendingReferral {
    friendName?: string;
    inviteDate: ISODateString;
    expirationDate?: ISODateString;
    daysUntilExpiration?: number;
}
export interface PatientCompletedReferral {
    friendName: string;
    completionDate: ISODateString;
    rewardEarned: number;
    rewardEarnedFormatted: string;
}
export interface PatientOffer {
    id: string;
    title: string;
    description: string;
    discount: string;
    expiryDate: ISODateString;
    daysUntilExpiry: number;
    code: string;
    terms?: string;
    isRedeemed: boolean;
}
export interface PatientFeedbackRequest {
    rating: 1 | 2 | 3 | 4 | 5;
    category: 'service' | 'treatment' | 'facility' | 'staff' | 'overall';
    comment?: string;
    appointmentId?: PatientAppointmentId;
}
export interface PatientNpsRequest {
    score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    comment?: string;
}
export declare enum PatientDataExportStatus {
    REQUESTED = "REQUESTED",
    READY = "READY",
    EXPIRED = "EXPIRED",
    FAILED = "FAILED"
}
export interface PatientDataExport {
    requestDate: ISODateString;
    status: PatientDataExportStatus;
    downloadUrl?: string;
    expiryDate?: ISODateString;
    daysUntilExpiry?: number;
    fileSizeBytes?: number;
    fileSizeFormatted?: string;
    errorMessage?: string;
}
export declare enum PatientDeletionStatus {
    REQUESTED = "REQUESTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DENIED = "DENIED"
}
export interface PatientDeletionRequest {
    requestDate: ISODateString;
    status: PatientDeletionStatus;
    scheduledCompletionDate?: ISODateString;
    completionDate?: ISODateString;
    reason?: string;
    denialReason?: string;
    canCancel: boolean;
    gracePeriodEnd?: ISODateString;
}
export declare enum PatientConsentType {
    MARKETING = "MARKETING",
    DATA_SHARING = "DATA_SHARING",
    RESEARCH = "RESEARCH",
    COMMUNICATIONS = "COMMUNICATIONS"
}
export interface PatientConsent {
    type: PatientConsentType;
    typeDisplayName: string;
    typeDescription: string;
    granted: boolean;
    grantedDate?: ISODateString;
    revokedDate?: ISODateString;
}
export declare enum PatientErrorCode {
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    UNAUTHORIZED = "UNAUTHORIZED",
    ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
    APPOINTMENT_CONFLICT = "APPOINTMENT_CONFLICT",
    APPOINTMENT_NOT_CANCELLABLE = "APPOINTMENT_NOT_CANCELLABLE",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    INVALID_REQUEST = "INVALID_REQUEST",
    NOT_FOUND = "NOT_FOUND",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
export interface PatientErrorResponse {
    code: PatientErrorCode;
    message: string;
    details?: string | Record<string, string>;
}
export interface PatientPaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
export interface PatientDateRange {
    from: string;
    to: string;
}
export interface PatientAppointmentFilter {
    status?: PatientAppointmentStatus | PatientAppointmentStatus[];
    dateRange?: PatientDateRange;
    providerId?: string;
}
export interface PatientInvoiceFilter {
    status?: PatientInvoiceStatus | PatientInvoiceStatus[];
    dateRange?: PatientDateRange;
    minAmount?: number;
    maxAmount?: number;
}
export declare enum PatientSortOrder {
    ASC = "ASC",
    DESC = "DESC"
}
export interface PatientSortCriteria {
    field: string;
    order: PatientSortOrder;
}

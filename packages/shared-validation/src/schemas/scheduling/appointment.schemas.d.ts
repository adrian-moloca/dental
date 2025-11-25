import { z } from 'zod';
export declare const AppointmentStatusSchema: z.ZodEnum<["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"]>;
export declare const CancellationTypeSchema: z.ZodEnum<["PATIENT", "PROVIDER", "SYSTEM", "NO_SHOW"]>;
export declare const AppointmentPrioritySchema: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>;
export declare const ParticipantRoleSchema: z.ZodEnum<["PROVIDER", "ASSISTANT", "HYGIENIST", "SPECIALIST", "OTHER"]>;
export declare const BookingSourceSchema: z.ZodEnum<["ONLINE_PORTAL", "PHONE", "WALK_IN", "ADMIN", "INTEGRATION", "OTHER"]>;
export declare const CheckInMethodSchema: z.ZodEnum<["KIOSK", "FRONT_DESK", "MOBILE_APP", "OTHER"]>;
export declare const ConfirmationMethodSchema: z.ZodEnum<["EMAIL", "PHONE", "SMS", "IN_PERSON", "ONLINE_PORTAL"]>;
export declare const RecurrencePatternSchema: z.ZodEnum<["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]>;
export declare const AppointmentParticipantSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<["PROVIDER", "ASSISTANT", "HYGIENIST", "SPECIALIST", "OTHER"]>;
    required: z.ZodDefault<z.ZodBoolean>;
    displayName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
    required: boolean;
    displayName?: string | undefined;
}, {
    userId: string;
    role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
    displayName?: string | undefined;
    required?: boolean | undefined;
}>;
export declare const RecurrenceRuleSchema: z.ZodObject<{
    pattern: z.ZodEnum<["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]>;
    interval: z.ZodDefault<z.ZodNumber>;
    daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    endDate: z.ZodOptional<z.ZodString>;
    occurrences: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    interval: number;
    pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
    endDate?: string | undefined;
    daysOfWeek?: number[] | undefined;
    occurrences?: number | undefined;
}, {
    pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
    endDate?: string | undefined;
    interval?: number | undefined;
    daysOfWeek?: number[] | undefined;
    occurrences?: number | undefined;
}>;
export declare const AppointmentNoteSchema: z.ZodObject<{
    id: z.ZodString;
    content: z.ZodString;
    createdBy: z.ZodString;
    createdAt: z.ZodString;
    isPrivate: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    content: string;
    createdBy: string;
    isPrivate: boolean;
}, {
    id: string;
    createdAt: string;
    content: string;
    createdBy: string;
    isPrivate?: boolean | undefined;
}>;
export declare const BookingMetadataSchema: z.ZodObject<{
    bookingSource: z.ZodEnum<["ONLINE_PORTAL", "PHONE", "WALK_IN", "ADMIN", "INTEGRATION", "OTHER"]>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    referrer: z.ZodOptional<z.ZodString>;
    bookedBy: z.ZodString;
    bookedAt: z.ZodString;
    confirmationToken: z.ZodOptional<z.ZodString>;
    requiresApproval: z.ZodDefault<z.ZodBoolean>;
    approvalStatus: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>;
    approvedBy: z.ZodOptional<z.ZodString>;
    approvedAt: z.ZodOptional<z.ZodString>;
    approvalNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
    bookedBy: string;
    bookedAt: string;
    requiresApproval: boolean;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
    referrer?: string | undefined;
    approvedBy?: string | undefined;
    approvalNotes?: string | undefined;
    confirmationToken?: string | undefined;
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    approvedAt?: string | undefined;
}, {
    bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
    bookedBy: string;
    bookedAt: string;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
    referrer?: string | undefined;
    approvedBy?: string | undefined;
    approvalNotes?: string | undefined;
    confirmationToken?: string | undefined;
    requiresApproval?: boolean | undefined;
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
    approvedAt?: string | undefined;
}>;
export declare const ResourceAllocationSchema: z.ZodObject<{
    room: z.ZodOptional<z.ZodString>;
    equipmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    specialRequirements: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    equipmentIds?: string[] | undefined;
    room?: string | undefined;
    specialRequirements?: string | undefined;
}, {
    equipmentIds?: string[] | undefined;
    room?: string | undefined;
    specialRequirements?: string | undefined;
}>;
export declare const CancellationDetailsSchema: z.ZodObject<{
    cancellationType: z.ZodEnum<["PATIENT", "PROVIDER", "SYSTEM", "NO_SHOW"]>;
    reason: z.ZodOptional<z.ZodString>;
    cancelledBy: z.ZodString;
    cancelledAt: z.ZodString;
    feeCharged: z.ZodDefault<z.ZodBoolean>;
    feeAmount: z.ZodOptional<z.ZodNumber>;
    feeCurrency: z.ZodOptional<z.ZodString>;
    withinPolicy: z.ZodDefault<z.ZodBoolean>;
    notificationSent: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
    cancelledBy: string;
    cancelledAt: string;
    feeCharged: boolean;
    withinPolicy: boolean;
    notificationSent: boolean;
    reason?: string | undefined;
    feeAmount?: number | undefined;
    feeCurrency?: string | undefined;
}, {
    cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
    cancelledBy: string;
    cancelledAt: string;
    reason?: string | undefined;
    feeCharged?: boolean | undefined;
    feeAmount?: number | undefined;
    feeCurrency?: string | undefined;
    withinPolicy?: boolean | undefined;
    notificationSent?: boolean | undefined;
}>;
export declare const ConfirmationDetailsSchema: z.ZodObject<{
    confirmedAt: z.ZodString;
    confirmedBy: z.ZodString;
    confirmationMethod: z.ZodEnum<["EMAIL", "PHONE", "SMS", "IN_PERSON", "ONLINE_PORTAL"]>;
    confirmationCode: z.ZodOptional<z.ZodString>;
    reminderSent: z.ZodDefault<z.ZodBoolean>;
    lastReminderAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confirmedAt: string;
    confirmedBy: string;
    confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
    reminderSent: boolean;
    confirmationCode?: string | undefined;
    lastReminderAt?: string | undefined;
}, {
    confirmedAt: string;
    confirmedBy: string;
    confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
    confirmationCode?: string | undefined;
    reminderSent?: boolean | undefined;
    lastReminderAt?: string | undefined;
}>;
export declare const CheckInDetailsSchema: z.ZodObject<{
    checkedInAt: z.ZodString;
    checkedInBy: z.ZodString;
    checkInMethod: z.ZodEnum<["KIOSK", "FRONT_DESK", "MOBILE_APP", "OTHER"]>;
    arrivedOnTime: z.ZodDefault<z.ZodBoolean>;
    minutesOffset: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    checkedInAt: string;
    checkedInBy: string;
    checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
    arrivedOnTime: boolean;
    notes?: string | undefined;
    minutesOffset?: number | undefined;
}, {
    checkedInAt: string;
    checkedInBy: string;
    checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
    notes?: string | undefined;
    arrivedOnTime?: boolean | undefined;
    minutesOffset?: number | undefined;
}>;
export declare const CompletionDetailsSchema: z.ZodObject<{
    completedAt: z.ZodString;
    completedBy: z.ZodString;
    actualDuration: z.ZodNumber;
    treatmentCompleted: z.ZodDefault<z.ZodBoolean>;
    outcomeNotes: z.ZodOptional<z.ZodString>;
    followUpRequired: z.ZodDefault<z.ZodBoolean>;
    followUpDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    completedAt: string;
    completedBy: string;
    actualDuration: number;
    treatmentCompleted: boolean;
    followUpRequired: boolean;
    outcomeNotes?: string | undefined;
    followUpDate?: string | undefined;
}, {
    completedAt: string;
    completedBy: string;
    actualDuration: number;
    outcomeNotes?: string | undefined;
    treatmentCompleted?: boolean | undefined;
    followUpRequired?: boolean | undefined;
    followUpDate?: string | undefined;
}>;
export declare const AppointmentSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodString;
    patientId: z.ZodString;
    providerId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"]>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    duration: z.ZodNumber;
    appointmentType: z.ZodString;
    appointmentTypeCode: z.ZodOptional<z.ZodString>;
    participants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodEnum<["PROVIDER", "ASSISTANT", "HYGIENIST", "SPECIALIST", "OTHER"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        displayName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }, {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }>, "many">>;
    resources: z.ZodOptional<z.ZodObject<{
        room: z.ZodOptional<z.ZodString>;
        equipmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        specialRequirements: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    }, {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    }>>;
    notes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        createdBy: z.ZodString;
        createdAt: z.ZodString;
        isPrivate: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate: boolean;
    }, {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate?: boolean | undefined;
    }>, "many">>;
    bookingMetadata: z.ZodOptional<z.ZodObject<{
        bookingSource: z.ZodEnum<["ONLINE_PORTAL", "PHONE", "WALK_IN", "ADMIN", "INTEGRATION", "OTHER"]>;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        referrer: z.ZodOptional<z.ZodString>;
        bookedBy: z.ZodString;
        bookedAt: z.ZodString;
        confirmationToken: z.ZodOptional<z.ZodString>;
        requiresApproval: z.ZodDefault<z.ZodBoolean>;
        approvalStatus: z.ZodOptional<z.ZodEnum<["PENDING", "APPROVED", "REJECTED"]>>;
        approvedBy: z.ZodOptional<z.ZodString>;
        approvedAt: z.ZodOptional<z.ZodString>;
        approvalNotes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        requiresApproval: boolean;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    }, {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        requiresApproval?: boolean | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    }>>;
    recurrenceRule: z.ZodOptional<z.ZodObject<{
        pattern: z.ZodEnum<["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]>;
        interval: z.ZodDefault<z.ZodNumber>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        endDate: z.ZodOptional<z.ZodString>;
        occurrences: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    }, {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    }>>;
    parentAppointmentId: z.ZodOptional<z.ZodString>;
    seriesId: z.ZodOptional<z.ZodString>;
    confirmation: z.ZodOptional<z.ZodObject<{
        confirmedAt: z.ZodString;
        confirmedBy: z.ZodString;
        confirmationMethod: z.ZodEnum<["EMAIL", "PHONE", "SMS", "IN_PERSON", "ONLINE_PORTAL"]>;
        confirmationCode: z.ZodOptional<z.ZodString>;
        reminderSent: z.ZodDefault<z.ZodBoolean>;
        lastReminderAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        reminderSent: boolean;
        confirmationCode?: string | undefined;
        lastReminderAt?: string | undefined;
    }, {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        confirmationCode?: string | undefined;
        reminderSent?: boolean | undefined;
        lastReminderAt?: string | undefined;
    }>>;
    checkIn: z.ZodOptional<z.ZodObject<{
        checkedInAt: z.ZodString;
        checkedInBy: z.ZodString;
        checkInMethod: z.ZodEnum<["KIOSK", "FRONT_DESK", "MOBILE_APP", "OTHER"]>;
        arrivedOnTime: z.ZodDefault<z.ZodBoolean>;
        minutesOffset: z.ZodOptional<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        arrivedOnTime: boolean;
        notes?: string | undefined;
        minutesOffset?: number | undefined;
    }, {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        notes?: string | undefined;
        arrivedOnTime?: boolean | undefined;
        minutesOffset?: number | undefined;
    }>>;
    cancellation: z.ZodOptional<z.ZodObject<{
        cancellationType: z.ZodEnum<["PATIENT", "PROVIDER", "SYSTEM", "NO_SHOW"]>;
        reason: z.ZodOptional<z.ZodString>;
        cancelledBy: z.ZodString;
        cancelledAt: z.ZodString;
        feeCharged: z.ZodDefault<z.ZodBoolean>;
        feeAmount: z.ZodOptional<z.ZodNumber>;
        feeCurrency: z.ZodOptional<z.ZodString>;
        withinPolicy: z.ZodDefault<z.ZodBoolean>;
        notificationSent: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        feeCharged: boolean;
        withinPolicy: boolean;
        notificationSent: boolean;
        reason?: string | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
    }, {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        reason?: string | undefined;
        feeCharged?: boolean | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
        withinPolicy?: boolean | undefined;
        notificationSent?: boolean | undefined;
    }>>;
    completion: z.ZodOptional<z.ZodObject<{
        completedAt: z.ZodString;
        completedBy: z.ZodString;
        actualDuration: z.ZodNumber;
        treatmentCompleted: z.ZodDefault<z.ZodBoolean>;
        outcomeNotes: z.ZodOptional<z.ZodString>;
        followUpRequired: z.ZodDefault<z.ZodBoolean>;
        followUpDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        treatmentCompleted: boolean;
        followUpRequired: boolean;
        outcomeNotes?: string | undefined;
        followUpDate?: string | undefined;
    }, {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        outcomeNotes?: string | undefined;
        treatmentCompleted?: boolean | undefined;
        followUpRequired?: boolean | undefined;
        followUpDate?: string | undefined;
    }>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdBy: z.ZodString;
    updatedBy: z.ZodString;
    deletedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    version: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
    organizationId: string;
    clinicId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    notes: {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate: boolean;
    }[];
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    updatedBy: string;
    createdBy: string;
    appointmentType: string;
    participants: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    recurrenceRule?: {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    appointmentTypeCode?: string | undefined;
    resources?: {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    } | undefined;
    bookingMetadata?: {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        requiresApproval: boolean;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    } | undefined;
    parentAppointmentId?: string | undefined;
    seriesId?: string | undefined;
    confirmation?: {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        reminderSent: boolean;
        confirmationCode?: string | undefined;
        lastReminderAt?: string | undefined;
    } | undefined;
    checkIn?: {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        arrivedOnTime: boolean;
        notes?: string | undefined;
        minutesOffset?: number | undefined;
    } | undefined;
    cancellation?: {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        feeCharged: boolean;
        withinPolicy: boolean;
        notificationSent: boolean;
        reason?: string | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
    } | undefined;
    completion?: {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        treatmentCompleted: boolean;
        followUpRequired: boolean;
        outcomeNotes?: string | undefined;
        followUpDate?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
    organizationId: string;
    clinicId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    updatedBy: string;
    createdBy: string;
    appointmentType: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    notes?: {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate?: boolean | undefined;
    }[] | undefined;
    recurrenceRule?: {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    appointmentTypeCode?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
    resources?: {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    } | undefined;
    bookingMetadata?: {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        requiresApproval?: boolean | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    } | undefined;
    parentAppointmentId?: string | undefined;
    seriesId?: string | undefined;
    confirmation?: {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        confirmationCode?: string | undefined;
        reminderSent?: boolean | undefined;
        lastReminderAt?: string | undefined;
    } | undefined;
    checkIn?: {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        notes?: string | undefined;
        arrivedOnTime?: boolean | undefined;
        minutesOffset?: number | undefined;
    } | undefined;
    cancellation?: {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        reason?: string | undefined;
        feeCharged?: boolean | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
        withinPolicy?: boolean | undefined;
        notificationSent?: boolean | undefined;
    } | undefined;
    completion?: {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        outcomeNotes?: string | undefined;
        treatmentCompleted?: boolean | undefined;
        followUpRequired?: boolean | undefined;
        followUpDate?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>, {
    status: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
    organizationId: string;
    clinicId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    notes: {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate: boolean;
    }[];
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    updatedBy: string;
    createdBy: string;
    appointmentType: string;
    participants: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    recurrenceRule?: {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    appointmentTypeCode?: string | undefined;
    resources?: {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    } | undefined;
    bookingMetadata?: {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        requiresApproval: boolean;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    } | undefined;
    parentAppointmentId?: string | undefined;
    seriesId?: string | undefined;
    confirmation?: {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        reminderSent: boolean;
        confirmationCode?: string | undefined;
        lastReminderAt?: string | undefined;
    } | undefined;
    checkIn?: {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        arrivedOnTime: boolean;
        notes?: string | undefined;
        minutesOffset?: number | undefined;
    } | undefined;
    cancellation?: {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        feeCharged: boolean;
        withinPolicy: boolean;
        notificationSent: boolean;
        reason?: string | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
    } | undefined;
    completion?: {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        treatmentCompleted: boolean;
        followUpRequired: boolean;
        outcomeNotes?: string | undefined;
        followUpDate?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
    organizationId: string;
    clinicId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    updatedBy: string;
    createdBy: string;
    appointmentType: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    notes?: {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate?: boolean | undefined;
    }[] | undefined;
    recurrenceRule?: {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    appointmentTypeCode?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
    resources?: {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    } | undefined;
    bookingMetadata?: {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        requiresApproval?: boolean | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    } | undefined;
    parentAppointmentId?: string | undefined;
    seriesId?: string | undefined;
    confirmation?: {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        confirmationCode?: string | undefined;
        reminderSent?: boolean | undefined;
        lastReminderAt?: string | undefined;
    } | undefined;
    checkIn?: {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        notes?: string | undefined;
        arrivedOnTime?: boolean | undefined;
        minutesOffset?: number | undefined;
    } | undefined;
    cancellation?: {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        reason?: string | undefined;
        feeCharged?: boolean | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
        withinPolicy?: boolean | undefined;
        notificationSent?: boolean | undefined;
    } | undefined;
    completion?: {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        outcomeNotes?: string | undefined;
        treatmentCompleted?: boolean | undefined;
        followUpRequired?: boolean | undefined;
        followUpDate?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>, {
    status: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
    organizationId: string;
    clinicId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    notes: {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate: boolean;
    }[];
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    updatedBy: string;
    createdBy: string;
    appointmentType: string;
    participants: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    recurrenceRule?: {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    appointmentTypeCode?: string | undefined;
    resources?: {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    } | undefined;
    bookingMetadata?: {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        requiresApproval: boolean;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    } | undefined;
    parentAppointmentId?: string | undefined;
    seriesId?: string | undefined;
    confirmation?: {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        reminderSent: boolean;
        confirmationCode?: string | undefined;
        lastReminderAt?: string | undefined;
    } | undefined;
    checkIn?: {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        arrivedOnTime: boolean;
        notes?: string | undefined;
        minutesOffset?: number | undefined;
    } | undefined;
    cancellation?: {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        feeCharged: boolean;
        withinPolicy: boolean;
        notificationSent: boolean;
        reason?: string | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
    } | undefined;
    completion?: {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        treatmentCompleted: boolean;
        followUpRequired: boolean;
        outcomeNotes?: string | undefined;
        followUpDate?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}, {
    status: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED";
    organizationId: string;
    clinicId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    updatedBy: string;
    createdBy: string;
    appointmentType: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    notes?: {
        id: string;
        createdAt: string;
        content: string;
        createdBy: string;
        isPrivate?: boolean | undefined;
    }[] | undefined;
    recurrenceRule?: {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    appointmentTypeCode?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
    resources?: {
        equipmentIds?: string[] | undefined;
        room?: string | undefined;
        specialRequirements?: string | undefined;
    } | undefined;
    bookingMetadata?: {
        bookingSource: "OTHER" | "PHONE" | "ADMIN" | "ONLINE_PORTAL" | "WALK_IN" | "INTEGRATION";
        bookedBy: string;
        bookedAt: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
        referrer?: string | undefined;
        approvedBy?: string | undefined;
        approvalNotes?: string | undefined;
        confirmationToken?: string | undefined;
        requiresApproval?: boolean | undefined;
        approvalStatus?: "PENDING" | "APPROVED" | "REJECTED" | undefined;
        approvedAt?: string | undefined;
    } | undefined;
    parentAppointmentId?: string | undefined;
    seriesId?: string | undefined;
    confirmation?: {
        confirmedAt: string;
        confirmedBy: string;
        confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
        confirmationCode?: string | undefined;
        reminderSent?: boolean | undefined;
        lastReminderAt?: string | undefined;
    } | undefined;
    checkIn?: {
        checkedInAt: string;
        checkedInBy: string;
        checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
        notes?: string | undefined;
        arrivedOnTime?: boolean | undefined;
        minutesOffset?: number | undefined;
    } | undefined;
    cancellation?: {
        cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
        cancelledBy: string;
        cancelledAt: string;
        reason?: string | undefined;
        feeCharged?: boolean | undefined;
        feeAmount?: number | undefined;
        feeCurrency?: string | undefined;
        withinPolicy?: boolean | undefined;
        notificationSent?: boolean | undefined;
    } | undefined;
    completion?: {
        completedAt: string;
        completedBy: string;
        actualDuration: number;
        outcomeNotes?: string | undefined;
        treatmentCompleted?: boolean | undefined;
        followUpRequired?: boolean | undefined;
        followUpDate?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    deletedBy?: string | null | undefined;
}>;
export declare const CreateAppointmentDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    organizationId: z.ZodString;
    clinicId: z.ZodString;
    patientId: z.ZodString;
    providerId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    duration: z.ZodNumber;
    appointmentType: z.ZodString;
    appointmentTypeCode: z.ZodOptional<z.ZodString>;
    room: z.ZodOptional<z.ZodString>;
    participants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodEnum<["PROVIDER", "ASSISTANT", "HYGIENIST", "SPECIALIST", "OTHER"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        displayName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }, {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodString>;
    recurrenceRule: z.ZodOptional<z.ZodObject<{
        pattern: z.ZodEnum<["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY", "CUSTOM"]>;
        interval: z.ZodDefault<z.ZodNumber>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        endDate: z.ZodOptional<z.ZodString>;
        occurrences: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    }, {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    clinicId: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: string;
    participants: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    recurrenceRule?: {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    room?: string | undefined;
    appointmentTypeCode?: string | undefined;
}, {
    organizationId: string;
    clinicId: string;
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    notes?: string | undefined;
    recurrenceRule?: {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    room?: string | undefined;
    appointmentTypeCode?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
}>, {
    organizationId: string;
    clinicId: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: string;
    participants: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    recurrenceRule?: {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    room?: string | undefined;
    appointmentTypeCode?: string | undefined;
}, {
    organizationId: string;
    clinicId: string;
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    notes?: string | undefined;
    recurrenceRule?: {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    room?: string | undefined;
    appointmentTypeCode?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
}>, {
    organizationId: string;
    clinicId: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: string;
    participants: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    recurrenceRule?: {
        interval: number;
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    room?: string | undefined;
    appointmentTypeCode?: string | undefined;
}, {
    organizationId: string;
    clinicId: string;
    title: string;
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    appointmentType: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    notes?: string | undefined;
    recurrenceRule?: {
        pattern: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";
        endDate?: string | undefined;
        interval?: number | undefined;
        daysOfWeek?: number[] | undefined;
        occurrences?: number | undefined;
    } | undefined;
    room?: string | undefined;
    appointmentTypeCode?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
}>;
export declare const UpdateAppointmentDtoSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    appointmentType: z.ZodOptional<z.ZodString>;
    room: z.ZodOptional<z.ZodString>;
    participants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        role: z.ZodEnum<["PROVIDER", "ASSISTANT", "HYGIENIST", "SPECIALIST", "OTHER"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        displayName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }, {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    title?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    duration?: number | undefined;
    room?: string | undefined;
    appointmentType?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[] | undefined;
}, {
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    title?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    duration?: number | undefined;
    room?: string | undefined;
    appointmentType?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
}>, {
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    title?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    duration?: number | undefined;
    room?: string | undefined;
    appointmentType?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        required: boolean;
        displayName?: string | undefined;
    }[] | undefined;
}, {
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    title?: string | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    duration?: number | undefined;
    room?: string | undefined;
    appointmentType?: string | undefined;
    participants?: {
        userId: string;
        role: "HYGIENIST" | "ASSISTANT" | "OTHER" | "PROVIDER" | "SPECIALIST";
        displayName?: string | undefined;
        required?: boolean | undefined;
    }[] | undefined;
}>;
export declare const AppointmentQueryDtoSchema: z.ZodObject<{
    organizationId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"]>, z.ZodArray<z.ZodEnum<["SCHEDULED", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW", "RESCHEDULED"]>, "many">]>>;
    priority: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>, z.ZodArray<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>, "many">]>>;
    appointmentType: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    startDateFrom: z.ZodOptional<z.ZodString>;
    startDateTo: z.ZodOptional<z.ZodString>;
    includeCancelled: z.ZodDefault<z.ZodBoolean>;
    includeDeleted: z.ZodDefault<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["startTime", "createdAt", "updatedAt", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "updatedAt" | "startTime";
    sortOrder: "asc" | "desc";
    includeCancelled: boolean;
    includeDeleted: boolean;
    status?: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED" | ("CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED")[] | undefined;
    organizationId?: string | undefined;
    clinicId?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[] | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentType?: string | string[] | undefined;
    startDateFrom?: string | undefined;
    startDateTo?: string | undefined;
}, {
    status?: "CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED" | ("CANCELLED" | "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW" | "RESCHEDULED")[] | undefined;
    organizationId?: string | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[] | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "updatedAt" | "startTime" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentType?: string | string[] | undefined;
    startDateFrom?: string | undefined;
    startDateTo?: string | undefined;
    includeCancelled?: boolean | undefined;
    includeDeleted?: boolean | undefined;
}>;
export declare const ConfirmAppointmentDtoSchema: z.ZodObject<{
    confirmationMethod: z.ZodEnum<["EMAIL", "PHONE", "SMS", "IN_PERSON", "ONLINE_PORTAL"]>;
    confirmationCode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
    notes?: string | undefined;
    confirmationCode?: string | undefined;
}, {
    confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON" | "ONLINE_PORTAL";
    notes?: string | undefined;
    confirmationCode?: string | undefined;
}>;
export declare const CheckInAppointmentDtoSchema: z.ZodObject<{
    checkInMethod: z.ZodEnum<["KIOSK", "FRONT_DESK", "MOBILE_APP", "OTHER"]>;
    arrivedOnTime: z.ZodDefault<z.ZodBoolean>;
    minutesOffset: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
    arrivedOnTime: boolean;
    notes?: string | undefined;
    minutesOffset?: number | undefined;
}, {
    checkInMethod: "OTHER" | "MOBILE_APP" | "KIOSK" | "FRONT_DESK";
    notes?: string | undefined;
    arrivedOnTime?: boolean | undefined;
    minutesOffset?: number | undefined;
}>;
export declare const CancelAppointmentDtoSchema: z.ZodObject<{
    cancellationType: z.ZodEnum<["PATIENT", "PROVIDER", "SYSTEM", "NO_SHOW"]>;
    reason: z.ZodOptional<z.ZodString>;
    cancelEntireSeries: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
    cancelEntireSeries: boolean;
    reason?: string | undefined;
}, {
    cancellationType: "PATIENT" | "NO_SHOW" | "PROVIDER" | "SYSTEM";
    reason?: string | undefined;
    cancelEntireSeries?: boolean | undefined;
}>;
export declare const RescheduleAppointmentDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    newStartTime: z.ZodString;
    newEndTime: z.ZodString;
    newDuration: z.ZodNumber;
    newRoom: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    rescheduleEntireSeries: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    newStartTime: string;
    newEndTime: string;
    newDuration: number;
    rescheduleEntireSeries: boolean;
    reason?: string | undefined;
    newRoom?: string | undefined;
}, {
    newStartTime: string;
    newEndTime: string;
    newDuration: number;
    reason?: string | undefined;
    newRoom?: string | undefined;
    rescheduleEntireSeries?: boolean | undefined;
}>, {
    newStartTime: string;
    newEndTime: string;
    newDuration: number;
    rescheduleEntireSeries: boolean;
    reason?: string | undefined;
    newRoom?: string | undefined;
}, {
    newStartTime: string;
    newEndTime: string;
    newDuration: number;
    reason?: string | undefined;
    newRoom?: string | undefined;
    rescheduleEntireSeries?: boolean | undefined;
}>, {
    newStartTime: string;
    newEndTime: string;
    newDuration: number;
    rescheduleEntireSeries: boolean;
    reason?: string | undefined;
    newRoom?: string | undefined;
}, {
    newStartTime: string;
    newEndTime: string;
    newDuration: number;
    reason?: string | undefined;
    newRoom?: string | undefined;
    rescheduleEntireSeries?: boolean | undefined;
}>;
export declare const CompleteAppointmentDtoSchema: z.ZodObject<{
    actualDuration: z.ZodNumber;
    treatmentCompleted: z.ZodDefault<z.ZodBoolean>;
    outcomeNotes: z.ZodOptional<z.ZodString>;
    followUpRequired: z.ZodDefault<z.ZodBoolean>;
    followUpDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    actualDuration: number;
    treatmentCompleted: boolean;
    followUpRequired: boolean;
    outcomeNotes?: string | undefined;
    followUpDate?: string | undefined;
}, {
    actualDuration: number;
    outcomeNotes?: string | undefined;
    treatmentCompleted?: boolean | undefined;
    followUpRequired?: boolean | undefined;
    followUpDate?: string | undefined;
}>;
export type AppointmentInput = z.input<typeof AppointmentSchema>;
export type AppointmentOutput = z.output<typeof AppointmentSchema>;
export type CreateAppointmentDtoInput = z.input<typeof CreateAppointmentDtoSchema>;
export type CreateAppointmentDtoOutput = z.output<typeof CreateAppointmentDtoSchema>;
export type UpdateAppointmentDtoInput = z.input<typeof UpdateAppointmentDtoSchema>;
export type UpdateAppointmentDtoOutput = z.output<typeof UpdateAppointmentDtoSchema>;
export type AppointmentQueryDtoInput = z.input<typeof AppointmentQueryDtoSchema>;
export type AppointmentQueryDtoOutput = z.output<typeof AppointmentQueryDtoSchema>;
export type ConfirmAppointmentDtoInput = z.input<typeof ConfirmAppointmentDtoSchema>;
export type ConfirmAppointmentDtoOutput = z.output<typeof ConfirmAppointmentDtoSchema>;
export type CheckInAppointmentDtoInput = z.input<typeof CheckInAppointmentDtoSchema>;
export type CheckInAppointmentDtoOutput = z.output<typeof CheckInAppointmentDtoSchema>;
export type CancelAppointmentDtoInput = z.input<typeof CancelAppointmentDtoSchema>;
export type CancelAppointmentDtoOutput = z.output<typeof CancelAppointmentDtoSchema>;
export type RescheduleAppointmentDtoInput = z.input<typeof RescheduleAppointmentDtoSchema>;
export type RescheduleAppointmentDtoOutput = z.output<typeof RescheduleAppointmentDtoSchema>;
export type CompleteAppointmentDtoInput = z.input<typeof CompleteAppointmentDtoSchema>;
export type CompleteAppointmentDtoOutput = z.output<typeof CompleteAppointmentDtoSchema>;

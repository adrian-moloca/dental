import { z } from 'zod';
export declare const CampaignChannelSchema: z.ZodEnum<["EMAIL", "SMS", "PUSH", "WHATSAPP"]>;
export type CampaignChannel = z.infer<typeof CampaignChannelSchema>;
export declare const CampaignStatusSchema: z.ZodEnum<["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]>;
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;
export declare const CampaignScheduleTypeSchema: z.ZodEnum<["IMMEDIATE", "SCHEDULED", "RECURRING"]>;
export type CampaignScheduleType = z.infer<typeof CampaignScheduleTypeSchema>;
export declare const TemplateVariableSchema: z.ZodString;
export type TemplateVariable = z.infer<typeof TemplateVariableSchema>;
export declare const CampaignTemplateSchema: z.ZodEffects<z.ZodObject<{
    subject: z.ZodOptional<z.ZodString>;
    body: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preheader: z.ZodOptional<z.ZodString>;
    fromName: z.ZodOptional<z.ZodString>;
    replyTo: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    body: string;
    language: string;
    subject?: string | undefined;
    fromName?: string | undefined;
    replyTo?: string | undefined;
    variables?: string[] | undefined;
    preheader?: string | undefined;
}, {
    body: string;
    subject?: string | undefined;
    fromName?: string | undefined;
    replyTo?: string | undefined;
    variables?: string[] | undefined;
    preheader?: string | undefined;
    language?: string | undefined;
}>, {
    body: string;
    language: string;
    subject?: string | undefined;
    fromName?: string | undefined;
    replyTo?: string | undefined;
    variables?: string[] | undefined;
    preheader?: string | undefined;
}, {
    body: string;
    subject?: string | undefined;
    fromName?: string | undefined;
    replyTo?: string | undefined;
    variables?: string[] | undefined;
    preheader?: string | undefined;
    language?: string | undefined;
}>;
export type CampaignTemplate = z.infer<typeof CampaignTemplateSchema>;
export declare const CampaignScheduleSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["IMMEDIATE", "SCHEDULED", "RECURRING"]>;
    scheduledAt: z.ZodOptional<z.ZodString>;
    timezone: z.ZodDefault<z.ZodString>;
    recurrence: z.ZodOptional<z.ZodObject<{
        frequency: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
        interval: z.ZodNumber;
        endDate: z.ZodOptional<z.ZodString>;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        dayOfMonth: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    }, {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone: string;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone?: string | undefined;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}>, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone: string;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone?: string | undefined;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}>, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone: string;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone?: string | undefined;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}>, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone: string;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}, {
    type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
    timezone?: string | undefined;
    scheduledAt?: string | undefined;
    recurrence?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        interval: number;
        endDate?: string | undefined;
        daysOfWeek?: number[] | undefined;
        dayOfMonth?: number | undefined;
    } | undefined;
}>;
export type CampaignSchedule = z.infer<typeof CampaignScheduleSchema>;
export declare const CreateCampaignDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    channel: z.ZodEnum<["EMAIL", "SMS", "PUSH", "WHATSAPP"]>;
    targetSegmentId: z.ZodString;
    template: z.ZodEffects<z.ZodObject<{
        subject: z.ZodOptional<z.ZodString>;
        body: z.ZodString;
        variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preheader: z.ZodOptional<z.ZodString>;
        fromName: z.ZodOptional<z.ZodString>;
        replyTo: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    }, {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    }>, {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    }, {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    }>;
    schedule: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["IMMEDIATE", "SCHEDULED", "RECURRING"]>;
        scheduledAt: z.ZodOptional<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        recurrence: z.ZodOptional<z.ZodObject<{
            frequency: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
            interval: z.ZodNumber;
            endDate: z.ZodOptional<z.ZodString>;
            daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            dayOfMonth: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        }, {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]>>;
    smsConfig: z.ZodOptional<z.ZodObject<{
        senderId: z.ZodOptional<z.ZodString>;
        unicode: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        unicode: boolean;
        senderId?: string | undefined;
    }, {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    }>>;
    whatsappConfig: z.ZodOptional<z.ZodObject<{
        templateId: z.ZodOptional<z.ZodString>;
        businessAccountId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    }, {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    }>>;
    emailConfig: z.ZodOptional<z.ZodObject<{
        trackOpens: z.ZodDefault<z.ZodBoolean>;
        trackClicks: z.ZodDefault<z.ZodBoolean>;
        unsubscribeLink: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        trackOpens: boolean;
        trackClicks: boolean;
        unsubscribeLink: boolean;
    }, {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    }>>;
    enableAbTesting: z.ZodDefault<z.ZodBoolean>;
    testPercentage: z.ZodOptional<z.ZodNumber>;
    sendLimit: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED";
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    enableAbTesting: boolean;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        unicode: boolean;
        senderId?: string | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens: boolean;
        trackClicks: boolean;
        unsubscribeLink: boolean;
    } | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}, {
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    status?: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED" | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    } | undefined;
    enableAbTesting?: boolean | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}>, {
    status: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED";
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    enableAbTesting: boolean;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        unicode: boolean;
        senderId?: string | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens: boolean;
        trackClicks: boolean;
        unsubscribeLink: boolean;
    } | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}, {
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    status?: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED" | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    } | undefined;
    enableAbTesting?: boolean | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}>, {
    status: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED";
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    enableAbTesting: boolean;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        unicode: boolean;
        senderId?: string | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens: boolean;
        trackClicks: boolean;
        unsubscribeLink: boolean;
    } | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}, {
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    status?: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED" | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    } | undefined;
    enableAbTesting?: boolean | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}>, {
    status: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED";
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    enableAbTesting: boolean;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        unicode: boolean;
        senderId?: string | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens: boolean;
        trackClicks: boolean;
        unsubscribeLink: boolean;
    } | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}, {
    name: string;
    channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
    targetSegmentId: string;
    template: {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    };
    schedule: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    };
    status?: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED" | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    smsConfig?: {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    } | undefined;
    enableAbTesting?: boolean | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}>;
export type CreateCampaignDto = z.infer<typeof CreateCampaignDtoSchema>;
export declare const UpdateCampaignDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    targetSegmentId: z.ZodOptional<z.ZodString>;
    template: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        subject: z.ZodOptional<z.ZodString>;
        body: z.ZodString;
        variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        preheader: z.ZodOptional<z.ZodString>;
        fromName: z.ZodOptional<z.ZodString>;
        replyTo: z.ZodOptional<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    }, {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    }>, {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    }, {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    }>>;
    schedule: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["IMMEDIATE", "SCHEDULED", "RECURRING"]>;
        scheduledAt: z.ZodOptional<z.ZodString>;
        timezone: z.ZodDefault<z.ZodString>;
        recurrence: z.ZodOptional<z.ZodObject<{
            frequency: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
            interval: z.ZodNumber;
            endDate: z.ZodOptional<z.ZodString>;
            daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
            dayOfMonth: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        }, {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }, {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    }>>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]>>;
    smsConfig: z.ZodOptional<z.ZodObject<{
        senderId: z.ZodOptional<z.ZodString>;
        unicode: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    }, {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    }>>;
    whatsappConfig: z.ZodOptional<z.ZodObject<{
        templateId: z.ZodOptional<z.ZodString>;
        businessAccountId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    }, {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    }>>;
    emailConfig: z.ZodOptional<z.ZodObject<{
        trackOpens: z.ZodOptional<z.ZodBoolean>;
        trackClicks: z.ZodOptional<z.ZodBoolean>;
        unsubscribeLink: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    }, {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    }>>;
    enableAbTesting: z.ZodOptional<z.ZodBoolean>;
    testPercentage: z.ZodOptional<z.ZodNumber>;
    sendLimit: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    targetSegmentId?: string | undefined;
    template?: {
        body: string;
        language: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
    } | undefined;
    schedule?: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone: string;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    } | undefined;
    smsConfig?: {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    } | undefined;
    enableAbTesting?: boolean | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}, {
    status?: "DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED" | undefined;
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    targetSegmentId?: string | undefined;
    template?: {
        body: string;
        subject?: string | undefined;
        fromName?: string | undefined;
        replyTo?: string | undefined;
        variables?: string[] | undefined;
        preheader?: string | undefined;
        language?: string | undefined;
    } | undefined;
    schedule?: {
        type: "SCHEDULED" | "IMMEDIATE" | "RECURRING";
        timezone?: string | undefined;
        scheduledAt?: string | undefined;
        recurrence?: {
            frequency: "DAILY" | "WEEKLY" | "MONTHLY";
            interval: number;
            endDate?: string | undefined;
            daysOfWeek?: number[] | undefined;
            dayOfMonth?: number | undefined;
        } | undefined;
    } | undefined;
    smsConfig?: {
        senderId?: string | undefined;
        unicode?: boolean | undefined;
    } | undefined;
    whatsappConfig?: {
        businessAccountId?: string | undefined;
        templateId?: string | undefined;
    } | undefined;
    emailConfig?: {
        trackOpens?: boolean | undefined;
        trackClicks?: boolean | undefined;
        unsubscribeLink?: boolean | undefined;
    } | undefined;
    enableAbTesting?: boolean | undefined;
    testPercentage?: number | undefined;
    sendLimit?: number | undefined;
}>;
export type UpdateCampaignDto = z.infer<typeof UpdateCampaignDtoSchema>;
export declare const QueryCampaignsDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    channel: z.ZodOptional<z.ZodEnum<["EMAIL", "SMS", "PUSH", "WHATSAPP"]>>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]>, "many">>;
    segmentId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    scheduledAfter: z.ZodOptional<z.ZodString>;
    scheduledBefore: z.ZodOptional<z.ZodString>;
    searchTerm: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "scheduledAt", "status", "channel"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "name" | "createdAt" | "scheduledAt" | "channel";
    sortOrder: "asc" | "desc";
    status?: ("DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED")[] | undefined;
    name?: string | undefined;
    tags?: string[] | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    segmentId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
}, {
    status?: ("DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED")[] | undefined;
    name?: string | undefined;
    limit?: number | undefined;
    tags?: string[] | undefined;
    page?: number | undefined;
    sortBy?: "status" | "name" | "createdAt" | "scheduledAt" | "channel" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    segmentId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "name" | "createdAt" | "scheduledAt" | "channel";
    sortOrder: "asc" | "desc";
    status?: ("DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED")[] | undefined;
    name?: string | undefined;
    tags?: string[] | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    segmentId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
}, {
    status?: ("DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED")[] | undefined;
    name?: string | undefined;
    limit?: number | undefined;
    tags?: string[] | undefined;
    page?: number | undefined;
    sortBy?: "status" | "name" | "createdAt" | "scheduledAt" | "channel" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    segmentId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "name" | "createdAt" | "scheduledAt" | "channel";
    sortOrder: "asc" | "desc";
    status?: ("DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED")[] | undefined;
    name?: string | undefined;
    tags?: string[] | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    segmentId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
}, {
    status?: ("DRAFT" | "ACTIVE" | "CANCELLED" | "SCHEDULED" | "COMPLETED" | "PAUSED")[] | undefined;
    name?: string | undefined;
    limit?: number | undefined;
    tags?: string[] | undefined;
    page?: number | undefined;
    sortBy?: "status" | "name" | "createdAt" | "scheduledAt" | "channel" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    segmentId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
}>;
export type QueryCampaignsDto = z.infer<typeof QueryCampaignsDtoSchema>;
export declare const SendCampaignDtoSchema: z.ZodObject<{
    campaignId: z.ZodString;
    testMode: z.ZodDefault<z.ZodBoolean>;
    testRecipients: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodString]>, "many">>;
    overrideSchedule: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    testMode: boolean;
    campaignId: string;
    overrideSchedule: boolean;
    testRecipients?: string[] | undefined;
}, {
    campaignId: string;
    testMode?: boolean | undefined;
    testRecipients?: string[] | undefined;
    overrideSchedule?: boolean | undefined;
}>;
export type SendCampaignDto = z.infer<typeof SendCampaignDtoSchema>;
export declare const SegmentRuleOperatorSchema: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
export type SegmentRuleOperator = z.infer<typeof SegmentRuleOperatorSchema>;
export declare const SegmentRuleFieldSchema: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
export type SegmentRuleField = z.infer<typeof SegmentRuleFieldSchema>;
export declare const SegmentRuleSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    field: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
    operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">]>>;
    logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
}, "strip", z.ZodTypeAny, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    logicalOperator: "AND" | "OR";
    value?: string | number | boolean | (string | number)[] | undefined;
}, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    value?: string | number | boolean | (string | number)[] | undefined;
    logicalOperator?: "AND" | "OR" | undefined;
}>, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    logicalOperator: "AND" | "OR";
    value?: string | number | boolean | (string | number)[] | undefined;
}, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    value?: string | number | boolean | (string | number)[] | undefined;
    logicalOperator?: "AND" | "OR" | undefined;
}>, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    logicalOperator: "AND" | "OR";
    value?: string | number | boolean | (string | number)[] | undefined;
}, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    value?: string | number | boolean | (string | number)[] | undefined;
    logicalOperator?: "AND" | "OR" | undefined;
}>, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    logicalOperator: "AND" | "OR";
    value?: string | number | boolean | (string | number)[] | undefined;
}, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    value?: string | number | boolean | (string | number)[] | undefined;
    logicalOperator?: "AND" | "OR" | undefined;
}>;
export type SegmentRule = z.infer<typeof SegmentRuleSchema>;
export declare const CreateSegmentDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    rules: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        field: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">]>>;
        logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, "many">;
    isStatic: z.ZodDefault<z.ZodBoolean>;
    estimatedSize: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    rules: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }[];
    isStatic: boolean;
    description?: string | undefined;
    tags?: string[] | undefined;
    estimatedSize?: number | undefined;
}, {
    name: string;
    rules: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }[];
    description?: string | undefined;
    tags?: string[] | undefined;
    isStatic?: boolean | undefined;
    estimatedSize?: number | undefined;
}>;
export type CreateSegmentDto = z.infer<typeof CreateSegmentDtoSchema>;
export declare const UpdateSegmentDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    rules: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        field: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">]>>;
        logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, "many">>;
    isStatic: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    rules?: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        logicalOperator: "AND" | "OR";
        value?: string | number | boolean | (string | number)[] | undefined;
    }[] | undefined;
    isStatic?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    rules?: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    isStatic?: boolean | undefined;
}>;
export type UpdateSegmentDto = z.infer<typeof UpdateSegmentDtoSchema>;
export declare const QuerySegmentsDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    isStatic: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minSize: z.ZodOptional<z.ZodNumber>;
    maxSize: z.ZodOptional<z.ZodNumber>;
    searchTerm: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "size", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "name" | "createdAt" | "updatedAt" | "size";
    sortOrder: "asc" | "desc";
    name?: string | undefined;
    tags?: string[] | undefined;
    searchTerm?: string | undefined;
    isStatic?: boolean | undefined;
    minSize?: number | undefined;
    maxSize?: number | undefined;
}, {
    name?: string | undefined;
    limit?: number | undefined;
    tags?: string[] | undefined;
    page?: number | undefined;
    sortBy?: "name" | "createdAt" | "updatedAt" | "size" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    searchTerm?: string | undefined;
    isStatic?: boolean | undefined;
    minSize?: number | undefined;
    maxSize?: number | undefined;
}>;
export type QuerySegmentsDto = z.infer<typeof QuerySegmentsDtoSchema>;
export declare const RefreshSegmentDtoSchema: z.ZodObject<{
    segmentId: z.ZodString;
    fullRefresh: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    segmentId: string;
    fullRefresh: boolean;
}, {
    segmentId: string;
    fullRefresh?: boolean | undefined;
}>;
export type RefreshSegmentDto = z.infer<typeof RefreshSegmentDtoSchema>;
export declare const ReferralStatusSchema: z.ZodEnum<["PENDING", "COMPLETED", "EXPIRED", "REDEEMED", "CANCELLED"]>;
export type ReferralStatus = z.infer<typeof ReferralStatusSchema>;
export declare const ReferralRewardTypeSchema: z.ZodEnum<["POINTS", "DISCOUNT", "CASH", "SERVICE", "GIFT"]>;
export type ReferralRewardType = z.infer<typeof ReferralRewardTypeSchema>;
export declare const ReferralCodeSchema: z.ZodString;
export type ReferralCode = z.infer<typeof ReferralCodeSchema>;
export declare const CreateReferralDtoSchema: z.ZodObject<{
    referrerId: z.ZodString;
    refereeEmail: z.ZodOptional<z.ZodString>;
    refereePhone: z.ZodOptional<z.ZodString>;
    refereeName: z.ZodOptional<z.ZodString>;
    referralCode: z.ZodOptional<z.ZodString>;
    rewardType: z.ZodEnum<["POINTS", "DISCOUNT", "CASH", "SERVICE", "GIFT"]>;
    rewardValue: z.ZodNumber;
    referrerRewardValue: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    referrerId: string;
    rewardType: "CASH" | "SERVICE" | "POINTS" | "DISCOUNT" | "GIFT";
    rewardValue: number;
    expiresAt?: string | undefined;
    notes?: string | undefined;
    refereeEmail?: string | undefined;
    refereePhone?: string | undefined;
    refereeName?: string | undefined;
    referralCode?: string | undefined;
    referrerRewardValue?: number | undefined;
}, {
    referrerId: string;
    rewardType: "CASH" | "SERVICE" | "POINTS" | "DISCOUNT" | "GIFT";
    rewardValue: number;
    expiresAt?: string | undefined;
    notes?: string | undefined;
    refereeEmail?: string | undefined;
    refereePhone?: string | undefined;
    refereeName?: string | undefined;
    referralCode?: string | undefined;
    referrerRewardValue?: number | undefined;
}>;
export type CreateReferralDto = z.infer<typeof CreateReferralDtoSchema>;
export declare const RedeemReferralDtoSchema: z.ZodObject<{
    referralCode: z.ZodString;
    refereeId: z.ZodString;
    redemptionDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    referralCode: string;
    refereeId: string;
    notes?: string | undefined;
    redemptionDate?: string | undefined;
}, {
    referralCode: string;
    refereeId: string;
    notes?: string | undefined;
    redemptionDate?: string | undefined;
}>;
export type RedeemReferralDto = z.infer<typeof RedeemReferralDtoSchema>;
export declare const QueryReferralsDtoSchema: z.ZodEffects<z.ZodObject<{
    referrerId: z.ZodOptional<z.ZodString>;
    refereeId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["PENDING", "COMPLETED", "EXPIRED", "REDEEMED", "CANCELLED"]>, "many">>;
    rewardType: z.ZodOptional<z.ZodEnum<["POINTS", "DISCOUNT", "CASH", "SERVICE", "GIFT"]>>;
    referralCode: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    expiringBefore: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "expiresAt", "status", "rewardValue"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "expiresAt" | "rewardValue";
    sortOrder: "asc" | "desc";
    status?: ("PENDING" | "CANCELLED" | "COMPLETED" | "EXPIRED" | "REDEEMED")[] | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    referrerId?: string | undefined;
    referralCode?: string | undefined;
    rewardType?: "CASH" | "SERVICE" | "POINTS" | "DISCOUNT" | "GIFT" | undefined;
    refereeId?: string | undefined;
    expiringBefore?: string | undefined;
}, {
    status?: ("PENDING" | "CANCELLED" | "COMPLETED" | "EXPIRED" | "REDEEMED")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "expiresAt" | "rewardValue" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    referrerId?: string | undefined;
    referralCode?: string | undefined;
    rewardType?: "CASH" | "SERVICE" | "POINTS" | "DISCOUNT" | "GIFT" | undefined;
    refereeId?: string | undefined;
    expiringBefore?: string | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "expiresAt" | "rewardValue";
    sortOrder: "asc" | "desc";
    status?: ("PENDING" | "CANCELLED" | "COMPLETED" | "EXPIRED" | "REDEEMED")[] | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    referrerId?: string | undefined;
    referralCode?: string | undefined;
    rewardType?: "CASH" | "SERVICE" | "POINTS" | "DISCOUNT" | "GIFT" | undefined;
    refereeId?: string | undefined;
    expiringBefore?: string | undefined;
}, {
    status?: ("PENDING" | "CANCELLED" | "COMPLETED" | "EXPIRED" | "REDEEMED")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "expiresAt" | "rewardValue" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    referrerId?: string | undefined;
    referralCode?: string | undefined;
    rewardType?: "CASH" | "SERVICE" | "POINTS" | "DISCOUNT" | "GIFT" | undefined;
    refereeId?: string | undefined;
    expiringBefore?: string | undefined;
}>;
export type QueryReferralsDto = z.infer<typeof QueryReferralsDtoSchema>;
export declare const LoyaltyTierSchema: z.ZodEnum<["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"]>;
export type LoyaltyTier = z.infer<typeof LoyaltyTierSchema>;
export declare const LoyaltyTransactionTypeSchema: z.ZodEnum<["ACCRUAL", "REDEMPTION", "EXPIRY", "ADJUSTMENT", "REVERSAL"]>;
export type LoyaltyTransactionType = z.infer<typeof LoyaltyTransactionTypeSchema>;
export declare const LoyaltyPointsSchema: z.ZodNumber;
export type LoyaltyPoints = z.infer<typeof LoyaltyPointsSchema>;
export declare const AccrueLoyaltyPointsDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    amount: z.ZodNumber;
    source: z.ZodEnum<["APPOINTMENT", "PROCEDURE", "PAYMENT", "REFERRAL", "BIRTHDAY", "PROMOTION", "MANUAL"]>;
    sourceId: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    expiresAt: z.ZodOptional<z.ZodString>;
    multiplier: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    source: "APPOINTMENT" | "PAYMENT" | "PROMOTION" | "MANUAL" | "PROCEDURE" | "REFERRAL" | "BIRTHDAY";
    description: string;
    patientId: string;
    amount: number;
    multiplier: number;
    expiresAt?: string | undefined;
    sourceId?: string | undefined;
}, {
    source: "APPOINTMENT" | "PAYMENT" | "PROMOTION" | "MANUAL" | "PROCEDURE" | "REFERRAL" | "BIRTHDAY";
    description: string;
    patientId: string;
    amount: number;
    expiresAt?: string | undefined;
    sourceId?: string | undefined;
    multiplier?: number | undefined;
}>;
export type AccrueLoyaltyPointsDto = z.infer<typeof AccrueLoyaltyPointsDtoSchema>;
export declare const RedeemLoyaltyPointsDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    amount: z.ZodNumber;
    description: z.ZodString;
    redemptionValue: z.ZodOptional<z.ZodNumber>;
    relatedInvoiceId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    patientId: string;
    amount: number;
    redemptionValue?: number | undefined;
    relatedInvoiceId?: string | undefined;
}, {
    description: string;
    patientId: string;
    amount: number;
    redemptionValue?: number | undefined;
    relatedInvoiceId?: string | undefined;
}>;
export type RedeemLoyaltyPointsDto = z.infer<typeof RedeemLoyaltyPointsDtoSchema>;
export declare const QueryLoyaltyTransactionsDtoSchema: z.ZodEffects<z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    transactionType: z.ZodOptional<z.ZodArray<z.ZodEnum<["ACCRUAL", "REDEMPTION", "EXPIRY", "ADJUSTMENT", "REVERSAL"]>, "many">>;
    source: z.ZodOptional<z.ZodArray<z.ZodEnum<["APPOINTMENT", "PROCEDURE", "PAYMENT", "REFERRAL", "BIRTHDAY", "PROMOTION", "MANUAL"]>, "many">>;
    minAmount: z.ZodOptional<z.ZodNumber>;
    maxAmount: z.ZodOptional<z.ZodNumber>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "amount", "transactionType"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "amount" | "transactionType";
    sortOrder: "asc" | "desc";
    source?: ("APPOINTMENT" | "PAYMENT" | "PROMOTION" | "MANUAL" | "PROCEDURE" | "REFERRAL" | "BIRTHDAY")[] | undefined;
    patientId?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    transactionType?: ("ACCRUAL" | "REDEMPTION" | "EXPIRY" | "ADJUSTMENT" | "REVERSAL")[] | undefined;
}, {
    source?: ("APPOINTMENT" | "PAYMENT" | "PROMOTION" | "MANUAL" | "PROCEDURE" | "REFERRAL" | "BIRTHDAY")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "amount" | "transactionType" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    transactionType?: ("ACCRUAL" | "REDEMPTION" | "EXPIRY" | "ADJUSTMENT" | "REVERSAL")[] | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "amount" | "transactionType";
    sortOrder: "asc" | "desc";
    source?: ("APPOINTMENT" | "PAYMENT" | "PROMOTION" | "MANUAL" | "PROCEDURE" | "REFERRAL" | "BIRTHDAY")[] | undefined;
    patientId?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    transactionType?: ("ACCRUAL" | "REDEMPTION" | "EXPIRY" | "ADJUSTMENT" | "REVERSAL")[] | undefined;
}, {
    source?: ("APPOINTMENT" | "PAYMENT" | "PROMOTION" | "MANUAL" | "PROCEDURE" | "REFERRAL" | "BIRTHDAY")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "amount" | "transactionType" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    minAmount?: number | undefined;
    maxAmount?: number | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    transactionType?: ("ACCRUAL" | "REDEMPTION" | "EXPIRY" | "ADJUSTMENT" | "REVERSAL")[] | undefined;
}>;
export type QueryLoyaltyTransactionsDto = z.infer<typeof QueryLoyaltyTransactionsDtoSchema>;
export declare const FeedbackCategorySchema: z.ZodEnum<["SERVICE", "TREATMENT", "FACILITY", "STAFF", "BILLING", "SCHEDULING", "COMMUNICATION", "OVERALL"]>;
export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;
export declare const FeedbackRatingSchema: z.ZodNumber;
export type FeedbackRating = z.infer<typeof FeedbackRatingSchema>;
export declare const CreateFeedbackDtoSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["SERVICE", "TREATMENT", "FACILITY", "STAFF", "BILLING", "SCHEDULING", "COMMUNICATION", "OVERALL"]>;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    wouldRecommend: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    category: "TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION";
    rating: number;
    isAnonymous: boolean;
    tags?: string[] | undefined;
    comment?: string | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    wouldRecommend?: boolean | undefined;
}, {
    category: "TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION";
    rating: number;
    tags?: string[] | undefined;
    comment?: string | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    isAnonymous?: boolean | undefined;
    wouldRecommend?: boolean | undefined;
}>;
export type CreateFeedbackDto = z.infer<typeof CreateFeedbackDtoSchema>;
export declare const QueryFeedbackDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodArray<z.ZodEnum<["SERVICE", "TREATMENT", "FACILITY", "STAFF", "BILLING", "SCHEDULING", "COMMUNICATION", "OVERALL"]>, "many">>;
    minRating: z.ZodOptional<z.ZodNumber>;
    maxRating: z.ZodOptional<z.ZodNumber>;
    wouldRecommend: z.ZodOptional<z.ZodBoolean>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    searchTerm: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "rating", "category"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "category" | "rating";
    sortOrder: "asc" | "desc";
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION")[] | undefined;
    isAnonymous?: boolean | undefined;
    searchTerm?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    wouldRecommend?: boolean | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "category" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION")[] | undefined;
    isAnonymous?: boolean | undefined;
    searchTerm?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    wouldRecommend?: boolean | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "category" | "rating";
    sortOrder: "asc" | "desc";
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION")[] | undefined;
    isAnonymous?: boolean | undefined;
    searchTerm?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    wouldRecommend?: boolean | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "category" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION")[] | undefined;
    isAnonymous?: boolean | undefined;
    searchTerm?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    wouldRecommend?: boolean | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "category" | "rating";
    sortOrder: "asc" | "desc";
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION")[] | undefined;
    isAnonymous?: boolean | undefined;
    searchTerm?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    wouldRecommend?: boolean | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "category" | "rating" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("TREATMENT" | "SCHEDULING" | "BILLING" | "STAFF" | "SERVICE" | "FACILITY" | "OVERALL" | "COMMUNICATION")[] | undefined;
    isAnonymous?: boolean | undefined;
    searchTerm?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    wouldRecommend?: boolean | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
}>;
export type QueryFeedbackDto = z.infer<typeof QueryFeedbackDtoSchema>;
export declare const NpsScoreSchema: z.ZodNumber;
export type NpsScore = z.infer<typeof NpsScoreSchema>;
export declare const NpsCategorySchema: z.ZodEnum<["DETRACTOR", "PASSIVE", "PROMOTER"]>;
export type NpsCategory = z.infer<typeof NpsCategorySchema>;
export declare const SubmitNpsDtoSchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    score: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    followUpQuestion: z.ZodOptional<z.ZodString>;
    isAnonymous: z.ZodDefault<z.ZodBoolean>;
    source: z.ZodDefault<z.ZodEnum<["EMAIL", "SMS", "WEBSITE", "APP", "IN_PERSON"]>>;
}, "strip", z.ZodTypeAny, {
    source: "EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON";
    isAnonymous: boolean;
    score: number;
    comment?: string | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    followUpQuestion?: string | undefined;
}, {
    score: number;
    source?: "EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON" | undefined;
    comment?: string | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    isAnonymous?: boolean | undefined;
    followUpQuestion?: string | undefined;
}>;
export type SubmitNpsDto = z.infer<typeof SubmitNpsDtoSchema>;
export declare const QueryNpsDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodArray<z.ZodEnum<["DETRACTOR", "PASSIVE", "PROMOTER"]>, "many">>;
    minScore: z.ZodOptional<z.ZodNumber>;
    maxScore: z.ZodOptional<z.ZodNumber>;
    source: z.ZodOptional<z.ZodArray<z.ZodEnum<["EMAIL", "SMS", "WEBSITE", "APP", "IN_PERSON"]>, "many">>;
    isAnonymous: z.ZodOptional<z.ZodBoolean>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "score"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "score";
    sortOrder: "asc" | "desc";
    source?: ("EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON")[] | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("DETRACTOR" | "PASSIVE" | "PROMOTER")[] | undefined;
    isAnonymous?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}, {
    source?: ("EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "score" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("DETRACTOR" | "PASSIVE" | "PROMOTER")[] | undefined;
    isAnonymous?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "score";
    sortOrder: "asc" | "desc";
    source?: ("EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON")[] | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("DETRACTOR" | "PASSIVE" | "PROMOTER")[] | undefined;
    isAnonymous?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}, {
    source?: ("EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "score" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("DETRACTOR" | "PASSIVE" | "PROMOTER")[] | undefined;
    isAnonymous?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "score";
    sortOrder: "asc" | "desc";
    source?: ("EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON")[] | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("DETRACTOR" | "PASSIVE" | "PROMOTER")[] | undefined;
    isAnonymous?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}, {
    source?: ("EMAIL" | "SMS" | "WEBSITE" | "APP" | "IN_PERSON")[] | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "score" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    category?: ("DETRACTOR" | "PASSIVE" | "PROMOTER")[] | undefined;
    isAnonymous?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    minScore?: number | undefined;
    maxScore?: number | undefined;
}>;
export type QueryNpsDto = z.infer<typeof QueryNpsDtoSchema>;
export declare const AutomationTriggerTypeSchema: z.ZodEnum<["APPOINTMENT_COMPLETED", "APPOINTMENT_SCHEDULED", "APPOINTMENT_CANCELLED", "APPOINTMENT_NO_SHOW", "INVOICE_PAID", "INVOICE_OVERDUE", "TREATMENT_COMPLETED", "PATIENT_REGISTERED", "PATIENT_BIRTHDAY", "LOYALTY_TIER_CHANGED", "FEEDBACK_SUBMITTED", "NPS_SUBMITTED", "REFERRAL_COMPLETED", "DAYS_SINCE_LAST_VISIT", "CUSTOM_DATE"]>;
export type AutomationTriggerType = z.infer<typeof AutomationTriggerTypeSchema>;
export declare const AutomationActionTypeSchema: z.ZodEnum<["SEND_CAMPAIGN", "SEND_EMAIL", "SEND_SMS", "SEND_PUSH", "ACCRUE_LOYALTY_POINTS", "CREATE_TASK", "UPDATE_SEGMENT", "TAG_PATIENT", "TRIGGER_WEBHOOK", "CREATE_APPOINTMENT_REMINDER", "SEND_FEEDBACK_REQUEST"]>;
export type AutomationActionType = z.infer<typeof AutomationActionTypeSchema>;
export declare const AutomationConditionSchema: z.ZodObject<{
    field: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
    operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">]>>;
}, "strip", z.ZodTypeAny, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    value?: string | number | boolean | (string | number)[] | undefined;
}, {
    field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
    operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
    value?: string | number | boolean | (string | number)[] | undefined;
}>;
export type AutomationCondition = z.infer<typeof AutomationConditionSchema>;
export declare const AutomationActionSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    type: z.ZodEnum<["SEND_CAMPAIGN", "SEND_EMAIL", "SEND_SMS", "SEND_PUSH", "ACCRUE_LOYALTY_POINTS", "CREATE_TASK", "UPDATE_SEGMENT", "TAG_PATIENT", "TRIGGER_WEBHOOK", "CREATE_APPOINTMENT_REMINDER", "SEND_FEEDBACK_REQUEST"]>;
    delay: z.ZodOptional<z.ZodNumber>;
    campaignId: z.ZodOptional<z.ZodString>;
    templateId: z.ZodOptional<z.ZodString>;
    emailSubject: z.ZodOptional<z.ZodString>;
    emailBody: z.ZodOptional<z.ZodString>;
    smsBody: z.ZodOptional<z.ZodString>;
    pointsAmount: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    webhookPayload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    taskTitle: z.ZodOptional<z.ZodString>;
    taskDescription: z.ZodOptional<z.ZodString>;
    assigneeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}>, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}>, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}>, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}, {
    type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
    tags?: string[] | undefined;
    templateId?: string | undefined;
    assigneeId?: string | undefined;
    pointsAmount?: number | undefined;
    campaignId?: string | undefined;
    delay?: number | undefined;
    emailSubject?: string | undefined;
    emailBody?: string | undefined;
    smsBody?: string | undefined;
    webhookUrl?: string | undefined;
    webhookPayload?: Record<string, unknown> | undefined;
    taskTitle?: string | undefined;
    taskDescription?: string | undefined;
}>;
export type AutomationAction = z.infer<typeof AutomationActionSchema>;
export declare const CreateAutomationRuleDtoSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    triggerType: z.ZodEnum<["APPOINTMENT_COMPLETED", "APPOINTMENT_SCHEDULED", "APPOINTMENT_CANCELLED", "APPOINTMENT_NO_SHOW", "INVOICE_PAID", "INVOICE_OVERDUE", "TREATMENT_COMPLETED", "PATIENT_REGISTERED", "PATIENT_BIRTHDAY", "LOYALTY_TIER_CHANGED", "FEEDBACK_SUBMITTED", "NPS_SUBMITTED", "REFERRAL_COMPLETED", "DAYS_SINCE_LAST_VISIT", "CUSTOM_DATE"]>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">]>>;
    }, "strip", z.ZodTypeAny, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }>, "many">>;
    actions: z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["SEND_CAMPAIGN", "SEND_EMAIL", "SEND_SMS", "SEND_PUSH", "ACCRUE_LOYALTY_POINTS", "CREATE_TASK", "UPDATE_SEGMENT", "TAG_PATIENT", "TRIGGER_WEBHOOK", "CREATE_APPOINTMENT_REMINDER", "SEND_FEEDBACK_REQUEST"]>;
        delay: z.ZodOptional<z.ZodNumber>;
        campaignId: z.ZodOptional<z.ZodString>;
        templateId: z.ZodOptional<z.ZodString>;
        emailSubject: z.ZodOptional<z.ZodString>;
        emailBody: z.ZodOptional<z.ZodString>;
        smsBody: z.ZodOptional<z.ZodString>;
        pointsAmount: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        webhookPayload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        taskTitle: z.ZodOptional<z.ZodString>;
        taskDescription: z.ZodOptional<z.ZodString>;
        assigneeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
    priority: z.ZodDefault<z.ZodNumber>;
    throttle: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        maxExecutions: z.ZodNumber;
        timeWindowMinutes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        maxExecutions: number;
        timeWindowMinutes: number;
    }, {
        maxExecutions: number;
        timeWindowMinutes: number;
        enabled?: boolean | undefined;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    priority: number;
    actions: {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }[];
    triggerType: "APPOINTMENT_NO_SHOW" | "DAYS_SINCE_LAST_VISIT" | "APPOINTMENT_COMPLETED" | "APPOINTMENT_SCHEDULED" | "APPOINTMENT_CANCELLED" | "INVOICE_PAID" | "INVOICE_OVERDUE" | "TREATMENT_COMPLETED" | "PATIENT_REGISTERED" | "PATIENT_BIRTHDAY" | "LOYALTY_TIER_CHANGED" | "FEEDBACK_SUBMITTED" | "NPS_SUBMITTED" | "REFERRAL_COMPLETED" | "CUSTOM_DATE";
    isActive: boolean;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }[] | undefined;
    throttle?: {
        enabled: boolean;
        maxExecutions: number;
        timeWindowMinutes: number;
    } | undefined;
}, {
    name: string;
    actions: {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }[];
    triggerType: "APPOINTMENT_NO_SHOW" | "DAYS_SINCE_LAST_VISIT" | "APPOINTMENT_COMPLETED" | "APPOINTMENT_SCHEDULED" | "APPOINTMENT_CANCELLED" | "INVOICE_PAID" | "INVOICE_OVERDUE" | "TREATMENT_COMPLETED" | "PATIENT_REGISTERED" | "PATIENT_BIRTHDAY" | "LOYALTY_TIER_CHANGED" | "FEEDBACK_SUBMITTED" | "NPS_SUBMITTED" | "REFERRAL_COMPLETED" | "CUSTOM_DATE";
    description?: string | undefined;
    tags?: string[] | undefined;
    priority?: number | undefined;
    conditions?: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    throttle?: {
        maxExecutions: number;
        timeWindowMinutes: number;
        enabled?: boolean | undefined;
    } | undefined;
}>;
export type CreateAutomationRuleDto = z.infer<typeof CreateAutomationRuleDtoSchema>;
export declare const UpdateAutomationRuleDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodEnum<["AGE", "GENDER", "LAST_VISIT_DATE", "DAYS_SINCE_LAST_VISIT", "TOTAL_VISITS", "TOTAL_SPENT", "OUTSTANDING_BALANCE", "LOYALTY_POINTS", "LOYALTY_TIER", "APPOINTMENT_STATUS", "TREATMENT_TYPE", "DIAGNOSIS", "LOCATION", "CITY", "STATE", "POSTAL_CODE", "REGISTRATION_DATE", "BIRTH_DATE", "MARITAL_STATUS", "HAS_INSURANCE", "INSURANCE_PROVIDER", "REFERRAL_SOURCE", "CONSENT_STATUS", "COMMUNICATION_PREFERENCE", "LANGUAGE", "TAG"]>;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "CONTAINS", "NOT_CONTAINS", "GT", "LT", "GTE", "LTE", "IN", "NOT_IN", "BETWEEN", "IS_NULL", "IS_NOT_NULL"]>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">]>>;
    }, "strip", z.ZodTypeAny, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }, {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }>, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        type: z.ZodEnum<["SEND_CAMPAIGN", "SEND_EMAIL", "SEND_SMS", "SEND_PUSH", "ACCRUE_LOYALTY_POINTS", "CREATE_TASK", "UPDATE_SEGMENT", "TAG_PATIENT", "TRIGGER_WEBHOOK", "CREATE_APPOINTMENT_REMINDER", "SEND_FEEDBACK_REQUEST"]>;
        delay: z.ZodOptional<z.ZodNumber>;
        campaignId: z.ZodOptional<z.ZodString>;
        templateId: z.ZodOptional<z.ZodString>;
        emailSubject: z.ZodOptional<z.ZodString>;
        emailBody: z.ZodOptional<z.ZodString>;
        smsBody: z.ZodOptional<z.ZodString>;
        pointsAmount: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        webhookPayload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        taskTitle: z.ZodOptional<z.ZodString>;
        taskDescription: z.ZodOptional<z.ZodString>;
        assigneeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }, {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }>, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodNumber>;
    throttle: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodBoolean;
        maxExecutions: z.ZodNumber;
        timeWindowMinutes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        maxExecutions: number;
        timeWindowMinutes: number;
    }, {
        enabled: boolean;
        maxExecutions: number;
        timeWindowMinutes: number;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    priority?: number | undefined;
    conditions?: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }[] | undefined;
    actions?: {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    throttle?: {
        enabled: boolean;
        maxExecutions: number;
        timeWindowMinutes: number;
    } | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    priority?: number | undefined;
    conditions?: {
        field: "DIAGNOSIS" | "AGE" | "GENDER" | "LAST_VISIT_DATE" | "DAYS_SINCE_LAST_VISIT" | "TOTAL_VISITS" | "TOTAL_SPENT" | "OUTSTANDING_BALANCE" | "LOYALTY_POINTS" | "LOYALTY_TIER" | "APPOINTMENT_STATUS" | "TREATMENT_TYPE" | "LOCATION" | "CITY" | "STATE" | "POSTAL_CODE" | "REGISTRATION_DATE" | "BIRTH_DATE" | "MARITAL_STATUS" | "HAS_INSURANCE" | "INSURANCE_PROVIDER" | "REFERRAL_SOURCE" | "CONSENT_STATUS" | "COMMUNICATION_PREFERENCE" | "LANGUAGE" | "TAG";
        operator: "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "GT" | "LT" | "GTE" | "LTE";
        value?: string | number | boolean | (string | number)[] | undefined;
    }[] | undefined;
    actions?: {
        type: "SEND_EMAIL" | "SEND_SMS" | "CREATE_TASK" | "SEND_CAMPAIGN" | "SEND_PUSH" | "ACCRUE_LOYALTY_POINTS" | "UPDATE_SEGMENT" | "TAG_PATIENT" | "TRIGGER_WEBHOOK" | "CREATE_APPOINTMENT_REMINDER" | "SEND_FEEDBACK_REQUEST";
        tags?: string[] | undefined;
        templateId?: string | undefined;
        assigneeId?: string | undefined;
        pointsAmount?: number | undefined;
        campaignId?: string | undefined;
        delay?: number | undefined;
        emailSubject?: string | undefined;
        emailBody?: string | undefined;
        smsBody?: string | undefined;
        webhookUrl?: string | undefined;
        webhookPayload?: Record<string, unknown> | undefined;
        taskTitle?: string | undefined;
        taskDescription?: string | undefined;
    }[] | undefined;
    isActive?: boolean | undefined;
    throttle?: {
        enabled: boolean;
        maxExecutions: number;
        timeWindowMinutes: number;
    } | undefined;
}>;
export type UpdateAutomationRuleDto = z.infer<typeof UpdateAutomationRuleDtoSchema>;
export declare const QueryAutomationRulesDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    triggerType: z.ZodOptional<z.ZodArray<z.ZodEnum<["APPOINTMENT_COMPLETED", "APPOINTMENT_SCHEDULED", "APPOINTMENT_CANCELLED", "APPOINTMENT_NO_SHOW", "INVOICE_PAID", "INVOICE_OVERDUE", "TREATMENT_COMPLETED", "PATIENT_REGISTERED", "PATIENT_BIRTHDAY", "LOYALTY_TIER_CHANGED", "FEEDBACK_SUBMITTED", "NPS_SUBMITTED", "REFERRAL_COMPLETED", "DAYS_SINCE_LAST_VISIT", "CUSTOM_DATE"]>, "many">>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    searchTerm: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "priority", "triggerType"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "name" | "createdAt" | "priority" | "triggerType";
    sortOrder: "asc" | "desc";
    name?: string | undefined;
    tags?: string[] | undefined;
    triggerType?: ("APPOINTMENT_NO_SHOW" | "DAYS_SINCE_LAST_VISIT" | "APPOINTMENT_COMPLETED" | "APPOINTMENT_SCHEDULED" | "APPOINTMENT_CANCELLED" | "INVOICE_PAID" | "INVOICE_OVERDUE" | "TREATMENT_COMPLETED" | "PATIENT_REGISTERED" | "PATIENT_BIRTHDAY" | "LOYALTY_TIER_CHANGED" | "FEEDBACK_SUBMITTED" | "NPS_SUBMITTED" | "REFERRAL_COMPLETED" | "CUSTOM_DATE")[] | undefined;
    searchTerm?: string | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    limit?: number | undefined;
    tags?: string[] | undefined;
    page?: number | undefined;
    sortBy?: "name" | "createdAt" | "priority" | "triggerType" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    triggerType?: ("APPOINTMENT_NO_SHOW" | "DAYS_SINCE_LAST_VISIT" | "APPOINTMENT_COMPLETED" | "APPOINTMENT_SCHEDULED" | "APPOINTMENT_CANCELLED" | "INVOICE_PAID" | "INVOICE_OVERDUE" | "TREATMENT_COMPLETED" | "PATIENT_REGISTERED" | "PATIENT_BIRTHDAY" | "LOYALTY_TIER_CHANGED" | "FEEDBACK_SUBMITTED" | "NPS_SUBMITTED" | "REFERRAL_COMPLETED" | "CUSTOM_DATE")[] | undefined;
    searchTerm?: string | undefined;
    isActive?: boolean | undefined;
}>;
export type QueryAutomationRulesDto = z.infer<typeof QueryAutomationRulesDtoSchema>;
export declare const DeliveryStatusSchema: z.ZodEnum<["PENDING", "QUEUED", "SENT", "DELIVERED", "FAILED", "BOUNCED", "OPENED", "CLICKED", "UNSUBSCRIBED", "COMPLAINED"]>;
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;
export declare const DeliveryProviderSchema: z.ZodEnum<["SENDGRID", "TWILIO", "ONESIGNAL", "WHATSAPP", "MAILGUN", "AWS_SES", "SMTP", "FCM"]>;
export type DeliveryProvider = z.infer<typeof DeliveryProviderSchema>;
export declare const QueryDeliveryLogsDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    campaignId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    channel: z.ZodOptional<z.ZodEnum<["EMAIL", "SMS", "PUSH", "WHATSAPP"]>>;
    status: z.ZodOptional<z.ZodArray<z.ZodEnum<["PENDING", "QUEUED", "SENT", "DELIVERED", "FAILED", "BOUNCED", "OPENED", "CLICKED", "UNSUBSCRIBED", "COMPLAINED"]>, "many">>;
    provider: z.ZodOptional<z.ZodArray<z.ZodEnum<["SENDGRID", "TWILIO", "ONESIGNAL", "WHATSAPP", "MAILGUN", "AWS_SES", "SMTP", "FCM"]>, "many">>;
    recipient: z.ZodOptional<z.ZodString>;
    sentAfter: z.ZodOptional<z.ZodString>;
    sentBefore: z.ZodOptional<z.ZodString>;
    deliveredAfter: z.ZodOptional<z.ZodString>;
    deliveredBefore: z.ZodOptional<z.ZodString>;
    hasError: z.ZodOptional<z.ZodBoolean>;
    errorCode: z.ZodOptional<z.ZodString>;
    wasOpened: z.ZodOptional<z.ZodBoolean>;
    wasClicked: z.ZodOptional<z.ZodBoolean>;
    searchTerm: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["sentAt", "deliveredAt", "status", "recipient", "channel"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "channel" | "recipient" | "sentAt" | "deliveredAt";
    sortOrder: "asc" | "desc";
    status?: ("PENDING" | "FAILED" | "SENT" | "QUEUED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "UNSUBSCRIBED" | "COMPLAINED")[] | undefined;
    errorCode?: string | undefined;
    provider?: ("SENDGRID" | "SMTP" | "TWILIO" | "WHATSAPP" | "ONESIGNAL" | "MAILGUN" | "AWS_SES" | "FCM")[] | undefined;
    patientId?: string | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    campaignId?: string | undefined;
    recipient?: string | undefined;
    sentAfter?: string | undefined;
    sentBefore?: string | undefined;
    deliveredAfter?: string | undefined;
    deliveredBefore?: string | undefined;
    hasError?: boolean | undefined;
    wasOpened?: boolean | undefined;
    wasClicked?: boolean | undefined;
}, {
    status?: ("PENDING" | "FAILED" | "SENT" | "QUEUED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "UNSUBSCRIBED" | "COMPLAINED")[] | undefined;
    limit?: number | undefined;
    errorCode?: string | undefined;
    page?: number | undefined;
    sortBy?: "status" | "channel" | "recipient" | "sentAt" | "deliveredAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    provider?: ("SENDGRID" | "SMTP" | "TWILIO" | "WHATSAPP" | "ONESIGNAL" | "MAILGUN" | "AWS_SES" | "FCM")[] | undefined;
    patientId?: string | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    campaignId?: string | undefined;
    recipient?: string | undefined;
    sentAfter?: string | undefined;
    sentBefore?: string | undefined;
    deliveredAfter?: string | undefined;
    deliveredBefore?: string | undefined;
    hasError?: boolean | undefined;
    wasOpened?: boolean | undefined;
    wasClicked?: boolean | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "channel" | "recipient" | "sentAt" | "deliveredAt";
    sortOrder: "asc" | "desc";
    status?: ("PENDING" | "FAILED" | "SENT" | "QUEUED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "UNSUBSCRIBED" | "COMPLAINED")[] | undefined;
    errorCode?: string | undefined;
    provider?: ("SENDGRID" | "SMTP" | "TWILIO" | "WHATSAPP" | "ONESIGNAL" | "MAILGUN" | "AWS_SES" | "FCM")[] | undefined;
    patientId?: string | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    campaignId?: string | undefined;
    recipient?: string | undefined;
    sentAfter?: string | undefined;
    sentBefore?: string | undefined;
    deliveredAfter?: string | undefined;
    deliveredBefore?: string | undefined;
    hasError?: boolean | undefined;
    wasOpened?: boolean | undefined;
    wasClicked?: boolean | undefined;
}, {
    status?: ("PENDING" | "FAILED" | "SENT" | "QUEUED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "UNSUBSCRIBED" | "COMPLAINED")[] | undefined;
    limit?: number | undefined;
    errorCode?: string | undefined;
    page?: number | undefined;
    sortBy?: "status" | "channel" | "recipient" | "sentAt" | "deliveredAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    provider?: ("SENDGRID" | "SMTP" | "TWILIO" | "WHATSAPP" | "ONESIGNAL" | "MAILGUN" | "AWS_SES" | "FCM")[] | undefined;
    patientId?: string | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    campaignId?: string | undefined;
    recipient?: string | undefined;
    sentAfter?: string | undefined;
    sentBefore?: string | undefined;
    deliveredAfter?: string | undefined;
    deliveredBefore?: string | undefined;
    hasError?: boolean | undefined;
    wasOpened?: boolean | undefined;
    wasClicked?: boolean | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "channel" | "recipient" | "sentAt" | "deliveredAt";
    sortOrder: "asc" | "desc";
    status?: ("PENDING" | "FAILED" | "SENT" | "QUEUED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "UNSUBSCRIBED" | "COMPLAINED")[] | undefined;
    errorCode?: string | undefined;
    provider?: ("SENDGRID" | "SMTP" | "TWILIO" | "WHATSAPP" | "ONESIGNAL" | "MAILGUN" | "AWS_SES" | "FCM")[] | undefined;
    patientId?: string | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    campaignId?: string | undefined;
    recipient?: string | undefined;
    sentAfter?: string | undefined;
    sentBefore?: string | undefined;
    deliveredAfter?: string | undefined;
    deliveredBefore?: string | undefined;
    hasError?: boolean | undefined;
    wasOpened?: boolean | undefined;
    wasClicked?: boolean | undefined;
}, {
    status?: ("PENDING" | "FAILED" | "SENT" | "QUEUED" | "DELIVERED" | "BOUNCED" | "OPENED" | "CLICKED" | "UNSUBSCRIBED" | "COMPLAINED")[] | undefined;
    limit?: number | undefined;
    errorCode?: string | undefined;
    page?: number | undefined;
    sortBy?: "status" | "channel" | "recipient" | "sentAt" | "deliveredAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    provider?: ("SENDGRID" | "SMTP" | "TWILIO" | "WHATSAPP" | "ONESIGNAL" | "MAILGUN" | "AWS_SES" | "FCM")[] | undefined;
    patientId?: string | undefined;
    searchTerm?: string | undefined;
    channel?: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | undefined;
    campaignId?: string | undefined;
    recipient?: string | undefined;
    sentAfter?: string | undefined;
    sentBefore?: string | undefined;
    deliveredAfter?: string | undefined;
    deliveredBefore?: string | undefined;
    hasError?: boolean | undefined;
    wasOpened?: boolean | undefined;
    wasClicked?: boolean | undefined;
}>;
export type QueryDeliveryLogsDto = z.infer<typeof QueryDeliveryLogsDtoSchema>;

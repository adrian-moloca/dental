import { z } from 'zod';
export declare enum ToothSurface {
    OCCLUSAL = "OCCLUSAL",
    MESIAL = "MESIAL",
    DISTAL = "DISTAL",
    BUCCAL = "BUCCAL",
    LINGUAL = "LINGUAL",
    FACIAL = "FACIAL",
    INCISAL = "INCISAL"
}
export declare enum ToothCondition {
    HEALTHY = "HEALTHY",
    CARIES = "CARIES",
    FILLED = "FILLED",
    CROWN = "CROWN",
    BRIDGE = "BRIDGE",
    IMPLANT = "IMPLANT",
    ROOT_CANAL = "ROOT_CANAL",
    EXTRACTED = "EXTRACTED",
    MISSING = "MISSING",
    FRACTURED = "FRACTURED",
    ABSCESS = "ABSCESS",
    IMPACTED = "IMPACTED",
    PARTIALLY_ERUPTED = "PARTIALLY_ERUPTED"
}
export declare enum ClinicalNoteType {
    SOAP = "SOAP",
    PROGRESS = "PROGRESS",
    CONSULTATION = "CONSULTATION",
    EMERGENCY = "EMERGENCY",
    RECALL = "RECALL",
    REFERRAL = "REFERRAL",
    DISCHARGE = "DISCHARGE"
}
export declare enum TreatmentPlanStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare enum ProcedureStatus {
    PLANNED = "PLANNED",
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    INCOMPLETE = "INCOMPLETE"
}
export declare enum ConsentType {
    TREATMENT = "TREATMENT",
    ANESTHESIA = "ANESTHESIA",
    SURGERY = "SURGERY",
    RADIOGRAPH = "RADIOGRAPH",
    DATA_SHARING = "DATA_SHARING",
    PHOTOGRAPHY = "PHOTOGRAPHY",
    RESEARCH = "RESEARCH",
    TELEHEALTH = "TELEHEALTH"
}
export declare enum ConsentStatus {
    PENDING = "PENDING",
    GRANTED = "GRANTED",
    DENIED = "DENIED",
    REVOKED = "REVOKED",
    EXPIRED = "EXPIRED"
}
export declare const ToothNumberSchema: z.ZodNumber;
export type ToothNumber = z.infer<typeof ToothNumberSchema>;
export declare const ToothSurfaceSchema: z.ZodNativeEnum<typeof ToothSurface>;
export type ToothSurfaceType = z.infer<typeof ToothSurfaceSchema>;
export declare const ToothConditionSchema: z.ZodNativeEnum<typeof ToothCondition>;
export type ToothConditionType = z.infer<typeof ToothConditionSchema>;
export declare const ToothStatusSchema: z.ZodObject<{
    condition: z.ZodNativeEnum<typeof ToothCondition>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    condition: ToothCondition;
    notes?: string | undefined;
    surfaces?: ToothSurface[] | undefined;
}, {
    condition: ToothCondition;
    notes?: string | undefined;
    surfaces?: ToothSurface[] | undefined;
}>;
export type ToothStatus = z.infer<typeof ToothStatusSchema>;
export declare const OdontogramEntrySchema: z.ZodObject<{
    toothNumber: z.ZodNumber;
    status: z.ZodObject<{
        condition: z.ZodNativeEnum<typeof ToothCondition>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        condition: ToothCondition;
        notes?: string | undefined;
        surfaces?: ToothSurface[] | undefined;
    }, {
        condition: ToothCondition;
        notes?: string | undefined;
        surfaces?: ToothSurface[] | undefined;
    }>;
    lastUpdated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: {
        condition: ToothCondition;
        notes?: string | undefined;
        surfaces?: ToothSurface[] | undefined;
    };
    toothNumber: number;
    lastUpdated: string;
}, {
    status: {
        condition: ToothCondition;
        notes?: string | undefined;
        surfaces?: ToothSurface[] | undefined;
    };
    toothNumber: number;
    lastUpdated: string;
}>;
export type OdontogramEntry = z.infer<typeof OdontogramEntrySchema>;
export declare const UpdateOdontogramDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    entries: z.ZodEffects<z.ZodArray<z.ZodObject<{
        toothNumber: z.ZodNumber;
        status: z.ZodObject<{
            condition: z.ZodNativeEnum<typeof ToothCondition>;
            surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        }, {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        }>;
        lastUpdated: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        };
        toothNumber: number;
        lastUpdated: string;
    }, {
        status: {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        };
        toothNumber: number;
        lastUpdated: string;
    }>, "many">, {
        status: {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        };
        toothNumber: number;
        lastUpdated: string;
    }[], {
        status: {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        };
        toothNumber: number;
        lastUpdated: string;
    }[]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entries: {
        status: {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        };
        toothNumber: number;
        lastUpdated: string;
    }[];
    patientId: string;
    notes?: string | undefined;
}, {
    entries: {
        status: {
            condition: ToothCondition;
            notes?: string | undefined;
            surfaces?: ToothSurface[] | undefined;
        };
        toothNumber: number;
        lastUpdated: string;
    }[];
    patientId: string;
    notes?: string | undefined;
}>;
export type UpdateOdontogramDto = z.infer<typeof UpdateOdontogramDtoSchema>;
export declare const PerioSiteSchema: z.ZodObject<{
    probingDepth: z.ZodNumber;
    recession: z.ZodOptional<z.ZodNumber>;
    bleeding: z.ZodBoolean;
    mobility: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    probingDepth: number;
    bleeding: boolean;
    recession?: number | undefined;
    mobility?: number | undefined;
}, {
    probingDepth: number;
    bleeding: boolean;
    recession?: number | undefined;
    mobility?: number | undefined;
}>;
export type PerioSite = z.infer<typeof PerioSiteSchema>;
export declare const PerioToothSchema: z.ZodObject<{
    toothNumber: z.ZodNumber;
    sites: z.ZodArray<z.ZodObject<{
        probingDepth: z.ZodNumber;
        recession: z.ZodOptional<z.ZodNumber>;
        bleeding: z.ZodBoolean;
        mobility: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        probingDepth: number;
        bleeding: boolean;
        recession?: number | undefined;
        mobility?: number | undefined;
    }, {
        probingDepth: number;
        bleeding: boolean;
        recession?: number | undefined;
        mobility?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    toothNumber: number;
    sites: {
        probingDepth: number;
        bleeding: boolean;
        recession?: number | undefined;
        mobility?: number | undefined;
    }[];
}, {
    toothNumber: number;
    sites: {
        probingDepth: number;
        bleeding: boolean;
        recession?: number | undefined;
        mobility?: number | undefined;
    }[];
}>;
export type PerioTooth = z.infer<typeof PerioToothSchema>;
export declare const UpdatePerioChartDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    teeth: z.ZodEffects<z.ZodArray<z.ZodObject<{
        toothNumber: z.ZodNumber;
        sites: z.ZodArray<z.ZodObject<{
            probingDepth: z.ZodNumber;
            recession: z.ZodOptional<z.ZodNumber>;
            bleeding: z.ZodBoolean;
            mobility: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }, {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        toothNumber: number;
        sites: {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }[];
    }, {
        toothNumber: number;
        sites: {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }[];
    }>, "many">, {
        toothNumber: number;
        sites: {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }[];
    }[], {
        toothNumber: number;
        sites: {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }[];
    }[]>;
    examDate: z.ZodString;
    examinerId: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientId: string;
    teeth: {
        toothNumber: number;
        sites: {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }[];
    }[];
    examDate: string;
    examinerId: string;
    notes?: string | undefined;
}, {
    patientId: string;
    teeth: {
        toothNumber: number;
        sites: {
            probingDepth: number;
            bleeding: boolean;
            recession?: number | undefined;
            mobility?: number | undefined;
        }[];
    }[];
    examDate: string;
    examinerId: string;
    notes?: string | undefined;
}>;
export type UpdatePerioChartDto = z.infer<typeof UpdatePerioChartDtoSchema>;
export declare const ClinicalNoteTypeSchema: z.ZodNativeEnum<typeof ClinicalNoteType>;
export type ClinicalNoteTypeType = z.infer<typeof ClinicalNoteTypeSchema>;
export declare const SOAPNoteSchema: z.ZodObject<{
    subjective: z.ZodString;
    objective: z.ZodString;
    assessment: z.ZodString;
    plan: z.ZodString;
}, "strip", z.ZodTypeAny, {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}, {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}>;
export type SOAPNote = z.infer<typeof SOAPNoteSchema>;
export declare const CreateClinicalNoteDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    type: z.ZodNativeEnum<typeof ClinicalNoteType>;
    content: z.ZodUnion<[z.ZodObject<{
        subjective: z.ZodString;
        objective: z.ZodString;
        assessment: z.ZodString;
        plan: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    }, {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    }>, z.ZodObject<{
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
    }, {
        text: string;
    }>]>;
    chiefComplaint: z.ZodOptional<z.ZodString>;
    diagnosis: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isConfidential: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    type: ClinicalNoteType;
    content: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    } | {
        text: string;
    };
    patientId: string;
    isConfidential: boolean;
    attachments?: string[] | undefined;
    appointmentId?: string | undefined;
    chiefComplaint?: string | undefined;
    diagnosis?: string[] | undefined;
}, {
    type: ClinicalNoteType;
    content: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    } | {
        text: string;
    };
    patientId: string;
    attachments?: string[] | undefined;
    appointmentId?: string | undefined;
    chiefComplaint?: string | undefined;
    diagnosis?: string[] | undefined;
    isConfidential?: boolean | undefined;
}>;
export type CreateClinicalNoteDto = z.infer<typeof CreateClinicalNoteDtoSchema>;
export declare const ClinicalNoteSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    patientId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodString;
    type: z.ZodNativeEnum<typeof ClinicalNoteType>;
    content: z.ZodUnion<[z.ZodObject<{
        subjective: z.ZodString;
        objective: z.ZodString;
        assessment: z.ZodString;
        plan: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    }, {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    }>, z.ZodObject<{
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text: string;
    }, {
        text: string;
    }>]>;
    chiefComplaint: z.ZodOptional<z.ZodString>;
    diagnosis: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    isConfidential: z.ZodDefault<z.ZodBoolean>;
    signedAt: z.ZodOptional<z.ZodString>;
    signedBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: ClinicalNoteType;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    content: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    } | {
        text: string;
    };
    patientId: string;
    isConfidential: boolean;
    authorId: string;
    attachments?: string[] | undefined;
    appointmentId?: string | undefined;
    signedAt?: string | undefined;
    chiefComplaint?: string | undefined;
    diagnosis?: string[] | undefined;
    signedBy?: string | undefined;
}, {
    type: ClinicalNoteType;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    content: {
        subjective: string;
        objective: string;
        assessment: string;
        plan: string;
    } | {
        text: string;
    };
    patientId: string;
    authorId: string;
    attachments?: string[] | undefined;
    appointmentId?: string | undefined;
    signedAt?: string | undefined;
    chiefComplaint?: string | undefined;
    diagnosis?: string[] | undefined;
    isConfidential?: boolean | undefined;
    signedBy?: string | undefined;
}>;
export type ClinicalNote = z.infer<typeof ClinicalNoteSchema>;
export declare const TreatmentPlanStatusSchema: z.ZodNativeEnum<typeof TreatmentPlanStatus>;
export type TreatmentPlanStatusType = z.infer<typeof TreatmentPlanStatusSchema>;
export declare const ProcedureItemSchema: z.ZodObject<{
    code: z.ZodString;
    description: z.ZodString;
    toothNumber: z.ZodOptional<z.ZodNumber>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
    fee: z.ZodNumber;
    insuranceCoverage: z.ZodOptional<z.ZodNumber>;
    priority: z.ZodEnum<["IMMEDIATE", "SOON", "FUTURE"]>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    description: string;
    priority: "SOON" | "IMMEDIATE" | "FUTURE";
    fee: number;
    notes?: string | undefined;
    toothNumber?: number | undefined;
    surfaces?: ToothSurface[] | undefined;
    insuranceCoverage?: number | undefined;
}, {
    code: string;
    description: string;
    priority: "SOON" | "IMMEDIATE" | "FUTURE";
    fee: number;
    notes?: string | undefined;
    toothNumber?: number | undefined;
    surfaces?: ToothSurface[] | undefined;
    insuranceCoverage?: number | undefined;
}>;
export type ProcedureItem = z.infer<typeof ProcedureItemSchema>;
export declare const TreatmentOptionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    procedures: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        description: z.ZodString;
        toothNumber: z.ZodOptional<z.ZodNumber>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
        fee: z.ZodNumber;
        insuranceCoverage: z.ZodOptional<z.ZodNumber>;
        priority: z.ZodEnum<["IMMEDIATE", "SOON", "FUTURE"]>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        description: string;
        priority: "SOON" | "IMMEDIATE" | "FUTURE";
        fee: number;
        notes?: string | undefined;
        toothNumber?: number | undefined;
        surfaces?: ToothSurface[] | undefined;
        insuranceCoverage?: number | undefined;
    }, {
        code: string;
        description: string;
        priority: "SOON" | "IMMEDIATE" | "FUTURE";
        fee: number;
        notes?: string | undefined;
        toothNumber?: number | undefined;
        surfaces?: ToothSurface[] | undefined;
        insuranceCoverage?: number | undefined;
    }>, "many">;
    totalFee: z.ZodNumber;
    estimatedDuration: z.ZodNumber;
    isRecommended: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    description: string;
    procedures: {
        code: string;
        description: string;
        priority: "SOON" | "IMMEDIATE" | "FUTURE";
        fee: number;
        notes?: string | undefined;
        toothNumber?: number | undefined;
        surfaces?: ToothSurface[] | undefined;
        insuranceCoverage?: number | undefined;
    }[];
    totalFee: number;
    estimatedDuration: number;
    isRecommended: boolean;
}, {
    name: string;
    id: string;
    description: string;
    procedures: {
        code: string;
        description: string;
        priority: "SOON" | "IMMEDIATE" | "FUTURE";
        fee: number;
        notes?: string | undefined;
        toothNumber?: number | undefined;
        surfaces?: ToothSurface[] | undefined;
        insuranceCoverage?: number | undefined;
    }[];
    totalFee: number;
    estimatedDuration: number;
    isRecommended?: boolean | undefined;
}>;
export type TreatmentOption = z.infer<typeof TreatmentOptionSchema>;
export declare const CreateTreatmentPlanDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    options: z.ZodEffects<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        procedures: z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            description: z.ZodString;
            toothNumber: z.ZodOptional<z.ZodNumber>;
            surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
            fee: z.ZodNumber;
            insuranceCoverage: z.ZodOptional<z.ZodNumber>;
            priority: z.ZodEnum<["IMMEDIATE", "SOON", "FUTURE"]>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }, {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }>, "many">;
        totalFee: z.ZodNumber;
        estimatedDuration: z.ZodNumber;
        isRecommended: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        description: string;
        procedures: {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }[];
        totalFee: number;
        estimatedDuration: number;
        isRecommended: boolean;
    }, {
        name: string;
        id: string;
        description: string;
        procedures: {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }[];
        totalFee: number;
        estimatedDuration: number;
        isRecommended?: boolean | undefined;
    }>, "many">, {
        name: string;
        id: string;
        description: string;
        procedures: {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }[];
        totalFee: number;
        estimatedDuration: number;
        isRecommended: boolean;
    }[], {
        name: string;
        id: string;
        description: string;
        procedures: {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }[];
        totalFee: number;
        estimatedDuration: number;
        isRecommended?: boolean | undefined;
    }[]>;
    validUntil: z.ZodOptional<z.ZodString>;
    requiresInsuranceApproval: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    options: {
        name: string;
        id: string;
        description: string;
        procedures: {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }[];
        totalFee: number;
        estimatedDuration: number;
        isRecommended: boolean;
    }[];
    title: string;
    patientId: string;
    requiresInsuranceApproval: boolean;
    description?: string | undefined;
    validUntil?: string | undefined;
}, {
    options: {
        name: string;
        id: string;
        description: string;
        procedures: {
            code: string;
            description: string;
            priority: "SOON" | "IMMEDIATE" | "FUTURE";
            fee: number;
            notes?: string | undefined;
            toothNumber?: number | undefined;
            surfaces?: ToothSurface[] | undefined;
            insuranceCoverage?: number | undefined;
        }[];
        totalFee: number;
        estimatedDuration: number;
        isRecommended?: boolean | undefined;
    }[];
    title: string;
    patientId: string;
    description?: string | undefined;
    validUntil?: string | undefined;
    requiresInsuranceApproval?: boolean | undefined;
}>;
export type CreateTreatmentPlanDto = z.infer<typeof CreateTreatmentPlanDtoSchema>;
export declare const UpdateTreatmentPlanDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TreatmentPlanStatus>>;
    validUntil: z.ZodOptional<z.ZodString>;
    requiresInsuranceApproval: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: TreatmentPlanStatus | undefined;
    description?: string | undefined;
    title?: string | undefined;
    validUntil?: string | undefined;
    requiresInsuranceApproval?: boolean | undefined;
}, {
    status?: TreatmentPlanStatus | undefined;
    description?: string | undefined;
    title?: string | undefined;
    validUntil?: string | undefined;
    requiresInsuranceApproval?: boolean | undefined;
}>;
export type UpdateTreatmentPlanDto = z.infer<typeof UpdateTreatmentPlanDtoSchema>;
export declare const AcceptOptionDtoSchema: z.ZodObject<{
    treatmentPlanId: z.ZodString;
    optionId: z.ZodString;
    patientSignature: z.ZodString;
    signedAt: z.ZodString;
    depositAmount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    treatmentPlanId: string;
    signedAt: string;
    optionId: string;
    patientSignature: string;
    depositAmount?: number | undefined;
}, {
    treatmentPlanId: string;
    signedAt: string;
    optionId: string;
    patientSignature: string;
    depositAmount?: number | undefined;
}>;
export type AcceptOptionDto = z.infer<typeof AcceptOptionDtoSchema>;
export declare const ProcedureStatusSchema: z.ZodNativeEnum<typeof ProcedureStatus>;
export type ProcedureStatusType = z.infer<typeof ProcedureStatusSchema>;
export declare const ProcedureCodeSchema: z.ZodString;
export type ProcedureCode = z.infer<typeof ProcedureCodeSchema>;
export declare const CreateProcedureDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    code: z.ZodString;
    description: z.ZodString;
    toothNumber: z.ZodOptional<z.ZodNumber>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
    providerId: z.ZodString;
    assistantId: z.ZodOptional<z.ZodString>;
    scheduledDate: z.ZodOptional<z.ZodString>;
    estimatedDuration: z.ZodNumber;
    fee: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: string;
    description: string;
    patientId: string;
    providerId: string;
    fee: number;
    estimatedDuration: number;
    notes?: string | undefined;
    toothNumber?: number | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    surfaces?: ToothSurface[] | undefined;
    assistantId?: string | undefined;
    scheduledDate?: string | undefined;
}, {
    code: string;
    description: string;
    patientId: string;
    providerId: string;
    fee: number;
    estimatedDuration: number;
    notes?: string | undefined;
    toothNumber?: number | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    surfaces?: ToothSurface[] | undefined;
    assistantId?: string | undefined;
    scheduledDate?: string | undefined;
}>;
export type CreateProcedureDto = z.infer<typeof CreateProcedureDtoSchema>;
export declare const CompleteProcedureDtoSchema: z.ZodObject<{
    procedureId: z.ZodString;
    completedAt: z.ZodString;
    actualDuration: z.ZodNumber;
    stockItemsUsed: z.ZodOptional<z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        itemId: string;
    }, {
        quantity: number;
        itemId: string;
    }>, "many">>;
    complications: z.ZodOptional<z.ZodString>;
    outcomeNotes: z.ZodOptional<z.ZodString>;
    requiresFollowUp: z.ZodDefault<z.ZodBoolean>;
    followUpInDays: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    procedureId: string;
    completedAt: string;
    actualDuration: number;
    requiresFollowUp: boolean;
    stockItemsUsed?: {
        quantity: number;
        itemId: string;
    }[] | undefined;
    complications?: string | undefined;
    outcomeNotes?: string | undefined;
    followUpInDays?: number | undefined;
}, {
    procedureId: string;
    completedAt: string;
    actualDuration: number;
    stockItemsUsed?: {
        quantity: number;
        itemId: string;
    }[] | undefined;
    complications?: string | undefined;
    outcomeNotes?: string | undefined;
    requiresFollowUp?: boolean | undefined;
    followUpInDays?: number | undefined;
}>;
export type CompleteProcedureDto = z.infer<typeof CompleteProcedureDtoSchema>;
export declare const ProcedureSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    patientId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    code: z.ZodString;
    description: z.ZodString;
    toothNumber: z.ZodOptional<z.ZodNumber>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
    providerId: z.ZodString;
    assistantId: z.ZodOptional<z.ZodString>;
    status: z.ZodNativeEnum<typeof ProcedureStatus>;
    scheduledDate: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    estimatedDuration: z.ZodNumber;
    actualDuration: z.ZodOptional<z.ZodNumber>;
    fee: z.ZodNumber;
    stockItemsUsed: z.ZodOptional<z.ZodArray<z.ZodObject<{
        itemId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        itemId: string;
    }, {
        quantity: number;
        itemId: string;
    }>, "many">>;
    complications: z.ZodOptional<z.ZodString>;
    outcomeNotes: z.ZodOptional<z.ZodString>;
    requiresFollowUp: z.ZodDefault<z.ZodBoolean>;
    followUpInDays: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    status: ProcedureStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    tenantId: string;
    patientId: string;
    providerId: string;
    fee: number;
    estimatedDuration: number;
    requiresFollowUp: boolean;
    notes?: string | undefined;
    toothNumber?: number | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    completedAt?: string | undefined;
    surfaces?: ToothSurface[] | undefined;
    assistantId?: string | undefined;
    scheduledDate?: string | undefined;
    actualDuration?: number | undefined;
    stockItemsUsed?: {
        quantity: number;
        itemId: string;
    }[] | undefined;
    complications?: string | undefined;
    outcomeNotes?: string | undefined;
    followUpInDays?: number | undefined;
}, {
    code: string;
    status: ProcedureStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    tenantId: string;
    patientId: string;
    providerId: string;
    fee: number;
    estimatedDuration: number;
    notes?: string | undefined;
    toothNumber?: number | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    completedAt?: string | undefined;
    surfaces?: ToothSurface[] | undefined;
    assistantId?: string | undefined;
    scheduledDate?: string | undefined;
    actualDuration?: number | undefined;
    stockItemsUsed?: {
        quantity: number;
        itemId: string;
    }[] | undefined;
    complications?: string | undefined;
    outcomeNotes?: string | undefined;
    requiresFollowUp?: boolean | undefined;
    followUpInDays?: number | undefined;
}>;
export type Procedure = z.infer<typeof ProcedureSchema>;
export declare const ClinicalConsentTypeSchema: z.ZodNativeEnum<typeof ConsentType>;
export type ClinicalConsentTypeType = z.infer<typeof ClinicalConsentTypeSchema>;
export declare const ConsentStatusSchema: z.ZodNativeEnum<typeof ConsentStatus>;
export type ConsentStatusType = z.infer<typeof ConsentStatusSchema>;
export declare const DigitalSignatureSchema: z.ZodObject<{
    signatureData: z.ZodString;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    signedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    signedAt: string;
    signatureData: string;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
}, {
    signedAt: string;
    signatureData: string;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
}>;
export type DigitalSignature = z.infer<typeof DigitalSignatureSchema>;
export declare const CreateConsentDtoSchema: z.ZodObject<{
    patientId: z.ZodString;
    type: z.ZodNativeEnum<typeof ConsentType>;
    procedureId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodString;
    patientSignature: z.ZodOptional<z.ZodObject<{
        signatureData: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }>>;
    guardianSignature: z.ZodOptional<z.ZodObject<{
        signatureData: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }>>;
    witnessSignature: z.ZodOptional<z.ZodObject<{
        signatureData: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }>>;
    expiresAt: z.ZodOptional<z.ZodString>;
    requiresGuardianConsent: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: ConsentType;
    content: string;
    title: string;
    patientId: string;
    requiresGuardianConsent: boolean;
    expiresAt?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    patientSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    guardianSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    witnessSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
}, {
    type: ConsentType;
    content: string;
    title: string;
    patientId: string;
    expiresAt?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    patientSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    guardianSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    witnessSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    requiresGuardianConsent?: boolean | undefined;
}>;
export type CreateConsentDto = z.infer<typeof CreateConsentDtoSchema>;
export declare const ConsentSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    patientId: z.ZodString;
    type: z.ZodNativeEnum<typeof ConsentType>;
    status: z.ZodNativeEnum<typeof ConsentStatus>;
    procedureId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodString;
    patientSignature: z.ZodOptional<z.ZodObject<{
        signatureData: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }>>;
    guardianSignature: z.ZodOptional<z.ZodObject<{
        signatureData: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }>>;
    witnessSignature: z.ZodOptional<z.ZodObject<{
        signatureData: z.ZodString;
        ipAddress: z.ZodOptional<z.ZodString>;
        userAgent: z.ZodOptional<z.ZodString>;
        signedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }, {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    }>>;
    grantedAt: z.ZodOptional<z.ZodString>;
    revokedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    requiresGuardianConsent: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: ConsentType;
    status: ConsentStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    content: string;
    title: string;
    patientId: string;
    requiresGuardianConsent: boolean;
    expiresAt?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    patientSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    guardianSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    witnessSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    grantedAt?: string | undefined;
    revokedAt?: string | undefined;
}, {
    type: ConsentType;
    status: ConsentStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    tenantId: string;
    content: string;
    title: string;
    patientId: string;
    expiresAt?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    patientSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    guardianSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    witnessSignature?: {
        signedAt: string;
        signatureData: string;
        userAgent?: string | undefined;
        ipAddress?: string | undefined;
    } | undefined;
    requiresGuardianConsent?: boolean | undefined;
    grantedAt?: string | undefined;
    revokedAt?: string | undefined;
}>;
export type Consent = z.infer<typeof ConsentSchema>;
export declare const ClinicalNoteQuerySchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    authorId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof ClinicalNoteType>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    isConfidential: z.ZodOptional<z.ZodBoolean>;
    searchText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: ClinicalNoteType | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    isConfidential?: boolean | undefined;
    authorId?: string | undefined;
    searchText?: string | undefined;
}, {
    type?: ClinicalNoteType | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    patientId?: string | undefined;
    appointmentId?: string | undefined;
    isConfidential?: boolean | undefined;
    authorId?: string | undefined;
    searchText?: string | undefined;
}>;
export type ClinicalNoteQuery = z.infer<typeof ClinicalNoteQuerySchema>;
export declare const TreatmentPlanQuerySchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TreatmentPlanStatus>>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
    requiresInsuranceApproval: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    status?: TreatmentPlanStatus | undefined;
    patientId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    requiresInsuranceApproval?: boolean | undefined;
}, {
    status?: TreatmentPlanStatus | undefined;
    patientId?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
    requiresInsuranceApproval?: boolean | undefined;
}>;
export type TreatmentPlanQuery = z.infer<typeof TreatmentPlanQuerySchema>;
export declare const ProcedureQuerySchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProcedureStatus>>;
    code: z.ZodOptional<z.ZodString>;
    toothNumber: z.ZodOptional<z.ZodNumber>;
    scheduledAfter: z.ZodOptional<z.ZodString>;
    scheduledBefore: z.ZodOptional<z.ZodString>;
    requiresFollowUp: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    status?: ProcedureStatus | undefined;
    patientId?: string | undefined;
    toothNumber?: number | undefined;
    providerId?: string | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
    requiresFollowUp?: boolean | undefined;
}, {
    code?: string | undefined;
    status?: ProcedureStatus | undefined;
    patientId?: string | undefined;
    toothNumber?: number | undefined;
    providerId?: string | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    scheduledAfter?: string | undefined;
    scheduledBefore?: string | undefined;
    requiresFollowUp?: boolean | undefined;
}>;
export type ProcedureQuery = z.infer<typeof ProcedureQuerySchema>;
export declare const ConsentQuerySchema: z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof ConsentType>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ConsentStatus>>;
    procedureId: z.ZodOptional<z.ZodString>;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    expiringBefore: z.ZodOptional<z.ZodString>;
    requiresGuardianConsent: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: ConsentType | undefined;
    status?: ConsentStatus | undefined;
    patientId?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    expiringBefore?: string | undefined;
    requiresGuardianConsent?: boolean | undefined;
}, {
    type?: ConsentType | undefined;
    status?: ConsentStatus | undefined;
    patientId?: string | undefined;
    treatmentPlanId?: string | undefined;
    procedureId?: string | undefined;
    expiringBefore?: string | undefined;
    requiresGuardianConsent?: boolean | undefined;
}>;
export type ConsentQuery = z.infer<typeof ConsentQuerySchema>;

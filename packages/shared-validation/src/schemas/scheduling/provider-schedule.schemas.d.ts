import { z } from 'zod';
export declare const DayOfWeekSchema: z.ZodNumber;
export declare const TimeSlotTypeSchema: z.ZodEnum<["AVAILABLE", "BREAK", "BLOCKED", "EMERGENCY", "BUFFER", "ADMINISTRATIVE"]>;
export declare const AbsenceTypeSchema: z.ZodEnum<["VACATION", "SICK_LEAVE", "CONFERENCE", "PERSONAL", "BEREAVEMENT", "PARENTAL_LEAVE", "SABBATICAL", "OTHER"]>;
export declare const AbsenceStatusSchema: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "CANCELLED"]>;
export declare const ScheduleRecurrenceSchema: z.ZodEnum<["NONE", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]>;
export declare const ScheduleExceptionTypeSchema: z.ZodEnum<["OVERRIDE", "ADDITION", "CANCELLATION"]>;
export declare const TimeOfDaySchema: z.ZodEffects<z.ZodObject<{
    hour: z.ZodNumber;
    minute: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    hour: number;
    minute: number;
}, {
    hour: number;
    minute: number;
}>, {
    hour: number;
    minute: number;
}, {
    hour: number;
    minute: number;
}>;
export declare const WorkPeriodSchema: z.ZodEffects<z.ZodObject<{
    startTime: z.ZodEffects<z.ZodObject<{
        hour: z.ZodNumber;
        minute: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>;
    endTime: z.ZodEffects<z.ZodObject<{
        hour: z.ZodNumber;
        minute: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>;
    clinicId: z.ZodOptional<z.ZodString>;
    room: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startTime: {
        hour: number;
        minute: number;
    };
    endTime: {
        hour: number;
        minute: number;
    };
    clinicId?: string | undefined;
    room?: string | undefined;
}, {
    startTime: {
        hour: number;
        minute: number;
    };
    endTime: {
        hour: number;
        minute: number;
    };
    clinicId?: string | undefined;
    room?: string | undefined;
}>, {
    startTime: {
        hour: number;
        minute: number;
    };
    endTime: {
        hour: number;
        minute: number;
    };
    clinicId?: string | undefined;
    room?: string | undefined;
}, {
    startTime: {
        hour: number;
        minute: number;
    };
    endTime: {
        hour: number;
        minute: number;
    };
    clinicId?: string | undefined;
    room?: string | undefined;
}>;
export declare const DailyWorkingHoursSchema: z.ZodObject<{
    dayOfWeek: z.ZodNumber;
    isWorkingDay: z.ZodBoolean;
    workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
        startTime: z.ZodEffects<z.ZodObject<{
            hour: z.ZodNumber;
            minute: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            hour: number;
            minute: number;
        }, {
            hour: number;
            minute: number;
        }>, {
            hour: number;
            minute: number;
        }, {
            hour: number;
            minute: number;
        }>;
        endTime: z.ZodEffects<z.ZodObject<{
            hour: z.ZodNumber;
            minute: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            hour: number;
            minute: number;
        }, {
            hour: number;
            minute: number;
        }>, {
            hour: number;
            minute: number;
        }, {
            hour: number;
            minute: number;
        }>;
        clinicId: z.ZodOptional<z.ZodString>;
        room: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
        clinicId?: string | undefined;
        room?: string | undefined;
    }, {
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
        clinicId?: string | undefined;
        room?: string | undefined;
    }>, {
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
        clinicId?: string | undefined;
        room?: string | undefined;
    }, {
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
        clinicId?: string | undefined;
        room?: string | undefined;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dayOfWeek: number;
    isWorkingDay: boolean;
    workPeriods: {
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
        clinicId?: string | undefined;
        room?: string | undefined;
    }[];
    notes?: string | undefined;
}, {
    dayOfWeek: number;
    isWorkingDay: boolean;
    notes?: string | undefined;
    workPeriods?: {
        startTime: {
            hour: number;
            minute: number;
        };
        endTime: {
            hour: number;
            minute: number;
        };
        clinicId?: string | undefined;
        room?: string | undefined;
    }[] | undefined;
}>;
export declare const TimeSlotSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    slotType: z.ZodEnum<["AVAILABLE", "BREAK", "BLOCKED", "EMERGENCY", "BUFFER", "ADMINISTRATIVE"]>;
    isAvailable: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
    duration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    duration: number;
    slotType: "AVAILABLE" | "ADMINISTRATIVE" | "BLOCKED" | "EMERGENCY" | "BREAK" | "BUFFER";
    reason?: string | undefined;
}, {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    duration: number;
    slotType: "AVAILABLE" | "ADMINISTRATIVE" | "BLOCKED" | "EMERGENCY" | "BREAK" | "BUFFER";
    reason?: string | undefined;
}>, {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    duration: number;
    slotType: "AVAILABLE" | "ADMINISTRATIVE" | "BLOCKED" | "EMERGENCY" | "BREAK" | "BUFFER";
    reason?: string | undefined;
}, {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    duration: number;
    slotType: "AVAILABLE" | "ADMINISTRATIVE" | "BLOCKED" | "EMERGENCY" | "BREAK" | "BUFFER";
    reason?: string | undefined;
}>;
export declare const WeeklyHoursSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    providerId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dailySchedules: z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        isWorkingDay: z.ZodBoolean;
        workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            startTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            endTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            clinicId: z.ZodOptional<z.ZodString>;
            room: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }>, "many">;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeZone: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    version: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    name: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    providerId: string;
    isDefault: boolean;
    dailySchedules: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }[];
    effectiveFrom: string;
    timeZone: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    effectiveTo?: string | null | undefined;
}, {
    organizationId: string;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    providerId: string;
    dailySchedules: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }[];
    effectiveFrom: string;
    timeZone: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    effectiveTo?: string | null | undefined;
}>;
export declare const ScheduleExceptionSchema: z.ZodObject<{
    id: z.ZodString;
    providerId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    exceptionType: z.ZodEnum<["OVERRIDE", "ADDITION", "CANCELLATION"]>;
    exceptionDate: z.ZodString;
    schedule: z.ZodOptional<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        isWorkingDay: z.ZodBoolean;
        workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            startTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            endTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            clinicId: z.ZodOptional<z.ZodString>;
            room: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }>>;
    reason: z.ZodOptional<z.ZodString>;
    cancelAppointments: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    createdBy: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    id: string;
    createdAt: string;
    providerId: string;
    createdBy: string;
    exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
    exceptionDate: string;
    cancelAppointments: boolean;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    schedule?: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    } | undefined;
}, {
    organizationId: string;
    id: string;
    createdAt: string;
    providerId: string;
    createdBy: string;
    exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
    exceptionDate: string;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    schedule?: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    } | undefined;
    cancelAppointments?: boolean | undefined;
}>;
export declare const ProviderAbsenceSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    providerId: z.ZodString;
    organizationId: z.ZodString;
    absenceType: z.ZodEnum<["VACATION", "SICK_LEAVE", "CONFERENCE", "PERSONAL", "BEREAVEMENT", "PARENTAL_LEAVE", "SABBATICAL", "OTHER"]>;
    status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "CANCELLED"]>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    isAllDay: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    documentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    requestedBy: z.ZodString;
    requestedAt: z.ZodString;
    reviewedBy: z.ZodOptional<z.ZodString>;
    reviewedAt: z.ZodOptional<z.ZodString>;
    reviewNotes: z.ZodOptional<z.ZodString>;
    cancelAppointments: z.ZodDefault<z.ZodBoolean>;
    affectedAppointmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    coveringProviderId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    version: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    organizationId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    startDate: string;
    endDate: string;
    providerId: string;
    requestedBy: string;
    cancelAppointments: boolean;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    isAllDay: boolean;
    requestedAt: string;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    reviewNotes?: string | undefined;
    documentIds?: string[] | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    affectedAppointmentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    startDate: string;
    endDate: string;
    providerId: string;
    requestedBy: string;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    requestedAt: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    reason?: string | undefined;
    reviewNotes?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    affectedAppointmentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    organizationId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    startDate: string;
    endDate: string;
    providerId: string;
    requestedBy: string;
    cancelAppointments: boolean;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    isAllDay: boolean;
    requestedAt: string;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    reviewNotes?: string | undefined;
    documentIds?: string[] | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    affectedAppointmentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    startDate: string;
    endDate: string;
    providerId: string;
    requestedBy: string;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    requestedAt: string;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    reason?: string | undefined;
    reviewNotes?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    reviewedBy?: string | undefined;
    reviewedAt?: string | undefined;
    affectedAppointmentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>;
export declare const ProviderScheduleSchema: z.ZodObject<{
    id: z.ZodString;
    providerId: z.ZodString;
    organizationId: z.ZodString;
    defaultWeeklyHours: z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        providerId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        dailySchedules: z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            isWorkingDay: z.ZodBoolean;
            workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
                startTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                endTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                clinicId: z.ZodOptional<z.ZodString>;
                room: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, "many">>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }>, "many">;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        effectiveFrom: z.ZodString;
        effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeZone: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        version: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        name: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    }, {
        organizationId: string;
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    }>;
    alternateWeeklyHours: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        providerId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        dailySchedules: z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            isWorkingDay: z.ZodBoolean;
            workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
                startTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                endTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                clinicId: z.ZodOptional<z.ZodString>;
                room: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, "many">>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }>, "many">;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        effectiveFrom: z.ZodString;
        effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeZone: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        version: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        name: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    }, {
        organizationId: string;
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    }>, "many">>;
    exceptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        providerId: z.ZodString;
        organizationId: z.ZodString;
        clinicId: z.ZodOptional<z.ZodString>;
        exceptionType: z.ZodEnum<["OVERRIDE", "ADDITION", "CANCELLATION"]>;
        exceptionDate: z.ZodString;
        schedule: z.ZodOptional<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            isWorkingDay: z.ZodBoolean;
            workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
                startTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                endTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                clinicId: z.ZodOptional<z.ZodString>;
                room: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, "many">>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }>>;
        reason: z.ZodOptional<z.ZodString>;
        cancelAppointments: z.ZodDefault<z.ZodBoolean>;
        createdAt: z.ZodString;
        createdBy: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        id: string;
        createdAt: string;
        providerId: string;
        createdBy: string;
        exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
        exceptionDate: string;
        cancelAppointments: boolean;
        clinicId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        schedule?: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        } | undefined;
    }, {
        organizationId: string;
        id: string;
        createdAt: string;
        providerId: string;
        createdBy: string;
        exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
        exceptionDate: string;
        clinicId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        schedule?: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        } | undefined;
        cancelAppointments?: boolean | undefined;
    }>, "many">>;
    absences: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        providerId: z.ZodString;
        organizationId: z.ZodString;
        absenceType: z.ZodEnum<["VACATION", "SICK_LEAVE", "CONFERENCE", "PERSONAL", "BEREAVEMENT", "PARENTAL_LEAVE", "SABBATICAL", "OTHER"]>;
        status: z.ZodEnum<["PENDING", "APPROVED", "REJECTED", "CANCELLED"]>;
        startDate: z.ZodString;
        endDate: z.ZodString;
        isAllDay: z.ZodDefault<z.ZodBoolean>;
        reason: z.ZodOptional<z.ZodString>;
        documentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        requestedBy: z.ZodString;
        requestedAt: z.ZodString;
        reviewedBy: z.ZodOptional<z.ZodString>;
        reviewedAt: z.ZodOptional<z.ZodString>;
        reviewNotes: z.ZodOptional<z.ZodString>;
        cancelAppointments: z.ZodDefault<z.ZodBoolean>;
        affectedAppointmentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        coveringProviderId: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        version: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        organizationId: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        startDate: string;
        endDate: string;
        providerId: string;
        requestedBy: string;
        cancelAppointments: boolean;
        absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
        isAllDay: boolean;
        requestedAt: string;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        reviewNotes?: string | undefined;
        documentIds?: string[] | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        affectedAppointmentIds?: string[] | undefined;
        coveringProviderId?: string | undefined;
    }, {
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        startDate: string;
        endDate: string;
        providerId: string;
        requestedBy: string;
        absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
        requestedAt: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        reason?: string | undefined;
        reviewNotes?: string | undefined;
        cancelAppointments?: boolean | undefined;
        isAllDay?: boolean | undefined;
        documentIds?: string[] | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        affectedAppointmentIds?: string[] | undefined;
        coveringProviderId?: string | undefined;
    }>, {
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        organizationId: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        startDate: string;
        endDate: string;
        providerId: string;
        requestedBy: string;
        cancelAppointments: boolean;
        absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
        isAllDay: boolean;
        requestedAt: string;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        reviewNotes?: string | undefined;
        documentIds?: string[] | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        affectedAppointmentIds?: string[] | undefined;
        coveringProviderId?: string | undefined;
    }, {
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        startDate: string;
        endDate: string;
        providerId: string;
        requestedBy: string;
        absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
        requestedAt: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        reason?: string | undefined;
        reviewNotes?: string | undefined;
        cancelAppointments?: boolean | undefined;
        isAllDay?: boolean | undefined;
        documentIds?: string[] | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        affectedAppointmentIds?: string[] | undefined;
        coveringProviderId?: string | undefined;
    }>, "many">>;
    clinicIds: z.ZodArray<z.ZodString, "many">;
    defaultAppointmentDuration: z.ZodNumber;
    minAppointmentDuration: z.ZodNumber;
    maxAppointmentDuration: z.ZodNumber;
    bufferTime: z.ZodDefault<z.ZodNumber>;
    maxAppointmentsPerDay: z.ZodOptional<z.ZodNumber>;
    acceptsOnlineBooking: z.ZodDefault<z.ZodBoolean>;
    bookingWindowDays: z.ZodOptional<z.ZodNumber>;
    cancellationPolicyHours: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    version: z.ZodDefault<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    version: number;
    id: string;
    createdAt: string;
    updatedAt: string;
    clinicIds: string[];
    providerId: string;
    isActive: boolean;
    defaultWeeklyHours: {
        organizationId: string;
        name: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    };
    exceptions: {
        organizationId: string;
        id: string;
        createdAt: string;
        providerId: string;
        createdBy: string;
        exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
        exceptionDate: string;
        cancelAppointments: boolean;
        clinicId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        schedule?: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        } | undefined;
    }[];
    absences: {
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        organizationId: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        startDate: string;
        endDate: string;
        providerId: string;
        requestedBy: string;
        cancelAppointments: boolean;
        absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
        isAllDay: boolean;
        requestedAt: string;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        reviewNotes?: string | undefined;
        documentIds?: string[] | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        affectedAppointmentIds?: string[] | undefined;
        coveringProviderId?: string | undefined;
    }[];
    defaultAppointmentDuration: number;
    minAppointmentDuration: number;
    maxAppointmentDuration: number;
    bufferTime: number;
    acceptsOnlineBooking: boolean;
    metadata?: Record<string, unknown> | undefined;
    cancellationPolicyHours?: number | undefined;
    alternateWeeklyHours?: {
        organizationId: string;
        name: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    }[] | undefined;
    maxAppointmentsPerDay?: number | undefined;
    bookingWindowDays?: number | undefined;
}, {
    organizationId: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    clinicIds: string[];
    providerId: string;
    defaultWeeklyHours: {
        organizationId: string;
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    };
    defaultAppointmentDuration: number;
    minAppointmentDuration: number;
    maxAppointmentDuration: number;
    metadata?: Record<string, unknown> | undefined;
    version?: number | undefined;
    cancellationPolicyHours?: number | undefined;
    isActive?: boolean | undefined;
    alternateWeeklyHours?: {
        organizationId: string;
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    }[] | undefined;
    exceptions?: {
        organizationId: string;
        id: string;
        createdAt: string;
        providerId: string;
        createdBy: string;
        exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
        exceptionDate: string;
        clinicId?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
        reason?: string | undefined;
        schedule?: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        } | undefined;
        cancelAppointments?: boolean | undefined;
    }[] | undefined;
    absences?: {
        status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
        organizationId: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        startDate: string;
        endDate: string;
        providerId: string;
        requestedBy: string;
        absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
        requestedAt: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        reason?: string | undefined;
        reviewNotes?: string | undefined;
        cancelAppointments?: boolean | undefined;
        isAllDay?: boolean | undefined;
        documentIds?: string[] | undefined;
        reviewedBy?: string | undefined;
        reviewedAt?: string | undefined;
        affectedAppointmentIds?: string[] | undefined;
        coveringProviderId?: string | undefined;
    }[] | undefined;
    bufferTime?: number | undefined;
    maxAppointmentsPerDay?: number | undefined;
    acceptsOnlineBooking?: boolean | undefined;
    bookingWindowDays?: number | undefined;
}>;
export declare const AvailabilitySearchCriteriaSchema: z.ZodObject<{
    providerId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    duration: z.ZodNumber;
    daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    preferredTimeStart: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        hour: z.ZodNumber;
        minute: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>>;
    preferredTimeEnd: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        hour: z.ZodNumber;
        minute: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>, {
        hour: number;
        minute: number;
    }, {
        hour: number;
        minute: number;
    }>>;
    appointmentType: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    limit: number;
    startDate: string;
    endDate: string;
    providerId: string;
    duration: number;
    clinicId?: string | undefined;
    daysOfWeek?: number[] | undefined;
    preferredTimeStart?: {
        hour: number;
        minute: number;
    } | undefined;
    preferredTimeEnd?: {
        hour: number;
        minute: number;
    } | undefined;
    appointmentType?: string | undefined;
}, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    duration: number;
    clinicId?: string | undefined;
    limit?: number | undefined;
    daysOfWeek?: number[] | undefined;
    preferredTimeStart?: {
        hour: number;
        minute: number;
    } | undefined;
    preferredTimeEnd?: {
        hour: number;
        minute: number;
    } | undefined;
    appointmentType?: string | undefined;
}>;
export declare const AvailableSlotSchema: z.ZodEffects<z.ZodObject<{
    providerId: z.ZodString;
    clinicId: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    duration: z.ZodNumber;
    room: z.ZodOptional<z.ZodString>;
    confidenceScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    confidenceScore: number;
    room?: string | undefined;
}, {
    clinicId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    confidenceScore: number;
    room?: string | undefined;
}>, {
    clinicId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    confidenceScore: number;
    room?: string | undefined;
}, {
    clinicId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    duration: number;
    confidenceScore: number;
    room?: string | undefined;
}>;
export declare const AvailabilitySummarySchema: z.ZodObject<{
    providerId: z.ZodString;
    date: z.ZodString;
    totalWorkingHours: z.ZodNumber;
    totalBookedHours: z.ZodNumber;
    totalAvailableHours: z.ZodNumber;
    appointmentCount: z.ZodNumber;
    availableSlotCount: z.ZodNumber;
    utilizationPercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    date: string;
    providerId: string;
    totalWorkingHours: number;
    totalBookedHours: number;
    totalAvailableHours: number;
    appointmentCount: number;
    availableSlotCount: number;
    utilizationPercentage: number;
}, {
    date: string;
    providerId: string;
    totalWorkingHours: number;
    totalBookedHours: number;
    totalAvailableHours: number;
    appointmentCount: number;
    availableSlotCount: number;
    utilizationPercentage: number;
}>;
export declare const BulkScheduleUpdateSchema: z.ZodObject<{
    providerId: z.ZodString;
    organizationId: z.ZodString;
    startDate: z.ZodString;
    endDate: z.ZodString;
    weeklyHoursTemplate: z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        providerId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        dailySchedules: z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            isWorkingDay: z.ZodBoolean;
            workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
                startTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                endTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                clinicId: z.ZodOptional<z.ZodString>;
                room: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, "many">>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }>, "many">;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        effectiveFrom: z.ZodString;
        effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeZone: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        version: z.ZodDefault<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        name: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    }, {
        organizationId: string;
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    }>;
    preserveAppointments: z.ZodDefault<z.ZodBoolean>;
    updatedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    updatedBy: string;
    weeklyHoursTemplate: {
        organizationId: string;
        name: string;
        version: number;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    };
    preserveAppointments: boolean;
}, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    updatedBy: string;
    weeklyHoursTemplate: {
        organizationId: string;
        name: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        version?: number | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    };
    preserveAppointments?: boolean | undefined;
}>;
export declare const CreateWeeklyHoursDtoSchema: z.ZodObject<{
    organizationId: z.ZodString;
    providerId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dailySchedules: z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        isWorkingDay: z.ZodBoolean;
        workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            startTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            endTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            clinicId: z.ZodOptional<z.ZodString>;
            room: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }>, "many">;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    effectiveFrom: z.ZodString;
    effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeZone: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    name: string;
    providerId: string;
    isDefault: boolean;
    dailySchedules: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }[];
    effectiveFrom: string;
    timeZone: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    effectiveTo?: string | null | undefined;
}, {
    organizationId: string;
    name: string;
    providerId: string;
    dailySchedules: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }[];
    effectiveFrom: string;
    timeZone: string;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    effectiveTo?: string | null | undefined;
}>;
export declare const UpdateWeeklyHoursDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    dailySchedules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        isWorkingDay: z.ZodBoolean;
        workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            startTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            endTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            clinicId: z.ZodOptional<z.ZodString>;
            room: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }>, "many">>;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    effectiveFrom: z.ZodOptional<z.ZodString>;
    effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeZone: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    dailySchedules?: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }[] | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | null | undefined;
    timeZone?: string | undefined;
}, {
    name?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    dailySchedules?: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }[] | undefined;
    effectiveFrom?: string | undefined;
    effectiveTo?: string | null | undefined;
    timeZone?: string | undefined;
}>;
export declare const CreateScheduleExceptionDtoSchema: z.ZodObject<{
    providerId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    exceptionType: z.ZodEnum<["OVERRIDE", "ADDITION", "CANCELLATION"]>;
    exceptionDate: z.ZodString;
    schedule: z.ZodOptional<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        isWorkingDay: z.ZodBoolean;
        workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
            startTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            endTime: z.ZodEffects<z.ZodObject<{
                hour: z.ZodNumber;
                minute: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>, {
                hour: number;
                minute: number;
            }, {
                hour: number;
                minute: number;
            }>;
            clinicId: z.ZodOptional<z.ZodString>;
            room: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }, {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }>, "many">>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    }, {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    }>>;
    reason: z.ZodOptional<z.ZodString>;
    cancelAppointments: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    providerId: string;
    exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
    exceptionDate: string;
    cancelAppointments: boolean;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    schedule?: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        workPeriods: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[];
        notes?: string | undefined;
    } | undefined;
}, {
    organizationId: string;
    providerId: string;
    exceptionType: "CANCELLATION" | "OVERRIDE" | "ADDITION";
    exceptionDate: string;
    clinicId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    schedule?: {
        dayOfWeek: number;
        isWorkingDay: boolean;
        notes?: string | undefined;
        workPeriods?: {
            startTime: {
                hour: number;
                minute: number;
            };
            endTime: {
                hour: number;
                minute: number;
            };
            clinicId?: string | undefined;
            room?: string | undefined;
        }[] | undefined;
    } | undefined;
    cancelAppointments?: boolean | undefined;
}>;
export declare const CreateProviderAbsenceDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    providerId: z.ZodString;
    organizationId: z.ZodString;
    absenceType: z.ZodEnum<["VACATION", "SICK_LEAVE", "CONFERENCE", "PERSONAL", "BEREAVEMENT", "PARENTAL_LEAVE", "SABBATICAL", "OTHER"]>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    isAllDay: z.ZodDefault<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    documentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cancelAppointments: z.ZodDefault<z.ZodBoolean>;
    coveringProviderId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    cancelAppointments: boolean;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    isAllDay: boolean;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    cancelAppointments: boolean;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    isAllDay: boolean;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    cancelAppointments: boolean;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    isAllDay: boolean;
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    organizationId: string;
    startDate: string;
    endDate: string;
    providerId: string;
    absenceType: "OTHER" | "VACATION" | "SICK_LEAVE" | "CONFERENCE" | "PERSONAL" | "BEREAVEMENT" | "PARENTAL_LEAVE" | "SABBATICAL";
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>;
export declare const UpdateProviderAbsenceDtoSchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    isAllDay: z.ZodOptional<z.ZodBoolean>;
    reason: z.ZodOptional<z.ZodString>;
    documentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cancelAppointments: z.ZodOptional<z.ZodBoolean>;
    coveringProviderId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>, {
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}, {
    metadata?: Record<string, unknown> | undefined;
    reason?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cancelAppointments?: boolean | undefined;
    isAllDay?: boolean | undefined;
    documentIds?: string[] | undefined;
    coveringProviderId?: string | undefined;
}>;
export declare const ReviewAbsenceDtoSchema: z.ZodObject<{
    status: z.ZodEnum<["APPROVED", "REJECTED"]>;
    reviewNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "APPROVED" | "REJECTED";
    reviewNotes?: string | undefined;
}, {
    status: "APPROVED" | "REJECTED";
    reviewNotes?: string | undefined;
}>;
export declare const CreateProviderScheduleDtoSchema: z.ZodObject<{
    providerId: z.ZodString;
    organizationId: z.ZodString;
    defaultWeeklyHours: z.ZodObject<{
        organizationId: z.ZodString;
        providerId: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        dailySchedules: z.ZodArray<z.ZodObject<{
            dayOfWeek: z.ZodNumber;
            isWorkingDay: z.ZodBoolean;
            workPeriods: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodObject<{
                startTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                endTime: z.ZodEffects<z.ZodObject<{
                    hour: z.ZodNumber;
                    minute: z.ZodNumber;
                }, "strip", z.ZodTypeAny, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>, {
                    hour: number;
                    minute: number;
                }, {
                    hour: number;
                    minute: number;
                }>;
                clinicId: z.ZodOptional<z.ZodString>;
                room: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }, {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }>, "many">>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }, {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }>, "many">;
        isDefault: z.ZodDefault<z.ZodBoolean>;
        effectiveFrom: z.ZodString;
        effectiveTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeZone: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        name: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    }, {
        organizationId: string;
        name: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    }>;
    clinicIds: z.ZodArray<z.ZodString, "many">;
    defaultAppointmentDuration: z.ZodNumber;
    minAppointmentDuration: z.ZodNumber;
    maxAppointmentDuration: z.ZodNumber;
    bufferTime: z.ZodDefault<z.ZodNumber>;
    maxAppointmentsPerDay: z.ZodOptional<z.ZodNumber>;
    acceptsOnlineBooking: z.ZodDefault<z.ZodBoolean>;
    bookingWindowDays: z.ZodOptional<z.ZodNumber>;
    cancellationPolicyHours: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    clinicIds: string[];
    providerId: string;
    defaultWeeklyHours: {
        organizationId: string;
        name: string;
        providerId: string;
        isDefault: boolean;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            workPeriods: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[];
            notes?: string | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        effectiveTo?: string | null | undefined;
    };
    defaultAppointmentDuration: number;
    minAppointmentDuration: number;
    maxAppointmentDuration: number;
    bufferTime: number;
    acceptsOnlineBooking: boolean;
    metadata?: Record<string, unknown> | undefined;
    cancellationPolicyHours?: number | undefined;
    maxAppointmentsPerDay?: number | undefined;
    bookingWindowDays?: number | undefined;
}, {
    organizationId: string;
    clinicIds: string[];
    providerId: string;
    defaultWeeklyHours: {
        organizationId: string;
        name: string;
        providerId: string;
        dailySchedules: {
            dayOfWeek: number;
            isWorkingDay: boolean;
            notes?: string | undefined;
            workPeriods?: {
                startTime: {
                    hour: number;
                    minute: number;
                };
                endTime: {
                    hour: number;
                    minute: number;
                };
                clinicId?: string | undefined;
                room?: string | undefined;
            }[] | undefined;
        }[];
        effectiveFrom: string;
        timeZone: string;
        metadata?: Record<string, unknown> | undefined;
        description?: string | undefined;
        isDefault?: boolean | undefined;
        effectiveTo?: string | null | undefined;
    };
    defaultAppointmentDuration: number;
    minAppointmentDuration: number;
    maxAppointmentDuration: number;
    metadata?: Record<string, unknown> | undefined;
    cancellationPolicyHours?: number | undefined;
    bufferTime?: number | undefined;
    maxAppointmentsPerDay?: number | undefined;
    acceptsOnlineBooking?: boolean | undefined;
    bookingWindowDays?: number | undefined;
}>;
export declare const UpdateProviderScheduleDtoSchema: z.ZodObject<{
    clinicIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    defaultAppointmentDuration: z.ZodOptional<z.ZodNumber>;
    minAppointmentDuration: z.ZodOptional<z.ZodNumber>;
    maxAppointmentDuration: z.ZodOptional<z.ZodNumber>;
    bufferTime: z.ZodOptional<z.ZodNumber>;
    maxAppointmentsPerDay: z.ZodOptional<z.ZodNumber>;
    acceptsOnlineBooking: z.ZodOptional<z.ZodBoolean>;
    bookingWindowDays: z.ZodOptional<z.ZodNumber>;
    cancellationPolicyHours: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    metadata?: Record<string, unknown> | undefined;
    clinicIds?: string[] | undefined;
    cancellationPolicyHours?: number | undefined;
    isActive?: boolean | undefined;
    defaultAppointmentDuration?: number | undefined;
    minAppointmentDuration?: number | undefined;
    maxAppointmentDuration?: number | undefined;
    bufferTime?: number | undefined;
    maxAppointmentsPerDay?: number | undefined;
    acceptsOnlineBooking?: boolean | undefined;
    bookingWindowDays?: number | undefined;
}, {
    metadata?: Record<string, unknown> | undefined;
    clinicIds?: string[] | undefined;
    cancellationPolicyHours?: number | undefined;
    isActive?: boolean | undefined;
    defaultAppointmentDuration?: number | undefined;
    minAppointmentDuration?: number | undefined;
    maxAppointmentDuration?: number | undefined;
    bufferTime?: number | undefined;
    maxAppointmentsPerDay?: number | undefined;
    acceptsOnlineBooking?: boolean | undefined;
    bookingWindowDays?: number | undefined;
}>;
export type TimeOfDayInput = z.input<typeof TimeOfDaySchema>;
export type TimeOfDayOutput = z.output<typeof TimeOfDaySchema>;
export type WorkPeriodInput = z.input<typeof WorkPeriodSchema>;
export type WorkPeriodOutput = z.output<typeof WorkPeriodSchema>;
export type DailyWorkingHoursInput = z.input<typeof DailyWorkingHoursSchema>;
export type DailyWorkingHoursOutput = z.output<typeof DailyWorkingHoursSchema>;
export type TimeSlotInput = z.input<typeof TimeSlotSchema>;
export type TimeSlotOutput = z.output<typeof TimeSlotSchema>;
export type WeeklyHoursInput = z.input<typeof WeeklyHoursSchema>;
export type WeeklyHoursOutput = z.output<typeof WeeklyHoursSchema>;
export type ScheduleExceptionInput = z.input<typeof ScheduleExceptionSchema>;
export type ScheduleExceptionOutput = z.output<typeof ScheduleExceptionSchema>;
export type ProviderAbsenceInput = z.input<typeof ProviderAbsenceSchema>;
export type ProviderAbsenceOutput = z.output<typeof ProviderAbsenceSchema>;
export type ProviderScheduleInput = z.input<typeof ProviderScheduleSchema>;
export type ProviderScheduleOutput = z.output<typeof ProviderScheduleSchema>;
export type AvailabilitySearchCriteriaInput = z.input<typeof AvailabilitySearchCriteriaSchema>;
export type AvailabilitySearchCriteriaOutput = z.output<typeof AvailabilitySearchCriteriaSchema>;
export type AvailableSlotInput = z.input<typeof AvailableSlotSchema>;
export type AvailableSlotOutput = z.output<typeof AvailableSlotSchema>;
export type CreateWeeklyHoursDtoInput = z.input<typeof CreateWeeklyHoursDtoSchema>;
export type CreateWeeklyHoursDtoOutput = z.output<typeof CreateWeeklyHoursDtoSchema>;
export type UpdateWeeklyHoursDtoInput = z.input<typeof UpdateWeeklyHoursDtoSchema>;
export type UpdateWeeklyHoursDtoOutput = z.output<typeof UpdateWeeklyHoursDtoSchema>;
export type CreateScheduleExceptionDtoInput = z.input<typeof CreateScheduleExceptionDtoSchema>;
export type CreateScheduleExceptionDtoOutput = z.output<typeof CreateScheduleExceptionDtoSchema>;
export type CreateProviderAbsenceDtoInput = z.input<typeof CreateProviderAbsenceDtoSchema>;
export type CreateProviderAbsenceDtoOutput = z.output<typeof CreateProviderAbsenceDtoSchema>;
export type UpdateProviderAbsenceDtoInput = z.input<typeof UpdateProviderAbsenceDtoSchema>;
export type UpdateProviderAbsenceDtoOutput = z.output<typeof UpdateProviderAbsenceDtoSchema>;
export type ReviewAbsenceDtoInput = z.input<typeof ReviewAbsenceDtoSchema>;
export type ReviewAbsenceDtoOutput = z.output<typeof ReviewAbsenceDtoSchema>;
export type CreateProviderScheduleDtoInput = z.input<typeof CreateProviderScheduleDtoSchema>;
export type CreateProviderScheduleDtoOutput = z.output<typeof CreateProviderScheduleDtoSchema>;
export type UpdateProviderScheduleDtoInput = z.input<typeof UpdateProviderScheduleDtoSchema>;
export type UpdateProviderScheduleDtoOutput = z.output<typeof UpdateProviderScheduleDtoSchema>;

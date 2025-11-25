import { z } from 'zod';
export declare const DevicePlatformSchema: z.ZodEnum<["WINDOWS", "MACOS", "LINUX"]>;
export declare const DeviceMetadataSchema: z.ZodObject<{
    platform: z.ZodEnum<["WINDOWS", "MACOS", "LINUX"]>;
    osVersion: z.ZodString;
    appVersion: z.ZodString;
    hardwareHash: z.ZodString;
    cpuArch: z.ZodString;
    totalMemoryMb: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    platform: "WINDOWS" | "MACOS" | "LINUX";
    osVersion: string;
    appVersion: string;
    hardwareHash: string;
    cpuArch: string;
    totalMemoryMb: number;
}, {
    platform: "WINDOWS" | "MACOS" | "LINUX";
    osVersion: string;
    appVersion: string;
    hardwareHash: string;
    cpuArch: string;
    totalMemoryMb: number;
}>;
export declare const RegisterDeviceSchema: z.ZodObject<{
    deviceName: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    metadata: z.ZodObject<{
        platform: z.ZodEnum<["WINDOWS", "MACOS", "LINUX"]>;
        osVersion: z.ZodString;
        appVersion: z.ZodString;
        hardwareHash: z.ZodString;
        cpuArch: z.ZodString;
        totalMemoryMb: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        platform: "WINDOWS" | "MACOS" | "LINUX";
        osVersion: string;
        appVersion: string;
        hardwareHash: string;
        cpuArch: string;
        totalMemoryMb: number;
    }, {
        platform: "WINDOWS" | "MACOS" | "LINUX";
        osVersion: string;
        appVersion: string;
        hardwareHash: string;
        cpuArch: string;
        totalMemoryMb: number;
    }>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    metadata: {
        platform: "WINDOWS" | "MACOS" | "LINUX";
        osVersion: string;
        appVersion: string;
        hardwareHash: string;
        cpuArch: string;
        totalMemoryMb: number;
    };
    userId: string;
    tenantId: string;
    deviceName: string;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    metadata: {
        platform: "WINDOWS" | "MACOS" | "LINUX";
        osVersion: string;
        appVersion: string;
        hardwareHash: string;
        cpuArch: string;
        totalMemoryMb: number;
    };
    userId: string;
    tenantId: string;
    deviceName: string;
    clinicId?: string | undefined;
}>;
export declare const ChangeOperationSchema: z.ZodEnum<["INSERT", "UPDATE", "DELETE"]>;
export declare const OfflineChangeSchema: z.ZodObject<{
    changeId: z.ZodString;
    sequenceNumber: z.ZodNumber;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    entityType: z.ZodString;
    entityId: z.ZodString;
    operation: z.ZodEnum<["INSERT", "UPDATE", "DELETE"]>;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    previousData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodDate;
    sourceDeviceId: z.ZodOptional<z.ZodString>;
    eventId: z.ZodOptional<z.ZodString>;
    eventType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    timestamp: Date;
    tenantId: string;
    changeId: string;
    sequenceNumber: number;
    entityType: string;
    entityId: string;
    operation: "UPDATE" | "DELETE" | "INSERT";
    data: Record<string, any>;
    clinicId?: string | undefined;
    previousData?: Record<string, any> | undefined;
    sourceDeviceId?: string | undefined;
    eventId?: string | undefined;
    eventType?: string | undefined;
}, {
    organizationId: string;
    timestamp: Date;
    tenantId: string;
    changeId: string;
    sequenceNumber: number;
    entityType: string;
    entityId: string;
    operation: "UPDATE" | "DELETE" | "INSERT";
    data: Record<string, any>;
    clinicId?: string | undefined;
    previousData?: Record<string, any> | undefined;
    sourceDeviceId?: string | undefined;
    eventId?: string | undefined;
    eventType?: string | undefined;
}>;
export declare const SyncBatchSchema: z.ZodObject<{
    deviceId: z.ZodString;
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    lastSequence: z.ZodNumber;
    changes: z.ZodArray<z.ZodObject<{
        changeId: z.ZodString;
        sequenceNumber: z.ZodNumber;
        tenantId: z.ZodString;
        organizationId: z.ZodString;
        clinicId: z.ZodOptional<z.ZodString>;
        entityType: z.ZodString;
        entityId: z.ZodString;
        operation: z.ZodEnum<["INSERT", "UPDATE", "DELETE"]>;
        data: z.ZodRecord<z.ZodString, z.ZodAny>;
        previousData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        timestamp: z.ZodDate;
        sourceDeviceId: z.ZodOptional<z.ZodString>;
        eventId: z.ZodOptional<z.ZodString>;
        eventType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        organizationId: string;
        timestamp: Date;
        tenantId: string;
        changeId: string;
        sequenceNumber: number;
        entityType: string;
        entityId: string;
        operation: "UPDATE" | "DELETE" | "INSERT";
        data: Record<string, any>;
        clinicId?: string | undefined;
        previousData?: Record<string, any> | undefined;
        sourceDeviceId?: string | undefined;
        eventId?: string | undefined;
        eventType?: string | undefined;
    }, {
        organizationId: string;
        timestamp: Date;
        tenantId: string;
        changeId: string;
        sequenceNumber: number;
        entityType: string;
        entityId: string;
        operation: "UPDATE" | "DELETE" | "INSERT";
        data: Record<string, any>;
        clinicId?: string | undefined;
        previousData?: Record<string, any> | undefined;
        sourceDeviceId?: string | undefined;
        eventId?: string | undefined;
        eventType?: string | undefined;
    }>, "many">;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    timestamp: Date;
    changes: {
        organizationId: string;
        timestamp: Date;
        tenantId: string;
        changeId: string;
        sequenceNumber: number;
        entityType: string;
        entityId: string;
        operation: "UPDATE" | "DELETE" | "INSERT";
        data: Record<string, any>;
        clinicId?: string | undefined;
        previousData?: Record<string, any> | undefined;
        sourceDeviceId?: string | undefined;
        eventId?: string | undefined;
        eventType?: string | undefined;
    }[];
    tenantId: string;
    deviceId: string;
    lastSequence: number;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    timestamp: Date;
    changes: {
        organizationId: string;
        timestamp: Date;
        tenantId: string;
        changeId: string;
        sequenceNumber: number;
        entityType: string;
        entityId: string;
        operation: "UPDATE" | "DELETE" | "INSERT";
        data: Record<string, any>;
        clinicId?: string | undefined;
        previousData?: Record<string, any> | undefined;
        sourceDeviceId?: string | undefined;
        eventId?: string | undefined;
        eventType?: string | undefined;
    }[];
    tenantId: string;
    deviceId: string;
    lastSequence: number;
    clinicId?: string | undefined;
}>;
export declare const GetChangesQuerySchema: z.ZodObject<{
    sinceSequence: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    entityTypes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sinceSequence: number;
    entityTypes?: string | undefined;
}, {
    limit?: number | undefined;
    sinceSequence?: number | undefined;
    entityTypes?: string | undefined;
}>;
export declare const ConflictResolutionStrategySchema: z.ZodEnum<["SERVER_WINS", "CLIENT_WINS", "MERGE"]>;
export declare const ResolveConflictSchema: z.ZodObject<{
    changeId: z.ZodString;
    strategy: z.ZodEnum<["SERVER_WINS", "CLIENT_WINS", "MERGE"]>;
    mergedData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    changeId: string;
    strategy: "SERVER_WINS" | "CLIENT_WINS" | "MERGE";
    mergedData?: Record<string, any> | undefined;
}, {
    changeId: string;
    strategy: "SERVER_WINS" | "CLIENT_WINS" | "MERGE";
    mergedData?: Record<string, any> | undefined;
}>;

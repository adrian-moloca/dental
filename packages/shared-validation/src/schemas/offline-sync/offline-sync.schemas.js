"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveConflictSchema = exports.ConflictResolutionStrategySchema = exports.GetChangesQuerySchema = exports.SyncBatchSchema = exports.OfflineChangeSchema = exports.ChangeOperationSchema = exports.RegisterDeviceSchema = exports.DeviceMetadataSchema = exports.DevicePlatformSchema = void 0;
const zod_1 = require("zod");
exports.DevicePlatformSchema = zod_1.z.enum(['WINDOWS', 'MACOS', 'LINUX']);
exports.DeviceMetadataSchema = zod_1.z.object({
    platform: exports.DevicePlatformSchema,
    osVersion: zod_1.z.string().min(1),
    appVersion: zod_1.z.string().min(1),
    hardwareHash: zod_1.z.string().min(1),
    cpuArch: zod_1.z.string().min(1),
    totalMemoryMb: zod_1.z.number().int().positive(),
});
exports.RegisterDeviceSchema = zod_1.z.object({
    deviceName: zod_1.z.string().min(1).max(255),
    tenantId: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    clinicId: zod_1.z.string().uuid().optional(),
    userId: zod_1.z.string().uuid(),
    metadata: exports.DeviceMetadataSchema,
});
exports.ChangeOperationSchema = zod_1.z.enum(['INSERT', 'UPDATE', 'DELETE']);
exports.OfflineChangeSchema = zod_1.z.object({
    changeId: zod_1.z.string().uuid(),
    sequenceNumber: zod_1.z.number().int().positive(),
    tenantId: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    clinicId: zod_1.z.string().uuid().optional(),
    entityType: zod_1.z.string().min(1),
    entityId: zod_1.z.string().min(1),
    operation: exports.ChangeOperationSchema,
    data: zod_1.z.record(zod_1.z.any()),
    previousData: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.coerce.date(),
    sourceDeviceId: zod_1.z.string().uuid().optional(),
    eventId: zod_1.z.string().uuid().optional(),
    eventType: zod_1.z.string().optional(),
});
exports.SyncBatchSchema = zod_1.z.object({
    deviceId: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    clinicId: zod_1.z.string().uuid().optional(),
    lastSequence: zod_1.z.number().int().min(0),
    changes: zod_1.z.array(exports.OfflineChangeSchema),
    timestamp: zod_1.z.coerce.date(),
});
exports.GetChangesQuerySchema = zod_1.z.object({
    sinceSequence: zod_1.z.coerce.number().int().min(0).default(0),
    limit: zod_1.z.coerce.number().int().positive().max(1000).default(100),
    entityTypes: zod_1.z.string().optional(),
});
exports.ConflictResolutionStrategySchema = zod_1.z.enum(['SERVER_WINS', 'CLIENT_WINS', 'MERGE']);
exports.ResolveConflictSchema = zod_1.z.object({
    changeId: zod_1.z.string().uuid(),
    strategy: exports.ConflictResolutionStrategySchema,
    mergedData: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=offline-sync.schemas.js.map
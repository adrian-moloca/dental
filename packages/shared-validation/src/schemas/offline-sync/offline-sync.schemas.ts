import { z } from 'zod';

export const DevicePlatformSchema = z.enum(['WINDOWS', 'MACOS', 'LINUX']);

export const DeviceMetadataSchema = z.object({
  platform: DevicePlatformSchema,
  osVersion: z.string().min(1),
  appVersion: z.string().min(1),
  hardwareHash: z.string().min(1),
  cpuArch: z.string().min(1),
  totalMemoryMb: z.number().int().positive(),
});

export const RegisterDeviceSchema = z.object({
  deviceName: z.string().min(1).max(255),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  metadata: DeviceMetadataSchema,
});

export const ChangeOperationSchema = z.enum(['INSERT', 'UPDATE', 'DELETE']);

export const OfflineChangeSchema = z.object({
  changeId: z.string().uuid(),
  sequenceNumber: z.number().int().positive(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  operation: ChangeOperationSchema,
  data: z.record(z.any()),
  previousData: z.record(z.any()).optional(),
  timestamp: z.coerce.date(),
  sourceDeviceId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  eventType: z.string().optional(),
});

export const SyncBatchSchema = z.object({
  deviceId: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  lastSequence: z.number().int().min(0),
  changes: z.array(OfflineChangeSchema),
  timestamp: z.coerce.date(),
});

export const GetChangesQuerySchema = z.object({
  sinceSequence: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().positive().max(1000).default(100),
  entityTypes: z.string().optional(),
});

export const ConflictResolutionStrategySchema = z.enum(['SERVER_WINS', 'CLIENT_WINS', 'MERGE']);

export const ResolveConflictSchema = z.object({
  changeId: z.string().uuid(),
  strategy: ConflictResolutionStrategySchema,
  mergedData: z.record(z.any()).optional(),
});

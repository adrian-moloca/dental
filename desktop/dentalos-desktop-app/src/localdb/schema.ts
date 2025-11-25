import Dexie, { Table } from 'dexie';

export interface DeviceRecord {
  deviceId: string;
  deviceName: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  userId: string;
  deviceAccessToken: string;
  refreshToken?: string;
  lastSyncedSequence: number;
  encryptionKey: string;
  registeredAt: Date;
  lastSeenAt: Date;
}

export interface ChangeLogRecord {
  changeId: string;
  sequenceNumber: number;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  entityType: string;
  entityId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  previousData?: any;
  timestamp: Date;
  sourceDeviceId?: string;
  syncedAt?: Date;
}

export interface PendingChangeRecord {
  localId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  entityType: string;
  entityId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  previousData?: any;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
  synced: boolean;
}

export interface PatientRecord {
  patientId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  data: any;
  updatedAt: Date;
}

export interface AppointmentRecord {
  appointmentId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  providerId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  data: any;
  updatedAt: Date;
}

export interface ClinicalRecord {
  recordId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  type: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingRecord {
  imageId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  imageType: string;
  filePath: string;
  data: any;
  capturedAt: Date;
  updatedAt: Date;
}

export interface BillingRecord {
  invoiceId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  amount: number;
  status: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryRecord {
  itemId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  name: string;
  quantity: number;
  data: any;
  updatedAt: Date;
}

export interface HRRecord {
  employeeId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  firstName: string;
  lastName: string;
  role: string;
  data: any;
  updatedAt: Date;
}

export interface SterilizationRecord {
  cycleId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  status: string;
  data: any;
  startedAt: Date;
  updatedAt: Date;
}

export interface EnterpriseRecord {
  entityId: string;
  tenantId: string;
  organizationId: string;
  entityType: string;
  data: any;
  updatedAt: Date;
}

export interface SequenceState {
  id: number;
  tenantId: string;
  lastSyncedSequence: number;
  lastSyncedAt: Date;
}

export interface TreatmentRecord {
  treatmentId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  type: string;
  status: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  _version?: number;
  _updatedAt?: Date;
  _actorId?: string;
}

export interface InvoiceRecord {
  invoiceId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  patientId: string;
  amount: number;
  status: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  _version?: number;
  _updatedAt?: Date;
  _actorId?: string;
}

export interface ConflictRecord {
  id: string;
  resourceType: string;
  resourceId: string;
  conflicts: any[];
  localData: any;
  remotePatch: any;
  createdAt: Date;
  resolved: boolean;
}

export class DentalOSDatabase extends Dexie {
  devices!: Table<DeviceRecord, string>;
  changelog!: Table<ChangeLogRecord, string>;
  pendingChanges!: Table<PendingChangeRecord, string>;
  patients!: Table<PatientRecord, string>;
  appointments!: Table<AppointmentRecord, string>;
  treatments!: Table<TreatmentRecord, string>;
  invoices!: Table<InvoiceRecord, string>;
  clinical!: Table<ClinicalRecord, string>;
  imaging!: Table<ImagingRecord, string>;
  billing!: Table<BillingRecord, string>;
  inventory!: Table<InventoryRecord, string>;
  hr!: Table<HRRecord, string>;
  sterilization!: Table<SterilizationRecord, string>;
  enterprise!: Table<EnterpriseRecord, string>;
  conflicts!: Table<ConflictRecord, string>;
  sequenceState!: Table<SequenceState, number>;

  constructor() {
    super('DentalOSDB');

    this.version(1).stores({
      devices: 'deviceId, tenantId, organizationId',
      changelog: 'changeId, sequenceNumber, tenantId, [tenantId+sequenceNumber], entityType, entityId',
      pendingChanges: 'localId, tenantId, synced, [tenantId+synced]',
      patients: 'patientId, tenantId, [tenantId+organizationId], clinicId',
      appointments: 'appointmentId, tenantId, clinicId, patientId, startTime, [tenantId+startTime]',
      treatments: 'treatmentId, tenantId, clinicId, patientId, status',
      invoices: 'invoiceId, tenantId, clinicId, patientId, status',
      clinical: 'recordId, tenantId, clinicId, patientId, type',
      imaging: 'imageId, tenantId, clinicId, patientId, capturedAt',
      billing: 'invoiceId, tenantId, clinicId, patientId, status',
      inventory: 'itemId, tenantId, clinicId',
      hr: 'employeeId, tenantId, organizationId, clinicId',
      sterilization: 'cycleId, tenantId, clinicId, status',
      enterprise: 'entityId, tenantId, organizationId, entityType',
      conflicts: 'id, resourceType, resourceId, resolved, [tenantId+resolved]',
      sequenceState: '++id, tenantId'
    });
  }
}

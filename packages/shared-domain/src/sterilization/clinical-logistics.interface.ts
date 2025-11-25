import type {
  ClinicalLogisticsTaskId,
  ClinicalLogisticsTaskType,
  ClinicalLogisticsTaskStatus
} from './sterilization-types';

export interface ClinicalLogisticsTask {
  id: ClinicalLogisticsTaskId;
  tenantId: string;
  organizationId: string;
  clinicId: string;

  type: ClinicalLogisticsTaskType;
  status: ClinicalLogisticsTaskStatus;

  roomId?: string;
  roomName?: string;

  appointmentId?: string;
  procedureId?: string;

  assigneeId?: string;
  assignedBy: string;

  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  title: string;
  description?: string;
  checklist?: ChecklistItem[];

  consumablesRequired?: ConsumableRequirement[];

  dueAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  completedBy?: string;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface ConsumableRequirement {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  isPrepared: boolean;
  preparedBy?: string;
  preparedAt?: Date;
}

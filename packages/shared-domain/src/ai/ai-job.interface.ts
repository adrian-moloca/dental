import { AIJobStatus } from './ai-job-status.enum';
import { AITaskType } from './ai-task-type.enum';

export interface AIJob {
  id: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  taskType: AITaskType;
  status: AIJobStatus;
  contextId: string;
  contextType: string;
  requestedBy: string;
  correlationId?: string;
  prompt?: string;
  contextData?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

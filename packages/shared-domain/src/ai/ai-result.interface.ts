import { AITaskType } from './ai-task-type.enum';

export interface AIResult {
  id: string;
  jobId: string;
  tenantId: string;
  organizationId: string;
  clinicId?: string;
  taskType: AITaskType;
  contextId: string;
  contextType: string;
  result: Record<string, unknown>;
  confidence?: number;
  metadata?: Record<string, unknown>;
  modelUsed: string;
  tokensUsed?: number;
  processingTimeMs: number;
  createdAt: Date;
  expiresAt?: Date;
}

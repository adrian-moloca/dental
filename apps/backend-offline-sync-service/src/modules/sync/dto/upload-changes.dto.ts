import { SyncBatchSchema } from '@dentalos/shared-validation';
import { z } from 'zod';

export type UploadChangesDto = z.infer<typeof SyncBatchSchema>;

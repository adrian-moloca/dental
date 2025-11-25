import { z } from 'zod';

export const GetChangesQuerySchema = z.object({
  sinceSequence: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  entityType: z.string().optional(),
});

export type GetChangesQueryDto = z.infer<typeof GetChangesQuerySchema>;

import { z } from 'zod';

export const PresenceUpdateDtoSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY', 'BUSY']).optional(),
  activeResource: z
    .object({
      type: z.string(),
      id: z.string(),
    })
    .nullable()
    .optional(),
});

export type PresenceUpdateDto = z.infer<typeof PresenceUpdateDtoSchema>;

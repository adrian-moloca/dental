import { z } from 'zod';

export const PublishEventDtoSchema = z.object({
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  clinicId: z.string().uuid().optional(),
  channels: z.array(z.string()).min(1),
  eventType: z.string().min(1),
  payload: z.record(z.any()),
});

export type PublishEventDto = z.infer<typeof PublishEventDtoSchema>;

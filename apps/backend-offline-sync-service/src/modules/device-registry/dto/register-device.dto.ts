import { RegisterDeviceSchema } from '@dentalos/shared-validation';
import { z } from 'zod';

export type RegisterDeviceDto = z.infer<typeof RegisterDeviceSchema>;

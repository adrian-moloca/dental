/**
 * Public Route Decorator
 * Marks routes as publicly accessible (no authentication required)
 */

import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * RequireModule Decorator
 *
 * Marks endpoints that require specific subscription modules.
 * Used in conjunction with SubscriptionGuard to enforce module-based access control.
 *
 * USAGE:
 * ```typescript
 * @UseGuards(JwtAuthGuard, SubscriptionGuard)
 * @RequireModule('CLINICAL')
 * @Get('clinical-notes')
 * async getClinicalNotes() {
 *   // Only accessible if user has CLINICAL module in subscription
 * }
 * ```
 *
 * AVAILABLE MODULES:
 * - SCHEDULING: Scheduling & Appointments
 * - PATIENT360: Patient Management
 * - CLINICAL: Clinical EHR
 * - BILLING: Billing & Payments
 * - ANALYTICS: Analytics & Reports
 * - INVENTORY: Inventory Management
 * - MARKETING: Marketing & Communications
 * - TELEHEALTH: Telehealth & Video Consultations
 *
 * @module decorators/require-module
 */

import { SetMetadata } from '@nestjs/common';
import { REQUIRED_MODULE_KEY } from '../guards/subscription.guard';

/**
 * Module codes enum
 * Keep in sync with backend-subscription-service/src/modules/constants/module-catalog.constant.ts
 */
export enum ModuleCode {
  // Core Modules (included in all subscriptions)
  SCHEDULING = 'SCHEDULING',
  PATIENT360 = 'PATIENT360',
  CLINICAL = 'CLINICAL',
  BILLING = 'BILLING',

  // Add-on Modules
  ANALYTICS = 'ANALYTICS',
  INVENTORY = 'INVENTORY',
  MARKETING = 'MARKETING',
  TELEHEALTH = 'TELEHEALTH',
}

/**
 * RequireModule Decorator
 *
 * @param moduleCode - Module code required for access
 * @returns MethodDecorator
 *
 * @example
 * // Single module requirement
 * @RequireModule('CLINICAL')
 * @Get('patient/:id/notes')
 * async getClinicalNotes() { ... }
 *
 * @example
 * // Apply to entire controller (all methods require module)
 * @Controller('clinical')
 * @RequireModule('CLINICAL')
 * export class ClinicalController { ... }
 */
export const RequireModule = (moduleCode: string | ModuleCode) =>
  SetMetadata(REQUIRED_MODULE_KEY, moduleCode);

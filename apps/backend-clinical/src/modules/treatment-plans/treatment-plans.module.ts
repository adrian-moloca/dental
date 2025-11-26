/**
 * Treatment Plans Module
 *
 * NestJS module for treatment plan management in the clinical system.
 * Provides complete treatment planning workflow including:
 * - Multi-phase treatment plans with alternatives
 * - Financial calculations with payment plans
 * - Patient consent and approval workflows
 * - Integration with billing, inventory, and scheduling via events
 *
 * CRITICAL SYSTEM INTEGRATION:
 * This module emits domain events consumed by:
 * - Billing System: Creates invoices from completed procedures
 * - Inventory System: Deducts materials on procedure completion
 * - Scheduling System: Creates appointments from treatment items
 *
 * @module treatment-plans
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Controller
import { TreatmentPlansController } from './treatment-plans.controller';

// Service
import { TreatmentPlansService } from './treatment-plans.service';

// Repository
import { TreatmentPlansRepository } from './treatment-plans.repository';

// Schemas
import {
  TreatmentPlan,
  TreatmentPlanSchema,
  TreatmentPlanHistory,
  TreatmentPlanHistorySchema,
} from './entities/treatment-plan.schema';

// Auth Module for guards and decorators
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Register MongoDB schemas
    MongooseModule.forFeature([
      {
        name: TreatmentPlan.name,
        schema: TreatmentPlanSchema,
      },
      {
        name: TreatmentPlanHistory.name,
        schema: TreatmentPlanHistorySchema,
      },
    ]),

    // Event Emitter for domain events
    EventEmitterModule.forRoot(),

    // Auth module for guards
    AuthModule,
  ],
  controllers: [TreatmentPlansController],
  providers: [
    TreatmentPlansService,
    TreatmentPlansRepository,
  ],
  exports: [
    // Export service for use by other modules
    TreatmentPlansService,
    TreatmentPlansRepository,
  ],
})
export class TreatmentPlansModule {}

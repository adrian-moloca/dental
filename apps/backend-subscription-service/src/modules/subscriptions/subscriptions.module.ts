/**
 * Subscriptions Module
 *
 * NestJS module that wires up all subscription-related components.
 *
 * Provides:
 * - Subscription entity and repository
 * - SubscriptionModule entity and repository
 * - Subscription service (business logic)
 * - License validation service
 * - Subscription controller (REST API)
 *
 * Dependencies:
 * - TypeORM (database access)
 * - Shared types package (@dentalos/shared-types)
 * - Shared errors package (@dentalos/shared-errors)
 *
 * Usage:
 * Import this module in the main app module:
 *
 * @example
 * ```typescript
 * import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
 *
 * @Module({
 *   imports: [
 *     TypeOrmModule.forRoot({...}),
 *     SubscriptionsModule,
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @module modules/subscriptions
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusMetricsService } from '@dentalos/shared-infra';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionModule as SubscriptionModuleEntity } from './entities/subscription-module.entity';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { SubscriptionService } from './services/subscription.service';
import { LicenseValidationService } from './services/license-validation.service';
import { SubscriptionController } from './controllers/subscription.controller';

/**
 * Subscriptions module
 *
 * Exports:
 * - SubscriptionService: For use in other modules
 * - LicenseValidationService: For license validation across services
 * - SubscriptionRepository: For direct data access if needed
 */
@Module({
  imports: [
    // Register entities with TypeORM
    TypeOrmModule.forFeature([Subscription, SubscriptionModuleEntity]),
  ],
  controllers: [
    // REST API endpoints
    SubscriptionController,
  ],
  providers: [
    // Repositories
    SubscriptionRepository,

    // Services
    SubscriptionService,
    LicenseValidationService,
    PrometheusMetricsService,
  ],
  exports: [
    // Export for use in other modules
    SubscriptionService,
    LicenseValidationService,
    SubscriptionRepository,
  ],
})
export class SubscriptionsModule {}

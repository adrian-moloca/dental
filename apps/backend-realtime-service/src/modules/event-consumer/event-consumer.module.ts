import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventConsumerService } from './event-consumer.service';
import { RealtimeModule } from '../realtime/realtime.module';

/**
 * Event Consumer Module
 *
 * This module provides RabbitMQ event subscription capabilities for the realtime service.
 * It connects to the domain event bus and bridges events to WebSocket clients.
 *
 * Architecture:
 * - Uses RabbitMQClient from @dentalos/shared-infra for connection management
 * - Subscribes to domain events via topic exchange pattern matching
 * - Routes events to appropriate WebSocket channels based on tenant context
 * - Handles connection failures gracefully with retry logic
 *
 * Dependencies:
 * - ConfigModule: For RabbitMQ connection configuration
 * - RealtimeModule: For WebSocket event publishing
 *
 * Event Flow:
 * 1. Backend services publish domain events to RabbitMQ exchange
 * 2. EventConsumerService subscribes to relevant event patterns
 * 3. Incoming events are parsed and validated
 * 4. Events are routed to WebSocket channels based on tenant/clinic context
 * 5. Connected clients receive real-time updates
 *
 * Subscribed Event Categories:
 * - patient.*: Patient CRUD operations
 * - appointment.*: Scheduling events
 * - clinical_note.*: Clinical documentation
 * - treatment_plan.*: Treatment planning
 * - invoice.*: Billing events
 * - stock.*: Inventory alerts
 * - provider_schedule.*: Provider availability
 */
@Module({
  imports: [ConfigModule, forwardRef(() => RealtimeModule)],
  providers: [EventConsumerService],
  exports: [EventConsumerService],
})
export class EventConsumerModule {}

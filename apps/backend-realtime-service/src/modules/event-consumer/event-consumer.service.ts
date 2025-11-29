import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQClient } from '@dentalos/shared-infra';
import { RealtimeService } from '../realtime/realtime.service';

/**
 * Domain Event Envelope
 * Standard structure for events published by backend services
 */
export interface DomainEventEnvelope<T = unknown> {
  metadata: {
    eventId: string;
    eventType: string;
    version: string;
    timestamp: string;
    correlationId: string;
    causationId?: string;
    source: string;
  };
  tenant: {
    tenantId: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
  };
  payload: T;
}

/**
 * Event routing configuration
 * Maps event types to WebSocket channels
 */
interface EventRouting {
  eventType: string;
  channels: (event: DomainEventEnvelope) => string[];
}

/**
 * Event Consumer Service
 *
 * Subscribes to RabbitMQ domain events and broadcasts them to connected WebSocket clients.
 * This service bridges the event-driven backend architecture with real-time frontend updates.
 *
 * Architecture:
 * - Connects to RabbitMQ on module initialization
 * - Declares exchanges and queues for domain events
 * - Subscribes to relevant event types
 * - Routes events to appropriate WebSocket channels based on tenant context
 *
 * Event Categories:
 * - Patient events: patient.created, patient.updated, patient.merged
 * - Scheduling events: appointment.booked, appointment.rescheduled, appointment.cancelled
 * - Clinical events: clinical_note.created, treatment_plan.accepted, procedure.completed
 * - Inventory events: stock.low, stock.deducted, purchase_order.created
 * - Billing events: invoice.created, invoice.paid, payment.received
 */
@Injectable()
export class EventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumerService.name);
  private rabbitmqClient: RabbitMQClient | null = null;
  private isConnected = false;

  // RabbitMQ configuration
  private readonly EXCHANGE_NAME = 'dentalos.domain_events';
  private readonly QUEUE_NAME = 'realtime-service.domain_events';
  private readonly DEAD_LETTER_EXCHANGE = 'dentalos.dead_letter';
  private readonly DEAD_LETTER_QUEUE = 'realtime-service.dead_letter';

  // Event types to subscribe to (with routing key patterns)
  private readonly SUBSCRIBED_EVENT_PATTERNS = [
    'patient.*', // All patient events
    'appointment.*', // All scheduling events
    'clinical_note.*', // Clinical note events
    'treatment_plan.*', // Treatment plan events
    'procedure.*', // Procedure events
    'invoice.*', // Invoice events
    'payment.*', // Payment events
    'stock.*', // Inventory events
    'purchase_order.*', // Purchase order events
    'campaign.*', // Marketing campaign events
    'notification.*', // System notifications
    'provider_schedule.*', // Provider availability changes
  ];

  // Event routing configuration
  private readonly eventRoutingConfig: EventRouting[] = [
    // Patient events - broadcast to tenant and specific patient room
    {
      eventType: 'patient.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`, `org:${event.tenant.organizationId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        // Add patient-specific room for detailed updates
        const patientId = (event.payload as { patientId?: string })?.patientId;
        if (patientId) {
          channels.push(`patient:${patientId}`);
        }
        return channels;
      },
    },
    // Appointment events - broadcast to clinic and patient room
    {
      eventType: 'appointment.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        // Add appointment-specific room
        const appointmentId = (event.payload as { appointmentId?: string })?.appointmentId;
        if (appointmentId) {
          channels.push(`resource:appointment:${appointmentId}`);
        }
        // Add patient room for their appointment updates
        const patientId = (event.payload as { patientId?: string })?.patientId;
        if (patientId) {
          channels.push(`patient:${patientId}`);
        }
        return channels;
      },
    },
    // Clinical events - broadcast to clinic and patient room
    {
      eventType: 'clinical_note.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        const patientId = (event.payload as { patientId?: string })?.patientId;
        if (patientId) {
          channels.push(`patient:${patientId}`);
        }
        return channels;
      },
    },
    // Treatment plan events
    {
      eventType: 'treatment_plan.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        const patientId = (event.payload as { patientId?: string })?.patientId;
        if (patientId) {
          channels.push(`patient:${patientId}`);
        }
        const treatmentPlanId = (event.payload as { treatmentPlanId?: string })?.treatmentPlanId;
        if (treatmentPlanId) {
          channels.push(`resource:treatment_plan:${treatmentPlanId}`);
        }
        return channels;
      },
    },
    // Invoice events - broadcast to organization for finance team
    {
      eventType: 'invoice.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`, `org:${event.tenant.organizationId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        const patientId = (event.payload as { patientId?: string })?.patientId;
        if (patientId) {
          channels.push(`patient:${patientId}`);
        }
        return channels;
      },
    },
    // Stock events - broadcast to organization and clinic
    {
      eventType: 'stock.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`, `org:${event.tenant.organizationId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        return channels;
      },
    },
    // Provider schedule events
    {
      eventType: 'provider_schedule.',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`];
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        const providerId = (event.payload as { providerId?: string })?.providerId;
        if (providerId) {
          channels.push(`resource:provider:${providerId}`);
        }
        return channels;
      },
    },
    // Default routing for any other events
    {
      eventType: '',
      channels: (event) => {
        const channels = [`tenant:${event.tenant.tenantId}`];
        if (event.tenant.organizationId) {
          channels.push(`org:${event.tenant.organizationId}`);
        }
        if (event.tenant.clinicId) {
          channels.push(`clinic:${event.tenant.clinicId}`);
        }
        return channels;
      },
    },
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.connect();
      this.logger.log('EventConsumerService initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize EventConsumerService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - allow service to start without RabbitMQ in development
      // The service will retry connection
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Connect to RabbitMQ and set up event subscriptions
   */
  private async connect(): Promise<void> {
    const config = this.configService.get('rabbitmq');
    if (!config) {
      this.logger.warn('RabbitMQ configuration not found, skipping event consumer setup');
      return;
    }

    try {
      this.rabbitmqClient = new RabbitMQClient({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        vhost: config.vhost,
        heartbeat: 60,
        connectionTimeout: 10000,
        channelMax: 100,
        prefetchCount: config.prefetchCount,
        reconnectDelay: config.reconnectDelay,
        maxReconnectAttempts: config.maxReconnectAttempts,
      });

      await this.rabbitmqClient.connect();
      this.isConnected = true;

      await this.setupExchangesAndQueues();
      await this.subscribeToEvents();

      this.logger.log('Successfully connected to RabbitMQ and subscribed to domain events');
    } catch (error) {
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Set up RabbitMQ exchanges and queues
   */
  private async setupExchangesAndQueues(): Promise<void> {
    if (!this.rabbitmqClient) return;

    // Declare dead letter exchange and queue for failed messages
    await this.rabbitmqClient.declareExchange(this.DEAD_LETTER_EXCHANGE, 'direct', {
      durable: true,
    });
    await this.rabbitmqClient.declareQueue(this.DEAD_LETTER_QUEUE, {
      durable: true,
    });
    await this.rabbitmqClient.bindQueue(
      this.DEAD_LETTER_QUEUE,
      this.DEAD_LETTER_EXCHANGE,
      'realtime-service',
    );

    // Declare main domain events exchange (topic for pattern matching)
    await this.rabbitmqClient.declareExchange(this.EXCHANGE_NAME, 'topic', {
      durable: true,
    });

    // Declare consumer queue with dead letter routing
    await this.rabbitmqClient.declareQueue(this.QUEUE_NAME, {
      durable: true,
      deadLetterExchange: this.DEAD_LETTER_EXCHANGE,
      deadLetterRoutingKey: 'realtime-service',
    });

    // Bind queue to exchange with all subscribed event patterns
    for (const pattern of this.SUBSCRIBED_EVENT_PATTERNS) {
      await this.rabbitmqClient.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, pattern);
      this.logger.debug(`Bound queue to pattern: ${pattern}`);
    }
  }

  /**
   * Subscribe to the event queue and process incoming messages
   */
  private async subscribeToEvents(): Promise<void> {
    if (!this.rabbitmqClient) return;

    await this.rabbitmqClient.subscribe(this.QUEUE_NAME, async (message) => {
      if (!message) return;

      try {
        const content = message.content.toString();
        const event = JSON.parse(content) as DomainEventEnvelope;

        await this.handleDomainEvent(event);
      } catch (error) {
        this.logger.error(
          `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        // Message will be nack'd and sent to dead letter queue by RabbitMQClient
        throw error;
      }
    });
  }

  /**
   * Handle an incoming domain event
   */
  private async handleDomainEvent(event: DomainEventEnvelope): Promise<void> {
    const { metadata, tenant } = event;

    this.logger.debug(
      `Processing event: ${metadata.eventType} [${metadata.eventId}] from ${metadata.source}`,
    );

    // Validate event structure
    if (!this.isValidEvent(event)) {
      this.logger.warn(`Invalid event structure: ${metadata.eventId}`);
      return;
    }

    // Get channels for this event type
    const channels = this.getChannelsForEvent(event);
    if (channels.length === 0) {
      this.logger.debug(`No channels configured for event type: ${metadata.eventType}`);
      return;
    }

    // Publish to WebSocket clients
    try {
      // Ensure payload is an object before spreading
      const payloadObj =
        typeof event.payload === 'object' && event.payload !== null
          ? (event.payload as Record<string, unknown>)
          : { data: event.payload };

      const result = await this.realtimeService.publishEvent({
        tenantId: tenant.tenantId,
        organizationId: tenant.organizationId || tenant.tenantId,
        clinicId: tenant.clinicId,
        channels,
        eventType: metadata.eventType,
        payload: {
          ...payloadObj,
          _metadata: {
            eventId: metadata.eventId,
            timestamp: metadata.timestamp,
            correlationId: metadata.correlationId,
            source: metadata.source,
          },
        },
      });

      this.logger.debug(
        `Event ${metadata.eventId} delivered to ${result.delivered} clients via ${channels.length} channels`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish event to WebSocket: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - event was processed, just failed to broadcast
    }
  }

  /**
   * Validate event structure
   */
  private isValidEvent(event: DomainEventEnvelope): boolean {
    return !!(
      event.metadata?.eventId &&
      event.metadata?.eventType &&
      event.tenant?.tenantId &&
      event.payload
    );
  }

  /**
   * Get WebSocket channels for an event based on its type
   */
  private getChannelsForEvent(event: DomainEventEnvelope): string[] {
    const eventType = event.metadata.eventType;

    // Find matching routing config
    for (const routing of this.eventRoutingConfig) {
      if (eventType.startsWith(routing.eventType)) {
        return routing.channels(event);
      }
    }

    // Use default routing (last in array)
    const defaultRouting = this.eventRoutingConfig[this.eventRoutingConfig.length - 1];
    return defaultRouting.channels(event);
  }

  /**
   * Disconnect from RabbitMQ
   */
  private async disconnect(): Promise<void> {
    if (this.rabbitmqClient) {
      try {
        await this.rabbitmqClient.shutdown();
        this.isConnected = false;
        this.logger.log('Disconnected from RabbitMQ');
      } catch (error) {
        this.logger.error(
          `Error disconnecting from RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  /**
   * Check if event consumer is connected to RabbitMQ
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Get health check status
   */
  async getHealthStatus(): Promise<{
    connected: boolean;
    exchangeName: string;
    queueName: string;
    subscribedPatterns: string[];
  }> {
    return {
      connected: this.isConnected,
      exchangeName: this.EXCHANGE_NAME,
      queueName: this.QUEUE_NAME,
      subscribedPatterns: this.SUBSCRIBED_EVENT_PATTERNS,
    };
  }
}

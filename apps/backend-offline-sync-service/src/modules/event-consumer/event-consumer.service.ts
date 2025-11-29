import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { ChangeLogService } from '../changelog/changelog.service';
import { ChangeOperation } from '@dentalos/shared-domain';

@Injectable()
export class EventConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventConsumerService.name);
  private connection: any = null;
  private channel: any = null;

  private readonly eventPatterns = [
    'patient.*',
    'scheduling.*',
    'clinical.*',
    'imaging.*',
    'billing.*',
    'marketing.*',
    'inventory.*',
    'hr.*',
    'sterilization.*',
    'enterprise.*',
    'integrations.*',
    'automation.*',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly changeLogService: ChangeLogService,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.setupConsumers();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const rabbitmqUrl = this.configService.get<string>('rabbitmq.url');
      this.connection = await amqp.connect(rabbitmqUrl!);
      this.channel = await this.connection.createChannel();

      this.logger.log('Connected to RabbitMQ for event consumption');
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async setupConsumers(): Promise<void> {
    try {
      const exchange = 'dentalos.events';
      await this.channel.assertExchange(exchange, 'topic', { durable: true });

      const queue = 'offline-sync.events';
      await this.channel.assertQueue(queue, { durable: true });

      // Bind queue to all event patterns
      for (const pattern of this.eventPatterns) {
        await this.channel.bindQueue(queue, exchange, pattern);
        this.logger.log(`Bound queue to pattern: ${pattern}`);
      }

      // Start consuming
      await this.channel.consume(
        queue,
        async (msg: any) => {
          if (msg) {
            await this.handleEvent(msg);
            this.channel.ack(msg);
          }
        },
        { noAck: false },
      );

      this.logger.log('Event consumer started');
    } catch (error) {
      this.logger.error(
        `Failed to setup consumers: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async handleEvent(msg: any): Promise<void> {
    try {
      const event = JSON.parse(msg.content.toString());
      const routingKey = msg.fields.routingKey;

      // Skip offline-sync events to avoid circular processing
      if (routingKey.startsWith('offline-sync.')) {
        return;
      }

      // Extract entity information from event
      const entityInfo = this.extractEntityInfo(event, routingKey);

      if (!entityInfo) {
        this.logger.debug(`Skipping non-entity event: ${routingKey}`);
        return;
      }

      // Create changelog entry
      await this.changeLogService.createChangeLog({
        tenantId: event.tenantId,
        organizationId: event.organizationId,
        clinicId: event.clinicId,
        entityType: entityInfo.entityType,
        entityId: entityInfo.entityId,
        operation: entityInfo.operation,
        data: entityInfo.data,
        previousData: entityInfo.previousData,
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        eventId: event.eventId || event.correlationId,
        eventType: event.eventType || routingKey,
      });

      this.logger.debug(
        `Processed event ${routingKey} for entity ${entityInfo.entityType}:${entityInfo.entityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle event: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private extractEntityInfo(
    event: any,
    routingKey: string,
  ): {
    entityType: string;
    entityId: string;
    operation: ChangeOperation;
    data: any;
    previousData?: any;
  } | null {
    // Determine operation based on event type
    let operation: ChangeOperation = ChangeOperation.UPDATE;

    if (
      routingKey.includes('.created') ||
      routingKey.includes('.registered') ||
      routingKey.includes('.added')
    ) {
      operation = ChangeOperation.INSERT;
    } else if (
      routingKey.includes('.deleted') ||
      routingKey.includes('.removed') ||
      routingKey.includes('.cancelled')
    ) {
      operation = ChangeOperation.DELETE;
    }

    // Extract entity type and ID based on routing key pattern
    const parts = routingKey.split('.');
    const domain = parts[0]; // e.g., 'patient', 'scheduling', 'clinical'

    // Common entity ID fields
    const entityIdField = this.findEntityIdField(event);
    if (!entityIdField) {
      return null;
    }

    const entityId = event[entityIdField];
    if (!entityId) {
      return null;
    }

    // Determine entity type
    let entityType = domain;
    if (parts.length > 1) {
      entityType = `${domain}.${parts[1]}`; // e.g., 'patient.appointment', 'clinical.note'
    }

    return {
      entityType,
      entityId,
      operation,
      data: event,
      previousData: event.previousData,
    };
  }

  private findEntityIdField(event: any): string | null {
    const possibleFields = [
      'patientId',
      'appointmentId',
      'userId',
      'clinicId',
      'treatmentId',
      'noteId',
      'imageId',
      'invoiceId',
      'paymentId',
      'campaignId',
      'itemId',
      'orderId',
      'employeeId',
      'cycleId',
      'deviceId',
      'integrationId',
      'automationId',
      'workflowId',
      'id',
    ];

    for (const field of possibleFields) {
      if (event[field]) {
        return field;
      }
    }

    return null;
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error(
        `Error disconnecting from RabbitMQ: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

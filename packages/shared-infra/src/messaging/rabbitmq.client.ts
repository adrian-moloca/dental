import * as amqp from 'amqplib';
import { RabbitMQConfig } from '../config/messaging.config';
import { HealthCheckable, HealthCheckResult, HealthStatus } from '../health';

/**
 * Message handler callback type
 */
export type MessageHandler = (message: amqp.ConsumeMessage | null) => Promise<void>;

/**
 * Exchange options
 */
export interface ExchangeOptions {
  durable?: boolean;
  autoDelete?: boolean;
  internal?: boolean;
  alternateExchange?: string;
}

/**
 * Queue options
 */
export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  messageTtl?: number;
  maxLength?: number;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
}

/**
 * RabbitMQ client with connection management, pub/sub, and auto-reconnect
 */
export class RabbitMQClient implements HealthCheckable {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQConfig;
  private isConnected = false;
  private isShuttingDown = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  /**
   * Connect to RabbitMQ
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.isShuttingDown) {
      throw new Error('RabbitMQClient is shutting down');
    }

    try {
      const connectionUrl = this.buildConnectionUrl();
      this.connection = await (amqp as any).connect(connectionUrl, {
        heartbeat: this.config.heartbeat,
        timeout: this.config.connectionTimeout,
      });

      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(this.config.prefetchCount);

      this.setupConnectionHandlers();
      this.isConnected = true;
      this.reconnectAttempts = 0;
    } catch (error) {
      throw new Error(
        `RabbitMQ connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build RabbitMQ connection URL without exposing credentials in errors
   */
  private buildConnectionUrl(): string {
    const { host, port, username, password, vhost } = this.config;
    return `amqp://${username}:${password}@${host}:${port}${vhost}`;
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.connection) {
      return;
    }

    this.connection.on('error', (err: any) => {
      console.error('RabbitMQ connection error:', {
        message: err.message,
      });
    });

    this.connection.on('close', () => {
      this.isConnected = false;
      if (!this.isShuttingDown) {
        this.handleReconnect();
      }
    });

    if (this.channel) {
      this.channel.on('error', (err: any) => {
        console.error('RabbitMQ channel error:', {
          message: err.message,
        });
      });

      this.channel.on('close', () => {
        this.isConnected = false;
        if (!this.isShuttingDown) {
          this.handleReconnect();
        }
      });
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.isShuttingDown || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectDelay * this.reconnectAttempts, 30000);

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('RabbitMQ reconnection failed:', {
          attempt: this.reconnectAttempts,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, delay);
  }

  /**
   * Ensure connection and channel are available
   */
  private ensureConnected(): void {
    if (!this.isConnected || !this.channel) {
      throw new Error('RabbitMQ client not connected. Call connect() first.');
    }
  }

  /**
   * Declare an exchange
   */
  public async declareExchange(
    exchangeName: string,
    exchangeType: 'direct' | 'topic' | 'fanout' | 'headers',
    options?: ExchangeOptions
  ): Promise<void> {
    this.ensureConnected();

    try {
      await this.channel!.assertExchange(exchangeName, exchangeType, {
        durable: options?.durable ?? true,
        autoDelete: options?.autoDelete ?? false,
        internal: options?.internal ?? false,
        alternateExchange: options?.alternateExchange,
      });
    } catch (error) {
      throw new Error(
        `Failed to declare exchange: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Declare a queue
   */
  public async declareQueue(queueName: string, options?: QueueOptions): Promise<void> {
    this.ensureConnected();

    try {
      const args: Record<string, unknown> = {};

      if (options?.messageTtl) {
        args['x-message-ttl'] = options.messageTtl;
      }
      if (options?.maxLength) {
        args['x-max-length'] = options.maxLength;
      }
      if (options?.deadLetterExchange) {
        args['x-dead-letter-exchange'] = options.deadLetterExchange;
      }
      if (options?.deadLetterRoutingKey) {
        args['x-dead-letter-routing-key'] = options.deadLetterRoutingKey;
      }

      await this.channel!.assertQueue(queueName, {
        durable: options?.durable ?? true,
        exclusive: options?.exclusive ?? false,
        autoDelete: options?.autoDelete ?? false,
        arguments: Object.keys(args).length > 0 ? args : undefined,
      });
    } catch (error) {
      throw new Error(
        `Failed to declare queue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Bind a queue to an exchange
   */
  public async bindQueue(
    queueName: string,
    exchangeName: string,
    routingKey: string
  ): Promise<void> {
    this.ensureConnected();

    try {
      await this.channel!.bindQueue(queueName, exchangeName, routingKey);
    } catch (error) {
      throw new Error(
        `Failed to bind queue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Publish a message to an exchange
   */
  public async publish(
    exchangeName: string,
    routingKey: string,
    message: Buffer | string,
    options?: any
  ): Promise<boolean> {
    this.ensureConnected();

    try {
      const content = Buffer.isBuffer(message) ? message : Buffer.from(message);
      return this.channel!.publish(exchangeName, routingKey, content, options);
    } catch (error) {
      throw new Error(
        `Failed to publish message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Send a message directly to a queue
   */
  public async sendToQueue(
    queueName: string,
    message: Buffer | string,
    options?: any
  ): Promise<boolean> {
    this.ensureConnected();

    try {
      const content = Buffer.isBuffer(message) ? message : Buffer.from(message);
      return this.channel!.sendToQueue(queueName, content, options);
    } catch (error) {
      throw new Error(
        `Failed to send to queue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Subscribe to a queue
   */
  public async subscribe(
    queueName: string,
    handler: MessageHandler,
    options?: any
  ): Promise<void> {
    this.ensureConnected();

    try {
      await this.channel!.consume(
        queueName,
        async (msg: any) => {
          try {
            await handler(msg);
            if (msg) {
              this.channel!.ack(msg);
            }
          } catch (error) {
            if (msg) {
              this.channel!.nack(msg, false, false);
            }
          }
        },
        options
      );
    } catch (error) {
      throw new Error(
        `Failed to subscribe to queue: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get the underlying channel for advanced operations
   */
  public getChannel(): any {
    this.ensureConnected();
    return this.channel!;
  }

  /**
   * Check if RabbitMQ connection is healthy
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    try {
      if (!this.isConnected || !this.channel) {
        return {
          status: HealthStatus.UNHEALTHY,
          timestamp: new Date(),
          error: 'RabbitMQ client not connected',
        };
      }

      return {
        status: HealthStatus.HEALTHY,
        timestamp: new Date(),
        message: 'RabbitMQ connection healthy',
        metadata: {
          reconnectAttempts: this.reconnectAttempts,
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Gracefully shutdown RabbitMQ connection
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.isConnected = false;
    } catch (error) {
      console.error(
        'Error during RabbitMQ shutdown:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }
}

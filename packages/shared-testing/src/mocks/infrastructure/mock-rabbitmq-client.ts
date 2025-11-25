/**
 * Mock RabbitMQ Client
 * In-memory implementation of RabbitMQClient for testing
 *
 * @module shared-testing/mocks/infrastructure
 */

import type { ConsumeMessage } from 'amqplib';
import type { MessageHandler, ExchangeOptions, QueueOptions } from '@dentalos/shared-infra';
import { HealthStatus } from '@dentalos/shared-infra';
import type { HealthCheckResult } from '@dentalos/shared-infra';

interface MockMessage {
  exchange: string;
  routingKey: string;
  content: Buffer;
  timestamp: Date;
}

/**
 * Mock RabbitMQ client for testing
 * Stores messages in memory and allows inspection
 */
export class MockRabbitMQClient {
  private publishedMessages: MockMessage[] = [];
  private exchanges: Set<string> = new Set();
  private queues: Map<string, MockMessage[]> = new Map();
  private bindings: Map<string, Array<{ exchange: string; routingKey: string }>> = new Map();
  private subscribers: Map<string, MessageHandler> = new Map();
  private connected: boolean = false;

  /**
   * Connect to RabbitMQ (no-op for mock)
   */
  public async connect(): Promise<void> {
    this.connected = true;
  }

  /**
   * Declare an exchange
   */
  public async declareExchange(
    exchangeName: string,
    exchangeType: 'direct' | 'topic' | 'fanout' | 'headers',
    options?: ExchangeOptions
  ): Promise<void> {
    this.exchanges.add(exchangeName);
  }

  /**
   * Declare a queue
   */
  public async declareQueue(queueName: string, options?: QueueOptions): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
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
    if (!this.bindings.has(queueName)) {
      this.bindings.set(queueName, []);
    }
    this.bindings.get(queueName)!.push({ exchange: exchangeName, routingKey });
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
    const content = Buffer.isBuffer(message) ? message : Buffer.from(message);

    const mockMessage: MockMessage = {
      exchange: exchangeName,
      routingKey,
      content,
      timestamp: new Date(),
    };

    this.publishedMessages.push(mockMessage);

    // Route to bound queues
    this.bindings.forEach((bindings, queueName) => {
      const matches = bindings.some(
        (b) => b.exchange === exchangeName && this.matchesRoutingKey(routingKey, b.routingKey)
      );
      if (matches) {
        const queue = this.queues.get(queueName);
        if (queue) {
          queue.push(mockMessage);
        }
      }
    });

    return true;
  }

  /**
   * Send a message directly to a queue
   */
  public async sendToQueue(
    queueName: string,
    message: Buffer | string,
    options?: any
  ): Promise<boolean> {
    const content = Buffer.isBuffer(message) ? message : Buffer.from(message);

    const mockMessage: MockMessage = {
      exchange: '',
      routingKey: queueName,
      content,
      timestamp: new Date(),
    };

    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }

    this.queues.get(queueName)!.push(mockMessage);
    return true;
  }

  /**
   * Subscribe to a queue
   */
  public async subscribe(
    queueName: string,
    handler: MessageHandler,
    options?: any
  ): Promise<void> {
    this.subscribers.set(queueName, handler);
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    return {
      status: this.connected ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
      timestamp: new Date(),
      message: 'Mock RabbitMQ connection',
      metadata: {
        reconnectAttempts: 0,
      },
    };
  }

  /**
   * Shutdown (no-op for mock)
   */
  public async shutdown(): Promise<void> {
    this.connected = false;
  }

  /**
   * Get all published messages (testing utility)
   */
  public getPublishedMessages(): MockMessage[] {
    return [...this.publishedMessages];
  }

  /**
   * Get messages for a specific queue (testing utility)
   */
  public getQueueMessages(queueName: string): MockMessage[] {
    return this.queues.get(queueName) ?? [];
  }

  /**
   * Get messages published to an exchange (testing utility)
   */
  public getMessagesForExchange(exchangeName: string): MockMessage[] {
    return this.publishedMessages.filter((m) => m.exchange === exchangeName);
  }

  /**
   * Reset all stored data
   */
  public reset(): void {
    this.publishedMessages = [];
    this.exchanges.clear();
    this.queues.clear();
    this.bindings.clear();
    this.subscribers.clear();
    this.connected = false;
  }

  /**
   * Match routing key patterns (supports wildcards)
   * @private
   */
  private matchesRoutingKey(actual: string, pattern: string): boolean {
    // Simple pattern matching: # matches any, * matches one segment
    if (pattern === '#' || pattern === actual) {
      return true;
    }

    const patternParts = pattern.split('.');
    const actualParts = actual.split('.');

    if (patternParts.length !== actualParts.length && !pattern.includes('#')) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '#') return true;
      if (patternParts[i] !== '*' && patternParts[i] !== actualParts[i]) {
        return false;
      }
    }

    return true;
  }
}

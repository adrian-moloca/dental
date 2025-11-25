import * as amqp from 'amqplib';
import { RabbitMQConfig } from '../config/messaging.config';
import { HealthCheckable, HealthCheckResult } from '../health';
export type MessageHandler = (message: amqp.ConsumeMessage | null) => Promise<void>;
export interface ExchangeOptions {
    durable?: boolean;
    autoDelete?: boolean;
    internal?: boolean;
    alternateExchange?: string;
}
export interface QueueOptions {
    durable?: boolean;
    exclusive?: boolean;
    autoDelete?: boolean;
    messageTtl?: number;
    maxLength?: number;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
}
export declare class RabbitMQClient implements HealthCheckable {
    private connection;
    private channel;
    private config;
    private isConnected;
    private isShuttingDown;
    private reconnectAttempts;
    private reconnectTimeout;
    constructor(config: RabbitMQConfig);
    connect(): Promise<void>;
    private buildConnectionUrl;
    private setupConnectionHandlers;
    private handleReconnect;
    private ensureConnected;
    declareExchange(exchangeName: string, exchangeType: 'direct' | 'topic' | 'fanout' | 'headers', options?: ExchangeOptions): Promise<void>;
    declareQueue(queueName: string, options?: QueueOptions): Promise<void>;
    bindQueue(queueName: string, exchangeName: string, routingKey: string): Promise<void>;
    publish(exchangeName: string, routingKey: string, message: Buffer | string, options?: any): Promise<boolean>;
    sendToQueue(queueName: string, message: Buffer | string, options?: any): Promise<boolean>;
    subscribe(queueName: string, handler: MessageHandler, options?: any): Promise<void>;
    getChannel(): any;
    healthCheck(): Promise<HealthCheckResult>;
    shutdown(): Promise<void>;
}

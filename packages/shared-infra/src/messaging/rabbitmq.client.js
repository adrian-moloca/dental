"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQClient = void 0;
const amqp = require("amqplib");
const health_1 = require("../health");
class RabbitMQClient {
    constructor(config) {
        this.connection = null;
        this.channel = null;
        this.isConnected = false;
        this.isShuttingDown = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
        this.config = config;
    }
    async connect() {
        if (this.isConnected) {
            return;
        }
        if (this.isShuttingDown) {
            throw new Error('RabbitMQClient is shutting down');
        }
        try {
            const connectionUrl = this.buildConnectionUrl();
            this.connection = await amqp.connect(connectionUrl, {
                heartbeat: this.config.heartbeat,
                timeout: this.config.connectionTimeout,
            });
            this.channel = await this.connection.createChannel();
            await this.channel.prefetch(this.config.prefetchCount);
            this.setupConnectionHandlers();
            this.isConnected = true;
            this.reconnectAttempts = 0;
        }
        catch (error) {
            throw new Error(`RabbitMQ connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    buildConnectionUrl() {
        const { host, port, username, password, vhost } = this.config;
        return `amqp://${username}:${password}@${host}:${port}${vhost}`;
    }
    setupConnectionHandlers() {
        if (!this.connection) {
            return;
        }
        this.connection.on('error', (err) => {
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
            this.channel.on('error', (err) => {
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
    handleReconnect() {
        if (this.isShuttingDown || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(this.config.reconnectDelay * this.reconnectAttempts, 30000);
        this.reconnectTimeout = setTimeout(async () => {
            try {
                await this.connect();
            }
            catch (error) {
                console.error('RabbitMQ reconnection failed:', {
                    attempt: this.reconnectAttempts,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }, delay);
    }
    ensureConnected() {
        if (!this.isConnected || !this.channel) {
            throw new Error('RabbitMQ client not connected. Call connect() first.');
        }
    }
    async declareExchange(exchangeName, exchangeType, options) {
        this.ensureConnected();
        try {
            await this.channel.assertExchange(exchangeName, exchangeType, {
                durable: options?.durable ?? true,
                autoDelete: options?.autoDelete ?? false,
                internal: options?.internal ?? false,
                alternateExchange: options?.alternateExchange,
            });
        }
        catch (error) {
            throw new Error(`Failed to declare exchange: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async declareQueue(queueName, options) {
        this.ensureConnected();
        try {
            const args = {};
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
            await this.channel.assertQueue(queueName, {
                durable: options?.durable ?? true,
                exclusive: options?.exclusive ?? false,
                autoDelete: options?.autoDelete ?? false,
                arguments: Object.keys(args).length > 0 ? args : undefined,
            });
        }
        catch (error) {
            throw new Error(`Failed to declare queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async bindQueue(queueName, exchangeName, routingKey) {
        this.ensureConnected();
        try {
            await this.channel.bindQueue(queueName, exchangeName, routingKey);
        }
        catch (error) {
            throw new Error(`Failed to bind queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async publish(exchangeName, routingKey, message, options) {
        this.ensureConnected();
        try {
            const content = Buffer.isBuffer(message) ? message : Buffer.from(message);
            return this.channel.publish(exchangeName, routingKey, content, options);
        }
        catch (error) {
            throw new Error(`Failed to publish message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async sendToQueue(queueName, message, options) {
        this.ensureConnected();
        try {
            const content = Buffer.isBuffer(message) ? message : Buffer.from(message);
            return this.channel.sendToQueue(queueName, content, options);
        }
        catch (error) {
            throw new Error(`Failed to send to queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async subscribe(queueName, handler, options) {
        this.ensureConnected();
        try {
            await this.channel.consume(queueName, async (msg) => {
                try {
                    await handler(msg);
                    if (msg) {
                        this.channel.ack(msg);
                    }
                }
                catch (error) {
                    if (msg) {
                        this.channel.nack(msg, false, false);
                    }
                }
            }, options);
        }
        catch (error) {
            throw new Error(`Failed to subscribe to queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    getChannel() {
        this.ensureConnected();
        return this.channel;
    }
    async healthCheck() {
        try {
            if (!this.isConnected || !this.channel) {
                return {
                    status: health_1.HealthStatus.UNHEALTHY,
                    timestamp: new Date(),
                    error: 'RabbitMQ client not connected',
                };
            }
            return {
                status: health_1.HealthStatus.HEALTHY,
                timestamp: new Date(),
                message: 'RabbitMQ connection healthy',
                metadata: {
                    reconnectAttempts: this.reconnectAttempts,
                },
            };
        }
        catch (error) {
            return {
                status: health_1.HealthStatus.UNHEALTHY,
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async shutdown() {
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
        }
        catch (error) {
            console.error('Error during RabbitMQ shutdown:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
}
exports.RabbitMQClient = RabbitMQClient;
//# sourceMappingURL=rabbitmq.client.js.map
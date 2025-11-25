/**
 * Messaging Configuration Schema
 * Re-exports messaging configuration from shared-infra
 */

import { RabbitMQConfig, loadRabbitMQConfig } from '@dentalos/shared-infra';

/**
 * Re-export RabbitMQ configuration type
 */
export type { RabbitMQConfig };

/**
 * Re-export RabbitMQ configuration loader
 */
export { loadRabbitMQConfig };

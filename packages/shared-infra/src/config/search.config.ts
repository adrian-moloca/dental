import { z } from 'zod';

/**
 * OpenSearch configuration schema
 */
const OpenSearchConfigSchema = z.object({
  node: z.string().default('http://localhost:9200'),
  username: z.string().optional(),
  password: z.string().optional(),
  maxRetries: z.number().int().positive().default(3),
  requestTimeout: z.number().int().positive().default(30000),
  sniffOnStart: z.boolean().default(false),
  sniffInterval: z.number().int().positive().optional(),
  ssl: z.boolean().default(false),
});

export type OpenSearchConfig = z.infer<typeof OpenSearchConfigSchema>;

/**
 * Load OpenSearch configuration from environment variables
 */
export function loadOpenSearchConfig(): OpenSearchConfig {
  const config: Record<string, unknown> = {
    node: process.env.DENTALOS_OPENSEARCH_NODE || 'http://localhost:9200',
    username: process.env.DENTALOS_OPENSEARCH_USERNAME,
    password: process.env.DENTALOS_OPENSEARCH_PASSWORD,
    maxRetries: process.env.DENTALOS_OPENSEARCH_MAX_RETRIES
      ? parseInt(process.env.DENTALOS_OPENSEARCH_MAX_RETRIES, 10)
      : 3,
    requestTimeout: process.env.DENTALOS_OPENSEARCH_REQUEST_TIMEOUT
      ? parseInt(process.env.DENTALOS_OPENSEARCH_REQUEST_TIMEOUT, 10)
      : 30000,
    sniffOnStart: process.env.DENTALOS_OPENSEARCH_SNIFF_ON_START === 'true',
    ssl: process.env.DENTALOS_OPENSEARCH_SSL === 'true',
  };

  if (process.env.DENTALOS_OPENSEARCH_SNIFF_INTERVAL) {
    config.sniffInterval = parseInt(process.env.DENTALOS_OPENSEARCH_SNIFF_INTERVAL, 10);
  }

  return OpenSearchConfigSchema.parse(config);
}

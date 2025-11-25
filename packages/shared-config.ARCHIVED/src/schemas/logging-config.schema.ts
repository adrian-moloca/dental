/**
 * Logging Configuration Schema
 * Zod schema for application logging configuration
 */

import { z } from 'zod';

/**
 * Logging configuration schema
 * Defines log level, format, and output destinations
 */
export const LoggingConfigSchema = z.object({
  /** Log level - determines which messages are logged */
  level: z
    .enum(['DEBUG', 'INFO', 'WARN', 'ERROR'])
    .default('INFO')
    .describe('Minimum log level to output'),

  /** Log output format */
  format: z
    .enum(['json', 'text'])
    .default('json')
    .describe('Log output format (json for production, text for dev)'),

  /** Enable console output */
  enableConsole: z
    .boolean()
    .default(true)
    .describe('Enable logging to console/stdout'),

  /** Enable file output */
  enableFile: z
    .boolean()
    .default(false)
    .describe('Enable logging to file system'),

  /** File path for logs (required if enableFile is true) */
  filePath: z
    .string()
    .min(1)
    .optional()
    .describe('File path for log output (required if enableFile is true)'),
})
  .refine(
    (data: {
      level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
      format: 'json' | 'text';
      enableConsole: boolean;
      enableFile: boolean;
      filePath?: string;
    }) => {
      // If file logging is enabled, filePath must be provided
      if (data.enableFile && !data.filePath) {
        return false;
      }
      return true;
    },
    {
      message: 'filePath is required when enableFile is true',
      path: ['filePath'],
    },
  );

/**
 * Inferred TypeScript type from logging config schema
 */
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;

/**
 * Load logging configuration from environment variables
 *
 * @returns Validated logging configuration
 * @throws ZodError if validation fails
 */
export function loadLoggingConfig(): LoggingConfig {
  const level = process.env.DENTALOS_LOG_LEVEL?.toUpperCase();
  const format = process.env.DENTALOS_LOG_FORMAT?.toLowerCase();

  const rawConfig = {
    level:
      level === 'DEBUG' || level === 'INFO' || level === 'WARN' || level === 'ERROR'
        ? level
        : undefined,
    format: format === 'json' || format === 'text' ? format : undefined,
    enableConsole: process.env.DENTALOS_LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.DENTALOS_LOG_ENABLE_FILE === 'true',
    filePath: process.env.DENTALOS_LOG_FILE_PATH,
  };

  return LoggingConfigSchema.parse(rawConfig);
}

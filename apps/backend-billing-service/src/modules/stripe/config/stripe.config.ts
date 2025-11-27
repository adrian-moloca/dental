import { registerAs } from '@nestjs/config';
import { z } from 'zod';

// Allow test keys and placeholder strings for development
const isStripeTestKey = (value: string): boolean => {
  return value.startsWith('sk_test_') || value.includes('placeholder') || value.includes('replace');
};

export const StripeConfigSchema = z.object({
  secretKey: z.string().refine(
    (value) => {
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        // In development, allow empty, test keys, or placeholder strings
        return value === '' || isStripeTestKey(value) || value.length > 0;
      }
      // In production, require real Stripe keys (sk_live_)
      return value.startsWith('sk_live_') && value.length > 10;
    },
    {
      message:
        process.env.NODE_ENV !== 'production'
          ? 'STRIPE_SECRET_KEY must be set (test keys starting with sk_test_ are allowed)'
          : 'STRIPE_SECRET_KEY must be a valid production Stripe key (sk_live_*)',
    },
  ),
  webhookSecret: z.string().refine(
    (value) => {
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        // In development, allow empty, test keys, or placeholder strings
        return value === '' || isStripeTestKey(value) || value.length > 0;
      }
      // In production, require real webhook secret
      return value.startsWith('whsec_') && value.length > 10;
    },
    {
      message:
        process.env.NODE_ENV !== 'production'
          ? 'STRIPE_WEBHOOK_SECRET may be empty in development'
          : 'STRIPE_WEBHOOK_SECRET must be a valid webhook secret (whsec_*)',
    },
  ),
  apiVersion: z.string().default('2024-11-20.acacia'),
  currency: z.string().default('RON'),
  statementDescriptor: z.string().max(22).default('DENTAL CLINIC'),
  paymentMethodTypes: z.array(z.string()).default(['card']),
  captureMethod: z.enum(['automatic', 'manual']).default('automatic'),
  maxRetries: z.number().default(3),
});

export type StripeConfigType = z.infer<typeof StripeConfigSchema>;

export default registerAs('stripe', (): StripeConfigType => {
  const isDev = process.env.NODE_ENV !== 'production';

  // Provide sensible defaults for development
  const devDefaults = {
    secretKey: 'sk_test_dev_placeholder',
    webhookSecret: 'whsec_dev_placeholder',
  };

  const config = {
    secretKey: process.env.STRIPE_SECRET_KEY || (isDev ? devDefaults.secretKey : ''),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || (isDev ? devDefaults.webhookSecret : ''),
    apiVersion: process.env.STRIPE_API_VERSION || '2024-11-20.acacia',
    currency: process.env.STRIPE_CURRENCY || 'RON',
    statementDescriptor: process.env.STRIPE_STATEMENT_DESCRIPTOR || 'DENTAL CLINIC',
    paymentMethodTypes: (process.env.STRIPE_PAYMENT_METHODS || 'card').split(','),
    captureMethod: (process.env.STRIPE_CAPTURE_METHOD || 'automatic') as 'automatic' | 'manual',
    maxRetries: parseInt(process.env.STRIPE_MAX_RETRIES || '3', 10),
  };

  return StripeConfigSchema.parse(config);
});

/**
 * Application Bootstrap for Backend Subscription Service
 *
 * Initializes the NestJS application with security middleware,
 * global validation, error handling, and graceful shutdown.
 *
 * @module main
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { createHelmetConfig, createCorsConfigFromEnv } from '@dentalos/shared-security';
import { AppModule } from './app.module';
import type { AppConfig } from './configuration';
import { validateProductionConfig } from './validators/production-config.validator';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap(): Promise<void> {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    cors: false, // We'll configure CORS manually below
  });

  // Get configuration service
  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get('port', { infer: true }) || 3011;
  const nodeEnv = configService.get('nodeEnv', { infer: true }) || 'development';
  const corsOrigins = configService.get('cors.origins', { infer: true }) || [
    'http://localhost:5173',
  ];
  const corsCredentials = configService.get('cors.credentials', { infer: true }) || true;
  const swaggerEnabled = configService.get('swaggerEnabled', { infer: true }) || true;
  const shutdownTimeout = configService.get('shutdownTimeout', { infer: true }) || 10000;

  // Apply security headers with Helmet (using shared-security)
  app.use(
    helmet(
      createHelmetConfig({
        enableCSP: nodeEnv === 'production',
        enableHSTS: nodeEnv === 'production',
      }),
    ),
  );

  // Configure CORS (using shared-security)
  app.enableCors(
    createCorsConfigFromEnv({
      CORS_ALLOWED_ORIGINS: corsOrigins.join(','),
      CORS_ALLOW_CREDENTIALS: corsCredentials.toString(),
    }),
  );

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      disableErrorMessages: nodeEnv === 'production',
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Set global API prefix
  // All endpoints including health are under /api/v1
  app.setGlobalPrefix('api/v1');

  // Setup Swagger documentation
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('DentalOS Subscription API')
      .setDescription('Subscription and Billing Management Microservice')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('subscriptions', 'Subscription management')
      .addTag('plans', 'Subscription plan management')
      .addTag('invoices', 'Invoice management')
      .addTag('payments', 'Payment processing')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Validate production configuration before starting server
  // This prevents insecure deployments and ensures HIPAA/GDPR compliance
  validateProductionConfig(configService);

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Listen for shutdown signals
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, starting graceful shutdown...`);

      // Set timeout for forced shutdown
      const forceShutdownTimer = setTimeout(() => {
        console.error('Graceful shutdown timeout exceeded, forcing exit');
        process.exit(1);
      }, shutdownTimeout);

      try {
        await app.close();
        clearTimeout(forceShutdownTimer);
        console.log('Application closed successfully');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }
    });
  });

  // Start listening
  await app.listen(port.toString());

  console.log(`Backend Subscription Service running on port ${port} in ${nodeEnv} mode`);
  console.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
  if (swaggerEnabled) {
    console.log(`API Documentation available at http://localhost:${port}/api/docs`);
  }
}

// Start the application
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

/**
 * Application Bootstrap for Backend Patient Portal Gateway
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
import type { AppConfig } from './config/configuration';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap(): Promise<void> {
  // Create NestJS application instance
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    cors: false,
  });

  // Get configuration service
  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get('port', { infer: true });
  const nodeEnv = configService.get('nodeEnv', { infer: true });
  const corsOrigins = configService.get('cors.origins', { infer: true });
  const corsCredentials = configService.get('cors.credentials', { infer: true });
  const swaggerEnabled = configService.get('swaggerEnabled', { infer: true });
  const shutdownTimeout = configService.get('shutdownTimeout', { infer: true });

  // Apply security headers with Helmet (using shared-security)
  app.use(
    helmet(
      createHelmetConfig({
        enableCSP: nodeEnv === 'production',
        enableHSTS: nodeEnv === 'production',
      })
    )
  );

  // Configure CORS (using shared-security)
  app.enableCors(
    createCorsConfigFromEnv({
      CORS_ALLOWED_ORIGINS: corsOrigins.join(','),
      CORS_ALLOW_CREDENTIALS: corsCredentials.toString(),
    })
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
  app.setGlobalPrefix('api', {
    exclude: ['health/liveness', 'health/readiness', 'health/detailed'],
  });

  // Setup Swagger documentation
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('DentalOS Patient Portal Gateway')
      .setDescription('API Gateway / BFF for Patient-Facing Applications')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('portal/auth', 'Patient authentication')
      .addTag('portal/profile', 'Patient profile management')
      .addTag('portal/appointments', 'Appointment management')
      .addTag('portal/clinical', 'Clinical data access')
      .addTag('portal/imaging', 'Imaging studies')
      .addTag('portal/billing', 'Billing and payments')
      .addTag('portal/engagement', 'Loyalty and engagement')
      .addTag('portal/gdpr', 'Privacy and data rights')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Listen for shutdown signals
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, starting graceful shutdown...`);

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
  await app.listen(port);

  console.log(`Patient Portal Gateway running on port ${port} in ${nodeEnv} mode`);
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

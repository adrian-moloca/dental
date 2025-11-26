import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const startTime = Date.now();

  const app = await NestFactory.create(AppModule, {
    // Enable graceful shutdown hooks
    abortOnError: false,
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const configService = app.get(ConfigService<AppConfig>);

  // Security
  app.use(helmet());

  // CORS - Parse comma-separated origins into array
  const corsOriginConfig = configService.get('cors.origin', { infer: true }) || 'http://localhost:3000,http://localhost:5173';
  const corsOrigins = typeof corsOriginConfig === 'string'
    ? corsOriginConfig.split(',').map(o => o.trim())
    : corsOriginConfig;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Organization-ID',
      'X-Clinic-ID',
    ],
    exposedHeaders: ['X-Correlation-ID'],
  });

  // Global exception filter
  // Handles all errors and converts them to standardized error responses
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  // Order matters: Metrics -> Logging -> Transform
  // Metrics captures request timing and counts
  // Logging runs first to capture raw request/response
  // Transform wraps successful responses in standardized format
  const { MetricsInterceptor } = await import('./metrics/metrics.interceptor');
  const { MetricsService } = await import('./metrics/metrics.service');
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(
    new MetricsInterceptor(metricsService),
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  // All endpoints including health are under /api/v1
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DentalOS Patient Service API')
    .setDescription(
      `
# DentalOS Patient Management API

Comprehensive patient management with PHI protection and GDPR compliance.

## Features
- **Patients**: Complete patient records with PHI protection
- **Relationships**: Family and guardian relationships
- **Timeline**: Patient activity and event tracking
- **GDPR**: Data export, consent management, right-to-be-forgotten
- **Search**: Advanced patient search with fuzzy matching

## Authentication
All endpoints require Bearer token authentication:
\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

## Response Format
All responses are wrapped in a standardized format with success/error status.

## Multi-Tenant Isolation
All patient data is strictly isolated by organization ID.

## Support
- Documentation: https://docs.dentalos.com
- Support: support@dentalos.com
    `,
    )
    .setVersion('1.0.0')
    .setContact('DentalOS Support', 'https://dentalos.com/support', 'support@dentalos.com')
    .setLicense('Proprietary', 'https://dentalos.com/license')
    .addServer('http://localhost:3004', 'Local Development')
    .addServer('https://api-staging.dentalos.com', 'Staging')
    .addServer('https://api.dentalos.com', 'Production')
    .addTag('Patients', 'Patient CRUD operations and management')
    .addTag('Relationships', 'Family and guardian relationship management')
    .addTag('Timeline', 'Patient timeline and activity tracking')
    .addTag('GDPR', 'GDPR compliance and data privacy operations')
    .addTag('Search', 'Advanced patient search capabilities')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from authentication service',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'DentalOS Patient API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
    },
  });

  const port = configService.get('port', { infer: true })!;
  await app.listen(port);

  const bootTime = Date.now() - startTime;
  logger.log(`Patient Service started in ${bootTime}ms on http://localhost:${port}`);
  logger.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
  logger.log(`API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`Patients, Relationships, Timeline, GDPR & Search endpoints ready`);
  logger.log(`Process ID: ${process.pid}`);
  logger.log(`Node version: ${process.version}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Graceful shutdown handlers
  setupGracefulShutdown(app, logger);

  return app;
}

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT signals
 *
 * This ensures:
 * - In-flight requests are completed before shutdown
 * - Database connections are properly closed
 * - Resources are cleaned up
 * - Zero-downtime deployments in Kubernetes
 *
 * Shutdown sequence:
 * 1. Stop accepting new requests
 * 2. Wait for in-flight requests to complete (max 30s)
 * 3. Close database connections
 * 4. Exit process
 */
function setupGracefulShutdown(app: any, logger: Logger): void {
  let isShuttingDown = false;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn(`${signal} received again, forcing shutdown...`);
      process.exit(1);
    }

    isShuttingDown = true;
    logger.log(`${signal} received, starting graceful shutdown...`);

    try {
      // Set shutdown timeout (30 seconds)
      const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful shutdown timeout exceeded, forcing exit');
        process.exit(1);
      }, 30000);

      // Close the NestJS application
      // This will:
      // - Stop accepting new connections
      // - Wait for in-flight requests
      // - Close database connections
      // - Clean up resources
      await app.close();

      clearTimeout(shutdownTimeout);
      logger.log('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', error);
      process.exit(1);
    }
  };

  // Handle SIGTERM (sent by Kubernetes, Docker, systemd)
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle SIGINT (Ctrl+C in terminal)
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});

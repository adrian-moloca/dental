import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Bootstrap function for the Health Aggregator service
 *
 * Configures:
 * - Security middleware (Helmet)
 * - CORS
 * - Global validation
 * - Swagger documentation
 * - Graceful shutdown
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('DentalOS Health Aggregator API')
    .setDescription(
      'Unified health monitoring and service dependency tracking for DentalOS microservices ecosystem',
    )
    .setVersion('1.0')
    .addTag('Health', 'Health check and monitoring endpoints')
    .addTag('Metrics', 'Metrics and observability endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Handle shutdown signals
  const gracefulShutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);

    try {
      await app.close();
      logger.log('Application shut down gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Promise Rejection', {
      reason,
      promise,
    });
  });

  // Uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    });

    // Exit process after logging
    process.exit(1);
  });

  // Get port from environment or use default
  const port = parseInt(process.env.PORT || '3099', 10);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  logger.log(`========================================`);
  logger.log(`🏥 Health Aggregator Service Started`);
  logger.log(`========================================`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`Port: ${port}`);
  logger.log(`Host: ${host}`);
  logger.log(`API URL: http://${host}:${port}/api/v1`);
  logger.log(`Swagger Docs: http://${host}:${port}/api/docs`);
  logger.log(`Health Check: http://${host}:${port}/api/v1/health/liveness`);
  logger.log(`Metrics: http://${host}:${port}/api/v1/metrics`);
  logger.log(`========================================`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

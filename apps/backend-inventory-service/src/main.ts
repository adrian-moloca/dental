import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const startTime = Date.now();

  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
  });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS - Parse comma-separated origins into array
  const corsOriginConfig = configService.get<string>('cors.origin', 'http://localhost:3000,http://localhost:5173');
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
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DentalOS Inventory Service API')
    .setDescription(
      `
# DentalOS Inventory, Procurement & Stock Automation API

Complete inventory management system with FEFO stock deduction, procurement workflows, and clinical integration.

## Features
- **Products**: Product catalog management with categories and suppliers
- **Stock**: Multi-location inventory tracking with FEFO deduction
- **Purchase Orders**: Procurement workflow with approval process
- **Goods Receipts**: Inventory receiving with lot/serial tracking
- **Suppliers**: Supplier management and integrations
- **Clinical Integration**: Automatic stock deduction from procedures

## Authentication
All endpoints require Bearer token authentication:
\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

## Response Format
All responses are wrapped in a standardized format with success/error status.

## Rate Limits
- FREE: 100 req/min | BASIC: 500 req/min | PRO: 2000 req/min | ENTERPRISE: 10000 req/min

## Support
- Documentation: https://docs.dentalos.com
- Support: support@dentalos.com
    `,
    )
    .setVersion('1.0.0')
    .setContact('DentalOS Support', 'https://dentalos.com/support', 'support@dentalos.com')
    .setLicense('Proprietary', 'https://dentalos.com/license')
    .addServer('http://localhost:3008', 'Local Development')
    .addServer('https://api-staging.dentalos.com', 'Staging')
    .addServer('https://api.dentalos.com', 'Production')
    .addTag('Products', 'Product catalog operations')
    .addTag('Stock', 'Inventory and stock operations')
    .addTag('Purchase Orders', 'Procurement and purchase order management')
    .addTag('Goods Receipts', 'Inventory receiving operations')
    .addTag('Suppliers', 'Supplier management')
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
    customSiteTitle: 'DentalOS Inventory API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
    },
  });

  const port = configService.get<number>('port', 3008);
  await app.listen(port);

  const bootTime = Date.now() - startTime;
  logger.log(`Inventory Service started in ${bootTime}ms on http://localhost:${port}`);
  logger.log(`Health endpoint available at http://localhost:${port}/api/v1/health`);
  logger.log(`API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`Products, Stock, Purchase Orders, Goods Receipts endpoints ready`);
  logger.log(`Process ID: ${process.pid}`);
  logger.log(`Node version: ${process.version}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Graceful shutdown handlers
  setupGracefulShutdown(app, logger);

  return app;
}

/**
 * Setup graceful shutdown handlers for SIGTERM and SIGINT signals
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
      const shutdownTimeout = setTimeout(() => {
        logger.error('Graceful shutdown timeout exceeded, forcing exit');
        process.exit(1);
      }, 30000);

      await app.close();

      clearTimeout(shutdownTimeout);
      logger.log('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

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
